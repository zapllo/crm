// app/api/integrations/tradeindia/fetchLeads/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import TradeIndiaIntegration from "@/models/tradeIndiaIntegrationModel";
import Lead from "@/models/leadModel";
import Contact from "@/models/contactModel";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load the user's TradeIndiaIntegration doc
    const setting = await TradeIndiaIntegration.findOne({ userId });
    if (!setting) {
      return NextResponse.json({ error: "No TradeIndia integration found" }, { status: 404 });
    }

    // Parse optional query params: e.g. ?fromDate=2025-03-18&toDate=2025-03-18&limit=10&page_no=1
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const limit = searchParams.get("limit") || "10";
    const pageNo = searchParams.get("page_no") || "1";

    // Build the tradeindia URL from docs
    // Example usage:
    // https://www.tradeindia.com/utils/my_inquiry.html?userid=xxx&profile_id=xxx&key=xxx&from_date=yyyy-mm-dd&to_date=yyyy-mm-dd&limit=10&page_no=1
    const apiUrl = "https://www.tradeindia.com/utils/my_inquiry.html";
    const params = {
      userid: setting.tradeIndiaUserId,
      profile_id: setting.tradeIndiaProfileId,
      key: setting.tradeIndiaKey,
      from_date: fromDate,
      to_date: toDate,
      limit,
      page_no: pageNo,
    };

    // Make the request:
    const response = await axios.get(apiUrl, { params });
    // The response data structure depends on how TradeIndia returns it
    // We'll call it `inquiries` for now:
    const inquiries = response.data; 
    // Possibly response.data.inquiries or something else. Adjust accordingly.

    // Insert them into CRM
    let count = 0;
    if (Array.isArray(inquiries)) {
      for (const inc of inquiries) {
        // We'll guess field names, adapt to actual structure:
        const buyerName = inc.buyerName || "Unknown";
        const buyerEmail = inc.email || "";
        const buyerMobile = inc.phone || "";
        const subject = inc.subject || "TradeIndia Lead";

        // 1) find or create contact
        let contactDoc = await Contact.findOne({ email: buyerEmail });
        if (!contactDoc) {
          contactDoc = new Contact({
            firstName: buyerName,
            email: buyerEmail,
            whatsappNumber: buyerMobile,
          });
          await contactDoc.save();
        }

        // 2) create lead
        await Lead.create({
          title: subject,
          contact: contactDoc._id,
          source: "TradeIndia",
          pipeline: setting.pipelineId || null, 
          // any other data...
        });

        count++;
      }
    }

    return NextResponse.json({
      message: `Fetched ${count} leads from TradeIndia.`,
      data: inquiries,
    });
  } catch (error) {
    console.error("Error fetching leads from TradeIndia:", error);
    return NextResponse.json({ error: "Failed to fetch TradeIndia leads" }, { status: 500 });
  }
}
