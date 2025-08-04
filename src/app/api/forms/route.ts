import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FormModel from '@/models/formBuilderModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import Organization from '@/models/organizationModel';
import { User } from '@/models/userModel';

export async function GET(request: NextRequest) {
  try {
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

    // Explicitly fetch the organization using the organization ID from the user
    let organizationData = null;
    if (user.organization) {
      organizationData = await Organization.findById(user.organization)
        .select('companyName trialExpires isPro subscribedPlan subscriptionExpires activeSubscriptions credits subscribedUserCount');
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { organization: user.organization };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const forms = await FormModel.find(query)
      .select('name description isPublished publishedUrl stats tags createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FormModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      forms,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const organizationId = user.organization;

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Form name is required' },
        { status: 400 }
      );
    }

    // Create new form
    const form = new FormModel({
      name: body.name,
      description: body.description || '',
      organization: organizationId,
      creator: userId,
      fields: body.fields || [],
      theme: body.theme || {},
      settings: body.settings || {},
      integrations: body.integrations || [],
      notifications: body.notifications || [],
      thankYouPage: body.thankYouPage || {
        message: 'Thank you for your submission!',
        redirectUrl: '',
        buttonText: 'Back to Home',
      },
      isTemplate: body.isTemplate || false,
      tags: body.tags || [],
      stats: {
        views: 0,
        submissions: 0,
        conversionRate: 0,
        averageCompletionTime: 0
      }
    });

    await form.save();

    return NextResponse.json({
      success: true,
      message: 'Form created successfully',
      formId: form._id
    });
  } catch (error: any) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Failed to create form', details: error.message },
      { status: 500 }
    );
  }
}
