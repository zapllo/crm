import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import Pipeline from "@/models/pipelineModel";
import { User } from "@/models/userModel";
import { Organization } from "@/models/organizationModel";
import OpenAI from 'openai';
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_GENERATION_COST = 5; // Credits required per generation

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
    const { prompt, industry, businessType } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Create OpenAI prompt
    const systemPrompt = `You are a CRM pipeline expert. Generate a sales pipeline based on the user's requirements.
    
    Return a JSON object with this exact structure:
    {
      "name": "Pipeline Name",
      "openStages": [
        {"name": "Stage Name", "color": "#hexcolor"}
      ],
      "closeStages": [
        {"name": "Stage Name", "color": "#hexcolor", "won": true/false, "lost": true/false}
      ],
      "customFields": [
        {"name": "Field Name", "type": "Text|Date|Number|MultiSelect", "options": ["option1", "option2"] (only for MultiSelect)}
      ]
    }
    
    Guidelines:
    - Create 4-7 open stages representing the sales process
    - Create 2-4 close stages (at least one won and one lost)
    - Use professional stage names relevant to the industry
    - Use appropriate colors (hex codes)
    - Create 2-5 relevant custom fields
    - Ensure at least one close stage is marked as won=true and one as lost=true`;

    const userPrompt = `Generate a sales pipeline for:
    Industry: ${industry || organization.industry}
    Business Type: ${businessType || 'General'}
    Requirements: ${prompt}
    
    Make it specific to this industry and business type.`;

    // Generate pipeline using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse AI response
    let pipelineData;
    try {
      pipelineData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    // Validate pipeline data structure
    if (!pipelineData.name || !pipelineData.openStages || !pipelineData.closeStages) {
      throw new Error("Invalid pipeline structure from AI");
    }

    // Ensure close stages have proper won/lost flags
    const formattedCloseStages = pipelineData.closeStages.map((stage: any) => ({
      ...stage,
      won: stage.won || false,
      lost: stage.lost || false,
    }));

    // Validate that we have at least one won and one lost stage
    const hasWon = formattedCloseStages.some((stage: any) => stage.won);
    const hasLost = formattedCloseStages.some((stage: any) => stage.lost);
    
    if (!hasWon) {
      formattedCloseStages[0].won = true;
    }
    if (!hasLost) {
      formattedCloseStages[formattedCloseStages.length - 1].lost = true;
    }

    // Create the pipeline
    const pipeline = await Pipeline.create({
      name: pipelineData.name,
      organization: user.organization,
      openStages: pipelineData.openStages || [],
      closeStages: formattedCloseStages,
      customFields: pipelineData.customFields || [],
    });

    // Deduct AI credits
    await Organization.findByIdAndUpdate(
      user.organization,
      { $inc: { aiCredits: -AI_GENERATION_COST } }
    );

    return NextResponse.json({
      pipeline,
      creditsUsed: AI_GENERATION_COST,
      remainingCredits: organization.aiCredits - AI_GENERATION_COST
    }, { status: 201 });

  } catch (error: any) {
    console.error("AI Pipeline Generation Error:", error);
    
    if (error.message?.includes("API key")) {
      return NextResponse.json({ error: "AI service configuration error" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to generate pipeline", 
      details: error.message 
    }, { status: 500 });
  }
}