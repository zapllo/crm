"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { IFormField } from '@/models/formBuilderModel';
import FormRenderer from './FormRenderer';
import { cn } from '@/lib/utils';

interface FormPreviewProps {
  fields: IFormField[];
  theme: any;
  formTitle: string;
  formDescription: string;
  coverImage?: string | null;
  settings: any;
  thankYouPage: any;
  multiPage?: boolean;
}

export default function FormPreview({
  fields,
  theme,
  formTitle,
  formDescription,
  coverImage,
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

  // Apply custom button styles based on theme
  const getButtonStyles = () => {
    if (theme.buttonStyle === 'gradient') {
      return {
        background: `linear-gradient(to right, ${theme.primaryColor}, ${adjustColor(theme.primaryColor, 20)})`,
        color: '#fff',
        borderRadius: theme.borderRadius,
        border: 'none',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      };
    } else if (theme.buttonStyle === 'outlined') {
      return {
        backgroundColor: 'transparent',
        color: theme.primaryColor,
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.primaryColor}`,
      };
    } else {
      // Default filled
      return {
        backgroundColor: theme.primaryColor,
        color: '#fff',
        borderRadius: theme.borderRadius,
        border: 'none',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      };
    }
  };

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number) => {
    return color;
    // A more complex implementation would adjust the brightness
    // This is simplified for this example
  };

  // Show thank you page after submission
  if (submitted) {
    return (
      <Card
        className="w-full max-w-xl mx-auto overflow-hidden shadow-lg transition-all duration-500 ease-in-out"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
          borderRadius: theme.borderRadius,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent className="pt-12 px-8 pb-12 text-center space-y-6 flex flex-col items-center">
          <div
            className="mx-auto rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4 animate-in zoom-in-50 duration-500"
            style={{
              backgroundColor: `${theme.primaryColor}20`,
              color: theme.primaryColor
            }}
          >
            <Check className="h-8 w-8" />
          </div>
          <CardTitle
            className="text-2xl sm:text-3xl font-bold animate-in fade-in-50 duration-500"
            style={{ color: theme.textColor }}
          >
            {thankYouPage.message || "Thank you for your submission!"}
          </CardTitle>

          <CardDescription
            className="text-base animate-in fade-in-50 duration-500 delay-200"
            style={{ color: `${theme.textColor}99` }}
          >
            {thankYouPage.subMessage || "We've received your response and will process it shortly."}
          </CardDescription>

          {thankYouPage.redirectUrl && (
            <CardDescription className="animate-in fade-in-50 duration-500 delay-300">
              You will be redirected shortly...
            </CardDescription>
          )}

          {thankYouPage.buttonText && (
            <Button
              className="mt-6 px-6 py-2 transition-all duration-300 hover:scale-105 animate-in fade-in-50 duration-500 delay-500"
              style={getButtonStyles()}
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
      className={cn(
        "w-full max-w-xl mx-auto  shadow-lg transition-all duration-300",
        coverImage ? "shadow-xl" : "shadow-md"
      )}
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius
      }}
    >
      {/* Display cover image if present */}
      {coverImage && (
        <div
          className="w-full relative"
          style={{
            maxHeight: '240px',
            overflow: 'hidden'
          }}
        >
          <img
            src={coverImage}
            alt="Form cover"
            className="w-full object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
            style={{ height: '240px' }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
            style={{ mixBlendMode: 'multiply' }}
          ></div>
        </div>
      )}

      <CardHeader
        className={cn(
          "p-6",
          coverImage ? "-mt-16 relative z-10" : `bg-primary/5 ${theme.logoPosition === 'center' ? 'text-center' : ''}`
        )}
        style={{
          backgroundColor: coverImage ? 'transparent' : `${theme.primaryColor}10`,
        }}
      >
        <CardTitle
          className={cn(
            "text-2xl font-bold",
            coverImage && "text-white drop-shadow-md"
          )}
          style={{
            color: coverImage ? '#ffffff' : theme.textColor,
          }}
        >
          {formTitle}
        </CardTitle>
        {/* {formDescription && (
  <CardDescription
    className={cn(coverImage && "text-white drop-shadow-md")}
    style={{
      color: coverImage ? 'rgba(255,255,255,0.85)' : `${theme.textColor}99`
    }}
  >
    {formDescription}
  </CardDescription>
)} */}
      </CardHeader>

      {settings.multiPage && settings.progressBar && (
        <div className="bg-muted h-1.5 w-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentPage + 1) / totalPages) * 100}%`,
              background: theme.buttonStyle === 'gradient'
                ? `linear-gradient(to right, ${theme.primaryColor}, ${adjustColor(theme.primaryColor, 20)})`
                : theme.primaryColor
            }}
          />
        </div>
      )}

      <CardContent className="p-6 pt-8 space-y-6">
        {settings.multiPage && (
          <div
            className="mb-4 text-sm text-muted-foreground flex items-center"
            style={{ color: `${theme.textColor}80` }}
          >
            <Sparkles className="h-3.5 w-3.5 mr-2" style={{ color: theme.primaryColor }} />
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

      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        {multiPage && currentPage > 0 ? (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center transition-all hover:-translate-x-1"
            style={{
              borderColor: `${theme.primaryColor}50`,
              color: theme.primaryColor
            }}
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
          className="transition-all hover:translate-x-1 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={getButtonStyles()}
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
