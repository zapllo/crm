import { NextRequest, NextResponse } from 'next/server';
import { User } from "@/models/userModel";
import Lead from '@/models/leadModel';
import Contact from '@/models/contactModel';
import Pipeline from '@/models/pipelineModel';
import Company from '@/models/companyModel';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get the API key from the request headers
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    // Verify the API key and get organization
    const ApiKey = require('@/models/apiKeyModel').default;
    const validKey = await ApiKey.findOne({ key: apiKey, isActive: true });

    if (!validKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.leadData || !body.contactData || !body.pipelineData) {
      return NextResponse.json(
        { error: "Missing required data (leadData, contactData, pipelineData)" },
        { status: 400 }
      );
    }

    const { leadData, contactData, pipelineData } = body;
    const organizationId = validKey.organization;

    // Find an admin user to use as the creator
    const adminUser = await User.findOne({
      organization: organizationId,
      isOrgAdmin: true
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "No admin user found for this organization" },
        { status: 400 }
      );
    }

    // Find or create pipeline
    let pipeline = await Pipeline.findOne({
      name: pipelineData.name,
      organization: organizationId
    });

    if (!pipeline) {
      // Create new pipeline with provided stages
      pipeline = await Pipeline.create({
        name: pipelineData.name,
        openStages: pipelineData.openStages || [
          { name: "New", color: "#2196F3" },
          { name: "Contacted", color: "#673AB7" }
        ],
        closeStages: pipelineData.closeStages || [
          { name: "Won", color: "#4CAF50", won: true },
          { name: "Lost", color: "#F44336", lost: true }
        ],
        organization: organizationId,
        leads: []
      });
    }

    // Find default company for the organization or create one
    let company = await Company.findOne({ organization: organizationId });
    
    if (!company) {
      company = await Company.create({
        companyName: "Default Company",
        organization: organizationId,
        industry: "General",
        country: "Unknown",
        companySize: "Small",
        website: "",
        contacts: []
      });
    }

    // Check if contact already exists by phone or email
    let contact = await Contact.findOne({
      $or: [
        { whatsappNumber: contactData.phone },
        ...(contactData.email ? [{ email: contactData.email }] : [])
      ],
      company: company._id
    });

    if (!contact) {
      // Create new contact
      contact = await Contact.create({
        company: company._id,
        firstName: contactData.name.split(' ')[0] || contactData.name,
        lastName: contactData.name.split(' ').slice(1).join(' ') || "",
        email: contactData.email || "",
        country: contactData.countryCode || "Unknown",
        whatsappNumber: contactData.phone,
        state: "",
        city: "",
        pincode: "",
        address: "",
        customFieldValues: contactData.customFields || {},
        tags: contactData.tags || [],
        dateOfBirth: null,
        dateOfAnniversary: null
      });

      // Add contact to company
      await Company.findByIdAndUpdate(
        company._id,
        { $push: { contacts: contact._id } }
      );
    }

    // Get the count of leads for generating a lead ID
    const leadCount = await Lead.countDocuments({ organization: organizationId });
    const leadId = `LEAD-${leadCount + 1}`;

    // Determine the stage
    let stage = leadData.stage;
    if (!stage) {
      stage = pipeline.openStages && pipeline.openStages.length > 0
        ? pipeline.openStages[0].name
        : "New";
    }

    // Create the lead
    const lead = await Lead.create({
      leadId,
      title: leadData.title,
      description: leadData.description || `Lead created from Zaptick for ${contact.firstName} ${contact.lastName}`,
      product: leadData.product,
      contact: contact._id,
      amount: leadData.amount || 0,
      closeDate: leadData.closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      source: leadData.source,
      assignedTo: leadData.assignedTo || adminUser._id,
      remarks: leadData.remarks || "Created via Zaptick integration",
      pipeline: pipeline._id,
      organization: organizationId,
      stage: stage,
      timeline: [{
        stage: stage,
        action: "Created via Zaptick",
        remark: `Lead imported from Zaptick WhatsApp conversation`,
        timestamp: new Date(),
        movedBy: adminUser._id
      }]
    });

    // Add reference to the pipeline
    await Pipeline.findByIdAndUpdate(
      pipeline._id,
      { $push: { leads: lead._id } }
    );

    return NextResponse.json({
      success: true,
      message: "Lead created successfully from Zaptick",
      lead: {
        id: lead._id,
        leadId: lead.leadId,
        title: lead.title,
        stage: lead.stage,
        pipeline: pipeline.name
      },
      contact: {
        id: contact._id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        phone: contact.whatsappNumber
      }
    });
  } catch (error: any) {
    console.error('Error processing Zaptick lead:', error);
    return NextResponse.json(
      { error: "Failed to create lead from Zaptick", details: error.message },
      { status: 500 }
    );
  }
}