import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Followup from '@/models/followupModel';
import { User } from '@/models/userModel';
import Lead from '@/models/leadModel';
import Contact from '@/models/contactModel';
import { sendFollowupReminderEmail } from '@/lib/emailTemplates';

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

// Function to check if a reminder should be sent based on its configuration
function shouldSendReminder(reminder: any, followupDate: Date): boolean {
  if (reminder.sent) return false; // Skip if already sent

  const now = new Date();

  // For a specific date reminder
  if (reminder.type === 'specific' && reminder.date) {
    const reminderTime = new Date(reminder.date);
    return now >= reminderTime;
  }

  // For relative time-based reminders
  if (['minutes', 'hours', 'days'].includes(reminder.type) && reminder.value) {
    const followupTime = new Date(followupDate).getTime();
    let reminderTime: number;

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
      default:
        return false;
    }

    // This is where the issue was - for future dates, this will always be false
    // We need a different approach for testing
    return now.getTime() >= reminderTime;
  }

  return false;
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectDB();

    // Get a query parameter for testing
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get("testMode") === "true";
    const followupId = searchParams.get("followupId");

    let followups;

    if (testMode && followupId) {
      // In test mode, find the specific follow-up by ID regardless of date
      console.log(`Test mode enabled for followup: ${followupId}`);
      followups = await Followup.find({
        _id: followupId,
        stage: 'Open',
        'reminders.sent': false
      });
    } else {
      // Normal mode - only find follow-ups where the reminder time is in the past
      const currentDate = new Date();

      followups = await Followup.find({
        stage: 'Open',
        'reminders.sent': false
      });
    }

    console.log(`Found ${followups.length} follow-ups with potential reminders`);

    const results = {
      processed: 0,
      emailsSent: 0,
      whatsappSent: 0,
      errors: [] as string[]
    };

    // Process each follow-up
    for (const followup of followups) {
      try {
        console.log(`Processing followup: ${followup._id}`);
        const user = await User.findById(followup.addedBy);
        const lead = await Lead.findById(followup.lead);

        if (!user || !lead) {
          console.error(`Missing user or lead data for followup: ${followup._id}`);
          continue;
        }

        // Get contact details for the lead
        const contact = await Contact.findById(lead.contact);
        const contactName = contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';

        // Format the date for WhatsApp
        const formattedDate = new Date(followup.followupDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: '2-digit'
        });

        // Create follow-up details for notifications
        const followupDetails = {
          description: followup.description,
          type: followup.type,
          followupDate: followup.followupDate,
          leadTitle: lead.title,
          contactName: contactName,
          leadId: lead._id
        };

        // Check each reminder
        let updatedReminders = [...followup.reminders];
        let remindersUpdated = false;

        for (let i = 0; i < updatedReminders.length; i++) {
          const reminder = updatedReminders[i];

          const shouldSend = testMode ? true : shouldSendReminder(reminder, followup.followupDate);

          if (!reminder.sent && (shouldSend || testMode)) {
            try {
              // Send notification based on type
              if (reminder.notificationType === 'email' && user.email) {
                await sendFollowupReminderEmail({
                  to: user.email,
                  firstName: user.firstName,
                  followupDetails
                });
                results.emailsSent++;
                console.log(`Email reminder sent to ${user.email} for followup: ${followup._id}`);
              }

              if (reminder.notificationType === 'whatsapp' && user.whatsappNo) {
                const templateName = 'followup_reminder';
                const bodyVariables = [
                  user.firstName,
                  contactName,
                  formattedDate
                ];

                await sendWebhookNotification(
                  user.whatsappNo,
                  "IN", // Country code, assuming India as default
                  templateName,
                  bodyVariables
                );
                results.whatsappSent++;
                console.log(`WhatsApp reminder sent to ${user.whatsappNo} for followup: ${followup._id}`);
              }

              // Mark reminder as sent
              updatedReminders[i] = { ...reminder, sent: true };
              remindersUpdated = true;

            } catch (error: any) {
              console.error(`Error sending notification for followup ${followup._id}:`, error);
              results.errors.push(`Followup ${followup._id}: ${error.message}`);
            }
          }
        }

        // Update follow-up with sent reminders if needed
        if (remindersUpdated) {
          await Followup.findByIdAndUpdate(followup._id, {
            reminders: updatedReminders
          });
        }

        results.processed++;

      } catch (error: any) {
        console.error(`Error processing followup ${followup._id}:`, error);
        results.errors.push(`Followup ${followup._id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    console.error('Error processing follow-up reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process follow-up reminders: ' + error.message },
      { status: 500 }
    );
  }
}
