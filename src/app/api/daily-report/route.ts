import connectDB from '@/lib/db';
import { sendDailyReportEmail } from '@/lib/emailTemplates';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';
import Lead from '@/models/leadModel';
import Followup from '@/models/followupModel';
import Pipeline from '@/models/pipelineModel';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
    try {
        await connectDB();



        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        // Find all organizations that have daily report time matching current time
        const organizations = await Organization.find({
            'notifications.dailyReportTime': currentTimeString
        });

        console.log(`Found ${organizations.length} organizations for daily report at ${currentTimeString}`);

        if (organizations.length === 0) {
            return NextResponse.json({ message: "No reports to send at this time" });
        }

        // Process each organization
        for (const organization of organizations) {
            // Get all users in this organization
            const users = await User.find({ organization: organization._id });

            // Get all pipelines for this organization to identify won/lost stages
            const pipelines = await Pipeline.find({ organization: organization._id });

            // Create a map of all won/lost stages
            const wonStages = new Set();
            const lostStages = new Set();

            pipelines.forEach(pipeline => {
                pipeline.closeStages.forEach((stage: { won: boolean, lost: boolean, name: string }) => {
                    if (stage.won) wonStages.add(stage.name);
                    if (stage.lost) lostStages.add(stage.name);
                });
            });

            // Process each user
            for (const user of users) {
                // Get all leads assigned to this user
                const userLeads = await Lead.find({ assignedTo: user._id });

                // Calculate statistics
                const totalLeads = userLeads.length;
                const openLeads = userLeads.filter(lead =>
                    !wonStages.has(lead.stage) && !lostStages.has(lead.stage)).length;
                const wonLeads = userLeads.filter(lead => wonStages.has(lead.stage)).length;
                const lostLeads = userLeads.filter(lead => lostStages.has(lead.stage)).length;

                // Get pending followups for this user
                const pendingFollowups = await Followup.find({
                    addedBy: user._id,
                    stage: 'Open'
                }).populate('lead', 'title');


                // Format followup data for the email
                const formattedFollowups = pendingFollowups.map(followup => ({
                    description: followup.description,
                    type: followup.type,
                    followupDate: followup.followupDate,
                    leadTitle: followup.lead ? (followup.lead as any).title : 'Unknown Lead'
                }));

                // Prepare the report data object
                const reportData = {
                    totalLeads,
                    openLeads,
                    wonLeads,
                    lostLeads,
                    pendingFollowups: formattedFollowups
                };

                // Send notifications based on user preferences
                const promises = [];

                // Email notification
                if (organization.notifications?.dailyReportTime) {
                    promises.push(sendDailyReportEmail({
                        to: user.email,
                        firstName: user.firstName,
                        reportData
                    }));
                }

                // Send WhatsApp notification for daily report
                if (organization.notifications?.dailyReportTime && user.whatsappNo) {
                    try {
                        // Format today's date for the message
                        const today = new Date();
                        const formattedDate = today.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit'
                        });

                        // Prepare the webhook payload
                        const webhookPayload = {
                            phoneNumber: user.whatsappNo,
                            country: "IN", // Default to India if not specified
                            templateName: "crmdailyreport", // Name of your Interakt template
                            bodyVariables: [
                                user.firstName, // User's name
                                formattedDate, // Today's date
                                totalLeads.toString(), // Total leads count
                                openLeads.toString(), // Open leads count
                                wonLeads.toString(), // Won leads count
                                lostLeads.toString(), // Lost leads count
                                pendingFollowups.length.toString(), // Pending followups count
                                "crm.zapllo.com" // CRM URL
                            ]
                        };
                        console.log(webhookPayload, 'webhook payload');
                        // Send the webhook request
                        const response = await fetch("https://zapllo.com/api/webhook", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(webhookPayload)
                        });

                        if (!response.ok) {
                            throw new Error(`Webhook API error: ${response.status}`);
                        }

                        console.log(`Daily report WhatsApp notification sent successfully to ${user.whatsappNo}`);
                    } catch (error) {
                        console.error(`Error sending daily report WhatsApp to ${user.whatsappNo}:`, error);
                        // Continue execution, don't fail for this user
                    }
                }
                // Execute all notifications in parallel
                await Promise.all(promises).catch(error => {
                    console.error(`Error sending notifications to user ${user.email}:`, error);
                });

                console.log(`Sent daily report to ${user.email}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Daily reports sent to ${organizations.length} organizations`
        });
    } catch (error) {
        console.error('Error sending daily reports:', error);
        return NextResponse.json({ error: 'Failed to send daily reports' }, { status: 500 });
    }
}