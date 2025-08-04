import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import FormSubmission from '@/models/formSubmissionModel';
import Pipeline from '@/models/pipelineModel';
import { User } from '@/models/userModel';
import { convertSubmissionToLead } from '@/lib/formSubmissionToLead';

// Generate a unique ID for the lead (adding this here since it was missing in formSubmissionToLead.ts)
async function generateUniqueId(prefix: string) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix.toUpperCase()}-${timestamp}${random}`;
}

export async function POST(request: Request,
  { params }: { params: Promise<{ submissionId: string, formId: string }> }
) {
  try {
    const submissionId = (await params).submissionId
    const formId = (await params).formId
    // Get userId from the 'token' cookie
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // First, get the user
    const user = await User.findById(userId).select('-password').populate('role');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    // Optional: Get configuration from request body
    let pipelineId, stageId, additionalOptions;
    try {
      const body = await request.json();
      pipelineId = body.pipelineId;
      stageId = body.stageId;
      additionalOptions = body.options || {};
    } catch (e) {
      // If no body is provided, we'll use default settings
    }

    // Verify the submission exists and belongs to the user's organization
    const submission = await FormSubmission.findById(submissionId)
      .populate('form')
      .populate('organization');

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if the user has access to this submission
    const userOrganizationId = user.organization.toString();
    if (submission.organization._id.toString() !== userOrganizationId) {
      return NextResponse.json(
        { success: false, message: 'Access denied: Submission belongs to a different organization' },
        { status: 403 }
      );
    }

    // If already converted to lead
    if (submission.leadId) {
      return NextResponse.json(
        { success: false, message: 'Submission has already been converted to a lead' },
        { status: 400 }
      );
    }

    // If no pipeline provided, find the default one
    if (!pipelineId) {
      const defaultPipeline = await Pipeline.findOne({ organization: userOrganizationId });
      if (!defaultPipeline) {
        return NextResponse.json(
          { success: false, message: 'No pipeline found. Please create a pipeline first.' },
          { status: 400 }
        );
      }
      pipelineId = defaultPipeline._id;

      // Use the first stage as default if no stage specified
      if (!stageId && defaultPipeline.openStages && defaultPipeline.openStages.length > 0) {
        stageId = defaultPipeline.openStages[0]._id;
      } else if (!stageId) {
        return NextResponse.json(
          { success: false, message: 'No stages found in the pipeline. Please configure your pipeline stages first.' },
          { status: 400 }
        );
      }
    }

    // Make sure formSubmissionToLead can access the generateUniqueId function
    // Either make it global or patch it for this call
    if (typeof (global as any).generateUniqueId !== 'function') {
      (global as any).generateUniqueId = generateUniqueId;
    }

    // Convert the submission to a lead
    const result = await convertSubmissionToLead(
      submissionId,
      pipelineId,
      stageId,
      userId,
      additionalOptions
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully converted to lead',
        leadId: result.leadId,
        contactId: result.contactId,
        lead: result.lead
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to convert submission to lead' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error converting submission to lead:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function GET(request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  return NextResponse.json({
    success: true,
    message: 'Form updated successfully',
  });
}
