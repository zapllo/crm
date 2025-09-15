import { NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import { sendFormShareEmail } from "@/lib/emailTemplates";
import FormModel from "@/models/formBuilderModel";

export async function POST(req: Request) {
  try {
    await connectDB();

    // Get user data from token
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request data
    const body = await req.json();
    const { formId, formName, to, subject, recipientName, message, formUrl } = body;

    // Validate form exists and belongs to the user
    const form = await FormModel.findOne({
      _id: formId,
      organization: user.organization
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Send email
    await sendFormShareEmail({
      to,
      subject,
      firstName: recipientName || "there",
      formDetails: {
        formName: formName || form.name || "Form",
        message: message,
        senderName: `${user.firstName} ${user.lastName}`,
        formUrl
      }
    });

    return NextResponse.json({
      success: true,
      message: "Form shared via email successfully"
    });

  } catch (error) {
    console.error("Error sharing form via email:", error);
    return NextResponse.json(
      { error: "Failed to share form via email" },
      { status: 500 }
    );
  }
}
