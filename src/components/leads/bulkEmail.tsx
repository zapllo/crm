'use client'
// Add these imports at the top
import {
    Mail,
    Copy,
    Eye,
    Sparkles,
    RefreshCw,
    LayoutTemplate,
    Send
} from "lucide-react";
// Add useCallback to the imports at the top
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion"; // Add this if missing
import { Button } from "@/components/ui/button"; // Add any other missing UI components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";

interface Lead {
    assignedTo: any;
    _id: string;
    leadId: string;
    title: string;
    description?: string;
    product?: string;
    contact?: any;
    amount?: number;
    closeDate?: string;
    stage?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    company?: string;
}

// Add this at the bottom of your file
export default function BulkEmailDialog({
    isOpen,
    onClose,
    selectedLeads,
}: {
    isOpen: boolean;
    onClose: () => void;
    selectedLeads: Lead[];
}) {
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeField, setActiveField] = useState<"subject" | "body">("body");

    // Refs
    const subjectRef = useRef<HTMLInputElement | null>(null);
    const bodyRef = useRef<HTMLTextAreaElement | null>(null);

    // Define placeholders
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

    // 1) Load templates on dialog open
    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    async function fetchTemplates() {
        setIsLoading(true);
        try {
            const res = await axios.get("/api/channels/templates");
            setTemplates(res.data);
        } catch (err) {
            console.error("Error fetching templates", err);
            toast({
                title: "Error loading templates",
                description: "Failed to load email templates",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // 2) Template selection
    async function handleTemplateSelect(templateId: string) {
        const found = templates.find((t) => t._id === templateId);
        if (found) {
            setSubject(found.subject);
            setBody(found.body);
        }
    }

    // 3) Insert placeholder at cursor position
    const insertPlaceholder = useCallback((placeholder: string) => {
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
    }, [activeField, subject, body]);

    // 4) Send emails
    async function handleSendEmails() {
        if (!subject || !body) {
            toast({
                title: "Missing information",
                description: "Please provide both subject and body for your email",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSending(true);

            // Filter out leads without contact emails
            const validLeads = selectedLeads.filter(lead =>
                lead.contact?.email && lead.contact.email !== 'N/A'
            );

            if (validLeads.length === 0) {
                toast({
                    title: "No valid recipients",
                    description: "None of the selected leads have valid contact emails",
                    variant: "destructive",
                });
                return;
            }

            // Send emails to all valid leads
            const results = await Promise.all(
                validLeads.map(async (lead) => {
                    try {
                        await axios.post("/api/channels/sendEmail", {
                            leadId: lead._id,
                            to: lead.contact.email,
                            subject,
                            body,
                        });

                        return { success: true, leadId: lead._id };
                    } catch (error) {
                        console.error("Error sending email to lead:", lead._id, error);
                        return {
                            success: false,
                            leadId: lead._id,
                            error: "Failed to send email"
                        };
                    }
                })
            );

            // Determine results
            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (successCount === results.length) {
                toast({
                    title: "Email sent successfully",
                    description: `Email sent to ${successCount} lead${successCount !== 1 ? 's' : ''}`,
                });
                onClose();
            } else if (successCount > 0) {
                toast({
                    title: "Partially successful",
                    description: `Sent to ${successCount} lead${successCount !== 1 ? 's' : ''}, ${failCount} failed`,
                    variant: "default",
                });
            } else {
                toast({
                    title: "Failed to send emails",
                    description: "No emails were sent. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error in bulk email sending:", error);
            toast({
                title: "Email sending failed",
                description: "There was an error sending your emails",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[90vh] overflow-y-scroll scrollbar-hide z-[100]">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-500" />
                        Send Email to {selectedLeads.length} Selected Leads
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Recipients */}
                    <div>
                        <Label htmlFor="recipients" className="text-base">Recipients</Label>
                        <div className="mt-1.5 bg-gray-50 dark:bg-gray-900/50 rounded-md border p-3">
                            <div className="flex flex-wrap gap-2">
                                {selectedLeads.map(lead => (
                                    <Badge
                                        key={lead._id}
                                        variant="secondary"
                                        className={`py-1 ${!lead.contact?.email || lead.contact.email === 'N/A' ? 'line-through opacity-50' : ''}`}
                                    >
                                        {lead.contact?.firstName} {lead.contact?.lastName}
                                        {!lead.contact?.email || lead.contact.email === 'N/A' ?
                                            <span className="ml-1 text-red-500">(no email)</span> :
                                            <span className="ml-1 text-muted-foreground">&lt;{lead.contact.email}&gt;</span>
                                        }
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                * Emails will only be sent to leads with valid contact emails
                            </p>
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div>
                        <Label className="text-base">Email Template (Optional)</Label>
                        <div className="mt-1.5">
                            <Select onValueChange={handleTemplateSelect}>
                                <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50">
                                    <SelectValue placeholder="Choose a template or create from scratch" />
                                </SelectTrigger>
                                <SelectContent className="z-[100]">
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
                                            <SelectItem className="hover:bg-accent" key={t._id} value={t._id}>
                                                {t.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
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
                        onClick={onClose}
                        className="sm:mr-auto"
                    >
                        Cancel
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Preview functionality would go here
                                toast({
                                    title: "Preview not available",
                                    description: "Preview is not available for bulk emails",
                                    variant: "default",
                                });
                            }}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>

                        <Button
                            className="gap-2 min-w-[120px]"
                            onClick={handleSendEmails}
                            disabled={isSending || !subject || !body}
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
    );
}