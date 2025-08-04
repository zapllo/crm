import { NextRequest, NextResponse } from 'next/server';
import { User } from "@/models/userModel";
import { Organization } from "@/models/organizationModel";
import Contact from '@/models/contactModel';
import Lead from '@/models/leadModel';
import crypto from 'crypto';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get the webhook signature from the request headers
    const signature = request.headers.get('x-webhook-signature');
    const organizationId = request.headers.get('x-organization-id');
    
    if (!signature || !organizationId) {
      return NextResponse.json(
        { error: "Missing required headers" },
        { status: 401 }
      );
    }
    
    // Get the organization directly
    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 401 }
      );
    }
    
    // Check if webhooks are enabled for this organization
    if (!organization.apiConfigurations?.webhooksEnabled) {
      return NextResponse.json(
        { error: "Webhooks are disabled for this organization" },
        { status: 403 }
      );
    }
    
    // Get an admin user for reference
    const adminUser = await User.findOne({
      organization: organizationId,
      role: "admin"
    });
    
    if (!adminUser) {
      return NextResponse.json(
        { error: "No admin user found for this organization" },
        { status: 400 }
      );
    }
    
    // Get the request body as text to verify the signature
    const body = await request.text();
    
    // Verify the signature using the organization's webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', organization.webhookSecret)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
    
    // Parse the body
    const payload = JSON.parse(body);
    
    // Process the webhook based on the event
    if (payload.event === 'contact.created' || payload.event === 'contact.updated') {
      const contactData = payload.data;
      
      if (!contactData.company) {
        return NextResponse.json(
          { error: "Company ID is required for contact operations" },
          { status: 400 }
        );
      }
      
      if (payload.event === 'contact.created') {
        // Create a new contact
        await Contact.create({
          ...contactData,
          company: contactData.company
        });
      } else {
        // Update an existing contact
        await Contact.findOneAndUpdate(
          { email: contactData.email, company: contactData.company },
          contactData,
          { upsert: true }
        );
      }
      
      return NextResponse.json({ success: true, message: "Contact processed successfully" });
    }
    
    if (payload.event === 'lead.created' || payload.event === 'lead.updated') {
      const leadData = payload.data;
      
      if (!leadData.contact || !leadData.pipeline) {
        return NextResponse.json(
          { error: "Contact ID and Pipeline ID are required for lead operations" },
          { status: 400 }
        );
      }
      
      // Set the organization from the header
      leadData.organization = organizationId;
      
      // Get the count of leads for generating a lead ID
      const leadCount = await Lead.countDocuments({ organization: organizationId });
      const leadId = `LEAD-${leadCount + 1}`;
      
      if (payload.event === 'lead.created') {
        // Create a new lead
        await Lead.create({
          ...leadData,
          leadId,
          stage: leadData.stage || "New", // Default stage
          timeline: [{
            stage: leadData.stage || "New",
            action: "Created via webhook",
            remark: "External integration",
            timestamp: new Date(),
            movedBy: adminUser._id // Use an admin user as the creator
          }]
        });
      } else {
        // Update an existing lead
        const existingLead = await Lead.findOne({
          _id: leadData._id,
          organization: organizationId
        });
        
        if (!existingLead) {
          return NextResponse.json(
            { error: "Lead not found" },
            { status: 404 }
          );
        }
        
        // If stage is changed, add to timeline
        if (leadData.stage && leadData.stage !== existingLead.stage) {
          leadData.timeline = [
            ...existingLead.timeline,
            {
              stage: leadData.stage,
              action: "Updated via webhook",
              remark: payload.source || "External integration",
              timestamp: new Date(),
              movedBy: adminUser._id
            }
          ];
        }
        
        await Lead.findByIdAndUpdate(existingLead._id, leadData);
      }
      
      return NextResponse.json({ success: true, message: "Lead processed successfully" });
    }
    
    // Respond with error for unhandled event types
    return NextResponse.json(
      { error: "Unsupported event type" },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}