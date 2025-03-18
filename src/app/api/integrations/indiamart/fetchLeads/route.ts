// app/api/integrations/indiamart/fetchLeads/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import IndiaMartIntegration from "@/models/indiaMartIntegrationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import axios from "axios";
import Lead from "@/models/leadModel";
import Contact from "@/models/contactModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // find user's IndiaMART record
    const setting = await IndiaMartIntegration.findOne({ userId });
    if (!setting) {
      return NextResponse.json({ error: "No IndiaMART integration found" }, { status: 404 });
    }

    // parse optional query params from request, e.g. ?start=0&rows=10&fromDate=yyyy-mm-dd
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start") || "0";
    const rows = searchParams.get("rows") || "10";
    const fromDate = searchParams.get("fromDate") || "";

    // 1) Possibly pass to IndiaMART's API if supported
    //    Check their docs for a param name. For example, maybe "dateFrom" or "start_time".
    //    If there's no such param, you can skip or handle filtering yourself.

    const apiUrl = "https://mapi.indiamart.com/wservce/enquiry/listing";
    const params: any = {
      glusr_crm_key: setting.apiKey,
      start,
      rows,
    };

    // If the IndiaMART API supports a date param, do something like:
    if (fromDate) {
      // e.g. params.fromDate = fromDate;
      // or transform fromDate to match their format (YYYY-MM-DD or dd/mm/yyyy, etc.)
    }

    // Make the GET request to IndiaMART
    const response = await axios.get(apiUrl, { params });
    const leadsData = response.data;

    // 2) Filter results if you need server-side logic
    //    If IndiaMART doesn't filter by date, you can do it manually:
    let filteredLeads = leadsData;
    if (fromDate) {
      // Convert fromDate to a date object
      const fromDateObj = new Date(fromDate);
      // We assume leadsData has a date field, e.g. `ld.RECEIVED_DATE`
      filteredLeads = leadsData.filter((ld: any) => {
        if (!ld.RECEIVED_DATE) return true; // or false
        const leadDate = new Date(ld.RECEIVED_DATE);
        return leadDate >= fromDateObj;
      });
    }

    // 3) Insert leads into CRM
    let count = 0;
    if (Array.isArray(filteredLeads)) {
      for (const ld of filteredLeads) {
        const buyerName = ld.NAME || "Unknown";
        const buyerMobile = ld.MOB || "";
        const buyerEmail = ld.EMAIL_ID || "";
        const subject = ld.SUBJECT || "IndiaMART Lead";

        // find or create contact
        let contactDoc = await Contact.findOne({ email: buyerEmail });
        if (!contactDoc) {
          contactDoc = new Contact({
            firstName: buyerName,
            email: buyerEmail,
            whatsappNumber: buyerMobile,
          });
          await contactDoc.save();
        }

        // create lead
        await Lead.create({
          leadId: "IM-" + ld.UNIQUE_QUERY_ID,
          title: subject,
          contact: contactDoc._id,
          source: "IndiaMART",
          pipeline: setting.pipelineId || null,
        });
        count++;
      }
    }

    return NextResponse.json({
      message: `Fetched ${count} leads from IndiaMART.`,
      leadsData: filteredLeads,
    });
  } catch (error) {
    console.error("Error fetching IndiaMART leads:", error);
    return NextResponse.json({ error: "Failed to fetch IndiaMART leads" }, { status: 500 });
  }
}
