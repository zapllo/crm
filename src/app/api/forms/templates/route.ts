import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FormModel from '@/models/formBuilderModel';
import FormTemplateModel from '@/models/formTemplateModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import msmeTemplates from '@/data/formTemplates';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query for public templates
    const query: any = { isPublic: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query for public templates with pagination
    const publicTemplates = await FormTemplateModel.find(query)
      .select('name description category previewImage tags')
      .sort({ usageCount: -1 })
      .skip(skip)
      .limit(limit);

    // Get user's organization templates if logged in
    let orgTemplates: any[] = [];

    // Get userId from the 'token' cookie (if available)
    const userId = getDataFromToken(request);

    if (userId) {
      // Get the user
      const user = await User.findById(userId).select('-password');

      if (user && user.organization) {
        // Get organization-specific templates (forms marked as templates)
        orgTemplates = await FormModel.find({
          organization: user.organization,
          isTemplate: true
        })
          .select('name description category tags coverImage')
          .sort({ updatedAt: -1 });
      }
    }

    // Include our hard-coded MSME templates
    const msmeTemplatesList = msmeTemplates.map(template => ({
      _id: template.name.toLowerCase().replace(/\s+/g, '-'),
      name: template.name,
      description: template.description,
      category: template.category,
      tags: template.tags,
      previewImage: template.coverImage
    }));

    return NextResponse.json({
      success: true,
      templates: {
        public: [...publicTemplates, ...msmeTemplatesList],
        organization: orgTemplates
      }
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error.message },
      { status: 500 }
    );
  }
}
