"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import FormBuilder from '@/components/form-builder/FormBuilder';

export default function NewFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('blank');
  const [loading, setLoading] = useState(false);
  const [formName, setFormName] = useState('');
  const [templates, setTemplates] = useState({ public: [], organization: [] });
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  React.useEffect(() => {
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/forms/templates');
        if (response.data.success) {
          setTemplates(response.data.templates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  const createBlankForm = async () => {
    if (!formName.trim()) {
      toast({
        title: "Form name required",
        description: "Please enter a name for your form",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/forms', {
        name: formName,
        description: '',
        fields: [],
        theme: {
          primaryColor: '#3B82F6',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          accentColor: '#EFF6FF',
          fontFamily: 'Inter, sans-serif',
          borderRadius: '0.375rem',
          buttonStyle: 'filled',
          logoPosition: 'center',
        },
        settings: {
          captcha: true,
          allowAnonymous: true,
          requireLogin: false,
          multiPage: false,
          progressBar: true,
          autoSave: false,
          confirmationEmail: false,
        }
      });

      if (response.data.success) {
        router.push(`/forms/${response.data.formId}/edit`);
      } else {
        throw new Error(response.data.message || "Failed to create form");
      }
    } catch (error: any) {
      toast({
        title: "Error creating form",
        description: error.message || "There was a problem creating the form",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = async (templateId: string) => {
    setLoading(true);
    try {
      // Get template details
      const response = await axios.get(`/api/forms/templates/${templateId}`);

      if (response.data.success) {
        const template = response.data.template;

        // Create new form based on template
        const formResponse = await axios.post('/api/forms', {
          name: formName || template.name,
          description: template.description,
          fields: template.fields,
          theme: template.theme,
          settings: {
            captcha: true,
            allowAnonymous: true,
            requireLogin: false,
            multiPage: template.fields.length > 5, // Set multi-page if many fields
            progressBar: true,
            autoSave: false,
            confirmationEmail: false,
          }
        });

        if (formResponse.data.success) {
          router.push(`/forms/${formResponse.data.formId}/edit`);
        } else {
          throw new Error(formResponse.data.message || "Failed to create form from template");
        }
      } else {
        throw new Error(response.data.message || "Failed to get template details");
      }
    } catch (error: any) {
      toast({
        title: "Error using template",
        description: error.message || "There was a problem creating form from template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push('/forms');
  };

  const renderTemplateCards = (templateList: any[]) => {
    if (loadingTemplates) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (templateList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No templates available
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templateList.map(template => (
          <Card
            key={template._id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template._id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedTemplate(template._id)}
          >
            {template.previewImage ? (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-t-lg">
                <TemplateIcon className="h-12 w-12 text-muted-foreground opacity-40" />
              </div>
            )}
            <CardContent className="p-4">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags?.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8 max-w-screen-xl">
      <Button
        variant="ghost"
        onClick={goBack}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Forms
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Form</h1>
        <p className="text-muted-foreground mt-1">
          Start from scratch or use a template to create your new form.
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="form-name" className="block text-sm font-medium mb-1">
          Form Name
        </label>
        <div className="max-w-md">
          <Input
            id="form-name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter a name for your form"
            className="w-full"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="blank">Blank Form</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="blank" className="mt-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PlusCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Start from Scratch</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create a completely blank form and customize it to your needs using our powerful form builder.
              </p>
              <Button
                onClick={createBlankForm}
                disabled={loading}
                size="lg"
              >
                {loading && (
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                )}
                Create Blank Form
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Organization Templates</h2>
              {renderTemplateCards(templates.organization)}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Public Templates</h2>
              {renderTemplateCards(templates.public)}
            </div>

            {selectedTemplate && (
              <div className="flex justify-end">
                <Button
                  onClick={() => useTemplate(selectedTemplate)}
                  disabled={loading}
                >
                  {loading && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  )}
                  Use Selected Template
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper icon component
function TemplateIcon(props: any) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="9" x2="9" y1="21" y2="9" />
    </svg>
  );
}
