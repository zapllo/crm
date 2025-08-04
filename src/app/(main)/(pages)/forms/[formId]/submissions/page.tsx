"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, Download, Search, Eye,
  FileText, RefreshCw, MoreHorizontal, MessageSquare,
  Mail, Phone, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axios from 'axios';

export default function SubmissionsPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]); // Store all submissions for filtering
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [processingAction, setProcessingAction] = useState('');

  useEffect(() => {
    fetchFormAndSubmissions();
  }, []);

  // Apply filtering and searching client-side
  const filteredSubmissions = useMemo(() => {
    // Start with all submissions
    let result = [...allSubmissions];

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(submission => submission.status === filter);
    }

    // Apply search filter if search has at least 2 characters
    if (searchQuery.length >= 2) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(submission => {
        // Search in submitter details
        if (submission.submitterDetails?.name?.toLowerCase().includes(searchLower)) return true;
        if (submission.submitterDetails?.email?.toLowerCase().includes(searchLower)) return true;
        if (submission.submitterDetails?.phone?.toLowerCase().includes(searchLower)) return true;

        // Search in form data
        const formData = submission.data;
        if (!formData) return false;

        return Object.values(formData).some(
          (value: any) => typeof value === 'string' && value.toLowerCase().includes(searchLower)
        );
      });
    }

    return result;
  }, [allSubmissions, filter, searchQuery]);

  // Handle pagination with the filtered results
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;

    // Update total pages based on filtered results
    const totalPages = Math.ceil(filteredSubmissions.length / pagination.limit);

    // Ensure page is valid (in case filtering reduces available pages)
    if (pagination.page > totalPages && totalPages > 0) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }

    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, pagination.page, pagination.limit]);

  // Update pagination info whenever filtered results change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredSubmissions.length,
      pages: Math.max(1, Math.ceil(filteredSubmissions.length / prev.limit))
    }));
  }, [filteredSubmissions, pagination.limit]);

  const fetchFormAndSubmissions = async () => {
    setLoading(true);
    try {
      // Get form details
      const formResponse = await axios.get(`/api/forms/${formId}`);

      if (formResponse.data.success) {
        setForm(formResponse.data.form);

        // Get all submissions at once (we'll handle pagination client-side)
        const submissionsResponse = await axios.get(`/api/forms/${formId}/submissions`, {
          params: {
            limit: 1000 // Get a large number of submissions
          }
        });

        if (submissionsResponse.data.success) {
          const allSubmissions = submissionsResponse.data.submissions;
          setAllSubmissions(allSubmissions);

          // Initialize pagination
          setPagination(prev => ({
            ...prev,
            total: allSubmissions.length,
            pages: Math.ceil(allSubmissions.length / prev.limit)
          }));
        } else {
          throw new Error(submissionsResponse.data.message || "Failed to fetch submissions");
        }
      } else {
        throw new Error(formResponse.data.message || "Failed to fetch form");
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message || "There was a problem loading the form and submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportSubmissions = () => {
    setExportLoading(true);
    try {
      // Use the currently filtered submissions
      const dataToExport = filteredSubmissions;

      if (!dataToExport.length) {
        toast({
          title: "No data to export",
          description: "There are no submissions matching your current filters.",
          variant: "destructive"
        });
        setExportLoading(false);
        return;
      }

      // Create CSV header
      let headers = ['Submission ID', 'Date', 'Status', 'Name', 'Email', 'Phone'];

      // Add form field headers if we have form info
      if (form && form.fields) {
        const fieldHeaders = form.fields
          .filter((f: any) => !['heading', 'paragraph', 'divider', 'hidden'].includes(f.type))
          .map((f: any) => f.label);

        headers = [...headers, ...fieldHeaders];
      }

      // Create CSV content
      let csvContent = headers.join(',') + '\n';

      dataToExport.forEach(submission => {
        // Basic info
        let row = [
          submission._id,
          new Date(submission.createdAt).toISOString(),
          submission.status,
          submission.submitterDetails?.name || '',
          submission.submitterDetails?.email || '',
          submission.submitterDetails?.phone || ''
        ];

        // Form field values
        if (form && form.fields) {
          form.fields
            .filter((f: any) => !['heading', 'paragraph', 'divider', 'hidden'].includes(f.type))
            .forEach((field: any) => {
              let value = submission.data && submission.data[field.id] ? submission.data[field.id] : '';

              // Handle arrays
              if (Array.isArray(value)) {
                value = value.join('; ');
              }

              // Escape commas and quotes for CSV
              if (typeof value === 'string') {
                value = value.includes(',') || value.includes('"')
                  ? `"${value.replace(/"/g, '""')}"`
                  : value;
              }

              row.push(value);
            });
        }

        csvContent += row.join(',') + '\n';
      });

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${form?.name.replace(/\s+/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export complete",
        description: `${dataToExport.length} submissions exported successfully.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error.message || "There was a problem exporting the submissions",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: string) => {
    // Track which submission is being updated
    setProcessingAction(`status-${submissionId}`);

    try {
      const response = await axios.put(`/api/forms/${formId}/submissions/${submissionId}`, {
        status
      });

      if (response.data.success) {
        toast({
          title: "Status updated",
          description: `Submission status changed to ${status}`,
        });

        // If the submission details modal is open, update the selected submission
        if (selectedSubmission && selectedSubmission._id === submissionId) {
          setSelectedSubmission({ ...selectedSubmission, status });
        }

        // Update both the filtered submissions and all submissions
        setAllSubmissions(prevSubmissions =>
          prevSubmissions.map(sub =>
            sub._id === submissionId ? { ...sub, status } : sub
          )
        );
      } else {
        throw new Error(response.data.message || "Failed to update submission");
      }
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message || "There was a problem updating the submission status",
        variant: "destructive"
      });
    } finally {
      setProcessingAction('');
    }
  };

  const convertToLead = async (submissionId: string) => {
    setProcessingAction(`convert-${submissionId}`);
    try {
      const response = await axios.post(`/api/forms/${formId}/submissions/${submissionId}/convert-to-lead`);

      if (response.data.success) {
        toast({
          title: "Converted to lead",
          description: "The submission has been converted to a lead in your CRM",
        });

        // Update submissions list and selected submission if open
        if (selectedSubmission && selectedSubmission._id === submissionId) {
          setSelectedSubmission({
            ...selectedSubmission,
            status: 'converted',
            leadId: response.data.leadId
          });
        }

        // Update both the filtered submissions and all submissions
        setAllSubmissions(prevSubmissions =>
          prevSubmissions.map(sub =>
            sub._id === submissionId
              ? { ...sub, status: 'converted', leadId: response.data.leadId }
              : sub
          )
        );
      } else {
        throw new Error(response.data.message || "Failed to convert to lead");
      }
    } catch (error: any) {
      toast({
        title: "Error converting to lead",
        description: error.message || "There was a problem converting the submission to a lead",
        variant: "destructive"
      });
    } finally {
      setProcessingAction('');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const viewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setShowSubmissionDetails(true);

    // Mark as viewed if it's new
    if (submission.status === 'new') {
      updateSubmissionStatus(submission._id, 'viewed');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'viewed': return 'secondary';
      case 'contacted': return 'outline';
      case 'converted': return 'success';
      case 'archived': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'viewed': return <Eye className="h-3 w-3 mr-1" />;
      case 'contacted': return <Mail className="h-3 w-3 mr-1" />;
      case 'converted': return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case 'archived': return <FileText className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'AN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading && !form) {
    return (
      <div className="flex items-center mt-20 justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 mt-14 max-h-screen h-fit overflow-y-scroll scrollbar-hide max-w-screen-xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.push('/forms')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{form?.name}</h1>
          <p className="text-muted-foreground text-sm">
            Manage submissions and convert to leads
          </p>
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>
                  {pagination.total} submissions in total
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchFormAndSubmissions}
                        disabled={loading}
                      >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh submissions</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportSubmissions}
                        disabled={loading || exportLoading || filteredSubmissions.length === 0}
                      >
                        {exportLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        <span className="hidden md:inline">Export</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export submissions as CSV</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border-b">
              <div className="flex flex-col md:flex-row justify-between gap-4 p-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
                    <TabsList className='bg-accent gap-4'>
                      <TabsTrigger className='border-none' value="all">All</TabsTrigger>
                      <TabsTrigger className='border-none' value="new">New</TabsTrigger>
                      <TabsTrigger className='border-none' value="viewed">Viewed</TabsTrigger>
                      <TabsTrigger className='border-none' value="contacted">Contacted</TabsTrigger>
                      <TabsTrigger className='border-none' value="converted">Converted</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Select defaultValue={pagination.limit.toString()} onValueChange={(value) =>
                    setPagination(prev => ({ ...prev, limit: parseInt(value), page: 1 }))
                  }>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="ml-auto h-8 w-[120px]" />
                  </div>
                ))}
              </div>
            ) : paginatedSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold">No submissions found</h2>
                <p className="text-muted-foreground mt-1">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : filter !== 'all'
                      ? `No submissions with status "${filter}"`
                      : "This form has no submissions yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubmissions.map((submission) => (
                      <TableRow key={submission._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(submission.submitterDetails?.name || 'Anonymous')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{submission.submitterDetails?.name || 'Anonymous'}</div>
                              {submission.submitterDetails?.email && (
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {submission.submitterDetails.email}
                                </div>
                              )}
                              {submission.submitterDetails?.phone && (
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {submission.submitterDetails.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(submission.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className="flex items-center w-fit">
                            {getStatusIcon(submission.status)}
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewSubmission(submission)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => viewSubmission(submission)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => updateSubmissionStatus(submission._id, 'viewed')}
                                  disabled={submission.status === 'viewed' || processingAction.startsWith('status-')}
                                >
                                  {processingAction === `status-${submission._id}` ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Eye className="h-4 w-4 mr-2" />
                                  )}
                                  Mark as Viewed
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => updateSubmissionStatus(submission._id, 'contacted')}
                                  disabled={submission.status === 'contacted' || processingAction.startsWith('status-')}
                                >
                                  {processingAction === `status-${submission._id}` ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Mail className="h-4 w-4 mr-2" />
                                  )}
                                  Mark as Contacted
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => updateSubmissionStatus(submission._id, 'converted')}
                                  disabled={submission.status === 'converted' || processingAction.startsWith('status-')}
                                >
                                  {processingAction === `status-${submission._id}` ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                  )}
                                  Mark as Converted
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {!submission.leadId && (
                                  <DropdownMenuItem
                                    onClick={() => convertToLead(submission._id)}
                                    disabled={processingAction.startsWith('convert-')}
                                  >
                                    {processingAction === `convert-${submission._id}` ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                    )}
                                    Convert to Lead
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  onClick={() => updateSubmissionStatus(submission._id, 'archived')}
                                  disabled={submission.status === 'archived' || processingAction.startsWith('status-')}
                                >
                                  {processingAction === `status-${submission._id}` ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                  )}
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {
                    Math.min(pagination.page * pagination.limit, pagination.total)
                  } of {pagination.total} submissions
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Submission details dialog */}
      <Dialog open={showSubmissionDetails} onOpenChange={setShowSubmissionDetails}>
        <DialogContent className="max-w-3xl max-h-[85vh] z-[100] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedSubmission && formatDate(selectedSubmission.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <Badge  className="flex items-center">
                  {getStatusIcon(selectedSubmission.status)}
                  {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                </Badge>

                {selectedSubmission.leadId ? (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/CRM/leads/${selectedSubmission.leadId}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View in CRM
                  </Button>
                ) : null}
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Submitter Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Name</div>
                      <div>{selectedSubmission.submitterDetails?.name || 'Not provided'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Email</div>
                      <div className="flex items-center">
                        {selectedSubmission.submitterDetails?.email ? (
                          <>
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <a href={`mailto:${selectedSubmission.submitterDetails.email}`} className="hover:underline">
                              {selectedSubmission.submitterDetails.email}
                            </a>
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Phone</div>
                      <div className="flex items-center">
                        {selectedSubmission.submitterDetails?.phone ? (
                          <>
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <a href={`tel:${selectedSubmission.submitterDetails.phone}`} className="hover:underline">
                              {selectedSubmission.submitterDetails.phone}
                            </a>
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">IP Address</div>
                      <div>{selectedSubmission.submitterDetails?.ip || 'Not available'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Form Responses</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableBody>
                      {form && selectedSubmission.data && form.fields.map((field: any) => {
                        // Skip layout fields
                        if (['heading', 'paragraph', 'divider', 'hidden'].includes(field.type)) {
                          return null;
                        }

                        // Get the field value
                        const value = selectedSubmission.data[field.id];

                        // Skip empty values
                        if (value === undefined || value === null || value === '') {
                          return null;
                        }

                        return (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium w-1/3 align-top py-3 border-b">
                              {field.label}
                            </TableCell>
                            <TableCell className="py-3 border-b">
                              {field.type === 'checkbox' || field.type === 'multiSelect' ? (
                                Array.isArray(value) ? (
                                  <ul className="list-disc list-inside space-y-1">
                                    {value.map((item: string, i: number) => (
                                      <li key={i}>
                                        {item === '__other__' && selectedSubmission.data[`${field.id}-other-value`]
                                          ? `Other: ${selectedSubmission.data[`${field.id}-other-value`]}`
                                          : item}
                                      </li>
                                    ))}
                                  </ul>
                                ) : value
                              ) : field.type === 'file' ? (
                                <a href={value} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download file
                                </a>
                              ) : field.type === 'address' ? (
                                <div className="space-y-1">
                                  {selectedSubmission.data[`${field.id}-street1`] && (
                                    <p>{selectedSubmission.data[`${field.id}-street1`]}</p>
                                  )}
                                  {selectedSubmission.data[`${field.id}-street2`] && (
                                    <p>{selectedSubmission.data[`${field.id}-street2`]}</p>
                                  )}
                                  <p>
                                    {[
                                      selectedSubmission.data[`${field.id}-city`],
                                      selectedSubmission.data[`${field.id}-state`],
                                      selectedSubmission.data[`${field.id}-zip`]
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                  {selectedSubmission.data[`${field.id}-country`] && (
                                    <p>{selectedSubmission.data[`${field.id}-country`]}</p>
                                  )}
                                </div>
                              ) : field.type === 'signature' ? (
                                <div className="border p-2 rounded-md bg-muted/30 inline-block">
                                  <img src={value} alt="Signature" className="max-h-20" />
                                </div>
                              ) : (
                                <p>{value}</p>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {selectedSubmission.notes && selectedSubmission.notes.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedSubmission.notes.map((note: any, index: number) => (
                        <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                          <p className="text-sm">{note.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(note.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap justify-between gap-2 pt-2">
                <div className="space-x-2 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateSubmissionStatus(selectedSubmission._id, 'viewed')}
                    disabled={selectedSubmission.status === 'viewed' || processingAction === `status-${selectedSubmission._id}`}
                  >
                    {processingAction === `status-${selectedSubmission._id}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Mark Viewed
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => updateSubmissionStatus(selectedSubmission._id, 'contacted')}
                    disabled={selectedSubmission.status === 'contacted' || processingAction === `status-${selectedSubmission._id}`}
                  >
                    {processingAction === `status-${selectedSubmission._id}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Mark Contacted
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => updateSubmissionStatus(selectedSubmission._id, 'archived')}
                    disabled={selectedSubmission.status === 'archived' || processingAction === `status-${selectedSubmission._id}`}
                  >
                    {processingAction === `status-${selectedSubmission._id}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Archive
                  </Button>
                </div>

                {!selectedSubmission.leadId ? (
                  <Button
                    variant="default"
                    onClick={() => convertToLead(selectedSubmission._id)}
                    disabled={processingAction === `convert-${selectedSubmission._id}`}
                  >
                    {processingAction === `convert-${selectedSubmission._id}` ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Convert to Lead
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => router.push(`/CRM/leads/${selectedSubmission.leadId}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Lead in CRM
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
