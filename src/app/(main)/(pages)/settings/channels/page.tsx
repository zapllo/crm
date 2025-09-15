"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
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
  LayoutTemplate,
  MessageCircle,
  ExternalLink,
  Settings,
  Brain,
  Wand2,
  Filter,
  Loader2,
  Users,
  Settings2,
  Database,
  Megaphone,
  MessageCircleMore,
} from "lucide-react";

// Shadcn UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FaGoogle, FaWhatsapp } from "react-icons/fa";

// Custom components
import RichTextEditor from "@/components/ui/rich-text-editor";
import AIEmailTemplateModal from "@/components/modals/channels/aiEmailTemplateModal";
import { useToast } from "@/hooks/use-toast";

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

export default function ChannelsPage() {
  const { toast } = useToast();
  
  // Email integration state
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [connectedDate, setConnectedDate] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [templateToDelete, setTemplateToDelete] = useState<{id: string, name: string} | null>(null);
  // WhatsApp integration state
  const [wabaId, setWabaId] = useState("");
  const [connectedWaba, setConnectedWaba] = useState<string | null>(null);
  const [wabaConnectedDate, setWabaConnectedDate] = useState<string | null>(null);
  const [wabaLastSyncDate, setWabaLastSyncDate] = useState<string | null>(null);
  const [isConnectingWaba, setIsConnectingWaba] = useState(false);
  const [whatsappTemplates, setWhatsappTemplates] = useState<any[]>([]);
  const [isSyncingWhatsApp, setIsSyncingWhatsApp] = useState(false);

  // Template management state
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [templateTab, setTemplateTab] = useState("email");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [templateType, setTemplateType] = useState<"email" | "whatsapp">("email");

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch connected accounts (both email and WhatsApp)
  async function fetchConnectedAccounts() {
    try {
      // Fetch email connection
      const emailRes = await axios.get("/api/channels/connect");
      if (emailRes.data && emailRes.data.emailAddress) {
        setConnectedEmail(emailRes.data.emailAddress);
        setConnectedDate(emailRes.data.createdAt);
      }
    } catch (err) {
      console.log("No connected email account found or error:", err);
    }

    try {
      // Fetch organization data to get WhatsApp connection info
      const orgRes = await axios.get("/api/organization");
      if (orgRes.data && orgRes.data.whatsappIntegration) {
        const whatsapp = orgRes.data.whatsappIntegration;
        if (whatsapp.isConnected && whatsapp.wabaId) {
          setConnectedWaba(whatsapp.wabaId);
          setWabaConnectedDate(whatsapp.connectedAt);
          setWabaLastSyncDate(whatsapp.lastSyncAt);
        }
      }
    } catch (err) {
      console.log("Error fetching organization data:", err);
    }
  }

  // Connect Google account
  function handleConnectGoogle() {
    setIsConnecting(true);
    window.location.href = "/api/channels/connect/google";
  }

  // Connect WhatsApp WABA
  async function handleConnectWaba() {
    if (!wabaId.trim()) return;

    setIsConnectingWaba(true);
    try {
      await axios.post("/api/channels/whatsapp/connect", { wabaId: wabaId.trim() });

      // Update local state
      setConnectedWaba(wabaId.trim());
      setWabaConnectedDate(new Date().toISOString());
      setWabaId("");

      // Sync templates after connection
      await syncWhatsAppTemplates();
      
      toast({
        title: "Success",
        description: "WhatsApp Business Account connected successfully"
      });
    } catch (error) {
      console.error("Error connecting WABA:", error);
      toast({
        title: "Error",
        description: "Failed to connect WhatsApp Business Account",
        variant: "destructive"
      });
    } finally {
      setIsConnectingWaba(false);
    }
  }

  // Sync WhatsApp templates
  async function syncWhatsAppTemplates() {
    if (!connectedWaba) return;

    setIsSyncingWhatsApp(true);
    setSyncError(null);
    setSyncStatus("Syncing templates from WhatsApp...");

    try {
      const response = await axios.post("/api/channels/whatsapp/sync-templates", { wabaId: connectedWaba });

      if (response.data.success) {
        setWhatsappTemplates(response.data.templates || []);
        setSyncStatus(response.data.message);
        setWabaLastSyncDate(new Date().toISOString());

        toast({
          title: "Success",
          description: "WhatsApp templates synced successfully"
        });

        // Clear status after 3 seconds
        setTimeout(() => setSyncStatus(null), 3000);
      } else {
        setSyncError("Failed to sync templates");
        toast({
          title: "Error",
          description: "Failed to sync WhatsApp templates",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error syncing WhatsApp templates:", error);
      setSyncError(error.response?.data?.error || "Failed to sync templates");
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to sync templates",
        variant: "destructive"
      });
    } finally {
      setIsSyncingWhatsApp(false);
    }
  }

  // Fetch stored WhatsApp templates
  async function fetchStoredWhatsAppTemplates() {
    try {
      const response = await axios.get("/api/channels/whatsapp/templates");
      if (response.data.success) {
        setWhatsappTemplates(response.data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching stored WhatsApp templates:", error);
    }
  }

  // Fetch email templates
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

// Replace the existing handleDeleteTemplate function
async function handleDeleteTemplate(id: string, name: string) {
  setTemplateToDelete({ id, name });
  setDeleteConfirmOpen(true);
}

// Add this new function to handle the actual deletion
async function confirmDeleteTemplate() {
  if (!templateToDelete) return;

  try {
    await axios.delete(`/api/channels/templates?templateId=${templateToDelete.id}`);
    fetchTemplates();
    toast({
      title: "Success",
      description: `Template "${templateToDelete.name}" deleted successfully`
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    toast({
      title: "Error",
      description: "Failed to delete template",
      variant: "destructive"
    });
  } finally {
    setDeleteConfirmOpen(false);
    setTemplateToDelete(null);
  }
}
  // Insert placeholder
  const insertPlaceholder = useCallback((placeholder: string) => {
    if (templateType === "email") {
      const placeholderText = `{{${placeholder}}}`;
      setBody(prevBody => prevBody + placeholderText);
    } else {
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
    }
  }, [body, templateType]);

  // Dialog handlers
  function openNewTemplateDialog(type: "email" | "whatsapp" = "email") {
    setEditingId(null);
    setTemplateName("");
    setSubject("");
    setBody("");
    setTemplateType(type);
    setOpenDialog(true);
  }

  function openEditTemplateDialog(t: any) {
    setEditingId(t._id);
    setTemplateName(t.name);
    setSubject(t.subject || "");
    setBody(t.body);
    setTemplateType("email");
    setOpenDialog(true);
  }

  function handlePreviewTemplate(t: any) {
    setPreviewTemplate(t);
    setShowPreview(true);
  }

  // AI Template Generation Handler
  function handleAITemplateGenerated(template: { name: string; subject: string; body: string }) {
    setTemplateName(template.name);
    setSubject(template.subject);
    setBody(template.body);
    setTemplateType("email");
    setEditingId(null);
    setOpenAIDialog(false);
    setOpenDialog(true);
  }

  // Save template
  async function handleSaveTemplate() {
    try {
      setIsSaving(true);
      const payload = {
        name: templateName,
        body,
        type: templateType,
        ...(templateType === "email" && { subject })
      };

      if (editingId) {
        await axios.put("/api/channels/templates", { templateId: editingId, ...payload });
        toast({
          title: "Success",
          description: "Template updated successfully"
        });
      } else {
        await axios.post("/api/channels/templates", payload);
        toast({
          title: "Success",
          description: "Template created successfully"
        });
      }
      setOpenDialog(false);
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Initialize
  useEffect(() => {
    fetchConnectedAccounts();
    fetchTemplates();
  }, []);

  // Load stored WhatsApp templates when WABA is connected
  useEffect(() => {
    if (connectedWaba) {
      fetchStoredWhatsAppTemplates();
    }
  }, [connectedWaba]);

  // Filter templates
  const getCurrentTemplates = () => {
    if (templateTab === "whatsapp") {
      return whatsappTemplates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  };

  const filteredTemplates = getCurrentTemplates();

  return (
    <div className="min-h-screen p-6 space-y-8 mx-auto">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Channels</h1>
          <p className="text-muted-foreground mt-1">Connect communication channels and manage templates</p>
        </div>
        <MessageCircleMore className="h-8 w-8 text-primary" />
      </motion.div>

      <Separator className="my-6" />

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        {/* Tabs List */}
        <div className="flex justify-start">
          <TabsList className="grid grid-cols-2 w-full max-w-md gap-x-6 bg-accent">
            <TabsTrigger value="integrations" className="flex gap-2 items-center border-none">
              <Settings className="h-4 w-4" />
              <span>Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex gap-2 items-center border-none">
              <LayoutTemplate className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Email Integration Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Integration
                  </CardTitle>
                  <CardDescription>Connect your Google account for email automation</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {connectedEmail ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 text-white w-12">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(connectedEmail)}&background=4F46E5`} />
                        <AvatarFallback className="bg-primary text-white">
                         <h1 className="text-white"> {connectedEmail.substring(0, 2).toUpperCase()}</h1>
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{connectedEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          Connected on {connectedDate ? new Date(connectedDate).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Account successfully connected
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        No email account connected
                      </span>
                    </div>
                    <Button
                      onClick={handleConnectGoogle}
                      className="w-full gap-2"
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <FaGoogle className="h-4 w-4" />
                          Connect Google Account
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* WhatsApp Integration Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FaWhatsapp className="h-5 w-5 text-primary" />
                    WhatsApp Integration
                  </CardTitle>
                  <CardDescription>Connect your WhatsApp Business Account via Interakt</CardDescription>
                </div>
                {connectedWaba && (
                  <Button
                    onClick={syncWhatsAppTemplates}
                    variant="outline"
                    size="sm"
                    disabled={isSyncingWhatsApp}
                    className="gap-2"
                  >
                    {isSyncingWhatsApp ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Sync
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {connectedWaba ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <FaWhatsapp className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">WABA ID: {connectedWaba}</p>
                        <p className="text-xs text-muted-foreground">
                          Connected on {wabaConnectedDate ? new Date(wabaConnectedDate).toLocaleDateString() : ""}
                        </p>
                        {wabaLastSyncDate && (
                          <p className="text-xs text-muted-foreground">
                            Last synced: {new Date(wabaLastSyncDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        WhatsApp Business Account connected ({whatsappTemplates.length} templates)
                      </span>
                    </div>
                    {syncStatus && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-600 dark:text-blue-400">{syncStatus}</span>
                      </div>
                    )}
                    {syncError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-600 dark:text-red-400">{syncError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        No WhatsApp Business Account connected
                      </span>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter your WABA ID"
                        value={wabaId}
                        onChange={(e) => setWabaId(e.target.value)}
                        className="bg-muted/50"
                      />
                      <Button
                        onClick={handleConnectWaba}
                        className="w-full gap-2"
                        disabled={isConnectingWaba || !wabaId.trim()}
                      >
                        {isConnectingWaba ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4" />
                            Connect WABA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5 text-primary" />
                    Communication Templates
                  </CardTitle>
                  <CardDescription>Create and manage reusable communication templates</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setOpenAIDialog(true)}
                    variant="outline"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600 hover:text-white gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Generate with AI
                  </Button>
                  <Button
                    onClick={() => openNewTemplateDialog("email")}
                    className="group flex gap-2"
                  >
                    <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4">
                  {/* Template Type Tabs */}
                  <Tabs value={templateTab} onValueChange={setTemplateTab} className="mb-6">
                    <TabsList className="w-full bg-accent ">
                      <TabsTrigger value="email" className="flex-1 border-none gap-2">
                        <Mail className="h-4 w-4" />
                        Email Templates ({templates.length})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="whatsapp" 
                        className="flex-1 gap-2 border-none" 
                        disabled={!connectedWaba}
                      >
                        <FaWhatsapp className="h-4 w-4" />
                        WhatsApp Templates ({whatsappTemplates.length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search */}
                  <div className="relative mb-6">
                    <Input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>

               <ScrollArea className="h-[500px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">Loading templates...</p>
                        </div>
                      </div>
                    ) : templateTab === "whatsapp" && !connectedWaba ? (
                      <div className="text-center py-12 space-y-4">
                        <div className="mx-auto bg-green-100 dark:bg-green-900/30 h-16 w-16 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
                        </div>
                        <h3 className="font-medium">Connect WhatsApp First</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Connect your WhatsApp Business Account to access templates.
                        </p>
                      </div>
                    ) : filteredTemplates.length === 0 ? (
                      <div className="text-center py-12 space-y-4">
                        <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center">
                          <LayoutTemplate className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-medium">
                          No {templateTab} templates found
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          {templateTab === "whatsapp"
                            ? "Sync your templates from Interakt or create custom ones."
                            : "Create your first email template to streamline communication."
                          }
                        </p>
                        {templateTab === "email" && (
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={() => setOpenAIDialog(true)}
                              variant="outline"
                              className="gap-2"
                            >
                              <Brain className="h-4 w-4" />
                              Generate with AI
                            </Button>
                            <Button
                              onClick={() => openNewTemplateDialog("email")}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Create Manually
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader className="bg-muted sticky top-0 z-10">
                            <TableRow>
                              <TableHead className="w-[200px]">Template Name</TableHead>
                              {templateTab === "email" && <TableHead className="w-[180px]">Subject</TableHead>}
                              <TableHead className="w-[250px]">Content Preview</TableHead>
                              <TableHead className="w-[120px]">Created</TableHead>
                              <TableHead className="w-[120px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                        </Table>
                        
                        <ScrollArea className="h-[420px]">
                          <Table>
                            <TableBody>
                              {filteredTemplates.map((template, index) => (
                                <TableRow key={template._id || template.id} className="hover:bg-muted/50 transition-colors">
                                  <TableCell className="w-[200px] font-medium">
                                    <div className="truncate pr-2" title={template.name}>
                                      {template.name}
                                    </div>
                                  </TableCell>
                                  {templateTab === "email" && (
                                    <TableCell className="w-[180px]">
                                      <div className="truncate text-sm text-muted-foreground pr-2" title={template.subject}>
                                        {template.subject}
                                      </div>
                                    </TableCell>
                                  )}
                                  <TableCell className="w-[250px]">
                                    <div className="text-sm text-muted-foreground pr-2">
                                      <div className="line-clamp-2" title={template.body.replace(/{{[^}]+}}/g, '[...]').replace(/<[^>]*>/g, '')}>
                                        {template.body.replace(/{{[^}]+}}/g, '[...]').replace(/<[^>]*>/g, '').substring(0, 80)}
                                        {template.body.replace(/{{[^}]+}}/g, '[...]').replace(/<[^>]*>/g, '').length > 80 && '...'}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="w-[120px]">
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(template.createdAt || Date.now()).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: '2-digit'
                                      })}
                                    </span>
                                  </TableCell>
                                  <TableCell className="w-[120px]">
                                    <div className="flex space-x-1">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              onClick={() => handlePreviewTemplate(template)}
                                              className="h-8 w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Preview template</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      {templateTab === "email" && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => openEditTemplateDialog(template)}
                                                className="h-8 w-8 text-green-500 hover:bg-green-50 dark:hover:bg-green-950"
                                              >
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit template</TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}

                                      {templateTab === "email" && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDeleteTemplate(template._id, template.name)}
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete template</TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              onClick={() => {
                                                navigator.clipboard.writeText(template.body);
                                                toast({
                                                  title: "Copied!",
                                                  description: "Template content copied to clipboard"
                                                });
                                              }}
                                              className="h-8 w-8 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-950"
                                            >
                                              <Copy className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Copy content</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* AI Email Template Generation Dialog */}
      <Dialog open={openAIDialog} onOpenChange={setOpenAIDialog}>
        <DialogContent className="max-w-2xl z-[100] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Generate Email Template with AI
            </DialogTitle>
          </DialogHeader>
          <AIEmailTemplateModal
            onTemplateGenerated={handleAITemplateGenerated}
            onClose={() => setOpenAIDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create/Edit Template Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl h-fit max-h-screen overflow-y-scroll scrollbar-hide z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {templateType === "whatsapp" ? (
                <MessageCircle className="h-5 w-5 text-green-500" />
              ) : (
                <LayoutTemplate className="h-5 w-5 text-primary" />
              )}
              {editingId ? `Edit ${templateType === "whatsapp" ? "WhatsApp" : "Email"} Template` : `Create New ${templateType === "whatsapp" ? "WhatsApp" : "Email"} Template`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <Label htmlFor="templateName" className="text-base">Template Name</Label>
              <div className="mt-1.5">
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter a name for your template"
                  className="bg-muted/50"
                />
              </div>
            </div>

            {templateType === "email" && (
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
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="body" className="text-base">
                  {templateType === "whatsapp" ? "Message Content" : "Email Body"}
                </Label>
              </div>

              {templateType === "email" ? (
                <RichTextEditor
                  value={body}
                  onChange={setBody}
                  placeholder="Type your email content here..."
                  minHeight="400px"
                />
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 text-sm border-b">
                    <Badge variant="outline" className="bg-primary/10 text-primary px-2 py-0.5 mr-1.5">
                      Tips
                    </Badge>
                    Use the placeholder buttons below to insert dynamic content
                  </div>
                  <Textarea
                    id="body"
                    ref={textAreaRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your message content. Insert placeholders using the buttons below."
                    className="min-h-[300px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none"
                  />
                </div>
              )}
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
              onClick={() => setOpenDialog(false)}
              className="sm:mr-auto"
            >
              Cancel
            </Button>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => handlePreviewTemplate({ name: templateName, subject, body, type: templateType })}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              <Button
                className="gap-2 min-w-[120px]"
                onClick={handleSaveTemplate}
                disabled={isSaving || !templateName || !body || (templateType === "email" && !subject)}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl z-[100] max-h-screen h-fit m-auto overflow-y-scroll scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex items-center gap-2">
                {previewTemplate?.type === "whatsapp" ? (
                  <MessageCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Eye className="h-5 w-5 text-primary" />
                )}
                {previewTemplate?.type === "whatsapp" ? "WhatsApp" : "Email"} Template Preview
              </span>
              <Badge variant="outline" className="ml-2">
                {previewTemplate?.name}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {previewTemplate?.subject && (
              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Subject:</div>
                <div className="font-medium">{previewTemplate.subject}</div>
              </div>
            )}

            <div className="bg-background p-4 rounded-lg border min-h-[300px] max-h-[500px] overflow-auto">
              <div className="text-sm text-muted-foreground mb-3">
                {previewTemplate?.type === "whatsapp" ? "Message:" : "Body:"}
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {previewTemplate?.type === "email" ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
                    className="email-preview"
                  />
                ) : (
                  previewTemplate?.body.split('\n').map((line: string, i: number) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {line.split(/{{([^}]+)}}/g).map((segment, index) =>
                        index % 2 === 0 ? (
                          segment
                        ) : (
                          <Badge key={index} variant="outline" className="font-mono bg-primary/10 text-primary">
                            {`{{${segment}}}`}
                          </Badge>
                        )
                      )}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">
                Placeholders will be replaced with actual data when the {previewTemplate?.type === "whatsapp" ? "message" : "email"} is sent.
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
            {previewTemplate && previewTemplate.type !== "whatsapp" && (
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
            )}
            
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add this AlertDialog before the closing </div> of your component */}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2 text-red-500">
              <Trash2 className="h-5 w-5" />
              Delete Template
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete the template{' '}
              <span className="font-medium text-foreground">"{templateToDelete?.name}"</span>?
              <br /><br />
              This action cannot be undone and will permanently remove this template from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-red-500 hover:bg-red-600 text-white font-medium"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}