"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Shield,
  Check,
  X,
  MessageSquare,
  Send,
  User,
  Clock,
  Download,
  Mail,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock8,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import QuotationPreview from "@/components/quotations/QuotationPreview";

export default function PublicQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveComment, setApproveComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("preview");

  // Auto-scroll to comments section after adding a comment
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/public/quotations/${params.token}`);
        setQuotation(response.data);
      } catch (error: any) {
        console.error("Error fetching quotation:", error);
        setError(
          error.response?.data?.error ||
          "This quotation is not available or has expired."
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      fetchQuotation();
    }
  }, [params.token]);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/public/quotations/${params.token}`, {
        action: 'approve',
        comment: approveComment,
        name,
        email
      });

      toast({
        title: "Quotation Approved",
        description: "Thank you! The quotation has been approved successfully.",
      });

      // Update quotation data to reflect the change
      setQuotation({
        ...quotation,
        status: 'approved',
        approvalHistory: [
          ...quotation.approvalHistory,
          {
            status: 'approved',
            comment: approveComment || 'Approved without comment',
            timestamp: new Date().toISOString()
          }
        ]
      });

      setApproveDialogOpen(false);
      setApproveComment("");
    } catch (error: any) {
      console.error("Error approving quotation:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve quotation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for requesting changes.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/public/quotations/${params.token}`, {
        action: 'request_revision',
        comment: rejectReason,
        name,
        email
      });

      toast({
        title: "Revision Requested",
        description: "Your feedback has been submitted. Thank you.",
      });

      // Update quotation data to reflect the change
      setQuotation({
        ...quotation,
        status: 'rejected',
        approvalHistory: [
          ...quotation.approvalHistory,
          {
            status: 'revision_requested',
            comment: rejectReason,
            timestamp: new Date().toISOString()
          }
        ]
      });

      setRejectDialogOpen(false);
      setRejectReason("");
    } catch (error: any) {
      console.error("Error rejecting quotation:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to request revision.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingComment(true);
      await axios.post(`/api/public/quotations/${params.token}`, {
        action: 'comment',
        comment: commentText,
        name,
        email
      });

      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });

      // Update quotation data to reflect the new comment
      setQuotation({
        ...quotation,
        approvalHistory: [
          ...quotation.approvalHistory,
          {
            status: 'pending',
            comment: `Comment from ${name || 'Anonymous'} (${email || 'No email'}): ${commentText}`,
            timestamp: new Date().toISOString()
          }
        ]
      });

      setCommentText("");

      // Scroll to comments section
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add comment.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="font-medium">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500 text-white font-medium">Awaiting Response</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 text-white font-medium">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white font-medium">Changes Requested</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500 text-white font-medium">Expired</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">{status}</Badge>;
    }
  };

  const getAvatarInitials = (name: string = 'Anonymous') => {
    if (name === 'Anonymous' || name === 'Client') return 'CL';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getActivityIcon = (entry: any) => {
    const isComment = entry.comment && entry.comment.startsWith('Comment from');

    if (isComment) {
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    } else if (entry.status === 'approved') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (entry.status === 'revision_requested') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <Clock8 className="h-5 w-5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center animate-ping opacity-75">
              <div className="w-8 h-8 rounded-full bg-primary/10"></div>
            </div>
          </div>
          <h1 className="mt-8 text-2xl font-bold animate-pulse">Loading Quotation</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Please wait while we retrieve your quotation details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full border-red-200 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle>Quotation Not Available</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">The link you followed may be expired, invalid, or you might not have permission to view this quotation.</p>
              <Button
                className="mt-4 transition-all duration-300 hover:scale-105"
                onClick={() => router.push('/')}
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className=" px-4 py-6 sm:py-10">
        <header className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {quotation?.organization?.companyName || 'Company'}
                </h1>
                {getStatusBadge(quotation.status)}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{quotation?.quotationNumber}</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">•</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Valid until {new Date(quotation.validUntil).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-lg self-start">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm dark:text-white font-medium">Secure Quotation</span>
            </div>
          </div>
        </header>

        <main>
          {/* Action Buttons for sent status */}
          {quotation.status === 'sent' && (
            <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-md overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300">Ready to respond?</h3>
                    <p className="text-blue-600 dark:text-blue-400 mt-1">
                      Please review this quotation and let us know if you'd like to proceed or request any changes.
                    </p>
                  </div>
                  <div className="flex flex-row md:flex-col justify-center gap-3 p-4 md:p-6 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 dark:from-blue-900/40 dark:to-indigo-900/40">
                    <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-red-200 bg-white dark:bg-gray-800 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" /> Request Changes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="z-[100] sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className='dark:text-white'>Request Changes</DialogTitle>
                          <DialogDescription>
                            Please explain what changes you'd like to see.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm dark:text-muted-foreground font-medium">Your Name (Optional)</label>
                              <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm dark:text-muted-foreground font-medium">Your Email (Optional)</label>
                              <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                type="email"
                              />
                            </div>
                          </div>
                          <Textarea
                            placeholder="Describe the changes needed..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="min-h-[120px]"
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button className="dark:text-white" variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || loading}
                            className="gap-2"
                          >
                            {loading ?
                              <Loader2 className="h-4 w-4 animate-spin" /> :
                              <X className="h-4 w-4" />
                            }
                            Request Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2">
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="z-[100] sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="dark:text-white">Approve Quotation</DialogTitle>
                          <DialogDescription>
                            You're about to approve this quotation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm dark:text-muted-foreground font-medium">Your Name (Optional)</label>
                              <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm dark:text-muted-foreground font-medium">Your Email (Optional)</label>
                              <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                type="email"
                              />
                            </div>
                          </div>
                          <Textarea
                            placeholder="Add an optional comment with your approval..."
                            value={approveComment}
                            onChange={(e) => setApproveComment(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </div>
                        <DialogFooter>
                          <Button className="dark:text-white" variant="outline" onClick={() => setApproveDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700 gap-2"
                            onClick={handleApprove}
                            disabled={loading}
                          >
                            {loading ?
                              <Loader2 className="h-4 w-4 animate-spin" /> :
                              <Check className="h-4 w-4" />
                            }
                            Approve Quotation
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile tabs for small screens */}
          <div className="md:hidden mb-6">
            <Tabs defaultValue="preview" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="preview">Quotation</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Quotation Preview */}
            <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} md:block md:flex-1 transition-all`}>
              <Card className="shadow-md overflow-hidden border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Quotation Details</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/public/quotations/${params.token}/pdf`, '_blank')}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" /> Download PDF
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download as PDF document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <QuotationPreview
                    quotation={quotation}
                    showActions={false}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Communication & Activity Section */}
            <div
              ref={commentsRef}
              className={`${activeTab === 'communication' ? 'block' : 'hidden'} md:block md:w-full md:max-w-md transition-all`}
            >
              <Card className="shadow-md overflow-hidden border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4 border-b">
                  <CardTitle className="text-lg">Communication & Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[50vh] md:h-[60vh]">
                    <div className="p-4">
                      {quotation.approvalHistory && quotation.approvalHistory.length > 0 ? (
                        <div className="space-y-6">
                          {quotation.approvalHistory.map((entry: any, index: number) => {
                            // Determine if this is a comment (check for the "Comment from" pattern)
                            const isComment = entry.comment && entry.comment.startsWith('Comment from');

                            // Format names appropriately based on entry type
                            let actionText, iconColor, personName, commentContent;

                            if (isComment) {
                              // Parse out the name and actual comment content
                              const commentPattern = /Comment from (.*?) \((.*?)\): (.*)/;
                              const match = entry.comment.match(commentPattern);

                              if (match) {
                                personName = match[1] === 'Anonymous' ? 'Client' : match[1];
                                const emailPart = match[2] !== 'No email' ? ` (${match[2]})` : '';
                                commentContent = match[3];

                                actionText = `added a comment`;
                                iconColor = "text-blue-500";
                              } else {
                                // Fallback if the pattern doesn't match
                                actionText = "commented";
                                personName = "Client";
                                commentContent = entry.comment;
                                iconColor = "text-blue-500";
                              }
                            } else if (entry.status === 'approved') {
                              actionText = "approved the quotation";
                              personName = "Client";
                              commentContent = entry.comment;
                              iconColor = "text-green-500";
                            } else if (entry.status === 'revision_requested') {
                              actionText = "requested changes";
                              personName = "Client";
                              commentContent = entry.comment;
                              iconColor = "text-red-500";
                            } else if (entry.status === 'pending') {
                              actionText = "updated status";
                              personName = entry.updatedBy?.firstName
                                ? `${entry.updatedBy.firstName} ${entry.updatedBy.lastName}`
                                : "System";
                              commentContent = entry.comment;
                              iconColor = "text-amber-500";
                            }

                            return (
                              <div key={index} className="relative pl-6 pb-6">
                                {/* Timeline line */}
                                {index < quotation.approvalHistory.length - 1 && (
                                  <div className="absolute left-4 top-6 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                                )}

                                <div className="flex gap-3">
                                  <div className="flex-shrink-0">
                                    <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 overflow-visible">
                                      <AvatarFallback className={`${
                                        isComment ? "bg-blue-100 text-blue-600" :
                                        entry.status === 'approved' ? "bg-green-100 text-green-600" :
                                        entry.status === 'revision_requested' ? "bg-red-100 text-red-600" :
                                        "bg-amber-100 text-amber-600"
                                      } text-xs`}>
                                        {getAvatarInitials(personName)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>

                                  <div className="flex-grow space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-1">
                                      <div className="font-medium text-sm">
                                        <span>{personName}</span>
                                        <span className="text-muted-foreground ml-1">{actionText}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDate(entry.timestamp)}
                                      </div>
                                    </div>

                                    {commentContent && (
                                      <div className="mt-2 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        {commentContent}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                            <MessageSquare className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-muted-foreground">No activity recorded yet.</p>
                          <p className="text-sm text-muted-foreground mt-1">Be the first to add a comment!</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="border-t p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                              <User className="h-4 w-4" />
                            </span>
                            <Input
                              className="rounded-l-none"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Your name"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                              <Mail className="h-4 w-4" />
                            </span>
                            <Input
                              className="rounded-l-none"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Your email"
                              type="email"
                            />
                          </div>
                        </div>
                      </div>

                      <Textarea
                        placeholder="Add your comment here..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[80px] resize-y"
                      />

                      <div className="flex justify-end">
                        <Button
                          onClick={handleAddComment}
                          disabled={!commentText.trim() || submittingComment}
                          className="gap-2"
                        >
                          {submittingComment ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          {submittingComment ? "Sending..." : "Send Comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <footer className="mt-12 pt-6 border-t text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground max-w-md">
              This is a secure quotation document shared directly with you. Please do not share this link without authorization.
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium">Powered by Zapllo CRM</p>
            </div>
          </div>
          </footer>
      </div>
    </div>
  );
}
