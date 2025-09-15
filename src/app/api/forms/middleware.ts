import { NextResponse } from 'next/server';
import Organization from '@/models/organizationModel';
import FormModel from '@/models/formBuilderModel';

export async function checkFormLimits(req: Request | any, organizationId: string) {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });
  }

  // Check if form builder is enabled
  if (!organization.formBuilder?.enabled &&
    !organization.activeSubscriptions?.includes('formBuilder')) {
    return NextResponse.json({
      success: false,
      message: "Form Builder is not enabled for your organization"
    }, { status: 403 });
  }

  // Get the current number of published forms
  const publishedFormsCount = await FormModel.countDocuments({
    organization: organizationId,
    isPublished: true
  });

  // For form publishing, check if we exceed the max forms limit
  if (req.method === 'PUT' && req.body.isPublished) {
    const maxForms = organization.formBuilder?.maxForms || 0;

    // If this is an existing form that was already published, don't count it again
    let existingFormPublishedStatus = false;
    if (req.params.formId) {
      const existingForm = await FormModel.findById(req.params.formId);
      existingFormPublishedStatus = existingForm?.isPublished || false;
    }

    // Only check the limit if we're newly publishing a form
    if (!existingFormPublishedStatus && publishedFormsCount >= maxForms) {
      return NextResponse.json({
        success: false,
        message: `Your plan allows a maximum of ${maxForms} published forms. Please upgrade to publish more forms.`,
        limitReached: true
      }, { status: 403 });
    }
  }

  return null; // No errors, continue processing
}
