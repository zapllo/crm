"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Filter, Edit2, Copy, Trash2,
  MoreHorizontal, FileText, ExternalLink, Eye,
  Sparkles, Calendar, Share2, RefreshCw, BarChart3, ArrowUpRight
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

export default function FormsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiFormName, setAiFormName] = useState('');
  const [aiFormDescription, setAiFormDescription] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  // Simulate AI progress bar
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

  // Reset AI progress when dialog closes
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

    // Simulate AI form generation
    setTimeout(() => {
      setAiProcessing(false);
      setShowAIDialog(false);

      toast({
        title: "AI Form Created",
        description: "Your AI-powered form has been generated successfully!",
      });

      // Navigate to the new form or refresh the list
      fetchForms();

      // Reset form fields
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

  const deleteForm = async (formId: string) => {
    setSelectedFormId(formId);

    toast({
      title: "Delete form?",
      description: "This action cannot be undone.",
      action: (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              confirmDeleteForm(formId);
            }}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFormId(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const confirmDeleteForm = async (formId: string) => {
    try {
      const response = await axios.delete(`/api/forms/${formId}`);

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
    }
  };

  const filteredForms = forms.filter((form: any) => {
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'published' && form.isPublished) ||
                         (filter === 'drafts' && !form.isPublished);

    return matchesSearch && matchesFilter;
  });

  // Sort forms by recently created/modified
  const sortedForms = [...filteredForms].sort((a: any, b: any) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getFormStatusColor = (form: any) => {
    return form.isPublished
      ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
      : "text-amber-600 bg-amber-50 hover:bg-amber-100";
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Form Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className={`p-2 rounded-md ${row.original.isPublished ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            <FileText className={`h-5 w-5 ${row.original.isPublished ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-base text-foreground">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              Last updated {new Date(row.original.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge
          variant="secondary"
          className={`${getFormStatusColor(row.original)} font-medium px-3 py-1`}
        >
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
          <span>{new Date(row.original.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => previewForm(row.original._id)}
                  className="hover:bg-accent"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview Form</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editForm(row.original._id)}
                  className="hover:bg-accent"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Form</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => viewSubmissions(row.original._id)}
                  className="hover:bg-accent"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Submissions</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => duplicateForm(row.original._id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Duplicate</span>
                </DropdownMenuItem>

                {row.original.isPublished && (
                  <DropdownMenuItem
                    onClick={() => window.open(`/forms/${row.original._id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>Open Live Form</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Share Form</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => deleteForm(row.original._id)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      )
    }
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8 mt-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-48" />
            </div>

            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container  mx-auto max-w-screen w-full px-8 py-10 h-full max-h-screen overflow-y-scroll mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Forms</h1>
          <p className="text-muted-foreground mt-1">Create, manage and analyze your forms</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={createAIForm} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Form Builder
          </Button>
          <Button onClick={createNewForm} variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      <Card className="mb-8 border shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search forms by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-background border-input"
              />
            </div>
            <div className="flex items-center gap-4">
              <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
                <TabsList className="bg-accent  h-10 w-full">
                  <TabsTrigger className="flex-1 border-none data-[state=active]:bg-background data-[state=active]:shadow-sm" value="all">All Forms</TabsTrigger>
                  <TabsTrigger className="flex-1 border-none data-[state=active]:bg-background data-[state=active]:shadow-sm" value="published">Published</TabsTrigger>
                  <TabsTrigger className="flex- border-none data-[state=active]:bg-background data-[state=active]:shadow-sm" value="drafts">Drafts</TabsTrigger>
                </TabsList>
              </Tabs>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchForms}
                      className="h-10 w-10"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh forms</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedForms.length === 0 ? (
        <Card className="border shadow-sm overflow-hidden">
          <div className="text-center py-16 px-4">
            <div className="bg-muted/30 rounded-full p-4 inline-flex mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">No forms found</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {searchQuery || filter !== 'all'
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by creating your first form or use our AI-powered form builder."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              {!searchQuery && filter === 'all' && (
                <>
                  <Button onClick={createAIForm} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Form Builder
                  </Button>
                  <Button onClick={createNewForm} variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Form
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
          </div>
        </Card>
      ) : (
        <Card className="border shadow-sm overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-280px)]">
            <DataTable
              columns={columns}
              data={sortedForms}
              pagination
            />
          </ScrollArea>
        </Card>
      )}

      {/* Recent activity card */}
      {sortedForms.length > 0 && (
        <Card className="mt-8 border shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Form Activity</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedForms.slice(0, 3).map((form: any) => (
                <div key={form._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <AvatarFallback className="text-xs">{form.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{form.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {form.stats?.submissions || 0} submissions • Updated {new Date(form.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => viewSubmissions(form._id)} className="gap-1">
                    <span>View</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Form Creation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Form Builder
            </DialogTitle>
            <DialogDescription>
              Let AI create a professional form for you. Just provide a name and optional description.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="ai-form-name" className="text-sm font-medium">
                Form Name
              </label>
              <Input
                id="ai-form-name"
                placeholder="E.g. Contact Form, Job Application, Survey"
                value={aiFormName}
                onChange={(e) => setAiFormName(e.target.value)}
                disabled={aiProcessing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ai-form-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                id="ai-form-description"
                placeholder="E.g. To collect contact information from customers"
                value={aiFormDescription}
                onChange={(e) => setAiFormDescription(e.target.value)}
                disabled={aiProcessing}
              />
            </div>

            {aiProcessing && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Generating form...</span>
                  <span>{Math.round(aiProgress)}%</span>
                </div>
                <Progress value={aiProgress} className="h-2" />
                <p className="text-xs text-muted-foreground animate-pulse">
                  AI is creating your form with optimized fields and validation
                </p>
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
              disabled={!aiFormName.trim() || aiProcessing}
              className={`${aiProcessing ? 'bg-purple-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'} text-white`}
            >
              {aiProcessing ? 'Creating...' : 'Generate Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
