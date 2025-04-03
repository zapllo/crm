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
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      // Add to approval history since our API now adds comments there
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
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Sent</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Changes Requested</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-white">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h1 className="mt-6 text-2xl font-bold">Loading Quotation</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Please wait while we retrieve your quotation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Quotation Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto" />
              <p className="mt-4 text-muted-foreground">{error}</p>
              <Button className="mt-6" onClick={() => router.push('/')}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{quotation?.organization?.companyName || 'Company'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">Quotation: {quotation?.quotationNumber}</p>
                <span className="text-muted-foreground">•</span>
                {getStatusBadge(quotation.status)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Secure Quotation</span>
            </div>
          </div>
        </header>

        <main>
          {/* Action Buttons */}
          {quotation.status === 'sent' && (
            <div className="mb-6 bg-muted/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold">Ready to respond?</h3>
                <p className="text-sm text-muted-foreground">You can approve this quotation or request changes.</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-red-200 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700">
                      <X className="h-4 w-4 mr-1" /> Request Changes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Changes</DialogTitle>
                      <DialogDescription>
                        Please explain what changes you'd like to see.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Name (Optional)</label>
                          <input 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Email (Optional)</label>
                          <input 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
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
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleReject}
                        disabled={!rejectReason.trim() || loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                        Request Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="z-[100]">
                    <DialogHeader>
                      <DialogTitle>Approve Quotation</DialogTitle>
                      <DialogDescription>
                        You're about to approve this quotation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Name (Optional)</label>
                          <input 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Email (Optional)</label>
                          <input 
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
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
                        className="min-h-[100px]"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleApprove}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                        Approve Quotation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* Quotation Preview */}
          <Card className="mb-8 shadow-sm">
            <CardContent className="p-0">
              <QuotationPreview 
                quotation={quotation} 
                showActions={false}
              />
            </CardContent>
            <CardFooter className="p-4 bg-muted/30 border-t flex justify-between">
              <div className="text-sm text-muted-foreground">
                Quotation valid until: {new Date(quotation.validUntil).toLocaleDateString()}
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open(`/api/public/quotations/${params.token}/pdf`, '_blank')}>
                <Download className="h-4 w-4 mr-1" /> Download PDF
              </Button>
            </CardFooter>
          </Card>

          {/* Communication & Activity Section */}
          <div ref={commentsRef} className="mt-10 mb-6">
            <h2 className="text-xl font-bold mb-6">Communication & Activity</h2>
            
            {/* Activity Timeline */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {quotation.approvalHistory && quotation.approvalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {quotation.approvalHistory.map((entry: any, index: number) => {
                      // Determine if this is a comment (check for the "Comment from" pattern)
                      const isComment = entry.comment && entry.comment.startsWith('Comment from');
                      
                      // Format names appropriately based on entry type
                      let actionText, iconColor, icon, personName, commentContent;
                      
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
                          icon = <MessageSquare className="h-5 w-5" />;
                        } else {
                          // Fallback if the pattern doesn't match
                          actionText = "commented";
                          personName = "Client";
                          commentContent = entry.comment;
                          iconColor = "text-blue-500";
                          icon = <MessageSquare className="h-5 w-5" />;
                        }
                      } else if (entry.status === 'approved') {
                        actionText = "approved the quotation";
                        personName = "Client";
                        commentContent = entry.comment;
                        iconColor = "text-green-500";
                        icon = <Check className="h-5 w-5" />;
                      } else if (entry.status === 'revision_requested') {
                        actionText = "requested changes";
                        personName = "Client";
                        commentContent = entry.comment;
                        iconColor = "text-red-500";
                        icon = <X className="h-5 w-5" />;
                      } else if (entry.status === 'pending') {
                        actionText = "updated status";
                        personName = entry.updatedBy?.firstName 
                          ? `${entry.updatedBy.firstName} ${entry.updatedBy.lastName}`
                          : "System";
                        commentContent = entry.comment;
                        iconColor = "text-amber-500";
                        icon = <Clock className="h-5 w-5" />;
                      }
                      
                      return (
                        <div key={index} className="flex gap-4">
                          <div className={`flex-shrink-0 mt-1 h-8 w-8 rounded-full bg-muted flex items-center justify-center ${iconColor} bg-opacity-20`}>
                            {icon}
                          </div>
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                              <div className="font-medium">
                                <span>{personName}</span> <span className="text-muted-foreground">{actionText}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(entry.timestamp)}
                              </div>
                            </div>
                            {commentContent && (
                              <div className="mt-1 text-sm bg-muted/20 p-3 rounded-md">
                                {commentContent}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">No activity recorded yet.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Add Comment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add a Comment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Name</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          <User className="h-4 w-4" />
                        </span>
                        <input 
                          className="flex h-9 w-full rounded-none rounded-r-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Email</label>
                      <input 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        type="email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Comment</label>
                    <Textarea
                      placeholder="Enter your comment here..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || submittingComment}
                    >
                      {submittingComment ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Submit Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p className="mb-2">This is a secure document shared directly with you. Please do not share this link without authorization.</p>
          <p>© {new Date().getFullYear()} {quotation?.organization?.companyName || 'Company'}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}