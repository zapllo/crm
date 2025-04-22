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
  Send
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
    icon: <Mail className="h-4 w-4" />
  },
  company: {
    title: "Company Fields",
    description: "Insert information about the company",
    icon: <LayoutTemplate className="h-4 w-4" />
  }
};

interface EmailsTabProps {
  leadId: string;
  contactEmail?: string; // Optional prop for the
  isDialogOpen?: boolean;
  setIsDialogOpen?: (open: boolean) => void;
  // If you want to default the "To" field from the lead's contact email,
  // you could pass that here, e.g. contactEmail?: string;
}

export default function EmailsTab({ leadId, contactEmail,   isDialogOpen,
  setIsDialogOpen }: EmailsTabProps) {
  // 1) Dialog state
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);

  // Use the external control if provided, otherwise use internal state
  const dialogOpen = isDialogOpen !== undefined ? isDialogOpen : internalDialogOpen;
  const setDialogOpen = setIsDialogOpen || setInternalDialogOpen;
  const [dialogMode, setDialogMode] = useState<"manual" | "template">("manual");
  const [isSending, setIsSending] = useState(false);

  const [leadDetails, setLeadDetails] = useState<any>(null);

  useEffect(() => {
    async function fetchLeadDetails() {
      try {
        const res = await axios.get(`/api/leads/details?leadId=${leadId}`);
        setLeadDetails(res.data);

        // If contact email is available directly in the props, use it
        if (contactEmail) {
          setRecipient(contactEmail);
        }
        // Otherwise try to get it from the lead details
        else if (res.data?.contact?.email && res.data.contact.email !== 'N/A') {
          setRecipient(res.data.contact.email);
        }
      } catch (err) {
        console.error("Error fetching lead details", err);
      }
    }

    fetchLeadDetails();
  }, [leadId, contactEmail]);


  // We'll store: to, subject, body
  const [recipient, setRecipient] = useState(leadId);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // 2) Existing templates for "Send Email Template"
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 3) "activeField" to know if we're inserting placeholders into subject or body
  const [activeField, setActiveField] = useState<"subject" | "body">("body");
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  // 5) "Send Email" button -> manual mode
  function handleSendEmail() {
    setDialogMode("manual");

    // Set the recipient to the contact's email from lead details if available
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

  // 6) Template selection from dropdown
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

    // Set the recipient to the contact's email from lead details if available
    if (leadDetails?.contact?.email && leadDetails.contact.email !== 'N/A') {
      setRecipient(leadDetails.contact.email);
    } else if (contactEmail) {
      setRecipient(contactEmail);
    } else {
      setRecipient("");
    }

    setDialogOpen(true);
  }

  // Insert placeholder at the cursor in subject or body
  const insertPlaceholder = useCallback(
    (placeholder: string) => {
      const toInsert = `{{${placeholder}}}`;

      if (activeField === "subject") {
        if (!subjectRef.current) return;
        const start = subjectRef.current.selectionStart || 0;
        const end = subjectRef.current.selectionEnd || 0;
        const before = subject.slice(0, start);
        const after = subject.slice(end);
        const updated = before + toInsert + after;
        setSubject(updated);
        requestAnimationFrame(() => {
          subjectRef.current?.focus();
          const newPos = start + toInsert.length;
          subjectRef.current?.setSelectionRange(newPos, newPos);
        });
      } else {
        // body
        if (!bodyRef.current) return;
        const start = bodyRef.current.selectionStart || 0;
        const end = bodyRef.current.selectionEnd || 0;
        const before = body.slice(0, start);
        const after = body.slice(end);
        const updated = before + toInsert + after;
        setBody(updated);
        requestAnimationFrame(() => {
          bodyRef.current?.focus();
          const newPos = start + toInsert.length;
          bodyRef.current?.setSelectionRange(newPos, newPos);
        });
      }
    },
    [activeField, subject, body]
  );

  // 4) On load, fetch templates
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


  // 7) On "Send," call /api/channels/sendEmail
  async function handleSend() {
    try {
      if (!recipient) {
        alert("Please enter a 'To' email address.");
        return;
      }

      setIsSending(true);

      // your final payload
      const payload = {
        leadId,
        to: recipient,
        subject: subject,
        body: body,
        // placeholders for lead/contact/company data in the server
      };

      await axios.post("/api/channels/sendEmail", payload);

      setDialogOpen(false);
      // Show success toast or message
    } catch (error) {
      console.error("Error sending email", error);
      // Show error toast or message
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="border-blue-100 dark:border-blue-900">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Email Communication
        </CardTitle>
        <CardDescription>
          Send emails and use templates for consistent communication
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSendEmail}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Button>

          <div className="relative">
            <Select onValueChange={(val) => handleTemplateSelect(val)}>
              <SelectTrigger className="w-[200px] bg-gray-50 dark:bg-gray-900/50">
                <SelectValue placeholder="Use Template" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : templates.length === 0 ? (
                  <div className="px-2 py-3 text-center text-muted-foreground text-sm">
                    No templates available
                  </div>
                ) : (
                  templates.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add your email list/history component here if needed */}
      </CardContent>

      {/* The shared dialog for both manual and template modes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl h-[90vh] overflow-y-scroll scrollbar-hide z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              {dialogMode === "manual" ? "Send New Email" : "Send Email From Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* The "To" field */}
            <div>
              <Label htmlFor="recipient" className="text-base">Recipient</Label>
              <div className="mt-1.5">
                <Input
                  id="recipient"
                  value={recipient}
                  disabled={true}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="bg-gray-50 dark:bg-gray-900/50"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject" className="text-base">Subject</Label>
              <div className="mt-1.5">
                <Input
                  id="subject"
                  ref={subjectRef}
                  onFocus={() => setActiveField("subject")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line"
                  className="bg-gray-50 dark:bg-gray-900/50"
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="body" className="text-base">Email Body</Label>
              </div>
              <div className="rounded-md border overflow-hidden">
                <div className="bg-gray-50 flex dark:bg-gray-900/50 px-3 py-2 text-sm border-b">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-500 px-2 py-0.5 mr-1.5">
                            Tips
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Use the placeholder buttons below to insert dynamic data</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  Use placeholders below to insert dynamic content
                </div>
                <Textarea
                  id="body"
                  ref={bodyRef}
                  onFocus={() => setActiveField("body")}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your email content. Insert placeholders using the buttons below."
                  className="min-h-[300px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none"
                />
              </div>
            </div>

            {/* TABS for placeholders */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-3">Insert Dynamic Placeholders</h3>
              <Tabs defaultValue="lead" className="w-full">
                <TabsList className="w-full mb-4 bg-white dark:bg-gray-900 border">
                  {Object.entries(FIELD_CATEGORIES).map(([key, category]) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="flex-1 data-[state=active]:bg-blue-50 border-none dark:data-[state=active]:bg-blue-950/50 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-none"
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
                                className="border-blue-100 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Copy className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                {field}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="mt-3 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                        <span className="font-medium">Example:</span> {`${key}.${fields[0]}`} will be replaced with actual {fields[0]} value
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 pt-2">
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
                onClick={() => {
                  // Preview functionality would go here
                  // This could be implemented similar to the template preview
                }}
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
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog (Could be implemented similar to template preview) */}
      {/*
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          Preview content would go here
        </DialogContent>
      </Dialog>
      */}
    </Card>
  );
}
