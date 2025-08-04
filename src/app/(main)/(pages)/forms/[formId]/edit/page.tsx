"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Eye, Save, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FormBuilder from '@/components/form-builder/FormBuilder';
import FormIntegrationPanel from '@/components/form-builder/FormIntegrationPanel';
import axios from 'axios';



export default function EditFormPageContent() {
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showIntegrationPanel, setShowIntegrationPanel] = useState(false);

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
      // router.push('/forms');
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async (formData: any) => {
    setSaving(true);
    try {
      const response = await axios.put(`/api/forms/${formId}`, formData);

      if (response.data.success) {
        toast({
          title: "Form saved",
          description: "Your form has been saved successfully",
        });

        // Refresh form data
        fetchForm();
      } else {
        throw new Error(response.data.message || "Failed to save form");
      }
    } catch (error: any) {
      toast({
        title: "Error saving form",
        description: error.message || "There was a problem saving the form",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const publishForm = async () => {
    setSaving(true);
    try {
      const response = await axios.put(`/api/forms/${formId}`, {
        ...form,
        isPublished: true
      });

      if (response.data.success) {
        toast({
          title: "Form published",
          description: "Your form is now live and accepting submissions",
        });

        // Refresh form data
        fetchForm();
      } else {
        throw new Error(response.data.message || "Failed to publish form");
      }
    } catch (error: any) {
      toast({
        title: "Error publishing form",
        description: error.message || "There was a problem publishing the form",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublishForm = async () => {
    setSaving(true);
    try {
      const newPublishState = !form.isPublished;

      const response = await axios.put(`/api/forms/${formId}`, {
        ...form,
        isPublished: newPublishState
      });

      if (response.data.success) {
        toast({
          title: newPublishState ? "Form published" : "Form unpublished",
          description: newPublishState
            ? "Your form is now live and accepting submissions"
            : "Your form is now in draft mode and not accepting submissions",
        });

        // Refresh form data
        fetchForm();
      } else {
        throw new Error(response.data.message || "Failed to update form");
      }
    } catch (error: any) {
      toast({
        title: "Error updating form",
        description: error.message || "There was a problem updating the form",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    router.push('/forms');
  };

  const previewForm = () => {
    router.push(`/forms/${formId}/preview`);
  };

  if (loading) {
    return (
      <div className="flex mt-20 items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-12 h-full max-h-screen sc overflow-y-scroll flex flex-col py-4 max-w-full px-0 md:px-4">
      <div className="flex justify-between items-center py-2 px-4 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">{form?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIntegrationPanel(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={previewForm}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={form?.isPublished ? "secondary" : "default"}
            size="sm"
            onClick={togglePublishForm}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {form?.isPublished ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <FormBuilder
          initialForm={form}
          onSave={saveForm}
        />
      </div>

      {showIntegrationPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Share Form</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowIntegrationPanel(false)}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <FormIntegrationPanel  formName={form?.name || "Form"} formId={formId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
