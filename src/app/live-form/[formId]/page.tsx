"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormRenderer from '@/components/form-builder/FormRenderer';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PublicFormPageContent() {
  const { toast } = useToast();
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [thankYouPage, setThankYouPage] = useState<any>(null);
  const [startTime, setStartTime] = useState(new Date());

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/forms/${formId}`);

      if (response.data.success) {
        const formData = response.data.form;

        // Check if form is published
        if (!formData.isPublished) {
          toast({
            title: "Form not available",
            description: "This form is currently not available for submissions.",
            variant: "destructive"
          });
          return;
        }

        // Check if form is within active date range
        const now = new Date();
        if (formData.settings?.startDate && new Date(formData.settings.startDate) > now) {
          toast({
            title: "Form not active yet",
            description: "This form is not yet open for submissions.",
            variant: "destructive"
          });
          return;
        }
        if (formData.settings?.endDate && new Date(formData.settings.endDate) < now) {
          toast({
            title: "Form closed",
            description: "This form is no longer accepting submissions.",
            variant: "destructive"
          });
          return;
        }

        setForm(formData);
        setStartTime(new Date());
      } else {
        throw new Error(response.data.message || "Failed to fetch form");
      }
    } catch (error: any) {
      toast({
        title: "Error loading form",
        description: error.message || "There was a problem loading the form",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues({
      ...formValues,
      [fieldId]: value
    });
  };

  const validatePage = (fields: any[]) => {
    // Check if all required fields on the current page are filled
    const requiredFields = fields.filter(field => field.required);
    return requiredFields.every(field =>
      formValues[field.id] !== undefined &&
      formValues[field.id] !== '' &&
      formValues[field.id] !== null
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post(`/api/forms/${formId}/submissions`, {
        data: formValues,
        startedAt: startTime.toISOString()
      });

      if (response.data.success) {
        setSubmitted(true);
        setThankYouPage(response.data.thankYouPage);

        // Handle redirect if specified
        if (response.data.thankYouPage?.redirectUrl) {
          setTimeout(() => {
            window.location.href = response.data.thankYouPage.redirectUrl;
          }, 3000);
        }
      } else {
        throw new Error(response.data.message || "Failed to submit form");
      }
    } catch (error: any) {
      let errorMessage = error.message || "There was a problem submitting the form";

      // Handle validation errors
      if (error.response?.data?.fields) {
        errorMessage = `Missing required fields: ${error.response.data.fields.join(', ')}`;
      }

      toast({
        title: "Error submitting form",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!form.settings?.multiPage) {
      handleSubmit();
      return;
    }

    // For multi-page forms, calculate which fields to display on each page
    const pages = getFormPages(form.fields);

    if (currentPage < pages.length - 1) {
      if (validatePage(pages[currentPage])) {
        setCurrentPage(currentPage + 1);
      } else {
        toast({
          title: "Please fill out all required fields",
          description: "Complete all required fields before proceeding to the next page",
          variant: "destructive"
        });
      }
    } else {
      if (validatePage(pages[currentPage])) {
        handleSubmit();
      } else {
        toast({
          title: "Please fill out all required fields",
          description: "Complete all required fields before submitting the form",
          variant: "destructive"
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Helper function to group fields into pages for multi-page forms
  const getFormPages = (fields: any[]) => {
    if (!form.settings?.multiPage) {
      return [fields];
    }

    // Simple grouping strategy: create pages with ~5 fields each
    // A better strategy would use explicit page breaks in the form editor
    return fields.reduce((acc: any[][], field, index) => {
      const pageIndex = Math.floor(index / 5);

      if (!acc[pageIndex]) {
        acc[pageIndex] = [];
      }

      acc[pageIndex].push(field);
      return acc;
    }, []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Form Not Available</h2>
          <p className="text-muted-foreground mb-6">
            The form you are looking for is not available. It may have been deleted, or is not yet published.
          </p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If the form has been submitted, show the thank you page
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-xl mx-auto bg-background rounded-lg shadow-lg p-8 text-center"
          style={{
            backgroundColor: form.theme?.backgroundColor || '#ffffff',
            color: form.theme?.textColor || '#000000',
            fontFamily: form.theme?.fontFamily || 'Inter, sans-serif'
          }}
        >
          <h1 className="text-2xl font-bold mb-4">
            {thankYouPage?.message || "Thank you for your submission!"}
          </h1>

          {thankYouPage?.redirectUrl && (
            <p className="text-muted-foreground mb-4">
              You will be redirected shortly...
            </p>
          )}

          {thankYouPage?.buttonText && thankYouPage?.redirectUrl && (
            <Button
              onClick={() => window.location.href = thankYouPage.redirectUrl}
              style={{
                backgroundColor: form.theme?.primaryColor || '#3B82F6',
                color: '#ffffff',
                borderRadius: form.theme?.borderRadius || '0.375rem'
              }}
            >
              {thankYouPage.buttonText}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // For active forms, render the form
  const pages = getFormPages(form.fields);
  const currentFields = pages[currentPage] || [];
  const totalPages = pages.length;
  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto bg-background rounded-lg shadow-lg overflow-hidden"
        style={{
          backgroundColor: form.theme?.backgroundColor || '#ffffff',
          color: form.theme?.textColor || '#000000',
          fontFamily: form.theme?.fontFamily || 'Inter, sans-serif',
          borderRadius: form.theme?.borderRadius || '0.375rem'
        }}
      >
        {/* Add cover image here */}
        {form.coverImage && (
          <div className="w-full relative">
            <img
              src={form.coverImage}
              alt="Form cover"
              className="w-full object-cover"
              style={{ maxHeight: '240px' }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
              style={{ mixBlendMode: 'multiply' }}
            ></div>
          </div>
        )}

        <div
          className={`px-6 py-8 border-b ${form.coverImage ? '-mt-16 relative z-10' : ''} text-center`}
          style={{
            borderColor: `${form.theme?.primaryColor || '#3B82F6'}20`
          }}
        >
          <h1
            className={`text-2xl font-bold ${form.coverImage ? 'text-white drop-shadow-md' : ''}`}
          >
            {form.name}
          </h1>
         
        </div>
        {form.settings?.multiPage && form.settings?.progressBar && (
          <div className="bg-muted w-full h-2">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${((currentPage + 1) / totalPages) * 100}%`,
                backgroundColor: form.theme?.primaryColor || '#3B82F6'
              }}
            />
          </div>
        )}

        <div className="p-6">
          {form.settings?.multiPage && (
            <div className="mb-4 text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </div>
          )}

          <FormRenderer
            fields={currentFields}
            values={formValues}
            onChange={handleFieldChange}
            theme={form.theme || {}}
          />
        </div>

        <div className="p-6 pt-0 flex justify-between">
          {form.settings?.multiPage && currentPage > 0 ? (
            <Button
              variant="outline"
              onClick={handlePrevious}
              style={{
                borderColor: form.theme?.primaryColor || '#3B82F6',
                color: form.theme?.primaryColor || '#3B82F6'
              }}
            >
              Previous
            </Button>
          ) : (
            <div></div> // Empty div to maintain layout with flex justify-between
          )}

          <Button
            onClick={handleNext}
            disabled={submitting}
            style={{
              backgroundColor: form.theme?.buttonStyle === 'filled' ? form.theme?.primaryColor || '#3B82F6' : 'transparent',
              color: form.theme?.buttonStyle === 'filled' ? '#ffffff' : form.theme?.primaryColor || '#3B82F6',
              borderRadius: form.theme?.borderRadius || '0.375rem',
              border: form.theme?.buttonStyle === 'outlined' ? `1px solid ${form.theme?.primaryColor || '#3B82F6'}` : 'none',
              background: form.theme?.buttonStyle === 'gradient'
                ? `linear-gradient(to right, ${form.theme?.primaryColor || '#3B82F6'}, ${form.theme?.accentColor || '#60A5FA'})`
                : undefined
            }}
          >
            {submitting ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </div>
            ) : form.settings?.multiPage && !isLastPage ? (
              "Next"
            ) : (
              "Submit"
            )}
          </Button>
        </div>


        <div className="border-t px-6 py-4 flex items-center justify-center space-x-2 text-xs text-muted-foreground"
          style={{
            borderColor: `${form.theme?.primaryColor || '#3B82F6'}20`,
            background: `linear-gradient(to right, ${form.theme?.backgroundColor || '#ffffff'}, ${form.theme?.primaryColor || '#3B82F6'}05, ${form.theme?.backgroundColor || '#ffffff'})`,
          }}
        >
          <span className='text-muted-foreground font-bold tracking-'>Powered by</span>
          <a
            href="https://zapllo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="https://res.cloudinary.com/dndzbt8al/image/upload/v1743846882/logo-01_1_a2qvzt.png"
              alt="Zapllo"
              className="h-4 mr-1"
            />
            <span className="font-semibold" style={{ color: form.theme?.primaryColor || '#3B82F6' }}>

            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
