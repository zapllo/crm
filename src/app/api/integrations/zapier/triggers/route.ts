import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import ApiKey from '@/models/apiKeyModel';
import Contact from '@/models/contactModel';
import Lead from '@/models/leadModel';
import Company from '@/models/companyModel';

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
    
    // Verify the API key
    const validKey = await ApiKey.findOne({ key: apiKey, isActive: true });
    
    if (!validKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }
    
    // Get the organization ID from the API key
    const organizationId = validKey.organization;
    
    // Parse the request body to get the trigger type
    const body = await request.json();
    const { triggerKey, page = 1, limit = 25 } = body;
    
    const skip = (page - 1) * limit;
    
    if (triggerKey === 'new_contact') {
      // Get company IDs for this organization
      const companies = await Company.find({ organization: organizationId });
      const companyIds = companies.map(c => c._id);
      
      // Get the most recent contacts for these companies
      const contacts = await Contact.find({ company: { $in: companyIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('company', 'companyName');
      
      return NextResponse.json(contacts);
    }
    
    if (triggerKey === 'new_lead') {
      // Get the most recent leads for this organization
      const leads = await Lead.find({ organization: organizationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'contact',
          select: 'firstName lastName email whatsappNumber'
        })
        .populate('pipeline', 'name')
        .populate('assignedTo', 'firstName lastName email');
      
      return NextResponse.json(leads);
    }
    
    return NextResponse.json(
      { error: "Invalid trigger key" },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing Zapier trigger:', error);
    return NextResponse.json(
      { error: "Failed to process trigger" },
      { status: 500 }
    );
  }
}