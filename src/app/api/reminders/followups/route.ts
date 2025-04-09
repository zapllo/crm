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
    // Connect to the database
    await connectDB();

    console.log(`Followup reminder check started at: ${new Date().toISOString()}`);

    // Get a query parameter for testing
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get("testMode") === "true";
    const followupId = searchParams.get("followupId");

    console.log(`Test mode: ${testMode}, Followup ID: ${followupId || 'none'}`);

    // FIRST, find all open followups
    let query: any = { stage: 'Open' };

    if (testMode && followupId) {
      query._id = new mongoose.Types.ObjectId(followupId);
      console.log(`Test mode enabled for followup: ${followupId}`);
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

    // Process each followup
    for (const followup of followups) {
      try {
        console.log(`Checking followup: ${followup._id}, scheduled for: ${new Date(followup.followupDate).toISOString()}`);

        // Check if there are any unsent reminders
        const hasUnsentReminders = followup.reminders.some((r: { sent: boolean }) => r.sent === false);
        if (!hasUnsentReminders && !testMode) {
          console.log(`Followup ${followup._id} has no unsent reminders, skipping`);
          continue;
        }

        // Get user and lead information
        const [user, lead] = await Promise.all([
          User.findById(followup.addedBy),
          Lead.findById(followup.lead)
        ]);

        if (!user || !lead) {
          console.error(`Missing user or lead data for followup: ${followup._id}`);
          continue;
        }

        // Get contact information
        const contact = await Contact.findById(lead.contact);
        const contactName = contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';

        // Format date for display
        const formattedDate = new Date(followup.followupDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: '2-digit'
        });

        // Prepare followup details for notifications
        const followupDetails = {
          description: followup.description,
          type: followup.type,
          followupDate: followup.followupDate,
          leadTitle: lead.title,
          contactName: contactName,
          leadId: lead._id
        };

        // Track which reminders need to be updated
        let remindersToUpdate = [];

        // Process each reminder individually
        for (const reminder of followup.reminders) {
          // Skip already sent reminders
          if (reminder.sent === true) {
            console.log(`Reminder ${reminder._id} already sent, skipping`);
            continue;
          }

          // Determine if we should send now
          let shouldSend = testMode;

          if (!testMode) {
            if (reminder.type === 'specific' && reminder.date) {
              shouldSend = now >= new Date(reminder.date);
            } else if (['minutes', 'hours', 'days'].includes(reminder.type) && reminder.value) {
              const followupTime = new Date(followup.followupDate).getTime();
              let reminderTime;

              switch (reminder.type) {
                case 'minutes':
                  reminderTime = followupTime - (reminder.value * 60 * 1000);
                  break;
                case 'hours':
                  reminderTime = followupTime - (reminder.value * 60 * 60 * 1000);
                  break;
                case 'days':
                  reminderTime = followupTime - (reminder.value * 24 * 60 * 60 * 1000);
                  break;
              }

              shouldSend = now.getTime() >= reminderTime!;
            }
          }

          console.log(`Reminder ${reminder._id} should send: ${shouldSend}`);

          // Send notifications if needed
          if (shouldSend) {
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
                console.log(`Email sent to ${user.email} for followup ${followup._id}`);
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
                console.log(`WhatsApp sent to ${user.whatsappNo} for followup ${followup._id}`);
              }

              // Add to the list of reminders to mark as sent
              remindersToUpdate.push(reminder._id);

            } catch (error: any) {
              console.error(`Error sending notification for followup ${followup._id}:`, error);
              results.errors.push(`Followup ${followup._id}, Reminder ${reminder._id}: ${error.message}`);
            }
          }
        }

        // Update the reminders that were sent - CRITICAL CHANGE
        if (remindersToUpdate.length > 0) {
          console.log(`Marking reminders as sent: ${remindersToUpdate.join(', ')}`);

          // Use atomic update operation instead of replacing the whole array
          const updateResult = await Followup.updateOne(
            { _id: followup._id },
            {
              $set: {
                "reminders.$[elem].sent": true
              }
            },
            {
              arrayFilters: [{ "elem._id": { $in: remindersToUpdate } }],
              new: true
            }
          );

          console.log(`Database update result:`, updateResult);
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
      {
        success: false,
        error: 'Failed to process follow-up reminders: ' + error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
