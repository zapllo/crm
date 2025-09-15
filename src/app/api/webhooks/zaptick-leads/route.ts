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
    console.log('Received Zaptick lead data:', JSON.stringify(body, null, 2));

    // Validate required fields with detailed error messages
    const { leadData, contactData, pipelineData } = body;

    if (!leadData) {
      return NextResponse.json(
        { error: "Missing leadData in request body" },
        { status: 400 }
      );
    }

    if (!contactData) {
      return NextResponse.json(
        { error: "Missing contactData in request body" },
        { status: 400 }
      );
    }

    if (!pipelineData) {
      return NextResponse.json(
        { error: "Missing pipelineData in request body" },
        { status: 400 }
      );
    }

    // Validate leadData fields
    if (!leadData.title) {
      return NextResponse.json(
        { error: "Missing required field: leadData.title" },
        { status: 400 }
      );
    }

    if (!leadData.stage) {
      return NextResponse.json(
        { error: "Missing required field: leadData.stage" },
        { status: 400 }
      );
    }

    // Validate contactData fields
    if (!contactData.name) {
      return NextResponse.json(
        { error: "Missing required field: contactData.name" },
        { status: 400 }
      );
    }

    if (!contactData.phone) {
      return NextResponse.json(
        { error: "Missing required field: contactData.phone" },
        { status: 400 }
      );
    }

    // Validate pipelineData fields
    if (!pipelineData.name) {
      return NextResponse.json(
        { error: "Missing required field: pipelineData.name" },
        { status: 400 }
      );
    }

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
      console.log('Creating new pipeline:', pipelineData.name);
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
      console.log('Creating default company for organization:', organizationId);
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
        ...(contactData.email && contactData.email !== '' ? [{ email: contactData.email }] : [])
      ],
      company: company._id
    });

    if (!contact) {
      console.log('Creating new contact:', contactData.name);
      // Create new contact with proper field handling
      const nameParts = contactData.name.split(' ');
      
      // Handle email - use a default if empty or not provided
      const email = contactData.email && contactData.email.trim() !== '' 
        ? contactData.email 
        : `${contactData.phone.replace(/[+\s-]/g, '')}@zaptick-import.com`; // Generate a placeholder email

      contact = await Contact.create({
        company: company._id,
        firstName: nameParts[0] || contactData.name,
        lastName: nameParts.slice(1).join(' ') || "",
        email: email,
        country: contactData.countryCode || "Unknown",
        whatsappNumber: contactData.phone,
        state: "",
        city: "",
        pincode: "",
        address: "",
        customFieldValues: [], // Empty array instead of object for proper validation
        tags: [], // Empty array instead of string tags to avoid ObjectId casting issues
        dateOfBirth: null,
        dateOfAnniversary: null
      });

      // Add contact to company
      await Company.findByIdAndUpdate(
        company._id,
        { $push: { contacts: contact._id } }
      );
    } else {
      console.log('Using existing contact:', contact._id);
      
      // Update existing contact if needed - fix email if it's invalid
      if (!contact.email || contact.email === '' || contact.email.includes('zaptick-import.com')) {
        const newEmail = contactData.email && contactData.email.trim() !== '' 
          ? contactData.email 
          : `${contactData.phone.replace(/[+\s-]/g, '')}@zaptick-import.com`;
          
        if (newEmail !== contact.email) {
          await Contact.findByIdAndUpdate(contact._id, { email: newEmail });
          contact.email = newEmail;
        }
      }
    }

    // Get the count of leads for generating a lead ID
    const leadCount = await Lead.countDocuments({ organization: organizationId });
    const leadId = `LEAD-${String(leadCount + 1).padStart(4, '0')}`;

    // Determine the stage - ensure it exists in the pipeline
    let stage = leadData.stage;
    if (!stage) {
      stage = pipeline.openStages && pipeline.openStages.length > 0
        ? pipeline.openStages[0].name
        : "New";
    }

    // Validate that the stage exists in the pipeline
    const stageExists = pipeline.openStages?.some((s: any) => s.name === stage) || 
                      pipeline.closeStages?.some((s: any) => s.name === stage);
    
    if (!stageExists) {
      console.log('Stage not found in pipeline, using default stage');
      stage = pipeline.openStages && pipeline.openStages.length > 0
        ? pipeline.openStages[0].name
        : "New";
    }

    // Prepare close date
    let closeDate = leadData.closeDate;
    if (!closeDate) {
      closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    } else if (typeof closeDate === 'string') {
      closeDate = new Date(closeDate);
    }

    console.log('Creating lead with data:', {
      leadId,
      title: leadData.title,
      stage,
      pipelineId: pipeline._id,
      contactId: contact._id
    });

    // Create the lead
    const lead = await Lead.create({
      leadId,
      title: leadData.title,
      description: leadData.description || `Lead created from Zaptick for ${contact.firstName} ${contact.lastName}`,
      product: leadData.product || null,
      contact: contact._id,
      amount: leadData.amount || 0,
      closeDate: closeDate,
      source: leadData.source || null,
      assignedTo: leadData.assignedTo || adminUser._id,
      remarks: leadData.remarks || "Created via Zaptick integration",
      pipeline: pipeline._id,
      organization: organizationId,
      stage: stage,
      customFieldValues: [], // Empty array for proper validation
      timeline: [{
        stage: stage,
        action: "Created via Zaptick",
        remark: `Lead imported from Zaptick WhatsApp conversation`,
        timestamp: new Date(),
        createdBy: adminUser._id,
        movedBy: adminUser._id
      }],
      followups: [],
      notes: [],
      files: [],
      audioRecordings: [],
      links: []
    });

    // Add reference to the pipeline
    await Pipeline.findByIdAndUpdate(
      pipeline._id,
      { $push: { leads: lead._id } }
    );

    console.log('Lead created successfully:', lead._id);

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
      { 
        error: "Failed to create lead from Zaptick", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}