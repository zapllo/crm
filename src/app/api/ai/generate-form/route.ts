import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from '@/lib/getDataFromToken';
import OpenAI from 'openai';

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the expected structure for the form fields
type FormFieldOption = {
  label: string;
  value: string;
};

type FormField = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[];
  order: number;
};

// Valid field types according to your schema
const VALID_FIELD_TYPES = [
  'text', 'textarea', 'email', 'phone', 'number', 'select', 'multiSelect',
  'checkbox', 'radio', 'date', 'time', 'file', 'rating', 'signature',
  'address', 'hidden', 'heading', 'paragraph', 'divider'
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { prompt, formName, formDescription } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate a unique ID for each field
    const generateUniqueId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    };

    // Prepare the system prompt with instructions
    const systemPrompt = `
      You are a form creation assistant. Create a form structure based on the user's requirements.

      Return a JSON object with a "fields" property containing an array of form fields with the following structure:
      {
        "fields": [
          {
            "type": "text|textarea|email|phone|number|select|multiSelect|checkbox|radio|date|time|file|rating|signature|address|hidden|heading|paragraph|divider",
            "label": "Field Label",
            "placeholder": "Placeholder text",
            "required": true|false,
            "options": [
              { "label": "Option 1", "value": "option_1" },
              { "label": "Option 2", "value": "option_2" }
            ] // Include only for select, multiSelect, checkbox, radio types
          }
        ]
      }

      Important guidelines:
      1. Ensure appropriate field types for the information being collected
      2. Include clear labels and placeholders
      3. Mark fields as required when they are essential
      4. For selection fields, provide appropriate options
      5. Keep the form focused on the user's needs
      6. Add appropriate validation
      7. Group related fields together
      8. Start with a clear heading field if appropriate
      9. Keep the response in valid JSON format with a "fields" array
      10. DO NOT use "submit" as a field type. Only use the field types specified above.

      Valid field types are: text, textarea, email, phone, number, select, multiSelect, checkbox, radio, date, time, file, rating, signature, address, hidden, heading, paragraph, divider.
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Use the most advanced model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Extract the form fields from the response
    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("Failed to generate form fields");
    }

    console.log("AI generated content:", generatedContent);

    let parsedFields = [];
    try {
      const parsedResponse = JSON.parse(generatedContent);

      // Check if the response has a fields property that is an array
      if (parsedResponse.fields && Array.isArray(parsedResponse.fields)) {
        parsedFields = parsedResponse.fields;
      }
      // If it's just an array, use it directly
      else if (Array.isArray(parsedResponse)) {
        parsedFields = parsedResponse;
      }
      // If we got an object with no fields array, try to convert it
      else {
        console.warn("AI response did not include fields array, attempting to convert");
        // Try to extract fields from the response object
        const potentialFields = Object.values(parsedResponse).filter(value =>
          typeof value === 'object' && value !== null && !Array.isArray(value)
        );
        if (potentialFields.length > 0) {
          parsedFields = potentialFields;
        } else {
          throw new Error("Could not extract fields from API response");
        }
      }

      // Filter out invalid field types and add unique IDs and ensure order is set
      parsedFields = parsedFields
        .filter((field: any) => {
          // Check if the field type is valid
          const isValidType = VALID_FIELD_TYPES.includes(field.type);
          if (!isValidType) {
            console.warn(`Removing field with invalid type: ${field.type}`);
          }
          return isValidType;
        })
        .map((field: any, index: number) => {
          // Ensure the field has a valid type
          if (!field.type || typeof field.type !== 'string') {
            field.type = 'text'; // Default to text field if type is missing
          }

          // Ensure the field has a label
          if (!field.label) {
            field.label = `Field ${index + 1}`;
          }

          return {
            ...field,
            id: generateUniqueId(),
            order: index
          };
        });
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw response:", generatedContent);
      throw new Error("Failed to parse AI-generated form structure");
    }

    // If we still don't have any fields, create a fallback
    if (parsedFields.length === 0) {
      parsedFields = [
        {
          id: generateUniqueId(),
          type: 'heading',
          label: formName || 'Generated Form',
          required: false,
          order: 0
        },
        {
          id: generateUniqueId(),
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
          order: 1
        },
        {
          id: generateUniqueId(),
          type: 'email',
          label: 'Email Address',
          placeholder: 'your@email.com',
          required: true,
          order: 2
        },
        {
          id: generateUniqueId(),
          type: 'textarea',
          label: 'Message',
          placeholder: 'Your message here...',
          required: false,
          order: 3
        }
      ];
    }

    // Generate theme suggestions based on the form purpose
    const themeSuggestions = {
      primaryColor: suggestPrimaryColor(prompt),
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#EFF6FF',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '0.375rem',
      buttonStyle: 'filled',
      logoPosition: 'center',
    };

    // Add a paragraph field at the end if there isn't one already
    const hasSubmitInstructions = parsedFields.some(
      (field: FormField) => field.type === 'paragraph' &&
        field.label.toLowerCase().includes('submit')
    );

    if (!hasSubmitInstructions) {
      parsedFields.push({
        id: generateUniqueId(),
        type: 'paragraph',
        label: 'Click the Submit button below to complete this form.',
        required: false,
        order: parsedFields.length
      });
    }

    return NextResponse.json({
      success: true,
      fields: parsedFields,
      description: formDescription || `AI-generated form based on: ${prompt.substring(0, 100)}...`,
      theme: themeSuggestions
    });

  } catch (error: any) {
    console.error('AI form generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate form with AI',
        message: 'An error occurred during AI form generation. Please try a different prompt or try again later.'
      },
      { status: 500 }
    );
  }
}

// Helper function to suggest a primary color based on the form purpose
function suggestPrimaryColor(prompt: string): string {
  const promptLower = prompt.toLowerCase();

  // Check for specific form types and assign suitable colors
  if (promptLower.includes('health') || promptLower.includes('medical') || promptLower.includes('doctor')) {
    return '#16A34A'; // Green
  }
  else if (promptLower.includes('finance') || promptLower.includes('bank') || promptLower.includes('money')) {
    return '#0284C7'; // Blue
  }
  else if (promptLower.includes('education') || promptLower.includes('school') || promptLower.includes('learning')) {
    return '#7C3AED'; // Purple
  }
  else if (promptLower.includes('food') || promptLower.includes('restaurant') || promptLower.includes('order')) {
    return '#EA580C'; // Orange
  }
  else if (promptLower.includes('feedback') || promptLower.includes('survey') || promptLower.includes('opinion')) {
    return '#0369A1'; // Blue
  }
  else if (promptLower.includes('event') || promptLower.includes('conference') || promptLower.includes('registration')) {
    return '#7C3AED'; // Purple
  }
  else if (promptLower.includes('contact') || promptLower.includes('inquiry')) {
    return '#2563EB'; // Primary blue
  }
  else if (promptLower.includes('job') || promptLower.includes('application') || promptLower.includes('resume')) {
    return '#0F766E'; // Teal
  }

  // Default color
  return '#3B82F6'; // Default blue
}
