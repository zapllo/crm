"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Placeholders for lead/contact/company
const LEAD_FIELDS = ["title", "description", "amount", "closeDate", "stage", "source"];
const CONTACT_FIELDS = ["firstName", "lastName", "email", "whatsappNumber", "city", "country"];
const COMPANY_FIELDS = ["companyName", "taxNo", "country", "city", "website"];

interface EmailsTabProps {
  leadId: string;
  // If you want to default the "To" field from the lead's contact email,
  // you could pass that here, e.g. contactEmail?: string;
}

export default function EmailsTab({ leadId }: EmailsTabProps) {
  // 1) Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"manual" | "template">("manual");

  // We'll store: to, subject, body
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // 2) Existing templates for "Send Email Template"
  const [templates, setTemplates] = useState<any[]>([]);

  // 3) “activeField” to know if we’re inserting placeholders into subject or body
  const [activeField, setActiveField] = useState<"subject" | "body">("body");
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

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
    try {
      const res = await axios.get("/api/channels/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates", err);
    }
  }

  // 5) “Send Email” button -> manual mode
  function handleSendEmail() {
    setDialogMode("manual");
    setRecipient(""); // or set default from lead's contact if you want
    setSubject("");
    setBody("");
    setDialogOpen(true);
  }

  // 6) Template selection from dropdown
  //    As soon as user selects a template, we open the dialog prefilled
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
    // If you have a lead contact email, you could also setRecipient(...) here.
    setRecipient("");
    setDialogOpen(true);
  }

  // 7) On “Send,” call /api/channels/sendEmail
  async function handleSend() {
    try {
      if (!recipient) {
        alert("Please enter a 'To' email address.");
        return;
      }

      // your final payload
      const payload = {
        leadId,
        to: recipient,
        subjectOverride: subject,
        bodyOverride: body,
        // placeholders for lead/contact/company data in the server
      };

      await axios.post("/api/channels/sendEmail", payload);

      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email", error);
      alert("Failed to send email");
    } finally {
      setDialogOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">Emails</h2>

      {/* 1) “Send Email” (manual) */}
      <Button onClick={handleSendEmail}>Send Email</Button>

      {/* 2) “Send Email Template” – user picks from dropdown, automatically open the dialog */}
      <div className="mt-2">
        <Label>Select From Template </Label>
        <div className="w-56 mt-1">
          <Select onValueChange={(val) => handleTemplateSelect(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* The shared dialog for both manual and template modes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "manual" ? "Send Email" : "Send Email (Template)"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* The “To” field */}
            <div>
              <Label htmlFor="recipient">To</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. user@example.com"
              />
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                ref={subjectRef}
                onFocus={() => setActiveField("subject")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Body */}
            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                ref={bodyRef}
                onFocus={() => setActiveField("body")}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-44"
              />
            </div>

            {/* TABS for placeholders */}
            <Tabs defaultValue="lead">
              <TabsList>
                <TabsTrigger value="lead">Lead Fields</TabsTrigger>
                <TabsTrigger value="contact">Contact Fields</TabsTrigger>
                <TabsTrigger value="company">Company Fields</TabsTrigger>
              </TabsList>

              <TabsContent value="lead" className="mt-2">
                <ScrollArea className="max-h-28">
                  <div className="flex flex-wrap gap-2">
                    {LEAD_FIELDS.map((field) => (
                      <Button
                        key={field}
                        variant="outline"
                        size="sm"
                        onClick={() => insertPlaceholder(`lead.${field}`)}
                      >
                        {field}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="contact" className="mt-2">
                <ScrollArea className="max-h-28">
                  <div className="flex flex-wrap gap-2">
                    {CONTACT_FIELDS.map((field) => (
                      <Button
                        key={field}
                        variant="outline"
                        size="sm"
                        onClick={() => insertPlaceholder(`contact.${field}`)}
                      >
                        {field}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="company" className="mt-2">
                <ScrollArea className="max-h-28">
                  <div className="flex flex-wrap gap-2">
                    {COMPANY_FIELDS.map((field) => (
                      <Button
                        key={field}
                        variant="outline"
                        size="sm"
                        onClick={() => insertPlaceholder(`company.${field}`)}
                      >
                        {field}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
