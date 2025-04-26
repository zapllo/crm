"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Icons
import {
    CheckCircle,
    Clock,
    Mail,
    MessageSquare,
    MessageSquareText,
    Pencil,
    Phone,
    Trash,
    CalendarIcon,
    AlertCircle,
    Info,
    Plus,
    RefreshCw,
    Filter,
    Calendar as CalendarIcon2,
    Loader2,
    Inbox,
    PlusCircle,
    User
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

// Components
import NewFollowupDialog from "../modals/followups/NewFollowup";
import EditFollowup from "../modals/followups/EditFollowup";

interface Followup {
    _id: string;
    leadId: string;
    followupId: string;
    type: string;
    description: string;
    followupDate: string;
    createdAt: string;
    stage: string;
    remarks: { text: string; timestamp: string }[];
    reminders: {
        notificationType: string;
        type: string;
        value: number;
        date: string;
        sent: boolean;
    }[];
    lead: {
        _id: any;
        assignedTo?: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    };
    assignedTo?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

// Helper function to safely format dates
const safeFormatDate = (dateString: string, formatString: string, fallback: string = "Invalid date") => {
    try {
        const date = new Date(dateString);
        if (!isValid(date)) return fallback;
        return format(date, formatString);
    } catch (error) {
        console.error("Date formatting error:", error);
        return fallback;
    }
};

// Helper function to safely calculate time distance
const safeFormatDistanceToNow = (dateString: string, options = {}) => {
    try {
        const date = new Date(dateString);
        if (!isValid(date)) return "some time ago";
        return formatDistanceToNow(date, options);
    } catch (error) {
        console.error("Date distance calculation error:", error);
        return "some time ago";
    }
};

export default function FollowupSection({ leadId }: { leadId: string }) {
    // State management
    const [followups, setFollowups] = useState<Followup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "pending" | "closed">("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
    const [editFollowup, setEditFollowup] = useState<Followup | null>(null);
    const [deleteFollowupId, setDeleteFollowupId] = useState<string | null>(null);
    const [remarkFollowupId, setRemarkFollowupId] = useState<string | null>(null);
    const [closingFollowupId, setClosingFollowupId] = useState<string | null>(null);
    const [remark, setRemark] = useState("");
    const [expandedFollowup, setExpandedFollowup] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);


    // Fetch followups on component mount
    useEffect(() => {
        if (leadId) {
            fetchFollowups();
        }
    }, [leadId]);

    // Function to fetch followups
    const fetchFollowups = async () => {
        if (!leadId) return;

        try {
            setIsLoading(true);
            const response = await axios.get(`/api/leads/followups?leadId=${leadId}`);
            setFollowups(response.data);
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to refresh followups
    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await fetchFollowups();
        } finally {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 600); // Small delay to show refresh animation
        }
    };

    // Function to add remark to a followup
    const handleAddRemark = async () => {
        if (!remarkFollowupId || !remark.trim()) return;

        const newRemark = {
            text: remark,
            timestamp: new Date().toISOString(),
        };

        try {
            await axios.patch(`/api/followups/${remarkFollowupId}`, {
                $push: { remarks: newRemark },
            });
            fetchFollowups();
            setRemark("");
            setRemarkFollowupId(null);
        } catch (error) {
            console.error("Error adding remark:", error);
        }
    };

    // Function to close a followup
    // Function to close a followup
    const handleCloseFollowup = async () => {
        if (!closingFollowupId || !remark.trim()) return;

        try {
            const followup = followups.find(f => f._id === closingFollowupId);
            if (!followup || !followup.lead?._id) return;

            // Special remark for closing the follow-up
            const closingRemark = {
                text: `Closed - ${remark}`,
                timestamp: new Date().toISOString(),
            };

            // Update the followup status to Closed
            await axios.patch(`/api/followups/${closingFollowupId}`, {
                stage: "Closed",
                $push: { remarks: closingRemark },
            });

            // Add to lead timeline with a stage that indicates this is a followup
            await axios.patch(`/api/leads/${followup.lead._id}`, {
                stage: "Followup", // Use a special stage name to indicate this is a followup
                action: `Closed ${followup.type} Followup`,
                remark: closingRemark.text,
            });

            fetchFollowups();
            setRemark("");
            setClosingFollowupId(null);
        } catch (error) {
            console.error("Error closing follow-up:", error);
        }
    };

    // Function to delete a followup
    const handleDeleteFollowup = async () => {
        if (!deleteFollowupId) return;

        try {
            await axios.delete(`/api/followups/${deleteFollowupId}`);
            fetchFollowups();
            setDeleteFollowupId(null);
        } catch (error) {
            console.error("Error deleting follow-up:", error);
        }
    };

    // Filter and sort followups
    const filteredFollowups = followups
        .filter(followup => {
            if (filter === "all") return true;
            if (filter === "pending") return followup.stage !== "Closed";
            if (filter === "closed") return followup.stage === "Closed";
            return true;
        })
        .sort((a, b) => {
            try {
                const dateA = new Date(a.followupDate).getTime();
                const dateB = new Date(b.followupDate).getTime();

                // Check if dates are valid
                if (isNaN(dateA) || isNaN(dateB)) {
                    return sortBy === "newest" ? -1 : 1; // Default sorting if dates are invalid
                }

                return sortBy === "newest" ? dateB - dateA : dateA - dateB;
            } catch (error) {
                console.error("Error sorting dates:", error);
                return 0;
            }
        });

    // Get type-specific badge styling
    const getFollowupTypeBadge = (type: string) => {
        switch (type) {
            case "WhatsApp":
                return "border-green-500 bg-green-500/20 hover:bg-green-500/20 text-green-700 dark:text-green-300";
            case "Call":
                return "border-blue-500 bg-blue-500/20 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300";
            case "Email":
                return "border-orange-500 bg-orange-500/20 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300";
            default:
                return "border-gray-500 bg-gray-500/20 hover:bg-gray-500/20";
        }
    };

    // Get stage-specific badge styling
    const getStageBadge = (stage: string) => {
        return stage === "Closed"
            ? "border-[#017a5b] bg-[#017a5b]/20 hover:bg-[#017a5b]/20 text-[#017a5b] dark:text-emerald-400"
            : "border-amber-500 bg-amber-500/20 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300";
    };

    // Get type-specific icon
    const getFollowupTypeIcon = (type: string) => {
        switch (type) {
            case "WhatsApp":
                return <FaWhatsapp className="h-4 w-4" />;
            case "Call":
                return <Phone className="h-4 w-4" />;
            case "Email":
                return <Mail className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    // Check if a date is past due
    const isPastDue = (followupDateString: string, stage: string): boolean => {
        try {
            if (stage === "Closed") return false;

            const followupDate = new Date(followupDateString);
            const today = new Date();

            // Check if date is valid
            if (!isValid(followupDate)) return false;

            // Compare dates (ignoring time)
            return (
                followupDate < today &&
                safeFormatDate(followupDateString, "yyyy-MM-dd") < safeFormatDate(today.toISOString(), "yyyy-MM-dd")
            );
        } catch (error) {
            console.error("Error checking past due date:", error);
            return false;
        }
    };

    return (
        <Card className="border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b px-6 py-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Follow-ups
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <NewFollowupDialog
                            leadId={leadId}
                            onFollowupAdded={fetchFollowups}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {/* Filters and controls */}
                <div className="flex flex-wrap gap-2 mb-4 justify-between">
                    <Tabs
                        value={filter}
                        onValueChange={(value) => setFilter(value as "all" | "pending" | "closed")}
                        className="w-auto"
                    >
                        <TabsList className="bg-muted/50 gap-4 ">
                            <TabsTrigger
                                value="all"
                                className="text-xs px-3 border-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950"
                            >
                                All
                            </TabsTrigger>
                            <TabsTrigger
                                value="pending"
                                className="text-xs px-3 border-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950"
                            >
                                Pending
                            </TabsTrigger>
                            <TabsTrigger
                                value="closed"
                                className="text-xs px-3 border-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950"
                            >
                                Closed
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <Select
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value as "newest" | "oldest")}
                        >
                            <SelectTrigger className="h-8 w-[130px] text-xs">
                                <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Refresh follow-ups</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Follow-ups list */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="overflow-hidden border-muted">
                                <CardContent className="p-0">
                                    <div className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <Skeleton className="h-6 w-24" />
                                                <Skeleton className="h-6 w-20" />
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                        <Skeleton className="h-8 w-full mt-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredFollowups.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                        <CalendarIcon2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <h3 className="font-medium text-lg mb-1">No follow-ups found</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                            {filter === "all"
                                ? "No follow-ups have been scheduled for this lead yet."
                                : filter === "pending"
                                    ? "No pending follow-ups found."
                                    : "No closed follow-ups found."}
                        </p>

                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="space-y-3">
                            {filteredFollowups.map((followup) => {
                                const latestRemark = followup.remarks.length > 0
                                    ? followup.remarks[followup.remarks.length - 1]
                                    : null;

                                const typeBadgeClass = getFollowupTypeBadge(followup.type);
                                const stageBadgeClass = getStageBadge(followup.stage);
                                const typeIcon = getFollowupTypeIcon(followup.type);

                                // Check if this followup is past due using our safe function
                                const isOverdue = isPastDue(followup.followupDate, followup.stage);

                                return (
                                    <motion.div
                                        key={followup._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="overflow-hidden shadow-sm border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                            <Accordion
                                                type="single"
                                                collapsible
                                                value={expandedFollowup === followup._id ? followup._id : undefined}
                                                onValueChange={(value) => setExpandedFollowup(value)}
                                                className="w-full"
                                            >
                                                <AccordionItem value={followup._id} className="border-none">
                                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                        <div className="flex flex-wrap items-center gap-2 w-full">
                                                            <div className="flex items-center gap-2 mr-auto">
                                                                {isOverdue && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Badge variant="outline" className="border-red-500 bg-red-500/10 text-red-500">
                                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                                    Overdue
                                                                                </Badge>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                This follow-up is past due
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}

                                                                <Badge variant="outline" className={typeBadgeClass}>
                                                                    <div className="flex items-center gap-1">
                                                                        {typeIcon}
                                                                        {followup.type}
                                                                    </div>
                                                                </Badge>

                                                                <Badge variant="outline" className={stageBadgeClass}>
                                                                    {followup.stage}
                                                                </Badge>

                                                                <div className="flex items-center text-xs text-muted-foreground">
                                                                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                                                    {safeFormatDate(followup.followupDate, "MMM d, yyyy", "Invalid date")}
                                                                </div>

                                                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                                                    {safeFormatDistanceToNow(followup.createdAt)} ago
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>

                                                    <AccordionContent className="px-4 pb-4 pt-0">
                                                        <div className="space-y-4">
                                                            {/* Description */}
                                                            <div className="p-3 bg-muted/30 rounded-md">
                                                                <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                                                                    <Info className="h-3.5 w-3.5 text-blue-500" />
                                                                    Description
                                                                </h4>
                                                                <p className="text-sm">{followup.description}</p>
                                                            </div>

                                                            {/* Follow-up Date and Assignment */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div className="bg-muted/30 p-3 rounded-md">
                                                                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                                                                        <CalendarIcon className="h-3.5 w-3.5 text-orange-500" />
                                                                        Follow-up Date
                                                                    </h4>
                                                                    <p className="text-sm">
                                                                        {safeFormatDate(followup.followupDate, "EEEE, MMMM d, yyyy", "Invalid date")}
                                                                        <span className="text-muted-foreground"> at </span>
                                                                        {safeFormatDate(followup.followupDate, "h:mm a", "Invalid time")}
                                                                    </p>
                                                                </div>

                                                                {followup.lead?.assignedTo && (
                                                                    <div className="bg-muted/30 p-3 rounded-md">
                                                                        <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                                                                            <User className="h-3.5 w-3.5 text-purple-500" />
                                                                            Assigned To
                                                                        </h4>
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="h-6 w-6">
                                                                                <AvatarFallback className="bg-primary text-xs">
                                                                                    {followup.lead.assignedTo.firstName?.[0] || "U"}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <p className="text-sm">
                                                                                {followup.lead.assignedTo.firstName} {followup.lead.assignedTo.lastName}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Reminders */}
                                                            {followup.reminders && followup.reminders.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                                                                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                                        Reminders
                                                                    </h4>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                        {followup.reminders.map((reminder, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-md"
                                                                            >
                                                                                {reminder.notificationType === "email" ? (
                                                                                    <Mail className="h-4 w-4 text-amber-500" />
                                                                                ) : (
                                                                                    <FaWhatsapp className="h-4 w-4 text-green-500" />
                                                                                )}
                                                                                <div className="flex-1">
                                                                                    <p className="text-sm flex gap-2 items-center capitalize">
                                                                                        {reminder.value} {reminder.type} before
                                                                                    </p>
                                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                                        {reminder.sent ? (
                                                                                            <Badge variant="outline" className="bg-green-50 text-green-600 text-xs h-5 px-1.5 border-green-200">
                                                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                                                Sent
                                                                                            </Badge>
                                                                                        ) : (
                                                                                            <Badge variant="outline" className="bg-amber-50 text-amber-600 text-xs h-5 px-1.5 border-amber-200">
                                                                                                <Clock className="h-3 w-3 mr-1" />
                                                                                                Pending
                                                                                            </Badge>
                                                                                        )}
                                                                                        <span className="text-xs text-muted-foreground">
                                                                                            {safeFormatDate(reminder.date, "MMM d, yyyy", "Invalid date")}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Latest Remark */}
                                                            {latestRemark && (
                                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-2 border-blue-500">
                                                                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                                                                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                                                                        Latest Remark
                                                                    </h4>
                                                                    <p className="text-sm">{latestRemark.text}</p>
                                                                    <div className="flex justify-end mt-1">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {safeFormatDistanceToNow(latestRemark.timestamp)} ago
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setRemarkFollowupId(followup._id);
                                                                    }}
                                                                >
                                                                    <MessageSquareText className="h-3.5 w-3.5" />
                                                                    Add Remark
                                                                </Button>

                                                                {followup.stage !== "Closed" && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setClosingFollowupId(followup._id);
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                                        Mark Complete
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeleteFollowupId(followup._id);
                                                                    }}
                                                                >
                                                                    <Trash className="h-3.5 w-3.5" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                )}
            </CardContent>

            {/* Add Remark Dialog */}
            {remarkFollowupId && (
                <AlertDialog open={!!remarkFollowupId} onOpenChange={(open) => !open && setRemarkFollowupId(null)}>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                Add Remark
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Add a note about progress or updates on this follow-up.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-4">
                            <Textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Enter your remark..."
                                className="min-h-[120px] resize-none"
                            />
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRemarkFollowupId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleAddRemark}
                                className=" gap-1"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Add Remark
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Mark Complete Dialog */}
            {closingFollowupId && (
                <AlertDialog open={!!closingFollowupId} onOpenChange={(open) => !open && setClosingFollowupId(null)}>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Mark Follow-up Complete
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Add a closing remark to complete this follow-up.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-4">
                            <Textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Enter closing remarks..."
                                className="min-h-[120px] resize-none"
                            />
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setClosingFollowupId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleCloseFollowup}
                                className=" gap-1"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Complete Follow-up
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteFollowupId && (
                <AlertDialog open={!!deleteFollowupId} onOpenChange={(open) => !open && setDeleteFollowupId(null)}>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                Delete Follow-up
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this follow-up? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteFollowupId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteFollowup}
                                className="bg-red-600 hover:bg-red-700 text-white gap-1"
                            >
                                <Trash className="h-4 w-4" />
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </Card>
    );
}

// Calendar Dialog Component
function MyCalendarDialog({
    isOpen,
    onClose,
    onSelectDate
}: {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    onSelectDate: (date: Date | undefined) => void
}) {
    const [tempDate, setTempDate] = useState<Date | undefined>(undefined);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="z-[100] w-fit">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-500" />
                        Select a Date
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4">
                    <Calendar
                        mode="single"
                        className="rounded-md border"
                        selected={tempDate}
                        onSelect={(day) => setTempDate(day)}
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onClose(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onSelectDate(tempDate);
                            onClose(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!tempDate}
                    >
                        Confirm Selection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
