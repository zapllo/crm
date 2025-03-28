import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import ApiKey from '@/models/apiKeyModel';
import Contact from '@/models/contactModel';
import Lead from '@/models/leadModel';
import Company from '@/models/companyModel';
import mongoose from 'mongoose';

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
    
    // Parse the request body to get the search type and criteria
    const body = await request.json();
    const { searchKey, criteria } = body;
    
    if (!searchKey || !criteria) {
      return NextResponse.json(
        { error: "Search key and criteria are required" },
        { status: 400 }
      );
    }
    
    if (searchKey === 'find_contact') {
      // Get company IDs for this organization
      const companies = await Company.find({ organization: organizationId });
      const companyIds = companies.map(c => c._id);
      
      // Create a query to search by ID or email
      const query = {
        company: { $in: companyIds },
        $or: [
          // If criteria looks like a MongoDB ObjectId, search by ID
          ...(mongoose.Types.ObjectId.isValid(criteria) ? [{ _id: criteria }] : []),
          // Search by email (case insensitive)
          { email: new RegExp(criteria, 'i') }
        ]
      };
      
      // Find contacts matching the criteria
      const contacts = await Contact.find(query)
        .limit(10)
        .populate('company', 'companyName');
      
      return NextResponse.json(contacts);
    }
    
    if (searchKey === 'find_lead') {
      // Create a query to search by ID or title
      const query = {
        organization: organizationId,
        $or: [
          // If criteria looks like a MongoDB ObjectId, search by ID
          ...(mongoose.Types.ObjectId.isValid(criteria) ? [{ _id: criteria }] : []),
          // Search by lead ID (the custom ID format)
          { leadId: new RegExp(criteria, 'i') },
          // Search by title (case insensitive)
          { title: new RegExp(criteria, 'i') }
        ]
      };
      
      // Find leads matching the criteria
      const leads = await Lead.find(query)
        .limit(10)
        .populate({
          path: 'contact',
          select: 'firstName lastName email'
        })
        .populate('pipeline', 'name');
      
      return NextResponse.json(leads);
    }
    
    return NextResponse.json(
      { error: "Invalid search key" },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing Zapier search:', error);
    return NextResponse.json(
      { error: "Failed to process search" },
      { status: 500 }
    );
  }
}