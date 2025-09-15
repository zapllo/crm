import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FormModel from '@/models/formBuilderModel';
import FormSubmission from '@/models/formSubmissionModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

export async function PUT(request: Request,
  { params }: { params: Promise<{ formId: string, submissionId:string }> }
) {
  try {
    const formId = (await params).formId;
    const submissionId = (await params).submissionId;
    // Get userId from the token cookie
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Find the form to check authorization
    const form = await FormModel.findById(formId);
    if (!form) {
      return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 });
    }

    // Only allow access to form creators or users in the same organization
    const isAuthorized =
      form.creator.toString() === userId ||
      (form.organization && user.organization &&
       form.organization.toString() === user.organization.toString());

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Find the submission
    const submission = await FormSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
    }

    // Verify the submission belongs to the specified form
    if (submission.form.toString() !== formId) {
      return NextResponse.json(
        { success: false, message: 'Submission does not belong to this form' },
        { status: 400 }
      );
    }

    // Get the update data from the request body
    const body = await request.json();

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['new', 'viewed', 'contacted', 'converted', 'archived'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: 'Invalid status value' },
          { status: 400 }
        );
      }
    }

    // Updates allowed: status, notes, tags, etc.
    const updates: Record<string, any> = {};

    // Only include fields that are provided and valid
    if (body.status) updates.status = body.status;
    if (body.tags) updates.tags = body.tags;

    // Handle notes separately to append rather than replace
    if (body.note) {
      // Add a new note to the submission
      const newNote = {
        text: body.note,
        createdBy: userId,
        createdAt: new Date()
      };

      // If submission doesn't have notes array yet, create it
      if (!submission.notes) {
        updates.notes = [newNote];
      } else {
        // Use $push in the update to add the note
        await FormSubmission.findByIdAndUpdate(
          submissionId,
          { $push: { notes: newNote } }
        );
      }
    }

    // Update the submission with all other fields
    const updatedSubmission = await FormSubmission.findByIdAndUpdate(
      submissionId,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully',
      submission: updatedSubmission
    });

  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update submission', details: error.message },
      { status: 500 }
    );
  }
}

// Implement the GET endpoint to fetch a single submission
export async function GET(request: Request,
  { params }: { params: Promise<{ formId: string, submissionId:string }> }
) {
  try {
    const formId = (await params).formId;
    const submissionId = (await params).submissionId;

    // Get userId from the token cookie
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Find the form to check authorization
    const form = await FormModel.findById(formId);
    if (!form) {
      return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 });
    }

    // Only allow access to form creators or users in the same organization
    const isAuthorized =
      form.creator.toString() === userId ||
      (form.organization && user.organization &&
       form.organization.toString() === user.organization.toString());

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Find the submission
    const submission = await FormSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
    }

    // Verify the submission belongs to the specified form
    if (submission.form.toString() !== formId) {
      return NextResponse.json(
        { success: false, message: 'Submission does not belong to this form' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      submission
    });

  } catch (error: any) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submission', details: error.message },
      { status: 500 }
    );
  }
}
