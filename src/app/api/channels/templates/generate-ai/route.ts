import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import { Organization } from "@/models/organizationModel";
import OpenAI from 'openai';
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_GENERATION_COST = 2; // Credits required per email template generation

export async function POST(request: Request) {
  try {
    await connectDB();

    // Get userId from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user and organization
    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }

    const organization = await Organization.findById(user.organization);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check AI credits
    if (organization.aiCredits < AI_GENERATION_COST) {
      return NextResponse.json({ 
        error: "Insufficient AI credits", 
        required: AI_GENERATION_COST,
        available: organization.aiCredits 
      }, { status: 402 });
    }

    // Parse request body
    const body = await request.json();
    const { prompt, templateType, industry, tone, purpose } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Create OpenAI prompt
    const systemPrompt = `You are an expert email copywriter and marketing specialist. Generate professional email templates with proper HTML formatting.

Return a JSON object with this exact structure:
{
  "name": "Template Name (descriptive and professional)",
  "subject": "Email Subject Line (compelling and relevant)",
  "body": "HTML formatted email body with proper styling"
}

Guidelines:
- Use proper HTML formatting with inline styles for email compatibility
- Include appropriate placeholders like {{contact.firstName}}, {{lead.title}}, {{company.companyName}}
- Make the content professional and engaging
- Use proper email HTML structure with tables for layout if needed
- Include relevant call-to-action buttons with proper styling
- Ensure mobile-responsive design
- Use colors that work well in both light and dark modes
- Keep the content focused and concise
- Add appropriate spacing and typography

HTML Elements to use:
- <p> for paragraphs with proper margins
- <h1>, <h2> for headings
- <strong> for bold text
- <em> for italic text
- <ul>, <ol>, <li> for lists
- <a> for links with styling
- <table> for layout structure
- <div> with inline styles for containers
- Use inline CSS for better email client compatibility`;

    const userPrompt = `Generate an email template for:
    Purpose: ${purpose || 'General communication'}
    Type: ${templateType || 'Professional'}
    Industry: ${industry || organization.industry}
    Tone: ${tone || 'Professional and friendly'}
    Requirements: ${prompt}
    
    Make it specific to the ${industry || organization.industry} industry and ensure it's engaging and professional.`;

    // Generate template using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse AI response
    let templateData;
    try {
      templateData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    // Validate template data structure
    if (!templateData.name || !templateData.subject || !templateData.body) {
      throw new Error("Invalid template structure from AI");
    }

    // Deduct AI credits
    await Organization.findByIdAndUpdate(
      user.organization,
      { $inc: { aiCredits: -AI_GENERATION_COST } }
    );

    return NextResponse.json({
      template: templateData,
      creditsUsed: AI_GENERATION_COST,
      remainingCredits: organization.aiCredits - AI_GENERATION_COST
    }, { status: 200 });

  } catch (error: any) {
    console.error("AI Email Template Generation Error:", error);
    
    if (error.message?.includes("API key")) {
      return NextResponse.json({ error: "AI service configuration error" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to generate template", 
      details: error.message 
    }, { status: 500 });
  }
}