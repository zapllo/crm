import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FormModel from '@/models/formBuilderModel';
import FormSubmission from '@/models/formSubmissionModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

export async function GET(request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const formId = (await params).formId

    await connectDB();

    // Get userId from the 'token' cookie (if available)
    // Note: we may want to allow public access to published forms
    const userId = getDataFromToken(request);

    const form = await FormModel.findById(formId);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // If the form is published, allow public access
    // Otherwise, require authentication and authorization
    if (!form.isPublished) {
      // Authentication check
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user data
      const user = await User.findById(userId).select('-password');

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Authorization check: only allow access to form creators or users in the same organization
      const isAuthorized = form.creator.toString() === userId ||
        form.organization.toString() === user.organization.toString();

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Increment view count
    form.stats.views += 1;
    await form.save();

    // Return the form without sensitive data
    return NextResponse.json({
      success: true,
      form
    });
  } catch (error: any) {
    console.error(`Error fetching form:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch form', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request,
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

    const form = await FormModel.findById(formId);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Only allow updates by the creator or users in the same organization
    const isAuthorized = form.creator.toString() === userId ||
      form.organization.toString() === user.organization.toString();

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const updateFields = [
      'name', 'description', 'coverImage', 'fields', 'theme', 'settings',
      'integrations', 'notifications', 'thankYouPage', 'isPublished', 'isTemplate'
    ];

    // Update all provided fields
    updateFields.forEach(field => {
      if (body[field] !== undefined) {
        form.set(field, body[field]);
      }
    });

    // For specific theme properties
    if (body.theme) {
      const themeFields = [
        'primaryColor', 'backgroundColor', 'textColor', 'accentColor',
        'fontFamily', 'borderRadius', 'buttonStyle', 'logoPosition', 'customCSS'
      ];

      themeFields.forEach(themeField => {
        if (body.theme[themeField] !== undefined) {
          (form.theme as any)[themeField] = body.theme[themeField];
        }
      });
    }


    await form.save();

    return NextResponse.json({
      success: true,
      message: 'Form updated successfully',
      formId: form._id
    });
  } catch (error: any) {
    console.error(`Error updating form:`, error);
    return NextResponse.json(
      { error: 'Failed to update form', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request,
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

    const form = await FormModel.findById(formId);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Only allow deletion by the creator or users in the same organization with admin permissions
    const isAuthorized = form.creator.toString() === userId ||
      (form.organization.toString() === user.organization.toString() && user.isOrgAdmin);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete all submissions first
    await FormSubmission.deleteMany({ form: formId });

    // Then delete the form
    await FormModel.findByIdAndDelete(formId);

    return NextResponse.json({
      success: true,
      message: 'Form and all submissions deleted successfully'
    });
  } catch (error: any) {
    console.error(`Error deleting form:`, error);
    return NextResponse.json(
      { error: 'Failed to delete form', details: error.message },
      { status: 500 }
    );
  }
}
