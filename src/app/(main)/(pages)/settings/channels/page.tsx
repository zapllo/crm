"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Lucide icons
import {
  Mail,
  Plus,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  Copy,
  Eye,
  ChevronDown,
  Sparkles,
  RefreshCw,
  MailCheck,
  Search,
  X,
  LayoutTemplate
} from "lucide-react";

// Shadcn UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription } from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { FaGoogle } from "react-icons/fa";

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

const TemplateCard = ({ template, onEdit, onDelete, onPreview }: {
  template: any;
  onEdit: (template: any) => void;
  onDelete: (id: string) => void;
  onPreview: (template: any) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg">{template.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{template.subject}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreview(template)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(template.body)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(template._id)} className="text-red-500 focus:bg-red-50 dark:focus:bg-red-950">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-grow">
          <div className="text-xs text-muted-foreground line-clamp-3 mb-3">
            {template.body.replace(/{{[^}]+}}/g, '[...]')}
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="text-xs text-muted-foreground">
            {new Date(template.createdAt || Date.now()).toLocaleDateString()}
          </div>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-500 dark:text-blue-300 text-xs">
            Email
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

export default function ChannelsPage() {
  // 1) CONNECT GOOGLE ACCOUNT
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [connectedDate, setConnectedDate] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

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
    setIsConnecting(true);
    window.location.href = "/api/channels/connect/google";
  }

  // 2) TEMPLATE LIST + CRUD
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function fetchTemplates() {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/channels/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setIsLoading(false);
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
  const [isSaving, setIsSaving] = useState(false);

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

  function handlePreviewTemplate(t: any) {
    setPreviewTemplate(t);
    setShowPreview(true);
  }

  async function handleSaveTemplate() {
    try {
      setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  }

  // 4) ON LOAD
  useEffect(() => {
    fetchConnectedAccount();
    fetchTemplates();
  }, []);

  // 5) Filter templates by search query
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl overflow-y-scroll h-screen mx-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Email Channels</h1>
        <p className="text-muted-foreground">
          Connect email providers and manage your email templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A) CONNECT GOOGLE ACCOUNT - Keep this in a separate column on larger screens */}
        <Card className="lg:col-span-1 border-blue-100 dark:border-blue-900 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Email Integration
            </CardTitle>
            <CardDescription>
              Connect your email account to send emails directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {connectedEmail ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-green-100 dark:border-green-900">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(connectedEmail)}&background=random`} />
                    <AvatarFallback>
                      {connectedEmail.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{connectedEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Connected on {connectedDate ? new Date(connectedDate).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>

                <Alert >
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Account successfully connected and ready to use
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Connection
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
                    <X className="h-4 w-4" />
                    Disconnect Account
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert  >
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-600 dark:text-amber-400">
                      No email account connected yet
                    </AlertDescription>
                  </div>
                </Alert>

                <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 text-center space-y-4">
                  <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 h-16 w-16 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Connect Email Account</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connect your Google account to send emails directly from Zapllo
                    </p>
                  </div>
                  <Button
                    onClick={handleConnectGoogle}
                    className="w-full gap-2"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <FaGoogle className="h-4 w-4" />
                    )}
                    Connect with Google
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
            <div className="text-sm text-muted-foreground">
              <MailCheck className="h-4 w-4 inline mr-1" />
              Your emails will be tracked automatically
            </div>
          </CardFooter>
        </Card>

        {/* B) MY TEMPLATES - Section takes up more space on larger screens */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-blue-100 dark:border-blue-900">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Email Templates
                  </CardTitle>
                  <CardDescription>
                    Create and manage reusable email templates
                  </CardDescription>
                </div>
                <Button
                  onClick={openNewTemplateDialog}
                  className="bg-primary hover:bg-primary/80 text-white gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                  <span className="ml-2 text-blue-500">Loading templates...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 h-16 w-16 rounded-full flex items-center justify-center">
                    <LayoutTemplate className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium">No templates yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Create your first email template to streamline your communication with contacts and leads.
                  </p>
                  <Button
                    onClick={openNewTemplateDialog}
                    className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Template
                  </Button>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-muted-foreground">No templates match your search.</p>
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template._id}
                        template={template}
                        onEdit={openEditTemplateDialog}
                        onDelete={handleDeleteTemplate}
                        onPreview={handlePreviewTemplate}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {connectedEmail && (
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-lg">Recent Email Activity</CardTitle>
                <CardDescription>
                  Track and monitor your recent emails
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  <RefreshCw className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                  <p>Email activity tracking will be available soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* C) DIALOG FOR CREATE/EDIT TEMPLATE */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl h-fit max-h-screen overflow-y-scroll scrollbar-hide z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-blue-500" />
              {editingId ? "Edit Email Template" : "Create New Email Template"}
            </DialogTitle>
          </DialogHeader>

          {/* FIELDS */}
          <div className="space-y-5 py-2">
            <div>
              <Label htmlFor="templateName" className="text-base">Template Name</Label>
              <div className="mt-1.5">
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter a name for your template"
                  className="bg-gray-50 dark:bg-gray-900/50"
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
                  className="bg-gray-50 dark:bg-gray-900/50"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="body" className="text-base">Email Body</Label>
                {/* <div className="flex items-center gap-2">
                  <Label htmlFor="rich-text" className="text-sm">Rich Text</Label>
                  <Switch id="rich-text" />
                </div> */}
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
                  ref={textAreaRef}
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

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              className="sm:mr-auto"
            >
              Cancel
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handlePreviewTemplate({ name: templateName, subject, body })}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              <Button
                className="gap-2 min-w-[120px]"
                onClick={handleSaveTemplate}
                disabled={isSaving || !templateName || !subject || !body}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editingId ? "Update" : "Create"}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* D) TEMPLATE PREVIEW DIALOG */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl z-[100] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Email Template Preview
              </span>
              <Badge variant="outline" className="ml-2">
                {previewTemplate?.name}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Subject:</div>
              <div className="font-medium">{previewTemplate?.subject}</div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border min-h-[300px]">
              <div className="text-sm text-muted-foreground mb-3">Body:</div>
              <div className="prose dark:prose-invert max-w-none">
                {previewTemplate?.body.split('\n').map((line: string, i: number) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {line.split(/{{([^}]+)}}/g).map((segment, index) =>
                      index % 2 === 0 ? (
                        segment
                      ) : (
                        <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-500 font-mono">
                          {`{{${segment}}}`}
                        </Badge>
                      )
                    )}
                  </p>
                ))}
              </div>
            </div>

            <Alert >
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                Placeholders will be replaced with actual data when the email is sent.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="mr-auto"
            >
              Close
            </Button>
            {previewTemplate && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    openEditTemplateDialog(previewTemplate);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => {
                    // Here you would typically implement sending a test email
                    // alert("Send test email functionality will be implemented soon!");
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Send Test Email
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* E) CONFIRMATION DIALOG FOR DELETE */}
      <Dialog open={false}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delete Template
            </DialogTitle>
          </DialogHeader>

          <div className="py-3">
            <p className="mb-2">Are you sure you want to delete this template?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>

          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
