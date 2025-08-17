"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Lucide icons
import {
  Mail,
  Pencil,
  Copy,
  Eye,
  ChevronDown,
  Sparkles,
  RefreshCw,
  LayoutTemplate,
  AlertCircle,
  Send,
  Loader2,
  Check,
  Users,
  Database
} from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription } from "@/components/ui/alert-dialog";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";

// Placeholders for lead/contact/company
const LEAD_FIELDS = ["title", "description", "amount", "closeDate", "stage", "source"];
const CONTACT_FIELDS = ["firstName", "lastName", "email", "whatsappNumber", "city", "country"];
const COMPANY_FIELDS = ["companyName", "taxNo", "country", "city", "website"];

// Enhanced category names
const FIELD_CATEGORIES = {
  lead: {
    title: "Lead Fields",
    description: "Insert information about the lead/deal",
    icon: <Sparkles className="h-4 w-4" />
  },
  contact: {
    title: "Contact Fields",
    description: "Insert information about the contact person",
    icon: <Users className="h-4 w-4" />
  },
  company: {
    title: "Company Fields",
    description: "Insert information about the company",
    icon: <Database className="h-4 w-4" />
  }
};

interface EmailsTabProps {
  leadId: string;
  contactEmail?: string;
  isDialogOpen?: boolean;
  setIsDialogOpen?: (open: boolean) => void;
}

export default function EmailsTab({ leadId, contactEmail, isDialogOpen, setIsDialogOpen }: EmailsTabProps) {
  const { toast } = useToast();
  
  // Dialog state
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const dialogOpen = isDialogOpen !== undefined ? isDialogOpen : internalDialogOpen;
  const setDialogOpen = setIsDialogOpen || setInternalDialogOpen;
  
  const [dialogMode, setDialogMode] = useState<"manual" | "template">("manual");
  const [isSending, setIsSending] = useState(false);
  const [leadDetails, setLeadDetails] = useState<any>(null);

  // Email form state
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null);

  useEffect(() => {
    async function fetchLeadDetails() {
      try {
        const res = await axios.get(`/api/leads/details?leadId=${leadId}`);
        setLeadDetails(res.data);

        if (contactEmail) {
          setRecipient(contactEmail);
        } else if (res.data?.contact?.email && res.data.contact.email !== 'N/A') {
          setRecipient(res.data.contact.email);
        }
      } catch (err) {
        console.error("Error fetching lead details", err);
      }
    }

    fetchLeadDetails();
  }, [leadId, contactEmail]);

  // Insert placeholder function
  const insertPlaceholder = useCallback((placeholder: string) => {
    const placeholderText = `{{${placeholder}}}`;
    setBody(prevBody => prevBody + placeholderText);
  }, []);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/channels/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle send email
  function handleSendEmail() {
    setDialogMode("manual");
    if (leadDetails?.contact?.email && leadDetails.contact.email !== 'N/A') {
      setRecipient(leadDetails.contact.email);
    } else if (contactEmail) {
      setRecipient(contactEmail);
    } else {
      setRecipient("");
    }
    setSubject("");
    setBody("");
    setDialogOpen(true);
  }

  // Handle template selection
  async function handleTemplateSelect(templateId: string) {
    setDialogMode("template");
    const found = templates.find((t) => t._id === templateId);
    if (found) {
      setSubject(found.subject);
      setBody(found.body);
    } else {
      setSubject("");
      setBody("");
    }

    if (leadDetails?.contact?.email && leadDetails.contact.email !== 'N/A') {
      setRecipient(leadDetails.contact.email);
    } else if (contactEmail) {
      setRecipient(contactEmail);
    } else {
      setRecipient("");
    }

    setDialogOpen(true);
  }

  // Handle preview
  function handlePreview() {
    setPreviewData({ subject, body });
    setShowPreview(true);
  }

  // Handle send
  async function handleSend() {
    try {
      if (!recipient) {
        toast({
          title: "Error",
          description: "Please enter a recipient email address.",
          variant: "destructive"
        });
        return;
      }

      setIsSending(true);

      const payload = {
        leadId,
        to: recipient,
        subject: subject,
        body: body,
      };

      await axios.post("/api/channels/sendEmail", payload);

      toast({
        title: "Success",
        description: "Email sent successfully!"
      });

      setDialogOpen(false);
    } catch (error) {
      console.error("Error sending email", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Communication
            </CardTitle>
            <CardDescription>Send emails and use templates for consistent communication</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSendEmail}
              className="group flex gap-2"
            >
              <Mail className="h-4 w-4 group-hover:animate-pulse" />
              Send Email
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2">Use Email Template</Label>
              <Select onValueChange={(val) => handleTemplateSelect(val)}>
                <SelectTrigger className="w-full bg-muted/50">
                  <SelectValue placeholder="Select a template to use" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading templates...
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                      No email templates available
                    </div>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {template.subject}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Email Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl h-fit max-h-screen overflow-y-scroll scrollbar-hide z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {dialogMode === "manual" ? "Send New Email" : "Send Email From Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <Label htmlFor="recipient" className="text-base">To</Label>
              <div className="mt-1.5">
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient email"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject" className="text-base">Email Subject</Label>
              <div className="mt-1.5">
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter your email subject line"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="body" className="text-base">Email Body</Label>
              </div>

              <RichTextEditor
                value={body}
                onChange={setBody}
                placeholder="Type your email content here..."
                minHeight="400px"
              />
            </div>

            {/* Placeholder Tabs */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-3">Insert Dynamic Placeholders</h3>
              <Tabs defaultValue="lead" className="w-full">
                <TabsList className="w-full mb-4 bg-background border">
                  {Object.entries(FIELD_CATEGORIES).map(([key, category]) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="flex-1 data-[state=active]:bg-primary/10 border-none data-[state=active]:text-primary data-[state=active]:shadow-none"
                    >
                      <div className="flex items-center gap-1.5">
                        {category.icon}
                        {category.title}
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(FIELD_CATEGORIES).map(([key, category]) => {
                  const fields = key === 'lead' ? LEAD_FIELDS : key === 'contact' ? CONTACT_FIELDS : COMPANY_FIELDS;

                  return (
                    <TabsContent key={key} value={key} className="mt-0 p-0">
                      <div className="mb-2 text-xs text-muted-foreground">
                        {category.description}
                      </div>
                      <ScrollArea className="max-h-36">
                        <div className="flex flex-wrap gap-2">
                          {fields.map((field) => (
                            <motion.div
                              key={field}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => insertPlaceholder(`${key}.${field}`)}
                                className="border-primary/20 hover:bg-primary/10 hover:text-primary"
                              >
                                <Copy className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                {field}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="mt-3 text-xs text-muted-foreground bg-primary/10 p-2 rounded">
                        <span className="font-medium">Example:</span> {`${key}.${fields[0]}`} will be replaced with actual {fields[0]} value
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="sm:mr-auto"
            >
              Cancel
            </Button>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              <Button
                className="gap-2 min-w-[120px]"
                onClick={handleSend}
                disabled={isSending || !recipient || !subject || !body}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl z-[100] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Email Preview
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {previewData?.subject && (
              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Subject:</div>
                <div className="font-medium">{previewData.subject}</div>
              </div>
            )}

            <div className="bg-background p-4 rounded-lg border min-h-[300px] max-h-[500px] overflow-auto">
              <div className="text-sm text-muted-foreground mb-3">Body:</div>
              <div className="prose dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: previewData?.body || "" }}
                  className="email-preview"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">
                Placeholders will be replaced with actual data when the email is sent.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="mr-auto"
            >
              Close
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                setShowPreview(false);
                // Return to send dialog
              }}
            >
              <Send className="h-4 w-4" />
              Back to Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}