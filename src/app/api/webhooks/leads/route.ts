import { NextRequest, NextResponse } from 'next/server';
import { User } from "@/models/userModel";
import Lead from '@/models/leadModel';
import Contact from '@/models/contactModel';
import Pipeline from '@/models/pipelineModel';
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

    // Basic validation
    if (!body.data || !body.data.title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const leadData = body.data;
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

    // Find or create the contact
    let contact;

    if (leadData.contact) {
      if (typeof leadData.contact === 'string') {
        // If it's a string, try to find by ID or email
        contact = await Contact.findOne({
          $or: [
            { _id: leadData.contact },
            { email: leadData.contact }
          ]
        });
      } else if (typeof leadData.contact === 'object') {
        // It might be a contact object with contact details
        if (leadData.contact.email) {
          contact = await Contact.findOne({ email: leadData.contact.email });
        }
      } else {
        // Assume it's an ID
        contact = await Contact.findById(leadData.contact);
      }
    }

    // If contact doesn't exist and we have contact data, create it
    if (!contact && leadData.contact && typeof leadData.contact === 'object') {
      const contactData = leadData.contact;

      // Validate required fields for contact creation
      if (!contactData.email || !contactData.firstName || !contactData.lastName ||
          !contactData.country || !contactData.whatsappNumber) {
        return NextResponse.json(
          { error: "Missing required contact fields. Need email, firstName, lastName, country and whatsappNumber" },
          { status: 400 }
        );
      }

      try {
        contact = await Contact.create({
          company: organizationId, // Assuming company is the organization
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          country: contactData.country,
          whatsappNumber: contactData.whatsappNumber,
          state: contactData.state || "",
          city: contactData.city || "",
          pincode: contactData.pincode || "",
          address: contactData.address || "",
          dateOfBirth: contactData.dateOfBirth || null,
          dateOfAnniversary: contactData.dateOfAnniversary || null,
          customFieldValues: contactData.customFieldValues || [],
          tags: contactData.tags || []
        });
      } catch (error:any) {
        return NextResponse.json(
          { error: "Failed to create contact", details: error.message },
          { status: 400 }
        );
      }
    }

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found or could not be created. Please provide valid contact information." },
        { status: 404 }
      );
    }

    // Find the pipeline
    let pipeline;

    if (leadData.pipeline) {
      pipeline = await Pipeline.findOne({
        $or: [
          { _id: leadData.pipeline },
          { name: leadData.pipeline }
        ],
        organization: organizationId
      });
    } else {
      // Get the default pipeline for the organization
      pipeline = await Pipeline.findOne({
        organization: organizationId
      });
    }

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    // Get the count of leads for generating a lead ID
    const leadCount = await Lead.countDocuments({ organization: organizationId });
    const leadId = `LEAD-${leadCount + 1}`;

    // Determine the stage
    let stage = leadData.stage;
    if (!stage) {
      // Use the first stage from the pipeline if not specified
      stage = pipeline.openStages && pipeline.openStages.length > 0
        ? pipeline.openStages[0].name
        : "New";
    }

    // Create the lead
    const lead = await Lead.create({
      leadId,
      title: leadData.title,
      description: leadData.description || "",
      product: leadData.product,
      contact: contact._id,
      amount: leadData.amount,
      closeDate: leadData.closeDate,
      source: leadData.source,
      assignedTo: leadData.assignedTo || adminUser._id,
      remarks: leadData.remarks || "",
      pipeline: pipeline._id,
      organization: organizationId,
      stage: stage,
      timeline: [{
        stage: stage,
        action: "Created via webhook",
        remark: "External integration",
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
      message: "Lead created successfully",
      lead,
      contact
    });
  } catch (error:any) {
    console.error('Error processing lead webhook:', error);
    return NextResponse.json(
      { error: "Failed to process lead", details: error.message },
      { status: 500 }
    );
  }
}
