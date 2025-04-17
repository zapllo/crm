"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Copy,
  Trash2,
  MoreHorizontal,
  FileText,
  ExternalLink,
  Eye
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FormsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchForms();
  }, []);

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
    if (!confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      return;
    }

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

  const columns = [
    {
      accessorKey: 'name',
      header: 'Form Name',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
          {row.original.isPublished && (
            <Badge variant="outline" className="text-green-600 bg-green-50">Live</Badge>
          )}
          {!row.original.isPublished && (
            <Badge variant="outline" className="text-amber-600 bg-amber-50">Draft</Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'submissions',
      header: 'Submissions',
      cell: ({ row }: any) => (
        <span>{row.original.stats?.submissions || 0}</span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => (
        <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => previewForm(row.original._id)}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editForm(row.original._id)}
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => viewSubmissions(row.original._id)}
            title="View Submissions"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => duplicateForm(row.original._id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {row.original.isPublished && (
                <DropdownMenuItem
                  onClick={() => window.open(`/forms/${row.original._id}`, '_blank')}
                >
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
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-12 py-8 max-w-screen-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <Button onClick={createNewForm}>
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className='bg-accent gap-4 '>
                  <TabsTrigger className='border-none' value="all">All</TabsTrigger>
                  <TabsTrigger className='border-none' value="published">Published</TabsTrigger>
                  <TabsTrigger className='border-none' value="drafts">Drafts</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedForms.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No forms found</h2>
          <p className="text-muted-foreground mt-1">
            {searchQuery || filter !== 'all'
              ? "Try adjusting your search or filters"
              : "Create your first form to get started"}
          </p>
          {!searchQuery && filter === 'all' && (
            <Button onClick={createNewForm} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={sortedForms}
          pagination
        />
      )}
    </div>
  );
}
