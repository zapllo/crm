"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, DownloadIcon, Filter, Search, EyeIcon, FileText, RefreshCw, MoreHorizontal, MessageSquare, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import axios from 'axios';

export default function SubmissionsPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [processingAction, setProcessingAction] = useState('');

  useEffect(() => {
    fetchFormAndSubmissions();
  }, [pagination.page, filter]);

  const fetchFormAndSubmissions = async () => {
    setLoading(true);
    try {
      // Get form details
      const formResponse = await axios.get(`/api/forms/${formId}`);

      if (formResponse.data.success) {
        setForm(formResponse.data.form);

        // Get submissions
        const submissionsResponse = await axios.get(`/api/forms/${formId}/submissions`, {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            status: filter !== 'all' ? filter : undefined
          }
        });

        if (submissionsResponse.data.success) {
          setSubmissions(submissionsResponse.data.submissions);
          setPagination(submissionsResponse.data.pagination);
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

  const goBack = () => {
    router.push('/forms');
  };

  const refreshData = () => {
    fetchFormAndSubmissions();
  };

  const exportSubmissions = () => {
    // Implementation would depend on your server-side export functionality
    toast({
      title: "Export started",
      description: "Your submissions are being exported. The download will start shortly.",
    });
  };

  const viewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setShowSubmissionDetails(true);
  };

  const updateSubmissionStatus = async (submissionId: string, status: string) => {
    setProcessingAction('status');
    try {
      const response = await axios.put(`/api/forms/${formId}/submissions/${submissionId}`, {
        status
      });

      if (response.data.success) {
        toast({
          title: "Submission updated",
          description: `Submission status changed to ${status}`,
        });

        // Refresh submissions
        fetchFormAndSubmissions();
      } else {
        throw new Error(response.data.message || "Failed to update submission");
      }
    } catch (error: any) {
      toast({
        title: "Error updating submission",
        description: error.message || "There was a problem updating the submission",
        variant: "destructive"
      });
    } finally {
      setProcessingAction('');
    }
  };

  const convertToLead = async (submissionId: string) => {
    setProcessingAction('convert');
    try {
      // This would call your API endpoint that handles the conversion logic
      const response = await axios.post(`/api/forms/${formId}/submissions/${submissionId}/convert-to-lead`);

      if (response.data.success) {
        toast({
          title: "Converted to lead",
          description: "The submission has been converted to a lead in your CRM",
        });

        // Refresh submissions
        fetchFormAndSubmissions();
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'contacted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'converted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Filter submissions by search query
  const filteredSubmissions = searchQuery.length > 2
    ? submissions.filter(submission => {
        const searchLower = searchQuery.toLowerCase();

        // Search in submitter details
        if (submission.submitterDetails?.name?.toLowerCase().includes(searchLower)) return true;
        if (submission.submitterDetails?.email?.toLowerCase().includes(searchLower)) return true;
        if (submission.submitterDetails?.phone?.toLowerCase().includes(searchLower)) return true;

        // Search in form field data
        const formData = submission.data;
        if (!formData) return false;

        return Object.values(formData).some(
          (value: any) => typeof value === 'string' && value.toLowerCase().includes(searchLower)
        );
      })
    : submissions;

  if (loading && !form) {
    return (
      <div className="flex items-center  mt-20 justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 mt-12 max-w-screen-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{form?.name} Submissions</h1>
            <p className="text-muted-foreground">
              {pagination.total} total submissions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportSubmissions}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className='bg-accent gap-2'>
                  <TabsTrigger  className='border-none'  value="all">All</TabsTrigger>
                  <TabsTrigger   className='border-none' value="new">New</TabsTrigger>
                  <TabsTrigger   className='border-none' value="viewed">Viewed</TabsTrigger>
                  <TabsTrigger   className='border-none' value="contacted">Contacted</TabsTrigger>
                  <TabsTrigger   className='border-none' value="converted">Converted</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No submissions found</h2>
          <p className="text-muted-foreground mt-1">
            {searchQuery
              ? "Try adjusting your search"
              : filter !== 'all'
                ? `No submissions with status "${filter}"`
                : "This form has no submissions yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Submitter</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission._id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      className="text-left hover:underline focus:outline-none w-full"
                      onClick={() => viewSubmission(submission)}
                    >
                      <div className="font-medium">
                        {submission.submitterDetails?.name || 'Anonymous'}
                      </div>
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
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDate(submission.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusBadgeClass(submission.status)} variant="outline">
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewSubmission(submission)}
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
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
                          <DropdownMenuItem onClick={() => viewSubmission(submission)}>
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => updateSubmissionStatus(submission._id, 'new')}
                            disabled={submission.status === 'new' || processingAction === 'status'}
                          >
                            Mark as New
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateSubmissionStatus(submission._id, 'viewed')}
                            disabled={submission.status === 'viewed' || processingAction === 'status'}
                          >
                            Mark as Viewed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateSubmissionStatus(submission._id, 'contacted')}
                            disabled={submission.status === 'contacted' || processingAction === 'status'}
                          >
                            Mark as Contacted
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {!submission.leadId && (
                            <DropdownMenuItem
                              onClick={() => convertToLead(submission._id)}
                              disabled={processingAction === 'convert'}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Convert to Lead
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => updateSubmissionStatus(submission._id, 'archived')}
                            disabled={submission.status === 'archived' || processingAction === 'status'}
                          >
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
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

      {/* Submission details dialog */}
      <Dialog
        open={showSubmissionDetails}
        onOpenChange={setShowSubmissionDetails}
      >
        <DialogContent className="max-w-3xl z-[100] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Date Submitted</h3>
                  <p>{formatDate(selectedSubmission.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <Badge className={getStatusBadgeClass(selectedSubmission.status)} variant="outline">
                    {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Submitter Details</h3>
                <div className="grid grid-cols-2 gap-4 border rounded-md p-4 bg-muted/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedSubmission.submitterDetails?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedSubmission.submitterDetails?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedSubmission.submitterDetails?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">IP Address</p>
                    <p className="font-medium">{selectedSubmission.submitterDetails?.ip || 'Not available'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Form Responses</h3>
                <div className="border rounded-md divide-y">
                  {form && selectedSubmission.data && form.fields.map((field: any) => {
                    // Skip layout fields
                    if (['heading', 'paragraph', 'divider', 'hidden'].includes(field.type)) {
                      return null;
                    }

                    // Get the field value
                    const value = selectedSubmission.data[field.id];

                    // Display field and value
                    return (
                      <div key={field.id} className="p-3 flex">
                        <div className="font-medium w-1/3">{field.label}</div>
                        <div className="flex-1">
                          {value ? (
                            // Special display formats for different field types
                            field.type === 'checkbox' || field.type === 'multiSelect' ? (
                              Array.isArray(value) ? (
                                <ul className="list-disc list-inside">
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
                              <a href={value} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                View file
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
                              <div className="border p-2">
                                <img src={value} alt="Signature" className="max-h-20" />
                              </div>
                            ) : field.type === 'date' || field.type === 'time' ? (
                              <p>{value}</p>
                            ) : (
                              <p>{value}</p>
                            )
                          ) : (
                            <p className="text-muted-foreground italic">Not provided</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedSubmission.notes && selectedSubmission.notes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <div className="border rounded-md p-3 space-y-2">
                    {selectedSubmission.notes.map((note: any, index: number) => (
                      <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                        <p>{note.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => updateSubmissionStatus(selectedSubmission._id, 'viewed')}
                    disabled={selectedSubmission.status === 'viewed' || processingAction === 'status'}
                  >
                    Mark as Viewed
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateSubmissionStatus(selectedSubmission._id, 'contacted')}
                    disabled={selectedSubmission.status === 'contacted' || processingAction === 'status'}
                  >
                    Mark as Contacted
                  </Button>
                </div>

                {!selectedSubmission.leadId ? (
                  <Button
                    variant="default"
                    onClick={() => convertToLead(selectedSubmission._id)}
                    disabled={processingAction === 'convert'}
                  >
                    {processingAction === 'convert' ? (
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
                    View Lead
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

