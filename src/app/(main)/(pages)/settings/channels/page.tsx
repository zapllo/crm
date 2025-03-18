"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

// Shadcn UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const LEAD_FIELDS = ["title", "description", "amount", "closeDate", "stage", "source"];
const CONTACT_FIELDS = ["firstName", "lastName", "email", "whatsappNumber", "city", "country"];
const COMPANY_FIELDS = ["companyName", "taxNo", "country", "city", "website"];

export default function ChannelsPage() {
  // 1) CONNECT GOOGLE ACCOUNT
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [connectedDate, setConnectedDate] = useState<string | null>(null);

  async function fetchConnectedAccount() {
    try {
      const res = await axios.get("/api/channels/connect");
      if (res.data && res.data.emailAddress) {
        setConnectedEmail(res.data.emailAddress);
        setConnectedDate(res.data.createdAt);
      }
    } catch (err) {
      console.log("No connected account found or error:", err);
    }
  }

  function handleConnectGoogle() {
    window.location.href = "/api/channels/connect/google";
  }

  // 2) TEMPLATE LIST + CRUD
  const [templates, setTemplates] = useState<any[]>([]);

  async function fetchTemplates() {
    try {
      const res = await axios.get("/api/channels/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  }

  async function handleDeleteTemplate(id: string) {
    try {
      await axios.delete(`/api/channels/templates?templateId=${id}`);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  }

  // 3) DIALOG / FORM STATE for CREATE/EDIT
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // track text area ref
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Insert placeholder at cursor
  const insertPlaceholder = useCallback((placeholder: string) => {
    if (!textAreaRef.current) return;
    const textArea = textAreaRef.current;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;

    const before = body.slice(0, start);
    const after = body.slice(end);
    const updated = before + `{{${placeholder}}}` + after;
    setBody(updated);

    requestAnimationFrame(() => {
      textArea.focus();
      const newPos = start + `{{${placeholder}}}`.length;
      textArea.setSelectionRange(newPos, newPos);
    });
  }, [body]);

  function openNewTemplateDialog() {
    setEditingId(null);
    setTemplateName("");
    setSubject("");
    setBody("");
    setOpenDialog(true);
  }

  function openEditTemplateDialog(t: any) {
    setEditingId(t._id);
    setTemplateName(t.name);
    setSubject(t.subject);
    setBody(t.body);
    setOpenDialog(true);
  }

  async function handleSaveTemplate() {
    try {
      if (editingId) {
        // update
        await axios.put("/api/channels/templates", {
          templateId: editingId,
          name: templateName,
          subject,
          body
        });
      } else {
        // create
        await axios.post("/api/channels/templates", {
          name: templateName,
          subject,
          body
        });
      }
      setOpenDialog(false);
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
    }
  }

  // 4) ON LOAD
  useEffect(() => {
    fetchConnectedAccount();
    fetchTemplates();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Channels Page</h1>

      {/* A) CONNECT GOOGLE ACCOUNT */}
      <Card>
        <CardHeader>
          <CardTitle>Connect Google Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectedEmail ? (
            <div>
              <p>Connected as: <strong>{connectedEmail}</strong></p>
              <p>Connected on: {connectedDate ? new Date(connectedDate).toLocaleString() : ""}</p>
              <p className="text-sm text-green-600 mt-2">All emails will send from this account.</p>
            </div>
          ) : (
            <Button onClick={handleConnectGoogle}>Connect Google</Button>
          )}
        </CardContent>
      </Card>

      {/* B) MY TEMPLATES */}
      <Card>
        <CardHeader>
          <CardTitle>My Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-600">Create and manage your email templates.</p>
            <Button onClick={openNewTemplateDialog}>New Template</Button>
          </div>

          <div className="space-y-2">
            {templates.map((tmpl) => (
              <div key={tmpl._id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <p className="font-semibold">{tmpl.name}</p>
                  <p className="text-xs text-gray-500">{tmpl.subject}</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => openEditTemplateDialog(tmpl)}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteTemplate(tmpl._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* C) DIALOG FOR CREATE/EDIT TEMPLATE */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {/* The trigger is "New Template" or "Edit" button, so no <DialogTrigger> needed here */}
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>

          {/* FIELDS */}
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                ref={textAreaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your email content. Use placeholders below..."
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

          <div className="pt-4">
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
