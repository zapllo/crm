// app/api/public-leads/route.ts
import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Lead from "@/models/leadModel"
import Contact from "@/models/contactModel"
import Pipeline from "@/models/pipelineModel"
import Source from "@/models/sourceModel"
import { Organization } from "@/models/organizationModel"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    await connectDB()

    const {
      pipeline,
      stage,
      title,
      description,
      product,
      contact,
      assignedTo,
      estimateAmount,
      closeDate,
      source,
      files,
      audioRecordings,
      links
    } = await request.json()

    // Basic validation
    if (!pipeline || !stage || !title || !contact) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    // Validate references if you still store them as ObjectIds:
    if (!mongoose.Types.ObjectId.isValid(pipeline)) {
      return NextResponse.json({ error: "Invalid pipeline ID" }, { status: 400 })
    }
    if (!mongoose.Types.ObjectId.isValid(contact)) {
      return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 })
    }
    // etc.

    // Optionally find pipelineDoc to confirm it exists
    const pipelineDoc = await Pipeline.findById(pipeline)
    if (!pipelineDoc) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
    }

    // Optionally find contactDoc to confirm it exists
    const contactDoc = await Contact.findById(contact)
    if (!contactDoc) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    // If you still want unique lead IDs, you can do something like:
    const orgId = pipelineDoc.organization  // Possibly store for reference
    const totalLeadsInOrg = await Lead.countDocuments({ organization: orgId })
    const leadId = `L-${totalLeadsInOrg + 1}`

    const newLead = new Lead({
      leadId,
      pipeline,
      stage,
      title,
      description,
      product,
      contact,
      assignedTo,
      amount: estimateAmount,
      organization: orgId, // or leave null if no org check is needed
      closeDate,
      source,
      files: files || [],
      audioRecordings: audioRecordings || [],
      links: links || []
    })

    const savedLead = await newLead.save()
    return NextResponse.json(savedLead, { status: 201 })
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const leads = await Lead.find({})
      .populate("contact")
      .populate({ path: "assignedTo", select: "firstName lastName" })
      .sort({ createdAt: -1 })

    return NextResponse.json(leads, { status: 200 })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}
