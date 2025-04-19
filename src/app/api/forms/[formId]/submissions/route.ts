import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FormModel from '@/models/formBuilderModel';
import FormSubmission from '@/models/formSubmissionModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import Organization from '@/models/organizationModel';

export async function GET(request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const formId = (await params).formId

    // Get userId from the 'token' cookie
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // First, get the user
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the form to check authorization
    const form = await FormModel.findById(formId);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Only allow access to form creators or users in the same organization
    const isAuthorized = form.creator.toString() === userId ||
      form.organization.toString() === user.organization.toString();

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || null;

    // Build query
    const query: any = { form: formId };

    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const submissions = await FormSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FormSubmission.countDocuments(query);

    return NextResponse.json({
      success: true,
      submissions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error(`Error fetching submissions:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const formId = (await params).formId;
    await connectDB();

    // Find the form
    const form = await FormModel.findById(formId);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    const organization = await Organization.findById(form.organization);
    if (!organization) {
      return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });
    }

    // Get submission count data with proper defaults
    const submissionsCount = organization.formBuilder?.submissionsCount || {
      currentMonth: 0,
      lastResetDate: new Date()
    };

    // Ensure we have valid values (handle potential null/undefined)
    const currentMonth = submissionsCount.currentMonth || 0;
    const lastResetDate = submissionsCount.lastResetDate || new Date();

    // Check if we need to reset the counter (more than 30 days passed)
    const shouldResetCounter = new Date().getTime() - new Date(lastResetDate).getTime() > 30 * 24 * 60 * 60 * 1000;

    // Calculate new submission count
    const updatedCount = shouldResetCounter ? 1 : (currentMonth + 1);

    // Get max submissions limit
    const maxSubmissions = organization.formBuilder?.maxSubmissionsPerMonth || 0;

    console.log('Form submission debug:', {
      orgId: organization._id.toString(),
      currentMonth,
      updatedCount,
      shouldResetCounter,
      lastResetDate: lastResetDate.toISOString(),
      maxSubmissions
    });

    // Only check limit if maxSubmissions is greater than 0
    if (maxSubmissions > 0 && !shouldResetCounter && currentMonth >= maxSubmissions) {
      return NextResponse.json({
        success: false,
        message: "Monthly submission limit reached. Please upgrade your plan for more submissions.",
        limitReached: true
      }, { status: 403 });
    }

    // Check if form is published
    if (!form.isPublished) {
      return NextResponse.json(
        { error: 'Cannot submit to an unpublished form' },
        { status: 400 }
      );
    }

    // Optional: Check if form has reached submission limit
    if (form.settings.limitSubmissions &&
      form.stats.submissions >= form.settings.limitSubmissions) {
      return NextResponse.json(
        { error: 'Form has reached its submission limit' },
        { status: 400 }
      );
    }

    // Check if form is within active time window
    const now = new Date();
    if (form.settings.startDate && new Date(form.settings.startDate) > now) {
      return NextResponse.json(
        { error: 'Form is not yet active' },
        { status: 400 }
      );
    }
    if (form.settings.endDate && new Date(form.settings.endDate) < now) {
      return NextResponse.json(
        { error: 'Form is no longer accepting submissions' },
        { status: 400 }
      );
    }

    // Get user ID if available (for logged-in submissions)
    let userId = null;
    let user = null;

    // Check for user token if form requires login
    if (form.settings.requireLogin) {
      userId = getDataFromToken(request);

      if (!userId) {
        return NextResponse.json(
          { error: 'This form requires you to be logged in' },
          { status: 401 }
        );
      }

      // Verify user exists
      user = await User.findById(userId).select('-password');

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else {
      // For non-login-required forms, still check for logged in users
      userId = getDataFromToken(request);
      if (userId) {
        user = await User.findById(userId).select('-password');
      }
    }

    const body = await request.json();

    // Validate form data against required fields
    const requiredFields = form.fields
      .filter(field => field.required && !['heading', 'paragraph', 'divider', 'hidden'].includes(field.type))
      .map(field => field.id);

    const missingFields = requiredFields.filter(fieldId => !body.data[fieldId]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Required fields are missing', fields: missingFields },
        { status: 400 }
      );
    }

    // Process file uploads (in a real implementation)
    const files = body.files || [];

    // Create submission
    const submissionData: any = {
      form: formId,
      organization: form.organization,
      data: body.data,
      files,
      completedAt: new Date(),
      startedAt: body.startedAt ? new Date(body.startedAt) : undefined
    };

    // Add submitter details
    if (user) {
      submissionData.submittedBy = userId;
    } else if (form.settings.allowAnonymous) {
      // For anonymous submissions, collect details from form data
      const emailField = form.fields.find(f => f.type === 'email')?.id;
      const nameFields = form.fields.filter(f =>
        f.label.toLowerCase().includes('name') ||
        f.type === 'text'
      ).map(f => f.id);

      const phoneField = form.fields.find(f => f.type === 'phone')?.id;

      submissionData.submitterDetails = {
        ip: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      };

      if (emailField && body.data[emailField]) {
        submissionData.submitterDetails.email = body.data[emailField];
      }

      if (nameFields.length > 0) {
        // Try to find a name from form data
        for (const fieldId of nameFields) {
          if (body.data[fieldId]) {
            submissionData.submitterDetails.name = body.data[fieldId];
            break;
          }
        }
      }

      if (phoneField && body.data[phoneField]) {
        submissionData.submitterDetails.phone = body.data[phoneField];
      }
    } else {
      return NextResponse.json(
        { error: 'Anonymous submissions are not allowed for this form' },
        { status: 400 }
      );
    }

    const submission = new FormSubmission(submissionData);
    await submission.save();

    // Update form statistics
    form.stats.submissions += 1;

    // Calculate conversion rate
    if (form.stats.views > 0) {
      form.stats.conversionRate = (form.stats.submissions / form.stats.views) * 100;
    }

    // Calculate average completion time if startedAt is provided
    if (submission.startedAt) {
      const completionTime = submission.completedAt.getTime() - submission.startedAt.getTime();

      if (form.stats.averageCompletionTime === 0) {
        form.stats.averageCompletionTime = completionTime;
      } else {
        form.stats.averageCompletionTime = (
          (form.stats.averageCompletionTime * (form.stats.submissions - 1)) + completionTime
        ) / form.stats.submissions;
      }
    }

    await form.save();

    // Update organization's submission count using $set to ensure proper updating of nested fields
    const updateResult = await Organization.findOneAndUpdate(
      { _id: form.organization },
      {
        $set: {
          'formBuilder.submissionsCount.currentMonth': updatedCount,
          'formBuilder.submissionsCount.lastResetDate': shouldResetCounter ? new Date() : lastResetDate
        }
      },
      { new: true }
    );

    if (!updateResult) {
      console.error('Failed to update organization submission count');
    } else {
      console.log('Successfully updated submission count to:', updatedCount);
      console.log('Organization updated:', {
        id: updateResult._id?.toString(),
        submissionCount: updateResult.formBuilder?.submissionsCount?.currentMonth
      });
    }
    console.log('Updated organization submission count:',
      updateResult?.formBuilder?.submissionsCount || 'Update failed');

    // Process form integrations
    try {
      await processFormIntegrations(form, submission);
    } catch (error) {
      console.error('Error processing integrations:', error);
      // We don't want to fail the submission if integrations fail
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submission._id,
      thankYouPage: form.thankYouPage
    });
  } catch (error: any) {
    console.error(`Error submitting form:`, error);
    return NextResponse.json(
      { error: 'Failed to submit form', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to process form integrations
async function processFormIntegrations(form: any, submission: any) {
  // 1. Handle email notifications
  const emailNotifications = form.notifications.filter((n: any) => n.type === 'email' && n.enabled);

  for (const notification of emailNotifications) {
    try {
      // Here you would send an email using your email service
      console.log(`Would send email notification to ${notification.recipients.join(', ')}`);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // 2. Handle WhatsApp notifications
  const whatsappNotifications = form.notifications.filter((n: any) => n.type === 'whatsapp' && n.enabled);

  for (const notification of whatsappNotifications) {
    try {
      // Here you would send a WhatsApp notification using your WhatsApp service
      console.log(`Would send WhatsApp notification to ${notification.recipients.join(', ')}`);
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }
  }

  // 3. Handle CRM integrations
  const crmIntegrations = form.integrations.filter((i: any) => i.type === 'crm' && i.enabled);

  for (const integration of crmIntegrations) {
    try {
      if (integration.config.createLead) {
        // Here you would create a lead in your CRM using the submission data
        console.log(`Would create lead in CRM pipeline ${integration.config.pipeline}`);
      }
    } catch (error) {
      console.error('Error creating CRM lead:', error);
    }
  }

  // 4. Handle webhook integrations
  const webhookIntegrations = form.integrations.filter((i: any) => i.type === 'webhook' && i.enabled);

  for (const integration of webhookIntegrations) {
    try {
      // Here you would make a webhook call to the configured URL
      console.log(`Would make ${integration.config.method} webhook call to ${integration.config.url}`);
    } catch (error) {
      console.error('Error making webhook call:', error);
    }
  }
}
