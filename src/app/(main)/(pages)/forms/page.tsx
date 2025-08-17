"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Filter, Edit2, Copy, Trash2,
  MoreHorizontal, FileText, ExternalLink, Eye,
  Sparkles, Calendar, Share2, RefreshCw, BarChart3, ArrowUpRight,
  Grid3X3, List, TrendingUp, Clock, Users, Settings
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import FormBuilderPricingPage from '@/components/billing/FormBuilderPricingPage';
import { useUserContext } from '@/contexts/userContext';
import FormBuilderUsageStats from '@/components/form-builder/FormBuilderUsageStats';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

function FormLimitsWarning({ limits }: { limits: { maxForms: number, currentForms: number, maxSubmissionsPerMonth: number, currentMonthSubmissions: number, plan: string | null } | null }) {
  if (!limits) return null;

  const { maxForms, currentForms, maxSubmissionsPerMonth, currentMonthSubmissions, plan } = limits;
  const formUsagePercent = maxForms > 0 ? (currentForms / maxForms) * 100 : 0;
  const submissionUsagePercent = maxSubmissionsPerMonth > 0 ? (currentMonthSubmissions / maxSubmissionsPerMonth) * 100 : 0;

  if (formUsagePercent < 80 && submissionUsagePercent < 80) return null;
  
  const router = useRouter();
  
  return (
    <Card className="mb-6 border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Usage Alert</h3>
              <p className="text-sm text-amber-700 dark:text-amber-200">You're approaching your plan limits</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {formUsagePercent >= 80 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Published Forms</span>
                    <span className={cn("text-sm font-bold", formUsagePercent >= 90 ? "text-red-600" : "text-amber-600")}>
                      {currentForms} / {maxForms}
                    </span>
                  </div>
                  <Progress 
                    value={formUsagePercent} 
                    className={cn("h-2", formUsagePercent >= 90 ? "bg-red-200" : "bg-amber-200")}
                  />
                </div>
              )}

              {submissionUsagePercent >= 80 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Monthly Submissions</span>
                    <span className={cn("text-sm font-bold", submissionUsagePercent >= 90 ? "text-red-600" : "text-amber-600")}>
                      {currentMonthSubmissions} / {maxSubmissionsPerMonth}
                    </span>
                  </div>
                  <Progress 
                    value={submissionUsagePercent} 
                    className={cn("h-2", submissionUsagePercent >= 90 ? "bg-red-200" : "bg-amber-200")}
                  />
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/settings/billing')}
              className="bg-white/50 dark:bg-amber-900/20 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
            >
              Upgrade Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FormsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiFormName, setAiFormName] = useState('');
  const [aiFormDescription, setAiFormDescription] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const deleteForm = (formId: string) => {
    setSelectedFormId(formId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteForm = async () => {
    if (!selectedFormId) return;

    try {
      const response = await axios.delete(`/api/forms/${selectedFormId}`);

      if (response.data.success) {
        toast({
          title: "Form deleted",
          description: "Form has been deleted successfully.",
        });
        fetchForms();
      } else {
        throw new Error(response.data.message || "Failed to delete form");
      }
    } catch (error: any) {
      toast({
        title: "Error deleting form",
        description: error.message || "There was a problem deleting the form.",
        variant: "destructive"
      });
    } finally {
      setSelectedFormId(null);
      setDeleteConfirmOpen(false);
    }
  };

  const [accessStatus, setAccessStatus] = useState({
    hasAccess: false,
    needsPurchase: false,
    limits: null,
    loading: true
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await axios.get('/api/check-form-builder-access');
        setAccessStatus({
          hasAccess: response.data.hasAccess,
          needsPurchase: response.data.needsPurchase || false,
          limits: response.data.limits || null,
          loading: false
        });
      } catch (error) {
        console.error('Error checking form builder access:', error);
        setAccessStatus(prev => ({
          ...prev,
          hasAccess: false,
          loading: false
        }));
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    fetchForms();
  }, []);

  const [usageStats, setUsageStats] = useState({
    totalForms: 0,
    publishedForms: 0,
    draftForms: 0,
    maxForms: 0,
    currentMonthSubmissions: 0,
    maxSubmissionsPerMonth: 0,
    submissionsResetDate: new Date(),
    planName: ''
  });

  const { user } = useUserContext();

  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!accessStatus.hasAccess) return;

      try {
        const totalForms = forms.length;
        const publishedForms = forms.filter((form: any) => form.isPublished).length;
        const draftForms = totalForms - publishedForms;

        const submissionsResponse = await axios.get('/api/forms/submission-stats');
        const submissionStats = submissionsResponse.data;

        const maxForms = user?.organization?.formBuilder?.maxForms || 0;
        const maxSubmissionsPerMonth = user?.organization?.formBuilder?.maxSubmissionsPerMonth || 0;
        const currentMonthSubmissions = user?.organization?.formBuilder?.submissionsCount?.currentMonth || 0;
        let resetDate = new Date();

        if (user?.organization?.formBuilder?.submissionsCount?.lastResetDate) {
          resetDate = new Date(user.organization.formBuilder.submissionsCount.lastResetDate);
        }

        let planName = 'Starter';
        if (user?.organization?.formBuilder?.plan) {
          planName = user.organization.formBuilder.plan.charAt(0).toUpperCase() +
            user.organization.formBuilder.plan.slice(1);
        }

        setUsageStats({
          totalForms,
          publishedForms,
          draftForms,
          maxForms,
          currentMonthSubmissions,
          maxSubmissionsPerMonth,
          submissionsResetDate: resetDate,
          planName
        });
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      }
    };

    if (forms.length > 0 && user?.organization) {
      fetchUsageStats();
    }
  }, [forms, user, accessStatus.hasAccess]);

  useEffect(() => {
    if (aiProcessing) {
      const interval = setInterval(() => {
        setAiProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 600);

      return () => clearInterval(interval);
    }
  }, [aiProcessing]);

  useEffect(() => {
    if (!showAIDialog) {
      setAiProgress(0);
      setAiProcessing(false);
    }
  }, [showAIDialog]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/forms');
      setForms(response.data.forms || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast({
        title: "Error loading forms",
        description: "There was a problem fetching your forms.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewForm = () => {
    router.push('/forms/new');
  };

  const createAIForm = () => {
    setShowAIDialog(true);
  };

  const handleAIFormGeneration = async () => {
    if (!aiFormName.trim()) {
      toast({
        title: "Form name required",
        description: "Please provide a name for your AI-generated form.",
        variant: "destructive"
      });
      return;
    }

    setAiProcessing(true);

    setTimeout(() => {
      setAiProcessing(false);
      setShowAIDialog(false);
      toast({
        title: "AI Form Created",
        description: "Your AI-powered form has been generated successfully!",
      });
      fetchForms();
      setAiFormName('');
      setAiFormDescription('');
    }, 3500);
  };

  const editForm = (formId: string) => {
    router.push(`/forms/${formId}/edit`);
  };

  const viewSubmissions = (formId: string) => {
    router.push(`/forms/${formId}/submissions`);
  };

  const previewForm = (formId: string) => {
    router.push(`/forms/${formId}/preview`);
  };

  const duplicateForm = async (formId: string) => {
    try {
      const response = await axios.post(`/api/forms/${formId}/duplicate`);

      if (response.data.success) {
        toast({
          title: "Form duplicated",
          description: "Form has been duplicated successfully.",
        });
        fetchForms();
      } else {
        throw new Error(response.data.message || "Failed to duplicate form");
      }
    } catch (error: any) {
      toast({
        title: "Error duplicating form",
        description: error.message || "There was a problem duplicating the form.",
        variant: "destructive"
      });
    }
  };

  const filteredForms = forms.filter((form: any) => {
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'published' && form.isPublished) ||
      (filter === 'drafts' && !form.isPublished);

    return matchesSearch && matchesFilter;
  });

  const sortedForms = [...filteredForms].sort((a: any, b: any) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getFormStatusColor = (form: any) => {
    return form.isPublished
      ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
      : "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200";
  };

  // Grid view component for forms
  const FormGridCard = ({ form }: { form: any }) => (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${form.isPublished ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
            <FileText className={`h-5 w-5 ${form.isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => editForm(form._id)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Form
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => previewForm(form._id)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => viewSubmissions(form._id)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Submissions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateForm(form._id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {form.isPublished && (
                <DropdownMenuItem onClick={() => window.open(`/live-form/${form._id}`, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Live Form
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteForm(form._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold line-clamp-1">{form.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs font-medium px-2 py-1", getFormStatusColor(form))}>
              {form.isPublished ? 'Published' : 'Draft'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated {new Date(form.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{form.stats?.submissions || 0}</span>
            <span className="text-xs text-muted-foreground">submissions</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(form.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editForm(form._id)}
            className="flex-1 text-xs"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewSubmissions(form._id)}
            className="flex-1 text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            View Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const columns = [
    {
      accessorKey: 'name',
      header: 'Form Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className={cn(
            "p-2 rounded-lg",
            row.original.isPublished 
              ? 'bg-emerald-50 dark:bg-emerald-950/30' 
              : 'bg-amber-50 dark:bg-amber-950/30'
          )}>
            <FileText className={cn(
              "h-4 w-4",
              row.original.isPublished 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-amber-600 dark:text-amber-400'
            )} />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-base">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              Updated {new Date(row.original.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant="outline" className={cn("text-xs font-medium px-3 py-1", getFormStatusColor(row.original))}>
          {row.original.isPublished ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    {
      accessorKey: 'submissions',
      header: 'Submissions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.stats?.submissions || 0}</span>
        </div>
      )
    },
    {
      accessorKey: 'created',
      header: 'Created',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{new Date(row.original.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => previewForm(row.original._id)} className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview Form</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => editForm(row.original._id)} className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Form</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => viewSubmissions(row.original._id)} className="h-8 w-8">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Submissions</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => duplicateForm(row.original._id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {row.original.isPublished && (
                  <DropdownMenuItem onClick={() => window.open(`/live-form/${row.original._id}`, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Live Form
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteForm(row.original._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      )
    }
  ];

  if (accessStatus.loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 mt-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accessStatus.hasAccess) {
    return (
      <div className="mt-12 mx-auto max-w-7xl px-8 py-10 h-full">
        <FormBuilderPricingPage />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 mb-36 h-fit max-h-screen overflow-y-scroll py-8 mt-12 space-y-8">
      {/* Modern Header */}
      <div className="flex flex-col  lg:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Forms
          </h1>
          <p className="text-lg text-muted-foreground">
            Create, manage and analyze your forms with powerful insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button onClick={createAIForm} variant="outline" className="gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/30">
            <Sparkles className="h-4 w-4 text-purple-600" />
            AI Form Builder
          </Button> */}
          <Button onClick={createNewForm} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Usage Stats Grid */}
      {accessStatus.hasAccess && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{usageStats.totalForms}</div>
                  <p className="text-sm text-muted-foreground">Total Forms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{usageStats.publishedForms}</div>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <Edit2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{usageStats.draftForms}</div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{usageStats.currentMonthSubmissions}</div>
<p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Limits Warning */}
      {accessStatus.hasAccess && accessStatus.limits && (
        <FormLimitsWarning limits={accessStatus.limits} />
      )}

      {/* Modern Controls Bar */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border/50 bg-background/50 focus:bg-background"
                />
              </div>
              
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="bg-muted/50 border border-border/50">
                  <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm border-none">
                    All Forms
                  </TabsTrigger>
                  <TabsTrigger value="published" className="data-[state=active]:bg-background data-[state=active]:shadow-sm border-none">
                    Published
                  </TabsTrigger>
                  <TabsTrigger value="drafts" className="data-[state=active]:bg-background data-[state=active]:shadow-sm border-none">
                    Drafts
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="h-9 w-9"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className="h-9 w-9"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchForms}
                      className="h-9 w-9"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedForms.length === 0 ? (
        <Card className="border-border/50  shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 rounded-full bg-muted/30 mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {searchQuery || filter !== 'all' ? 'No forms found' : 'No forms yet'}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              {searchQuery || filter !== 'all'
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by creating your first form or use our AI-powered form builder for instant results."
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {!searchQuery && filter === 'all' && (
                <>
                  <Button onClick={createNewForm} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Form
                  </Button>
                  <Button onClick={createAIForm} variant="outline" className="gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/30">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Try AI Builder
                  </Button>
                </>
              )}
              {(searchQuery || filter !== 'all') && (
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedForms.map((form: any) => (
                <FormGridCard key={form._id} form={form} />
              ))}
            </div>
          ) : (
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <DataTable columns={columns} data={sortedForms} pagination />
            </Card>
          )}

          {/* Recent Activity Section */}
          {sortedForms.length > 3 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                    <CardDescription>Your most recently updated forms</CardDescription>
                  </div>
                  {/* <Button variant="outline" size="sm" onClick={() => router.push('/forms/analytics')}>
                    View Analytics
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button> */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedForms.slice(0, 5).map((form: any) => (
                    <div key={form._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-md",
                          form.isPublished ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-amber-50 dark:bg-amber-950/50'
                        )}>
                          <FileText className={cn(
                            "h-4 w-4",
                            form.isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{form.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{form.stats?.submissions || 0} submissions</span>
                            <span>•</span>
                            <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editForm(form._id)}>
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => viewSubmissions(form._id)}>
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Data
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Form
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              This action cannot be undone. This will permanently delete the form and all its submissions.
              <br /><br />
              <strong>Are you sure you want to continue?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteForm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
            >
              Delete Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Form Creation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              AI Form Builder
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Let our AI create a professional form for you. Just provide a name and optional description, 
              and we'll generate optimized fields with smart validation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="ai-form-name" className="text-sm font-semibold">
                Form Name *
              </label>
              <Input
                id="ai-form-name"
                placeholder="e.g., Contact Form, Job Application, Customer Survey"
                value={aiFormName}
                onChange={(e) => setAiFormName(e.target.value)}
                disabled={aiProcessing}
                className="border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ai-form-description" className="text-sm font-semibold">
                Description (Optional)
              </label>
              <Input
                id="ai-form-description"
                placeholder="e.g., To collect contact information from potential customers"
                value={aiFormDescription}
                onChange={(e) => setAiFormDescription(e.target.value)}
                disabled={aiProcessing}
                className="border-border/50"
              />
            </div>

            {aiProcessing && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600">
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-purple-900 dark:text-purple-100">Creating your form...</span>
                      <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{Math.round(aiProgress)}%</span>
                    </div>
                    <Progress 
                      value={aiProgress} 
                      className="h-2 bg-purple-200 dark:bg-purple-900"
                    />
                  </div>
                </div>
                <p className="text-sm text-purple-800 dark:text-purple-200 animate-pulse">
                  AI is analyzing your requirements and creating optimized form fields with smart validation rules...
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 mt-6">
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
              disabled={!aiFormName.trim() || aiProcessing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium gap-2"
            >
              {aiProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Form
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}