"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, PlusCircle, Sparkles, Search,
  Check, Clipboard, FileText, LayoutTemplate,
  Star, Clock, ChevronRight, Filter, RefreshCw,
  Loader2, Zap, Target, Users, Building,
  MessageSquare, Calendar, CreditCard, UserCheck,
  TrendingUp, Globe, Shield, Wand2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

export default function NewFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('start');
  const [loading, setLoading] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [templates, setTemplates] = useState({ public: [], organization: [], recent: [] });
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedQuickTemplate, setSelectedQuickTemplate] = useState<string | null>(null);
  const [templateFilter, setTemplateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiFormPrompt, setAiFormPrompt] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [featuredTemplates, setFeaturedTemplates] = useState<any[]>([]);
  const [generatedFormFields, setGeneratedFormFields] = useState<IFormField[]>([]);
  const [aiFormError, setAiFormError] = useState<string | null>(null);
 const [aiFormName, setAiFormName] = useState('');
  const [aiFormDescription, setAiFormDescription] = useState('');
  // Enhanced quick start templates with better structure
  const quickStartTemplates = [
    {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Professional contact form with name, email, phone, and message fields',
      icon: MessageSquare,
      category: 'Business',
      fields: 5,
      popular: true,
      color: 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      id: 'feedback-survey',
      name: 'Customer Feedback',
      description: 'Comprehensive survey with ratings, multiple choice, and feedback comments',
      icon: TrendingUp,
      category: 'Survey',
      fields: 8,
      popular: true,
      color: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      id: 'event-registration',
      name: 'Event Registration',
      description: 'Event signup form with participant details and preferences',
      icon: Calendar,
      category: 'Events',
      fields: 10,
      popular: true,
      color: 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      id: 'job-application',
      name: 'Job Application',
      description: 'Complete job application with resume upload and experience details',
      icon: UserCheck,
      category: 'HR',
      fields: 14,
      popular: true,
      color: 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    },
    {
      id: 'lead-capture',
      name: 'Lead Generation',
      description: 'Optimized lead capture form with qualifying questions',
      icon: Target,
      category: 'Marketing',
      fields: 6,
      popular: true,
      color: 'bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20'
    },
    {
      id: 'order-form',
      name: 'Order Form',
      description: 'Product order form with payment and shipping information',
      icon: CreditCard,
      category: 'E-commerce',
      fields: 12,
      popular: true,
      color: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20'
    }
  ];
  // Reset AI dialog when it closes
  useEffect(() => {
    if (!showAIDialog) {
      setAiProgress(0);
      setAiProcessing(false);
      setAiFormError(null);
      // Reset AI form fields
      setAiFormName('');
      setAiFormDescription('');
    }
  }, [showAIDialog]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/forms/templates');
        if (response.data.success) {
          setTemplates(response.data.templates);
          if (response.data.templates.public.length > 0) {
            setFeaturedTemplates(response.data.templates.public.slice(0, 6));
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
      const response = await axios.get(`/api/forms/templates/${templateId}`);

      if (response.data.success) {
        const template = response.data.template;

        const formResponse = await axios.post('/api/forms', {
          name: formName,
          description: formDescription || template.description,
          fields: template.fields,
          theme: template.theme,
          settings: {
            captcha: true,
            allowAnonymous: true,
            requireLogin: false,
            multiPage: template.fields.length > 5,
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

  // Fixed function to use quick start templates
  const useQuickTemplate = async (templateId: string) => {
    if (!formName.trim()) {
      toast({
        title: "Form name required",
        description: "Please enter a name for your form",
        variant: "destructive"
      });
      return;
    }

    const template = quickStartTemplates.find(t => t.id === templateId);
    if (!template) return;

    setLoading(true);
    try {
      // Create form with predefined template structure
      const formResponse = await axios.post('/api/forms', {
        name: formName,
        description: formDescription || template.description,
        fields: generateTemplateFields(templateId), // Generate fields based on template type
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
          multiPage: template.fields > 8,
          progressBar: true,
          autoSave: false,
          confirmationEmail: false,
        }
      });

      if (formResponse.data.success) {
        toast({
          title: "Template applied",
          description: `Your ${template.name.toLowerCase()} has been created successfully.`,
        });
        router.push(`/forms/${formResponse.data.formId}/edit`);
      } else {
        throw new Error(formResponse.data.message || "Failed to create form from template");
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

  // Generate fields based on template type
  const generateTemplateFields = (templateId: string) => {
    switch (templateId) {
      case 'contact-form':
        return [
          { type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
          { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
          { type: 'tel', label: 'Phone Number', required: false, placeholder: 'Enter your phone number' },
          { type: 'select', label: 'Subject', required: true, options: ['General Inquiry', 'Support', 'Sales', 'Partnership'] },
          { type: 'textarea', label: 'Message', required: true, placeholder: 'How can we help you?' }
        ];
      case 'feedback-survey':
        return [
          { type: 'text', label: 'Your Name', required: false },
          { type: 'email', label: 'Email (Optional)', required: false },
          { type: 'rating', label: 'Overall Satisfaction', required: true, max: 5 },
          { type: 'rating', label: 'Product Quality', required: true, max: 5 },
          { type: 'rating', label: 'Customer Service', required: true, max: 5 },
          { type: 'select', label: 'Would you recommend us?', required: true, options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'] },
          { type: 'textarea', label: 'Additional Comments', required: false, placeholder: 'Share your thoughts...' },
          { type: 'checkbox', label: 'Follow up with me', required: false }
        ];
      case 'event-registration':
        return [
          { type: 'text', label: 'Full Name', required: true },
          { type: 'email', label: 'Email Address', required: true },
          { type: 'tel', label: 'Phone Number', required: true },
          { type: 'text', label: 'Organization', required: false },
          { type: 'select', label: 'Ticket Type', required: true, options: ['Regular', 'VIP', 'Student', 'Group'] },
          { type: 'number', label: 'Number of Attendees', required: true },
          { type: 'select', label: 'Dietary Preferences', required: false, options: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Other'] },
          { type: 'textarea', label: 'Special Requirements', required: false },
          { type: 'checkbox', label: 'Subscribe to newsletter', required: false },
          { type: 'checkbox', label: 'Terms and conditions', required: true }
        ];
      case 'job-application':
        return [
          { type: 'text', label: 'Full Name', required: true },
          { type: 'email', label: 'Email Address', required: true },
          { type: 'tel', label: 'Phone Number', required: true },
          { type: 'text', label: 'Position Applied For', required: true },
          { type: 'text', label: 'Current Location', required: true },
          { type: 'select', label: 'Experience Level', required: true, options: ['Entry Level', '1-3 years', '3-5 years', '5-10 years', '10+ years'] },
          { type: 'text', label: 'Current Company', required: false },
          { type: 'text', label: 'Current Salary', required: false },
          { type: 'text', label: 'Expected Salary', required: false },
          { type: 'date', label: 'Available Start Date', required: true },
          { type: 'file', label: 'Resume/CV', required: true, accept: '.pdf,.doc,.docx' },
          { type: 'file', label: 'Cover Letter', required: false, accept: '.pdf,.doc,.docx' },
          { type: 'textarea', label: 'Why are you interested in this position?', required: true },
          { type: 'checkbox', label: 'Authorized to work', required: true }
        ];
      case 'lead-capture':
        return [
          { type: 'text', label: 'Full Name', required: true },
          { type: 'email', label: 'Business Email', required: true },
          { type: 'text', label: 'Company Name', required: true },
          { type: 'select', label: 'Company Size', required: true, options: ['1-10', '11-50', '51-200', '201-1000', '1000+'] },
          { type: 'select', label: 'Industry', required: true, options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Other'] },
          { type: 'textarea', label: 'Tell us about your needs', required: false }
        ];
      case 'order-form':
        return [
          { type: 'text', label: 'Full Name', required: true },
          { type: 'email', label: 'Email Address', required: true },
          { type: 'tel', label: 'Phone Number', required: true },
          { type: 'text', label: 'Product/Service', required: true },
          { type: 'number', label: 'Quantity', required: true },
          { type: 'text', label: 'Shipping Address', required: true },
          { type: 'text', label: 'City', required: true },
          { type: 'text', label: 'State/Province', required: true },
          { type: 'text', label: 'ZIP/Postal Code', required: true },
          { type: 'select', label: 'Payment Method', required: true, options: ['Credit Card', 'PayPal', 'Bank Transfer'] },
          { type: 'textarea', label: 'Special Instructions', required: false },
          { type: 'checkbox', label: 'Terms and conditions', required: true }
        ];
      default:
        return [];
    }
  };

  const handleAIFormGeneration = async () => {
    // Use AI form name if provided, otherwise fall back to main form name
    const finalFormName = aiFormName.trim() || formName.trim();
    const finalFormDescription = aiFormDescription.trim() || formDescription.trim();

    if (!finalFormName) {
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
      const response = await axios.post('/api/ai/generate-form', {
        prompt: aiFormPrompt,
        formName: finalFormName,
        formDescription: finalFormDescription
      });

      if (response.data.success) {
        setAiProgress(100);
        setGeneratedFormFields(response.data.fields);

        setTimeout(async () => {
          try {
            const formResponse = await axios.post('/api/forms', {
              name: finalFormName,
              description: finalFormDescription || response.data.description || `AI-generated form based on: ${aiFormPrompt}`,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-border/50 overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const filtered = filteredTemplates(templateList);

    if (filtered.length === 0) {
      return (
        <Card className="border-border/50 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchQuery ?
                "Try adjusting your search terms or browse all categories" :
                "There are no templates available in this category yet"
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setTemplateFilter('all');
            }} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(template => (
          <Card
            key={template._id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden group border-border/50",
              selectedTemplate === template._id
                ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                : 'hover:border-primary/30 hover:shadow-md'
            )}
            onClick={() => setSelectedTemplate(template._id)}
          >
            <div className="aspect-video w-full overflow-hidden relative bg-gradient-to-br from-muted/80 to-muted">
              {template.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <LayoutTemplate className="h-16 w-16 text-muted-foreground/40 transition-transform group-hover:scale-110" />
                </div>
              )}

              {template.featured && (
                <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Featured
                </Badge>
              )}

              {selectedTemplate === template._id && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="p-3 rounded-full bg-primary shadow-lg">
                    <Check className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {template.description}
              </p>
            </CardHeader>

            <CardContent className="pt-0 pb-3">
              <div className="flex flex-wrap gap-2">
                {template.tags?.slice(0, 2).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                    {tag}
                  </Badge>
                ))}
                {template.tags?.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{template.tags.length - 2}
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter className="px-4 py-3 bg-muted/30 border-t border-border/30 flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <LayoutTemplate className="h-3 w-3" />
                <span>{template.fields?.length || 0} fields</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(template.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen h-fit overflow-y-scroll max-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={goBack}
            className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forms
          </Button>

          {/* <Button
            onClick={() => setShowAIDialog(true)}
            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="h-4 w-4" />
            AI Form Builder
          </Button> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text mb-3">
                  Create New Form
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  Build powerful, professional forms with our intuitive tools, pre-designed templates, or AI assistance.
                </p>
              </div>

              <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Form Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="form-name" className="text-sm font-semibold">
                      Form Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="form-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Customer Feedback Survey"
                      className="border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="form-description" className="text-sm font-semibold">
                      Description <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Textarea
                      id="form-description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Brief description of your form's purpose"
                      className="border-border/50 focus:border-primary resize-none transition-colors"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Action Buttons */}
              <div className="space-y-3">
                {selectedTemplate && activeTab === 'templates' && (
                  <Button
                    className="w-full gap-2 shadow-sm"
                    onClick={() => useTemplate(selectedTemplate)}
                    disabled={loading || !formName.trim()}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Use Selected Template
                  </Button>
                )}

                {selectedQuickTemplate && activeTab === 'start' && (
                  <Button
                    className="w-full gap-2 shadow-sm"
                    onClick={() => useQuickTemplate(selectedQuickTemplate)}
                    disabled={loading || !formName.trim()}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Use Quick Template
                  </Button>
                )}

                {activeTab === 'start' && !selectedQuickTemplate && (
                  <Button
                    className="w-full gap-2 shadow-sm"
                    onClick={createBlankForm}
                    disabled={loading || !formName.trim()}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                    Create Blank Form
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Modern Tab Navigation */}
              <div className="flex items-center justify-between mb-8">
                <TabsList className="bg-muted/50 border border-border/50 p-1 shadow-sm">
                  <TabsTrigger
                    value="start"
                    className="gap-2 border-none data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    <Zap className="h-4 w-4" />
                    Quick Start
                  </TabsTrigger>
                  <TabsTrigger
                    value="templates"
                    className="gap-2 border-none data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    <LayoutTemplate className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                </TabsList>

                {activeTab === 'templates' && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 border-border/50 bg-background/80"
                      />
                    </div>
                    <Select value={templateFilter} onValueChange={setTemplateFilter}>
                      <SelectTrigger className="w-48 border-border/50 bg-background/80">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter category" />
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
                )}
              </div>

              {/* Enhanced Quick Start Tab */}
              <TabsContent value="start" className="mt-0 space-y-8">
                {/* Hero Section */}
                <Card className="border-border/50 shadow-lg overflow-hidden bg-gradient-to-br from-background to-muted/20">
                  <div className="bg-gradient-to-br from-primary/5 via-background to-purple-500/5 p-8 text-center border-b border-border/50">
                    <div className="max-w-2xl mx-auto">
                      <div className="p-6 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 inline-flex mb-6 shadow-inner">
                        <PlusCircle className="h-12 w-12 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        Start from Scratch
                      </h2>
                      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        Create a completely custom form using our powerful drag-and-drop builder.
                        Perfect for unique requirements and complete creative control.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={createBlankForm}
                          disabled={loading || !formName.trim()}
                          size="lg"
                          className="gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle className="h-5 w-5" />}
                          Create Blank Form
                        </Button>
                        <Button
                          onClick={() => setShowAIDialog(true)}
                          variant="outline"
                          size="lg"
                          className="gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/30 shadow-lg hover:shadow-xl transition-all"
                        >
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          Try AI Builder
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Quick Start Templates */}
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Popular Templates</h3>
                        <p className="text-muted-foreground">Get started quickly with these professionally designed forms</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('templates')}
                        className="gap-2 shadow-sm hover:shadow-md transition-all"
                      >
                        View All Templates
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {quickStartTemplates.map((template) => {
                        const Icon = template.icon;
                        const isSelected = selectedQuickTemplate === template.id;

                        return (
                          <Card
                            key={template.id}
                            className={cn(
                              "cursor-pointer transition-all duration-300 border-border/50 group relative overflow-hidden",
                              isSelected
                                ? 'ring-2 ring-primary shadow-lg scale-[1.02] border-primary/50'
                                : 'hover:shadow-lg hover:border-primary/30 hover:scale-[1.01]'
                            )}
                            onClick={() => setSelectedQuickTemplate(isSelected ? null : template.id)}
                          >
                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-3 right-3 z-10">
                                <div className="p-1 rounded-full bg-primary shadow-lg">
                                  <Check className="h-4 w-4 text-primary-foreground" />
                                </div>
                              </div>
                            )}

                            <CardContent className="p-6">
                              <div className="flex items-start gap-4 mb-4">
                                <div className={cn(
                                  "p-4 rounded-xl transition-all duration-300",
                                  template.color,
                                  isSelected ? 'scale-110' : 'group-hover:scale-105'
                                )}>
                                  <Icon className="h-7 w-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                    {template.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                                    {template.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs font-medium transition-all",
                                    isSelected && "bg-primary/10 text-primary border-primary/20"
                                  )}
                                >
                                  {template.category}
                                </Badge>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <LayoutTemplate className="h-3 w-3" />
                                    <span>{template.fields} fields</span>
                                  </div>
                                  {template.popular && (
                                    <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400">
                                      <Star className="h-2 w-2 mr-1 fill-current" />
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>

                            {/* Gradient overlay on hover */}
                            <div className={cn(
                              "absolute inset-0 transition-opacity duration-300 pointer-events-none",
                              template.bgColor,
                              isSelected ? "opacity-10" : "opacity-0 group-hover:opacity-5"
                            )} />
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-border/50 text-center group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="p-4 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 inline-flex mb-6 group-hover:scale-110 transition-transform">
                        <Wand2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">Drag & Drop Builder</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Intuitive visual builder with advanced field types, conditional logic, and real-time preview
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 text-center group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="p-4 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-950/30 dark:to-emerald-900/30 inline-flex mb-6 group-hover:scale-110 transition-transform">
                        <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">Secure & Reliable</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Enterprise-grade security with data encryption, GDPR compliance, and reliable cloud hosting
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 text-center group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="p-4 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-950/30 dark:to-purple-900/30 inline-flex mb-6 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">Advanced Analytics</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Comprehensive insights, conversion tracking, and detailed reporting on form performance
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Enhanced Templates Tab */}
              <TabsContent value="templates" className="mt-0">
                <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                          <LayoutTemplate className="h-6 w-6 text-primary" />
                          Form Templates
                        </CardTitle>
                        <p className="text-muted-foreground mt-2 leading-relaxed">
                          Choose from professionally designed templates to get started quickly and efficiently
                        </p>
                      </div>
                      <Badge variant="outline" className="text-sm px-3 py-1 bg-background/50">
                        {templates.public.length} templates available
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8">
                    <ScrollArea className="h-[700px] pr-4">
                      {renderTemplateCards(templates.public)}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

         {/* Enhanced AI Form Creation Dialog */}
       <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
  <DialogContent className="sm:max-w-2xl z-[100]  max-h-screen h-fit scrollbar-hide m-auto overflow-y-scroll">
    {/* Modern Header with Gradient */}
    <DialogHeader className="pb-2 border-b bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 -m-6 mb-6 px-6 pt-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            AI Form Builder
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-1">
            Describe your needs and let our AI create a professional form with optimized fields and validation
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>

    <div className="space-y-6 py-">
      {/* Form Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-slate-50/50 to-gray-50/50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-lg border border-border/50">
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Form Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g., Customer Feedback Survey"
            value={aiFormName}
            onChange={(e) => setAiFormName(e.target.value)}
            disabled={aiProcessing}
            className="border-border/50 focus:border-blue-300 dark:focus:border-blue-700"
          />
          {!aiFormName.trim() && formName.trim() && (
            <p className="text-xs text-muted-foreground">
              💡 Will use "{formName}" from sidebar if left empty
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            placeholder="Brief description of your form"
            value={aiFormDescription}
            onChange={(e) => setAiFormDescription(e.target.value)}
            disabled={aiProcessing}
            className="border-border/50 focus:border-green-300 dark:focus:border-green-700"
          />
        </div>
      </div>

      {/* Enhanced Input Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-600" />
            Describe your form requirements
          </label>
          <div className="relative">
            <Textarea
              placeholder="Example: Create a comprehensive customer feedback form with rating scales for different aspects like product quality, customer service, and delivery experience. Include open-ended questions for suggestions and contact information fields."
              value={aiFormPrompt}
              onChange={(e) => setAiFormPrompt(e.target.value)}
              disabled={aiProcessing}
              className="min-h-32 border-border/50 focus:border-purple-300 placeholder:dark:text-gray-700 dark:focus:border-purple-700 resize-none text-sm leading-relaxed"
              maxLength={500}
            />
            <div className={cn(
              "absolute right-3 bottom-3 text-xs transition-colors",
              aiFormPrompt.length > 450 ? "text-amber-600" : "text-muted-foreground"
            )}>
              {aiFormPrompt.length}/500
            </div>
          </div>
        </div>

        {/* AI Examples/Suggestions */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            💡 Quick suggestions (click to use):
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              {
                text: "Customer satisfaction survey with 5-star ratings and feedback comments",
                suggestedName: "Customer Satisfaction Survey"
              },
              {
                text: "Job application form with resume upload and experience questions",
                suggestedName: "Job Application Form"
              },
              {
                text: "Event registration form with participant details and dietary preferences",
                suggestedName: "Event Registration Form"
              },
              {
                text: "Contact form with inquiry categories and file attachments",
                suggestedName: "Contact Form"
              }
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-3 border-border/50 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-200 dark:hover:border-purple-800"
                onClick={() => {
                  setAiFormPrompt(suggestion.text);
                  if (!aiFormName.trim()) {
                    setAiFormName(suggestion.suggestedName);
                  }
                }}
                disabled={aiProcessing}
              >
                <span className="text-xs leading-relaxed">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {aiFormError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm leading-relaxed">
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-full bg-destructive/20 mt-0.5">
              <X className="h-3 w-3" />
            </div>
            <div>
              <strong>Generation failed:</strong> {aiFormError}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Progress Section */}
      {aiProcessing && (
        <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400"></div>
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-purple-900 dark:text-purple-100 text-lg">
                  Creating "{aiFormName || formName || 'your form'}"...
                </span>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                  {Math.round(aiProgress)}%
                </span>
              </div>
              <Progress 
                value={aiProgress} 
                className="h-3 bg-purple-200 dark:bg-purple-900"
              />
            </div>
          </div>

          {/* Detailed Progress Steps */}
          <div className="space-y-3 mt-6">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-500",
              aiProgress < 30 
                ? 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100' 
                : 'bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300'
            )}>
              <div className={cn(
                "p-1.5 rounded-full transition-colors",
                aiProgress < 30 ? 'bg-purple-200 dark:bg-purple-800' : 'bg-purple-100 dark:bg-purple-900'
              )}>
                {aiProgress < 30 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                ) : (
                  <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <p className="font-medium">Analyzing Requirements</p>
                <p className="text-xs opacity-80">Understanding your form needs and structure</p>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-500",
              aiProgress >= 30 && aiProgress < 65
                ? 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100' 
                : aiProgress >= 65
                ? 'bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300'
                : 'bg-muted/30 text-muted-foreground'
            )}>
              <div className={cn(
                "p-1.5 rounded-full transition-colors",
                aiProgress >= 30 && aiProgress < 65 ? 'bg-purple-200 dark:bg-purple-800' : 
                aiProgress >= 65 ? 'bg-purple-100 dark:bg-purple-900' : 'bg-muted'
              )}>
                {aiProgress >= 30 && aiProgress < 65 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                ) : aiProgress >= 65 ? (
                  <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium">Generating Fields</p>
                <p className="text-xs opacity-80">Creating optimized form fields and layout</p>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-500",
              aiProgress >= 65 && aiProgress < 90
                ? 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100' 
                : aiProgress >= 90
                ? 'bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300'
                : 'bg-muted/30 text-muted-foreground'
            )}>
              <div className={cn(
                "p-1.5 rounded-full transition-colors",
                aiProgress >= 65 && aiProgress < 90 ? 'bg-purple-200 dark:bg-purple-800' : 
                aiProgress >= 90 ? 'bg-purple-100 dark:bg-purple-900' : 'bg-muted'
              )}>
                {aiProgress >= 65 && aiProgress < 90 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                ) : aiProgress >= 90 ? (
                  <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium">Optimizing Validation</p>
                <p className="text-xs opacity-80">Adding smart validation rules and logic</p>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-500",
              aiProgress >= 90
                ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100' 
                : 'bg-muted/30 text-muted-foreground'
            )}>
              <div className={cn(
                "p-1.5 rounded-full transition-colors",
                aiProgress >= 90 ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-muted'
              )}>
                {aiProgress >= 90 ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium">Finalizing Form</p>
                <p className="text-xs opacity-80">Applying finishing touches and theme</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium animate-pulse">
              AI is crafting your perfect form... This usually takes 30-60 seconds
            </p>
          </div>
        </div>
      )}
    </div>

    <DialogFooter className="gap-3 mt-8 pt-6 border-t border-border/50">
      <Button
        variant="outline"
        onClick={() => setShowAIDialog(false)}
        disabled={aiProcessing}
        className="font-medium"
      >
        Cancel
      </Button>
      <Button
        onClick={handleAIFormGeneration}
        disabled={(!aiFormName.trim() && !formName.trim()) || !aiFormPrompt.trim() || aiProcessing}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium gap-2 px-6"
      >
        {aiProcessing ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating Form...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>
    </div>
  );
}

// Helper icon component for templates
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