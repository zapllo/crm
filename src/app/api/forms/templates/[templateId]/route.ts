import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FormTemplateModel from '@/models/formTemplateModel';
import FormModel from '@/models/formBuilderModel';
import msmeTemplates from '@/data/formTemplates';

export async function GET(request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const templateId = (await params).templateId
    await connectDB();

    let template;

    // First check if it's a database template
    if (templateId.length === 24) { // MongoDB ObjectId is 24 chars
      // Try to find in FormTemplateModel (public templates)
      template = await FormTemplateModel.findById(templateId);

      if (!template) {
        // Try to find in FormModel (org templates)
        template = await FormModel.findOne({
          _id: templateId,
          isTemplate: true
        });
      }
    }

    // If not found in DB, check if it's one of our predefined templates
    if (!template) {
      // Find in our predefined templates
      template = msmeTemplates.find(t =>
        t.name.toLowerCase().replace(/\s+/g, '-') === templateId
      );

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template', details: error.message },
      { status: 500 }
    );
  }
}
