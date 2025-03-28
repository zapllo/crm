import { NextRequest, NextResponse } from 'next/server';
import { User } from "@/models/userModel";
import Contact from '@/models/contactModel';
import Company from '@/models/companyModel';
import crypto from 'crypto';
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
    // You would need to add ApiKey model import
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
    if (!body.data || !body.data.firstName || !body.data.lastName || !body.data.email || !body.data.company) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const contactData = body.data;
    const organizationId = validKey.organization;
    
    // Find the company by name or ID
    let company;
    
    if (typeof contactData.company === 'string') {
      // If company is a string, try to find by ID or name
      company = await Company.findOne({
        $or: [
          { _id: contactData.company },
          { companyName: contactData.company }
        ],
        organization: organizationId
      });
      
      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
    } else {
      // Assume it's an ID
      company = await Company.findOne({
        _id: contactData.company,
        organization: organizationId
      });
      
      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
    }
    
    // Check if contact already exists
    const existingContact = await Contact.findOne({ 
      email: contactData.email,
      company: company._id
    });
    
    let contact;
    
    if (existingContact) {
      // Update existing contact
      contact = await Contact.findByIdAndUpdate(
        existingContact._id,
        {
          ...contactData,
          company: company._id,
        },
        { new: true }
      );
    } else {
      // Create new contact
      contact = await Contact.create({
        ...contactData,
        company: company._id,
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: existingContact ? "Contact updated" : "Contact created",
      contact
    });
  } catch (error) {
    console.error('Error processing contact webhook:', error);
    return NextResponse.json(
      { error: "Failed to process contact" },
      { status: 500 }
    );
  }
}