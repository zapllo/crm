import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FormModel from '@/models/formBuilderModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

export async function POST(request: Request,
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

    // Find the form to duplicate
    const form = await FormModel.findById(formId);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Only allow duplication by users in the same organization
    const isAuthorized = form.organization.toString() === user.organization.toString();

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create a new form based on the original
    const newForm = new FormModel({
      name: `${form.name} (Copy)`,
      description: form.description,
      organization: user.organization,
      creator: userId,
      fields: form.fields,
      theme: form.theme,
      settings: form.settings,
      integrations: form.integrations,
      notifications: form.notifications,
      thankYouPage: form.thankYouPage,
      isPublished: false, // Always start as unpublished
      tags: form.tags,
      isTemplate: false, // Not a template even if original was
      stats: {
        views: 0,
        submissions: 0,
        conversionRate: 0,
        averageCompletionTime: 0
      }
    });

    await newForm.save();

    return NextResponse.json({
      success: true,
      message: 'Form duplicated successfully',
      formId: newForm._id
    });
  } catch (error: any) {
    console.error(`Error duplicating form:`, error);
    return NextResponse.json(
      { error: 'Failed to duplicate form', details: error.message },
      { status: 500 }
    );
  }
}
