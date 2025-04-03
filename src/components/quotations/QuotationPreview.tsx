import React, { useState } from 'react';
import { 
  MessageSquare, 
  Check, 
  X, 
  ExternalLink, 
  Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TemplateRenderer from './TemplateRenderer';

interface QuotationPreviewProps {
  quotation: any;
  onApprove?: (comment: string) => void;
  onReject?: (reason: string) => void;
  onComment?: (comment: string) => void;
  showActions?: boolean;
  showControls?: boolean;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  quotation,
  onApprove,
  onReject,
  onComment,
  showActions = false,
  showControls = false
}) => {
  const [comment, setComment] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const handleApprove = () => {
    if (onApprove) {
      onApprove(comment);
    }
    setComment('');
    setApproveDialogOpen(false);
  };

  const handleReject = () => {
    if (onReject && comment.trim()) {
      onReject(comment);
    }
    setComment('');
    setRejectDialogOpen(false);
  };

  const handleComment = () => {
    if (onComment && comment.trim()) {
      onComment(comment);
    }
    setComment('');
    setCommentDialogOpen(false);
  };

  const handleDownloadPDF = () => {
    // Redirect to PDF endpoint
    const pdfUrl = `/api/quotations/${quotation._id}/pdf`;
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="w-full bg-white dark:bg-gray-950 rounded-lg shadow-sm overflow-hidden">
      {/* Use fixed height container for the template renderer */}
      <div className="relative">
        <TemplateRenderer 
          quotation={quotation} 
          className="w-full h-[842px] bg-white overflow-auto border-b"
        />
        
        {/* Action buttons that overlay on the rendered template */}
        {showActions && quotation.status === 'sent' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-950 to-transparent p-4 pt-16">
            <div className="flex justify-center gap-3">
              <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                </DialogTrigger>
                <DialogContent className='z-[100]'>
                  <DialogHeader>
                    <DialogTitle>Approve Quotation</DialogTitle>
                    <DialogDescription>
                      Add an optional comment with your approval.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Add a comment (optional)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
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
                    >
                      Approve Quotation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-red-200 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700">
                    <X className="h-4 w-4 mr-1" /> Request Changes
                  </Button>
                </DialogTrigger>
                <DialogContent className='z-[100]'>
                  <DialogHeader>
                    <DialogTitle>Request Changes</DialogTitle>
                    <DialogDescription>
                      Please explain what changes you'd like to see.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Describe the changes needed..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
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
                      disabled={!comment.trim()}
                    >
                      Request Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" /> Add Comment
                  </Button>
                </DialogTrigger>
                <DialogContent className='z-[100]'>
                  <DialogHeader>
                    <DialogTitle>Add Comment</DialogTitle>
                    <DialogDescription>
                      Your comment will be visible to the quotation creator.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Write your comment here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleComment}
                      disabled={!comment.trim()}
                    >
                      Add Comment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
      
      {/* Optional controls below the quotation */}
      {showControls && (
        <div className="p-4 border-t flex justify-between items-center bg-gray-50 dark:bg-gray-950">
          <div>
            <p className="text-sm text-muted-foreground">
              Quotation: {quotation.quotationNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            {quotation.publicAccessToken && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`/share/quotation/${quotation.publicAccessToken}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> Open Public Link
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPreview;