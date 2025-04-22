"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ChevronsUpDown, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FormPreview from '@/components/form-builder/FormPreview';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import axios from 'axios';

export default function PreviewFormPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState('desktop');

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/forms/${formId}`);

      if (response.data.success) {
        setForm(response.data.form);
      } else {
        throw new Error(response.data.message || "Failed to fetch form");
      }
    } catch (error: any) {
      toast({
        title: "Error loading form",
        description: error.message || "There was a problem loading the form",
        variant: "destructive"
      });
      router.push('/forms');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push(`/forms/${formId}/edit`);
  };

  const viewLiveForm = () => {
    window.open(`/live-form/${formId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full mt-36">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading form preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container h-full  flex flex-col py-4 max-w-full px-0 md:px-4 mt-12">
      <div className="flex justify-between items-center py-2 px-4 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Preview: {form.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {viewport === 'desktop' && <Monitor className="h-4 w-4 mr-2" />}
                {viewport === 'tablet' && <Tablet className="h-4 w-4 mr-2" />}
                {viewport === 'mobile' && <Smartphone className="h-4 w-4 mr-2" />}
                {viewport.charAt(0).toUpperCase() + viewport.slice(1)}
                <ChevronsUpDown className="h-3.5 w-3.5 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewport('desktop')}>
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewport('tablet')}>
                <Tablet className="h-4 w-4 mr-2" />
                Tablet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewport('mobile')}>
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {form.isPublished && (
            <Button
              variant="default"
              size="sm"
              onClick={viewLiveForm}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live Form
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 h-full max-h-screen py-4 overflow-auto bg-gray-100 dark:bg-gray-800 p-4 flex justify-center">
        <div
          className={`bg-background rounded-lg p-4 h-full max-h-screen overflow-y-scroll shadow-lg transition-all duration-300 ${
            viewport === 'desktop' ? 'w-full max-w-3xl' :
            viewport === 'tablet' ? 'w-[768px]' :
            'w-[375px]'
          }`}
        >
          <FormPreview
            fields={form.fields || []}
            theme={form.theme || {}}
            formTitle={form.name || 'Form Preview'}
            formDescription={form.description || ''}
            settings={form.settings || {}}
            thankYouPage={form.thankYouPage || {}}
            coverImage={form.coverImage || ''}
            multiPage={form.settings?.multiPage || false}
          />
        </div>
      </div>
    </div>
  );
}

