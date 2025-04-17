"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { IFormField } from '@/models/formBuilderModel';
import FormRenderer from './FormRenderer';

interface FormPreviewProps {
  fields: IFormField[];
  theme: any;
  formTitle: string;
  formDescription: string;
  settings: any;
  thankYouPage: any;
  multiPage?: boolean;
}

export default function FormPreview({
  fields,
  theme,
  formTitle,
  formDescription,
  settings,
  thankYouPage,
  multiPage = false
}: FormPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  // For multi-page forms, group fields into pages
  const pages = !multiPage
    ? [fields]
    : fields.reduce((acc: IFormField[][], field, index) => {
        // Simple grouping strategy: create pages with 3-5 fields each
        // A better strategy would allow explicit page breaks
        const pageIndex = Math.floor(index / 4);

        if (!acc[pageIndex]) {
          acc[pageIndex] = [];
        }

        acc[pageIndex].push(field);
        return acc;
      }, []);

  const currentFields = pages[currentPage] || [];
  const totalPages = pages.length;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues({
      ...formValues,
      [fieldId]: value
    });
  };

  const validatePage = () => {
    // Check if all required fields on the current page are filled
    const requiredFields = currentFields.filter(field => field.required);
    return requiredFields.every(field =>
      formValues[field.id] !== undefined &&
      formValues[field.id] !== '' &&
      formValues[field.id] !== null
    );
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Submit the form
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = () => {
    // In the real implementation, this would submit the data to your API
    console.log('Form submitted with values:', formValues);
    setSubmitted(true);
  };

  // Show thank you page after submission
  if (submitted) {
    return (
      <Card
        className="w-full max-w-xl mx-auto overflow-hidden"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
          borderRadius: theme.borderRadius
        }}
      >
        <CardContent className="pt-6 px-8 pb-8 text-center space-y-4">
          <div className="mx-auto rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {thankYouPage.message || "Thank you for your submission!"}
          </CardTitle>

          {thankYouPage.redirectUrl && (
            <CardDescription>
              You will be redirected shortly...
            </CardDescription>
          )}

          {thankYouPage.buttonText && (
            <Button
              className="mt-4"
              style={{
                backgroundColor: theme.buttonStyle === 'filled' ? theme.primaryColor : 'transparent',
                color: theme.buttonStyle === 'filled' ? '#fff' : theme.primaryColor,
                borderRadius: theme.borderRadius,
                border: theme.buttonStyle === 'outlined' ? `1px solid ${theme.primaryColor}` : 'none',
                background: theme.buttonStyle === 'gradient'
                  ? `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})`
                  : undefined
              }}
            >
              {thankYouPage.buttonText}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full max-w-xl mx-auto overflow-hidden"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius
      }}
    >
      <CardHeader className={`bg-primary/5 p-6 ${theme.logoPosition === 'center' ? 'text-center' : ''}`}>
        <CardTitle className="text-2xl font-bold">{formTitle}</CardTitle>
        {formDescription && (
          <CardDescription>{formDescription}</CardDescription>
        )}
      </CardHeader>

      {settings.multiPage && settings.progressBar && (
        <div className="bg-muted h-1.5 w-full">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${((currentPage + 1) / totalPages) * 100}%`,
              backgroundColor: theme.primaryColor
            }}
          />
        </div>
      )}

      <CardContent className="p-6">
        {settings.multiPage && (
          <div className="mb-4 text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </div>
        )}

        <FormRenderer
          fields={currentFields}
          values={formValues}
          onChange={handleFieldChange}
          theme={theme}
        />
      </CardContent>

      <CardFooter className="p-6 pt-0 flex justify-between">
        {multiPage && currentPage > 0 ? (
          <Button
            variant="outline"
            onClick={handlePrevious}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        ) : (
          <div></div> // Empty div to maintain layout with flex justify-between
        )}

        <Button
          onClick={handleNext}
          disabled={!validatePage()}
          style={{
            backgroundColor: theme.buttonStyle === 'filled' ? theme.primaryColor : 'transparent',
            color: theme.buttonStyle === 'filled' ? '#fff' : theme.primaryColor,
            borderRadius: theme.borderRadius,
            border: theme.buttonStyle === 'outlined' ? `1px solid ${theme.primaryColor}` : 'none',
            background: theme.buttonStyle === 'gradient'
              ? `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})`
              : undefined
          }}
        >
          {currentPage < totalPages - 1 ? (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
