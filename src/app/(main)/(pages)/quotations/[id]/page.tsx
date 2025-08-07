'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  X,
  Download,
  Send,
  Edit,
  Link2,
  Clock,
  ArrowLeft,
  MessageSquare,
  Copy,
  Share2,
  Loader2,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription, AlertDialogTitle as AlertTitle } from '@/components/ui/alert-dialog';

import QuotationPreview from '@/components/quotations/QuotationPreview';
import TemplateRenderer from '@/components/quotations/TemplateRenderer';
import { FaWhatsapp } from 'react-icons/fa';

interface QuotationData {
  _id: string;
  quotationNumber: string;
  title: string;
  organization: {
    _id: string;
    companyName: string;
    industry: string;
  };
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lead: {
    _id: string;
    title: string;
    leadId: string;
  };
  contact: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    whatsappNumber: string;
  };
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    total: number;
  }[];
  subtotal: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
  tax?: {
    name: string;
    percentage: number;
    amount: number;
  };
  shipping?: number;
  total: number;
  currency: string;
  issueDate: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  terms: {
    title: string;
    content: string;
  }[];
  notes: {
    content: string;
    createdBy: string;
    timestamp: string;
  }[];
  approvalHistory: {
    status: 'pending' | 'approved' | 'revision_requested';
    comment?: string;
    updatedBy?: string;
    timestamp: string;
  }[];
  template: string;
  publicAccessToken: string;
  createdAt: string;
  updatedAt: string;
  lastViewed?: string;
}

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const quotationId = params.id as string;

  // State
  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [comment, setComment] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendEmailForm, setSendEmailForm] = useState({
    recipientEmail: '',
    subject: '',
    message: '',
  });
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Refs
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  // Load quotation data on component mount
  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/quotations/${quotationId}`);
      setQuotation(data);

      // Pre-fill send email form with contact data
      if (data.contact?.email) {
        setSendEmailForm({
          recipientEmail: data.contact.email,
          subject: `Quotation: ${data.title} (${data.quotationNumber})`,
          message: `Dear ${data.contact.firstName},\n\nPlease find attached our quotation ${data.quotationNumber} for your review.\n\nBest regards,\n${data.creator.firstName} ${data.creator.lastName}`,
        });
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotation details',
        variant: 'destructive',
      });
      router.push('/quotations/all');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quotation?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">Sent</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500 hover:bg-red-600 text-white">Changes Requested </Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data } = await axios.post(`/api/quotations/${quotationId}/comments`, { content: comment });

      // Update local state with new comment
      if (quotation) {
        setQuotation({
          ...quotation,
          notes: [...quotation.notes, data.note],
        });
      }

      setComment('');

      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleSendQuotation = async () => {
    if (!sendEmailForm.recipientEmail) {
      toast({
        title: 'Error',
        description: 'Recipient email is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSending(true);
      await axios.post(`/api/quotations/${quotationId}/send`, sendEmailForm);

      // Update status locally
      if (quotation && quotation.status === 'draft') {
        setQuotation({
          ...quotation,
          status: 'sent',
        });
      }

      setIsShareDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Quotation sent successfully',
      });
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send quotation',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };


  // Add this new function to handle sending WhatsApp
  const handleSendWhatsApp = async () => {
    if (!quotation?.contact?.whatsappNumber) {
      toast({
        title: 'Error',
        description: 'WhatsApp number not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSending(true);

      await axios.post(`/api/quotations/${quotationId}/send/whatsapp`, {
        whatsappNumber: quotation.contact.whatsappNumber,
        message: sendEmailForm.message, // We can reuse the message from the email form
      });

      setIsShareDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Quotation sent via WhatsApp successfully',
      });
    } catch (error) {
      console.error('Error sending quotation via WhatsApp:', error);
      toast({
        title: 'Error',
        description: 'Failed to send quotation via WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };


  const handleDownloadPDF = async () => {
    try {
      toast({
        title: 'Generating PDF',
        description: 'Your quotation PDF is being generated...',
      });

      const response = await axios.get(`/api/quotations/${quotationId}/pdf`, {
        responseType: 'blob',
      });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${quotation?.quotationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Success',
        description: 'Quotation PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  const handleCopyShareLink = async () => {
    if (!quotation?.publicAccessToken) {
      toast({
        title: 'Error',
        description: 'Share link not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      const shareLink = `${window.location.origin}/share/quotation/${quotation.publicAccessToken}`;
      await navigator.clipboard.writeText(shareLink);

      toast({
        title: 'Success',
        description: 'Share link copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying share link:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy share link',
        variant: 'destructive',
      });
    }
  };

  const handleApproveQuotation = async () => {
    try {
      const { data } = await axios.post(`/api/quotations/${quotationId}/approve`, {
        comment: comment.trim() || 'Approved without comment',
      });

      // Update local state
      if (quotation) {
        setQuotation({
          ...quotation,
          status: 'approved',
          approvalHistory: [
            ...quotation.approvalHistory,
            {
              status: 'approved',
              comment: comment.trim() || 'Approved without comment',
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }

      setComment('');
      setIsApprovalDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Quotation approved successfully',
      });
    } catch (error) {
      console.error('Error approving quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve quotation',
        variant: 'destructive',
      });
    }
  };

  const handleRejectQuotation = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      await axios.post(`/api/quotations/${quotationId}/reject`, {
        reason: rejectionReason,
      });

      // Update local state
      if (quotation) {
        setQuotation({
          ...quotation,
          status: 'rejected',
          approvalHistory: [
            ...quotation.approvalHistory,
            {
              status: 'revision_requested',
              comment: rejectionReason,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }

      setRejectionReason('');
      setIsApprovalDialogOpen(false);

      toast({
        title: 'Submitted',
        description: 'Revision request submitted successfully',
      });
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit revision request',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading quotation details...</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Quotation Not Found</h3>
          <p className="text-muted-foreground mb-6">The quotation you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/quotations/all')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Quotations
          </Button>
        </div>
      </div>
    );
  }

  const getAllComments = () => {
    if (!quotation) return [];

    const notesComments = quotation.notes.map(note => ({
      content: note.content,
      createdBy: note.createdBy,
      timestamp: note.timestamp,
      type: 'note'
    }));

    // Filter approval history entries that are comments
    // (comments usually have longer text in their comment field)
    const approvalComments = quotation.approvalHistory
      .filter(entry =>
        entry.comment &&
        (entry.comment.includes('Comment from') ||
          entry.status === 'revision_requested'))
      .map(entry => ({
        content: entry.comment,
        createdBy: entry.updatedBy || 'External User',
        timestamp: entry.timestamp,
        type: 'approval',
        approvalStatus: entry.status
      }));

    // Combine both arrays and sort by timestamp (newest first)
    return [...notesComments, ...approvalComments]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Format the display name for a comment
  type CommentWithStatus = {
    content: string | undefined;
    createdBy: string;
    timestamp: string;
    type: string;
    approvalStatus?: 'pending' | 'approved' | 'revision_requested';
  };

  const getCommentAuthor = (comment: CommentWithStatus) => {
    if (comment.type === 'approval') {
      // For approval history entries
      if (comment.content && comment.content.startsWith('Comment from')) {
        // Parse "Comment from Name (email): content"
        const match = comment.content.match(/Comment from (.*?) \((.*?)\):/);
        if (match) {
          return match[1] === 'Anonymous' ? 'Client' : match[1];
        }
      }

      if ('approvalStatus' in comment && comment.approvalStatus === 'revision_requested') {
        return 'Client (Change Request)';
      }

      return 'External User';
    } else {
      // For regular notes
      if (typeof comment.createdBy === 'string') {
        return comment.createdBy.startsWith('External:')
          ? comment.createdBy.replace('External:', 'Client:')
          : 'Internal User';
      }
      return 'User';
    }
  };

  // Format the content for display
  const getCommentContent = (comment: any) => {
    if (comment.type === 'approval' && comment.content && comment.content.startsWith('Comment from')) {
      // Extract actual comment content from "Comment from Name (email): content"
      const contentStart = comment.content.indexOf(':');
      return contentStart > 0 ? comment.content.substring(contentStart + 1).trim() : comment.content;
    }
    return comment.content;
  };


  return (
    <div className=" mx-auto p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex dark:!text-white items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/quotations/all')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className='dark:!text-white'>
            <h1 className="text-2xl  font-bold">{quotation.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">
                {quotation.quotationNumber}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {formatDate(quotation.createdAt)}
              </span>
              <span className="text-muted-foreground">•</span>
              {getStatusBadge(quotation.status)}
            </div>
          </div>
        </div>

        <div className="flex dark:!text-white flex-wrap gap-2">
          {quotation.status === 'draft' && (
            <Button
              variant="outline"
              onClick={() => router.push(`/quotations/${quotationId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyShareLink}>
                <Copy className="h-4 w-4 mr-2" /> Copy Public Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" /> Send by Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendWhatsApp}>
                <FaWhatsapp className="h-4 text-green-500 w-4 mr-2" /> Send by WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {quotation.status === 'sent' && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setIsApprovalDialogOpen(true)}
            >
              <Check className="h-4 w-4 mr-2" /> Approve/Reject
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-accent gap-2">
              <TabsTrigger className='border-none' value="preview">Preview</TabsTrigger>
              <TabsTrigger className='border-none' value="details">Details</TabsTrigger>
              <TabsTrigger className='border-none' value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="bg-white dark:bg-gray-950 border rounded-md shadow-sm overflow-hidden">
              <div className="relative">
                <TemplateRenderer
                  quotation={quotation}
                  className="w-full min-h-[842px] bg-white"
                />

                {/* Optional: Add floating controls if needed */}
                <div className="absolute bottom-4 dark:!text-white right-4">
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-1" /> Download PDF
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="grid gap-6">
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-1">Organization</h3>
                        <p>{quotation.lead.title}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Contact Person</h3>
                        <p>{quotation.contact.firstName} {quotation.contact.lastName}</p>
                        <p className="text-sm text-muted-foreground">{quotation.contact.email}</p>
                        <p className="text-sm text-muted-foreground">{quotation.contact.whatsappNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items & Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Items & Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">Item</th>
                            <th className="text-right py-2 px-4">Qty</th>
                            <th className="text-right py-2 px-4">Unit Price</th>
                            <th className="text-right py-2 px-4">Discount</th>
                            <th className="text-right py-2 px-4">Tax</th>
                            <th className="text-right py-2 px-4">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotation.items.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-3 px-4">
                                <div className="font-medium ">{item.name}</div>
                                {item.description && (
                                  <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                                )}
                              </td>
                              <td className="text-right py-3 px-4">{item.quantity}</td>
                              <td className="text-right py-3 px-4">{formatCurrency(item.unitPrice)}</td>
                              <td className="text-right py-3 px-4">
                                {item.discount > 0 ? `${item.discount}%` : '-'}
                              </td>
                              <td className="text-right py-3 px-4">
                                {item.tax > 0 ? `${item.tax}%` : '-'}
                              </td>
                              <td className="text-right py-3 px-4 font-medium">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span>{formatCurrency(quotation.subtotal)}</span>
                        </div>

                        {quotation.discount && (
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              Discount {quotation.discount.type === 'percentage' ?
                                `(${quotation.discount.value}%)` : ''}:
                            </span>
                            <span className="text-red-600">
                              -{formatCurrency(quotation.discount.amount)}
                            </span>
                          </div>
                        )}

                        {quotation.tax && (
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              {quotation.tax.name} ({quotation.tax.percentage}%):
                            </span>
                            <span>{formatCurrency(quotation.tax.amount)}</span>
                          </div>
                        )}

                        {quotation.shipping && quotation.shipping > 0 && (
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Shipping:</span>
                            <span>{formatCurrency(quotation.shipping)}</span>
                          </div>
                        )}

                        <Separator className="my-2" />

                        <div className="flex justify-between py-2 font-medium">
                          <span>Total:</span>
                          <span className="text-xl">{formatCurrency(quotation.total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Terms & Conditions */}
                {quotation.terms.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {quotation.terms.map((term, index) => (
                          <div key={index}>
                            <h3 className="font-medium mb-2">{term.title}</h3>
                            <div className="text-muted-foreground whitespace-pre-line">{term.content}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Approval History</CardTitle>
                </CardHeader>
                <CardContent>
                  {quotation.approvalHistory.length === 0 ? (
                    <p className="text-muted-foreground">No approval history available yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {quotation.approvalHistory.map((entry, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="mt-1">
                            {entry.status === 'approved' ? (
                              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                            ) : entry.status === 'revision_requested' ? (
                              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {entry.status === 'approved' ? 'Approved' :
                                  entry.status === 'revision_requested' ? 'Revision Requested' : 'Pending'}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                {formatDate(entry.timestamp)}
                              </span>
                            </div>
                            {entry.comment && (
                              <p className="mt-1 text-muted-foreground">{entry.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                  <div>{getStatusBadge(quotation.status)}</div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                  <p>{formatDate(quotation.issueDate)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valid Until</p>
                  <p>{formatDate(quotation.validUntil)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created By</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {quotation.creator.firstName.charAt(0)}{quotation.creator.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{quotation.creator.firstName} {quotation.creator.lastName}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {/* Comments Section - Updated */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                {getAllComments().length === 0 ? (
                  <p className="text-muted-foreground">No comments yet.</p>
                ) : (
                  getAllComments().map((comment, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium flex items-center gap-2">
                          {comment.type === 'approval' && 'approvalStatus' in comment && comment.approvalStatus === 'revision_requested' ? (
                            <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                            </div>
                          ) : (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {getCommentAuthor(comment).substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {getCommentAuthor(comment)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(comment.timestamp)}
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        {getCommentContent(comment)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddComment}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Add Comment
                  </Button>
                </div>
              </div> */}
            </CardContent>
          </Card>


          {/* Share Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Share Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Public Link</p>
                <div className="flex gap-2 items-center">
                  <Input
                    readOnly
                    value={`${window.location.origin}/share/quotation/${quotation.publicAccessToken}`}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyShareLink}
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Send className="h-4 w-4 mr-2" /> Send by Email
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSendWhatsApp}
              >
                <FaWhatsapp className="h-4 w-4 text-green-500 mr-2" /> Send by WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle>Share Quotation</DialogTitle>
            <DialogDescription>
              Send this quotation directly to your client via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                placeholder="client@example.com"
                value={sendEmailForm.recipientEmail}
                onChange={(e) => setSendEmailForm({
                  ...sendEmailForm,
                  recipientEmail: e.target.value
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={sendEmailForm.subject}
                onChange={(e) => setSendEmailForm({
                  ...sendEmailForm,
                  subject: e.target.value
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={sendEmailForm.message}
                onChange={(e) => setSendEmailForm({
                  ...sendEmailForm,
                  message: e.target.value
                })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendQuotation}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Quotation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle>Approve or Request Revision</DialogTitle>
            <DialogDescription>
              Please review the quotation and approve it or request changes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Alert >
              <div className='flex gap-1 items-center'>
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-600 dark:text-blue-400">Review Summary</AlertTitle>
              </div>
              <AlertDescription>
                <div className="text-muted-foreground text-sm mt-2">
                  <p className="mb-1">Quotation: {quotation.quotationNumber}</p>
                  <p className="mb-1">Amount: {formatCurrency(quotation.total)}</p>
                  <p>Valid Until: {formatDate(quotation.validUntil)}</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid gap-2">
              <Label htmlFor="comment">Comment (Optional for approval, required for revision)</Label>
              <Textarea
                id="comment"
                placeholder="Add your feedback or comments here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 sm:flex-1"
              onClick={() => {
                setRejectionReason(comment);
                handleRejectQuotation();
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 sm:flex-1"
              onClick={handleApproveQuotation}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden iframe for printing */}
      <iframe
        ref={printIframeRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
    </div>
  );
}
