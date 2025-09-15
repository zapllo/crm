"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

// Icons
import {
    ArrowRight,
    MessageSquare,
    RefreshCw,
    Clock,
    Calendar,
    Milestone,
    Star,
    User,
    Flag,
    CheckCircle,
    FlagIcon,
    Phone,
    Mail,
    FileText,
    Eye
} from "lucide-react";
import {
    FaSyncAlt,
    FaPhone,
    FaComment,
    FaStickyNote,
    FaClock,
    FaCheck,
    FaExclamationTriangle,
    FaWhatsapp,
    FaFileInvoiceDollar
} from "react-icons/fa";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimelineEntry {
    type: "stage" | "followup" | "note" | "quotation";
    stage?: string;
    action: string;
    remark: string;
    movedBy: string;
    addedBy: string;
    timestamp: string; // ISO string
    followupType?: string;
    quotationStatus?: string;
    quotationId?: string;
}

export default function LeadTimeline({ leadId, onlyStages = false }: { leadId: string; onlyStages?: boolean }) {
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timelineFilter, setTimelineFilter] = useState<"all" | "stage" | "followup" | "note" | "quotation">(
        onlyStages ? "stage" : "all"
    );
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchTimeline();
    }, [leadId, onlyStages]);

    // Function to fetch timeline data
    const fetchTimeline = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/leads/timeline?leadId=${leadId}`);

            // Filter based on user selection or prop
            const allEntries = response.data;
            if (onlyStages) {
                setTimeline(allEntries.filter((entry: TimelineEntry) => entry.type === "stage"));
                setTimelineFilter("stage");
            } else {
                setTimeline(allEntries);
            }
        } catch (error) {
            console.error("Error fetching timeline:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to refresh timeline data
    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await fetchTimeline();
        } finally {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 600);
        }
    };

    // Filter timeline entries based on selected filter
    const filteredTimeline = timeline.filter(entry => {
        if (timelineFilter === "all") return true;
        return entry.type === timelineFilter;
    });

    // Map event type to icons and colors
    const getTimelineItemProps = (type: string, followupType?: string, entry?: any) => {
        // Check if action contains "Note Added" for note detection
        if (entry && entry.action && entry.action.includes("Note Added")) {
            return {
                icon: <FaStickyNote className="h-4 w-4" />,
                color: "text-amber-500",
                bgColor: "bg-amber-100 dark:bg-amber-900/30",
                borderColor: "border-amber-300 dark:border-amber-700",
                label: "Note Added"
            };
        }

        // Handle quotation entries
        if (type === "quotation") {
            return {
                icon: <FaFileInvoiceDollar className="h-4 w-4" />,
                color: "text-blue-500",
                bgColor: "bg-blue-100 dark:bg-blue-900/30",
                borderColor: "border-blue-300 dark:border-blue-700",
                label: entry?.quotationStatus === 'sent' ? "Quotation Sent" : "Quotation Created"
            };
        }

        // If type is available, use it, otherwise check stage name for backward compatibility
        if (type === "stage") {
            return {
                icon: <FlagIcon className="h-5 w-5" />,
                color: "text-purple-500",
                bgColor: "bg-purple-100 dark:bg-purple-900/30",
                borderColor: "border-purple-300 dark:border-purple-700",
                label: "Stage Change"
            };
        }

        if (type === "followup" || (entry && entry.stage === "Followup")) {
            if (followupType === "Call" || (entry && entry.action && entry.action.includes("Call"))) {
                return {
                    icon: <Phone className="h-4 w-4" />,
                    color: "text-green-500",
                    bgColor: "bg-green-100 dark:bg-green-900/30",
                    borderColor: "border-green-300 dark:border-green-700",
                    label: "Call Followup"
                };
            }
            if (followupType === "Email" || (entry && entry.action && entry.action.includes("Email"))) {
                return {
                    icon: <Mail className="h-5 w-5" />,
                    color: "text-red-500",
                    bgColor: "bg-red-100 dark:bg-red-900/30",
                    borderColor: "border-red-300 dark:border-red-700",
                    label: "Email Followup"
                };
            }
            if (followupType === "Closed" || (entry && entry.action && entry.action.includes("Closed"))) {
                return {
                    icon: <FaCheck className="h-4 w-4" />,
                    color: "text-green-600",
                    bgColor: "bg-green-100 dark:bg-green-900/30",
                    borderColor: "border-green-300 dark:border-green-700",
                    label: "Followup Closed"
                };
            }
            if (followupType === "WhatsApp" || (entry && entry.action && entry.action.includes("WhatsApp"))) {
                return {
                    icon: <FaWhatsapp className="h-4 w-4" />,
                    color: "text-green-500",
                    bgColor: "bg-green-100 dark:bg-green-900/30",
                    borderColor: "border-green-300 dark:border-green-700",
                    label: "WhatsApp Followup"
                };
            }
            return {
                icon: <FaComment className="h-4 w-4" />,
                color: "text-purple-500",
                bgColor: "bg-purple-100 dark:bg-purple-900/30",
                borderColor: "border-purple-300 dark:border-purple-700",
                label: "Followup"
            };
        }

        if (type === "note" || (entry && entry.stage === "Note")) {
            return {
                icon: <FaStickyNote className="h-4 w-4" />,
                color: "text-amber-500",
                bgColor: "bg-amber-100 dark:bg-amber-900/30",
                borderColor: "border-amber-300 dark:border-amber-700",
                label: "Note Added"
            };
        }

        // Default case
        return {
            icon: <FaClock className="h-4 w-4" />,
            color: "text-gray-500",
            bgColor: "bg-gray-100 dark:bg-gray-800",
            borderColor: "border-gray-300 dark:border-gray-700",
            label: "Activity"
        };
    };

    // Handle quotation click
    const handleQuotationClick = (quotationId: string) => {
        router.push(`/quotations/${quotationId}`);
    };

    return (
        <Card className="border-blue-100 dark:border-blue-900 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/50 dark:to-indigo-950/50 border-b px-6 py-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        {onlyStages ? "Stage History" : "Activity Timeline"}
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        {!onlyStages && (
                            <Select
                                value={timelineFilter}
                                onValueChange={(value) => setTimelineFilter(value as any)}
                            >
                                <SelectTrigger className="h-8 w-[140px] text-xs bg-white/90 dark:bg-gray-900/90 rounded-full">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Activities</SelectItem>
                                    <SelectItem value="stage">Stage Changes</SelectItem>
                                    <SelectItem value="followup">Follow-ups</SelectItem>
                                    <SelectItem value="note">Notes</SelectItem>
                                    <SelectItem value="quotation">Quotations</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 rounded-full"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Refresh timeline</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <ScrollArea className="h-fit max-h-[700px] overflow-y-scroll ">
                    <div className="p-6">
                        {isLoading ? (
                            <div className="space-y-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="relative">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-[calc(100%-40px)] w-1 absolute top-12 left-5 transform -translate-x-1/2" />
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredTimeline.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                                <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-70" />
                                <h3 className="font-medium text-lg mb-1">No timeline entries</h3>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                                    {timelineFilter === "all"
                                        ? "No activity has been recorded for this lead yet."
                                        : `No ${timelineFilter} activities found for this lead.`}
                                </p>
                                {timelineFilter !== "all" && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setTimelineFilter("all")}
                                        className="gap-1 rounded-full"
                                    >
                                        <FaSyncAlt className="h-3 w-3" />
                                        Show All Activities
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="relative pl-6 space-y-8">
                                {/* Timeline line - more stylish gradient line */}
                                <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-gradient-to-b from-blue-500 via-indigo-400 to-blue-300 dark:from-blue-600 dark:via-indigo-500 dark:to-blue-400 rounded-full opacity-60"></div>

                                <AnimatePresence>
                                    {filteredTimeline.map((entry, index) => {
                                        const itemProps = getTimelineItemProps(entry.type, entry.followupType, entry);
                                        const { icon, color, bgColor, borderColor, label } = itemProps;

                                        const formattedDate = format(
                                            new Date(entry.timestamp),
                                            "MMM d, yyyy 'at' h:mm a"
                                        );
                                        const timeAgo = formatDistanceToNow(
                                            new Date(entry.timestamp),
                                            { addSuffix: true }
                                        );

                                        return (
                                            <motion.div
                                                key={`${entry.type}-${entry.timestamp}-${index}`}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -16 }}
                                                transition={{
                                                    duration: 0.3,
                                                    ease: "easeOut",
                                                    delay: index * 0.05
                                                }}
                                                className="relative group"
                                            >
                                                {/* Connection line between nodes */}
                                            
                                                {/* Timeline node - clean and professional */}
                                                <div className={`absolute -left-[20px] top-0 w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-5 ${bgColor} ${borderColor} border-2 shadow-sm group-hover:shadow-md transition-shadow duration-200 z-`}>
                                                    <span className={`${color}`}>
                                                        {icon}
                                                    </span>
                                                </div>

                                                {/* Timeline content - clean card design */}
                                                <div className={`ml-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${entry.type === 'quotation' && entry.quotationId ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20' : ''}`}
                                                     onClick={() => entry.type === 'quotation' && entry.quotationId && handleQuotationClick(entry.quotationId)}
                                                >
                                                    {/* Header section */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            {/* Clean, professional badge */}
                                                            <Badge
                                                                variant="secondary"
                                                                className={`${color} ${bgColor} border-0 rounded-md px-3 py-1 font-medium text-xs`}
                                                            >
                                                                {label}
                                                            </Badge>

                                                            {/* Stage indicator */}
                                                            {entry.type === "stage" && entry.stage && !entry.action.includes("Note Added") && (
                                                                <div className="flex items-center gap-2">
                                                                    <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 rounded-md px-3 py-1 font-medium"
                                                                    >
                                                                        {entry.stage}
                                                                    </Badge>
                                                                </div>
                                                            )}

                                                            {/* Quotation status indicator */}
                                                            {entry.type === "quotation" && entry.quotationStatus && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                                                                        entry.quotationStatus === 'sent' 
                                                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                                                                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                                                                    }`}
                                                                >
                                                                    {entry.quotationStatus}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {/* Clean timestamp */}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1.5 rounded-md">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {timeAgo}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="left">
                                                                    <p>{formattedDate}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>

                                                    {/* Main action text */}
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed mb-3">
                                                        {entry.action}
                                                        {entry.type === 'quotation' && entry.quotationId && (
                                                            <Eye className="inline-block ml-2 h-3 w-3 text-blue-500" />
                                                        )}
                                                    </p>

                                                    {/* Remark section - clean and minimal */}
                                                    {entry.remark && (
                                                        <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border-l-3 border-blue-500">
                                                            <div className="flex items-start gap-2">
                                                                <MessageSquare className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                                                        {entry.type === 'quotation' ? 'Details' : 'Remark'}
                                                                    </span>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                        {entry.remark}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Footer with user info */}
                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                                                        {entry.movedBy || entry.addedBy ? (
                                                            <div className="flex items-center gap-2.5">
                                                                <Avatar className="h-6 w-6 border border-gray-200 dark:border-gray-600">
                                                                    <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                                                                        {(entry.movedBy || entry.addedBy).charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                    {entry.type === "stage" ? "Moved by" : 
                                                                     entry.type === "quotation" ? "Created by" : "Added by"} {entry.movedBy || entry.addedBy}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div></div>
                                                        )}

                                                        {/* Subtle action indicator */}
                                                        <div className={`p-1.5 rounded ${bgColor.replace('100', '50')} ${color} opacity-60`}>
                                                            {entry.type === "stage" && !entry.action.includes("Note Added") && <ArrowRight className="h-3 w-3" />}
                                                            {entry.action.includes("Note Added") && <FaStickyNote className="h-3 w-3" />}
                                                            {entry.type === "followup" && <MessageSquare className="h-3 w-3" />}
                                                            {entry.type === "quotation" && <FaFileInvoiceDollar className="h-3 w-3" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}