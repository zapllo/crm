"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, PlusCircle, Sparkles, Search,
  Check, Clipboard, FileText, LayoutTemplate,
  Star, Clock, ChevronRight, Filter, RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import FormBuilder from '@/components/form-builder/FormBuilder';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';
import { IFormField } from '@/models/formBuilderModel';

export default function NewFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('blank');
  const [loading, setLoading] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [templates, setTemplates] = useState({ public: [], organization: [], recent: [] });
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateFilter, setTemplateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiFormPrompt, setAiFormPrompt] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [featuredTemplates, setFeaturedTemplates] = useState<any[]>([]);
  const [generatedFormFields, setGeneratedFormFields] = useState<IFormField[]>([]);
  const [aiFormError, setAiFormError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/forms/templates');
        if (response.data.success) {
          setTemplates(response.data.templates);

          // Set featured templates (normally would come from the API)
          if (response.data.templates.public.length > 0) {
            setFeaturedTemplates(response.data.templates.public.slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: "Couldn't load templates",
          description: "There was an issue loading templates. Try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  // Simulate AI progress bar
  useEffect(() => {
    if (aiProcessing) {
      const interval = setInterval(() => {
        setAiProgress((prev) => {
          const newProgress = prev + Math.random() * 8;
          if (newProgress >= 95) {
            clearInterval(interval);
            return 95;
          }
          return newProgress;
        });
      }, 700);

      return () => clearInterval(interval);
    }
  }, [aiProcessing]);

  // Reset AI progress when dialog closes
  useEffect(() => {
    if (!showAIDialog) {
      setAiProgress(0);
      setAiProcessing(false);
      setAiFormError(null);
    }
  }, [showAIDialog]);

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
        description: formDescription,
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
        toast({
          title: "Form created",
          description: "Your new form has been created successfully.",
        });
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
      // Get template details
      const response = await axios.get(`/api/forms/templates/${templateId}`);

      if (response.data.success) {
        const template = response.data.template;

        // Create new form based on template
        const formResponse = await axios.post('/api/forms', {
          name: formName,
          description: formDescription || template.description,
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
          toast({
            title: "Template applied",
            description: "Your form has been created using the selected template.",
          });
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

  const handleAIFormGeneration = async () => {
    if (!formName.trim()) {
      toast({
        title: "Form name required",
        description: "Please enter a name for your form",
        variant: "destructive"
      });
      return;
    }

    if (!aiFormPrompt.trim()) {
      toast({
        title: "AI prompt required",
        description: "Please describe what kind of form you want to create",
        variant: "destructive"
      });
      return;
    }

    setAiProcessing(true);
    setAiFormError(null);

    try {
      // Call OpenAI API endpoint to generate form fields
      const response = await axios.post('/api/ai/generate-form', {
        prompt: aiFormPrompt,
        formName: formName,
        formDescription: formDescription
      });

      if (response.data.success) {
        setAiProgress(100);
        setGeneratedFormFields(response.data.fields);

        // Create actual form with the generated fields
        setTimeout(async () => {
          try {
            const formResponse = await axios.post('/api/forms', {
              name: formName,
              description: formDescription || response.data.description || `AI-generated form based on: ${aiFormPrompt}`,
              fields: response.data.fields,
              theme: response.data.theme || {
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
                multiPage: response.data.fields.length > 5,
                progressBar: true,
                autoSave: false,
                confirmationEmail: false,
              }
            });

            if (formResponse.data.success) {
              setShowAIDialog(false);
              toast({
                title: "AI Form Created",
                description: "Your AI-powered form has been generated successfully!",
              });

              // Navigate to the edit page for the new form
              router.push(`/forms/${formResponse.data.formId}/edit`);
            } else {
              throw new Error(formResponse.data.message || "Failed to create form");
            }
          } catch (error: any) {
            setAiProcessing(false);
            setAiFormError("Error creating the form. Please try again.");
            toast({
              title: "Error creating form",
              description: error.message || "There was a problem creating the form",
              variant: "destructive"
            });
          }
        }, 1000);
      } else {
        throw new Error(response.data.message || "Failed to generate form fields");
      }
    } catch (error: any) {
      console.error("AI form generation error:", error);
      setAiProcessing(false);
      setAiFormError(error.message || "Error generating form. Please try a different prompt.");

      toast({
        title: "AI generation failed",
        description: "Could not generate form fields. Please try a different prompt.",
        variant: "destructive"
      });
    }
  };

  const goBack = () => {
    router.push('/forms');
  };

  const filteredTemplates = (templateList: any[]) => {
    return templateList.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = templateFilter === 'all' ||
        template.category === templateFilter ||
        (templateFilter === 'other' && !template.category);

      return matchesSearch && matchesCategory;
    });
  };

  const getUniqueCategories = () => {
    const allTemplates = [...templates.public, ...templates.organization];
    const categories = new Set(allTemplates.map((t: any) => t.category).filter(Boolean));
    return Array.from(categories);
  };

  const renderTemplateCards = (templateList: any[]) => {
    if (loadingTemplates) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse"></div>
              <CardContent className="p-4">
                <div className="h-5 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const filtered = filteredTemplates(templateList);

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            {searchQuery ?
              "Try adjusting your search or filters" :
              "There are no templates available in this category yet"
            }
          </p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setSearchQuery('');
            setTemplateFilter('all');
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(template => (
          <Card
            key={template._id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden group ${selectedTemplate === template._id ? 'ring-1 ring-primary' : 'hover:border-primary/50'
              }`}
            onClick={() => setSelectedTemplate(template._id)}
          >
            <div className="aspect-video w-full overflow-hidden relative">
              {template.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
                  <TemplateIcon className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}

              {template.featured && (
                <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Featured
                </Badge>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-base line-clamp-1">{template.name}</h3>
                {selectedTemplate === template._id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {template.description}
              </p>

              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags?.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
                {template.tags?.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter className="px-4 py-3 bg-muted/10 flex justify-between items-center border-t text-xs text-muted-foreground">
              {/* <div className="flex items-center">
                <LayoutTemplate className="h-3 w-3 mr-1" />
                {template.fields?.length || 0} fields
              </div> */}
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Updated {new Date(template.updatedAt || Date.now()).toLocaleDateString()}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-h-screen h-fit scrollbar-hide overflow-y-scroll py-8 max-w-screen">
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
          onClick={goBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forms
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-2/5 lg:w-1/3">
          <div className="sticky top-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Create New Form</h1>
              <p className="text-muted-foreground mt-2">
                Get started quickly with a blank canvas, pre-built templates, or AI-powered form generation.
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-medium">Form Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="form-name" className="text-sm font-medium">
                    Form Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="form-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="E.g. Customer Feedback Survey"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="form-description" className="text-sm font-medium">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Input
                    id="form-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of your form"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {selectedTemplate && activeTab === 'templates' && (
                <Button
                  className="w-full flex gap-2"
                  onClick={() => useTemplate(selectedTemplate)}
                  disabled={loading || !formName.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Use Selected Template
                </Button>
              )}

              {activeTab === 'blank' && (
                <Button
                  className="w-full flex gap-2"
                  onClick={createBlankForm}
                  disabled={loading || !formName.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                  Create Blank Form
                </Button>
              )}

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                onClick={() => setShowAIDialog(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          </div>
        </div>

        <div className="md:w-3/5 lg:w-2/3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-transparent p-0 h-auto gap-4">
                <TabsTrigger
                  value="blank"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm border data-[state=inactive]:bg-transparent data-[state=inactive]:border-transparent h-10 px-4"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Start Blank
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm border data-[state=inactive]:bg-transparent data-[state=inactive]:border-transparent h-10 px-4"
                >
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
              </TabsList>

              {activeTab === 'templates' && (
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              )}
            </div>

            <TabsContent value="blank" className="mt-0 border-none p-0">
              <Card className="overflow-hidden border shadow-sm">
                <div
                  className="aspect-[21/9] md:aspect-[21/10] bg-gradient-to-br from-background to-muted flex items-center justify-center border-b"
                >
                  <div className="max-w-md p-6 text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <PlusCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Start from Scratch</h2>
                    <p className="text-muted-foreground mb-6">
                      Create a completely blank form and customize it to your needs using our powerful form builder.
                    </p>

                    {!formName.trim() ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="lg" className="opacity-70" disabled>
                              Create Blank Form
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Please enter a form name first</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        onClick={createBlankForm}
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                        Create Blank Form
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="p-6 pb-8">
                  <h3 className="text-lg font-medium mb-4">Popular Starting Points</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredTemplates.map((template, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => {
                          setActiveTab('templates');
                          setSelectedTemplate(template._id);
                          setTemplateFilter('all');
                          setSearchQuery('');
                        }}
                      >
                        <CardContent className="p-4 flex gap-3 items-center">
                          <div className="p-2 rounded-md bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.fields?.length || 0} fields</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="mt-0 border-none p-0">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <Select value={templateFilter} onValueChange={setTemplateFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getUniqueCategories().map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <ScrollArea className=" pr-4 pb-4">

                      <div>
                        <h2 className="text-lg font-semibold mb-4">Public Templates</h2>
                        {renderTemplateCards(templates.public)}
                      </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI Form Creation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-lg z-[100]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Form Builder
            </DialogTitle>
            <DialogDescription>
              Let AI create a professional form for you. Describe what kind of form you need and our AI will generate it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Describe the form you want to create
              </label>
              <div className="relative">
                <textarea
                  placeholder="E.g. Create a customer feedback form with rating scales and open-ended questions about product satisfaction and service quality."
                  value={aiFormPrompt}
                  onChange={(e) => setAiFormPrompt(e.target.value)}
                  disabled={aiProcessing}
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                  {aiFormPrompt.length}/500
                </div>
              </div>
            </div>

            {aiFormError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                {aiFormError}
              </div>
            )}

            {aiProcessing && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Generating form...</span>
                  <span>{Math.round(aiProgress)}%</span>
                </div>
                <Progress value={aiProgress} className="h-2" />
                <div className="space-y-3 mt-3 bg-muted/20 p-3 rounded-md border text-sm">
                  <p className={`${aiProgress < 30 ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
                    <Loader2 className={`h-3 w-3 inline mr-2 ${aiProgress < 30 ? 'animate-spin' : ''}`} />
                    Analyzing your requirements...
                  </p>
                  <p className={`${aiProgress >= 30 && aiProgress < 60 ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
                    <Loader2 className={`h-3 w-3 inline mr-2 ${aiProgress >= 30 && aiProgress < 60 ? 'animate-spin' : ''}`} />
                    Generating form structure and fields...
                  </p>
                  <p className={`${aiProgress >= 60 && aiProgress < 90 ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
                    <Loader2 className={`h-3 w-3 inline mr-2 ${aiProgress >= 60 && aiProgress < 90 ? 'animate-spin' : ''}`} />
                    Optimizing field validation and layout...
                  </p>
                  <p className={`${aiProgress >= 90 ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
                    <Loader2 className={`h-3 w-3 inline mr-2 ${aiProgress >= 90 ? 'animate-spin' : ''}`} />
                    Finalizing your custom form...
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowAIDialog(false)}
              disabled={aiProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAIFormGeneration}
              disabled={!aiFormPrompt.trim() || !formName.trim() || aiProcessing}
              className={`${aiProcessing ? 'bg-purple-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white hover:from-purple-700 hover:to-indigo-700`}
            >
              {aiProcessing ? 'Generating...' : 'Generate Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
