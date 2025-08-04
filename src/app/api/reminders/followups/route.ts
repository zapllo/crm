import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Followup from '@/models/followupModel';
import { User } from '@/models/userModel';
import Lead from '@/models/leadModel';
import Contact from '@/models/contactModel';
import { sendFollowupReminderEmail } from '@/lib/emailTemplates';
import mongoose from 'mongoose';

// Reusing the webhook function from leads API
const sendWebhookNotification = async (
  phoneNumber: string,
  country: string,
  templateName: string,
  bodyVariables: string[]
) => {
  const payload = {
    phoneNumber,
    country,
    bodyVariables,
    templateName,
  };
  try {
    const response = await fetch('https://zapllo.com/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(`Webhook API error: ${responseData.message}`);
    }
    console.log('Webhook notification sent successfully:', payload);
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    throw new Error('Failed to send webhook notification');
  }
};

export async function GET(request: Request) {
  try {
    await connectDB();

    console.log(`Followup reminder check started at: ${new Date().toISOString()}`);
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get("testMode") === "true";
    const followupId = searchParams.get("followupId");
    const forceMode = searchParams.get("force") === "true";

    console.log(`Test mode: ${testMode}, Force mode: ${forceMode}, Followup ID: ${followupId || 'none'}`);

    // Find open followups - either all of them or a specific one
    let query: any = { stage: 'Open' };

    if (followupId) {
      query._id = new mongoose.Types.ObjectId(followupId);
    }

    const followups = await Followup.find(query);
    console.log(`Found ${followups.length} open followups`);

    const results = {
      processed: 0,
      emailsSent: 0,
      whatsappSent: 0,
      errors: [] as string[]
    };

    const now = new Date();
    const currentTime = {
      hours: now.getHours(),
      minutes: now.getMinutes()
    };

    // Process each followup
    for (const followup of followups) {
      try {
        const followupDate = new Date(followup.followupDate);
        console.log(`Checking followup ${followup._id}, scheduled for ${followupDate.toISOString()}`);

        // For each reminder in the followup
        for (const reminder of followup.reminders) {
          // Skip if already sent
          if (reminder.sent && !forceMode) {
            console.log(`Reminder ${reminder._id} already sent, skipping`);
            continue;
          }

          // Determine if we should send the reminder now
          let shouldSend = testMode || forceMode;

          if (!shouldSend) {
            // For minutes reminder with value 0, check exact match
            if (reminder.type === 'minutes' && reminder.value === 0) {
              // If the followup is today
              const isToday =
                followupDate.getDate() === now.getDate() &&
                followupDate.getMonth() === now.getMonth() &&
                followupDate.getFullYear() === now.getFullYear();

              if (isToday) {
                shouldSend =
                  followupDate.getHours() === currentTime.hours &&
                  followupDate.getMinutes() === currentTime.minutes;
              } else {
                // For future dates, just match the hour and minute for testing
                shouldSend =
                  followupDate.getHours() === currentTime.hours &&
                  followupDate.getMinutes() === currentTime.minutes;
              }
            }
            // For non-zero minute values, calculate the reminder time
            else if (reminder.type === 'minutes' && reminder.value && reminder.value > 0) {
              const reminderTimeMs = followupDate.getTime() - (reminder.value * 60 * 1000);
              const reminderTime = new Date(reminderTimeMs);

              // For reminders today
              const isToday =
                reminderTime.getDate() === now.getDate() &&
                reminderTime.getMonth() === now.getMonth() &&
                reminderTime.getFullYear() === now.getFullYear();

              if (isToday) {
                shouldSend =
                  reminderTime.getHours() === currentTime.hours &&
                  reminderTime.getMinutes() === currentTime.minutes;
              } else {
                // For future dates, just match the hour and minute for testing
                shouldSend =
                  reminderTime.getHours() === currentTime.hours &&
                  reminderTime.getMinutes() === currentTime.minutes;
              }
            }
          }

          console.log(`Reminder ${reminder._id} should send: ${shouldSend}`);

          if (shouldSend) {
            // Get user, lead, and contact information
            const [user, lead] = await Promise.all([
              User.findById(followup.addedBy),
              Lead.findById(followup.lead)
            ]);

            if (!user || !lead) {
              console.error(`Missing user or lead data for followup ${followup._id}`);
              continue;
            }

            const contact = await Contact.findById(lead.contact);
            const contactName = contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';

            // Format the date for display
            const formattedDate = new Date(followup.followupDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: '2-digit'
            });

            // Prepare followup details
            const followupDetails = {
              description: followup.description,
              type: followup.type,
              followupDate: followup.followupDate,
              leadTitle: lead.title,
              contactName: contactName,
              leadId: lead._id
            };

            try {
              // Send email notification
              if (reminder.notificationType === 'email' && user.email) {
                console.log(`Sending email to ${user.email}`);
                await sendFollowupReminderEmail({
                  to: user.email,
                  firstName: user.firstName,
                  followupDetails
                });
                results.emailsSent++;
                console.log(`Email sent successfully to ${user.email}`);
              }

              // Send WhatsApp notification
              if (reminder.notificationType === 'whatsapp' && user.whatsappNo) {
                console.log(`Sending WhatsApp to ${user.whatsappNo}`);
                const templateName = 'followup_reminder';
                const bodyVariables = [
                  user.firstName,
                  contactName,
                  formattedDate
                ];

                await sendWebhookNotification(
                  user.whatsappNo,
                  "IN",
                  templateName,
                  bodyVariables
                );
                results.whatsappSent++;
                console.log(`WhatsApp sent successfully to ${user.whatsappNo}`);
              }

              // Mark the reminder as sent - CRITICAL FIX
              if (!forceMode) {
                await Followup.updateOne(
                  { _id: followup._id, "reminders._id": reminder._id },
                  { $set: { "reminders.$.sent": true } }
                );
                console.log(`Marked reminder ${reminder._id} as sent`);
              } else {
                console.log(`Force mode active - not marking reminder as sent`);
              }
            } catch (error: any) {
              console.error(`Error sending notification:`, error);
              results.errors.push(`Error: ${error.message}`);
            }
          }
        }

        results.processed++;
      } catch (error: any) {
        console.error(`Error processing followup:`, error);
        results.errors.push(`General error: ${error.message}`);
      }
    }

    console.log(`Followup reminder check completed at: ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error processing follow-up reminders:', error);
    return NextResponse.json(
      { success: false, error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
