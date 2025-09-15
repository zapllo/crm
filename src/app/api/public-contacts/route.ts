// app/api/public-contacts/route.ts
import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Contact from "@/models/contactModel"
import { Types } from "mongoose"
import companyModel from "@/models/companyModel"

export async function POST(request: Request) {
  try {
    await connectDB()

    const data = await request.json()
    const {
      companyId,
      firstName,
      lastName,
      email,
      country,
      whatsappNumber,
      state,
      city,
      pincode,
      address,
      dateOfBirth,
      dateOfAnniversary,
      customFieldValues
    } = data

    // Basic validation
    if (!companyId || !firstName || !lastName || !email || !whatsappNumber) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }

    // Validate companyId if you still store references to Company
    if (!Types.ObjectId.isValid(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 })
    }

    // Optionally, verify the company actually exists:
    const company = await companyModel.findById(companyId)
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Create the contact
    const newContact = new Contact({
      company: companyId,
      firstName,
      lastName,
      email,
      country,
      whatsappNumber,
      state,
      city,
      pincode,
      address,
      dateOfBirth: dateOfBirth || null,
      dateOfAnniversary: dateOfAnniversary || null,
      customFieldValues
    })

    await newContact.save()

    return NextResponse.json(newContact, { status: 201 })
  } catch (error: any) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
