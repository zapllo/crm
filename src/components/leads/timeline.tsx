"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";

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
    CheckCircle
} from "lucide-react";
import {
    FaSyncAlt,
    FaPhone,
    FaComment,
    FaStickyNote,
    FaClock,
    FaCheck,
    FaExclamationTriangle,
    FaWhatsapp
} from "react-icons/fa";
import { IconArrowsLeftRight } from "@tabler/icons-react";

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
    type: "stage" | "followup" | "note";
    stage?: string;
    action: string;
    remark: string;
    movedBy: string;
    addedBy: string;
    timestamp: string; // ISO string
    followupType?: string;
}

export default function LeadTimeline({ leadId, onlyStages = false }: { leadId: string; onlyStages?: boolean }) {
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timelineFilter, setTimelineFilter] = useState<"all" | "stage" | "followup" | "note">(
        onlyStages ? "stage" : "all"
    );
    const [isRefreshing, setIsRefreshing] = useState(false);

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
            }, 600); // Slight delay to show the refresh animation
        }
    };

    // Filter timeline entries based on selected filter
    const filteredTimeline = timeline.filter(entry => {
        if (timelineFilter === "all") return true;
        return entry.type === timelineFilter;
    });

    // Map event type to icons and colors
    // ... existing code ...

    // Map event type to icons and colors
    // Map event type to icons and colors
    // Map event type to icons and colors
    const getTimelineItemProps = (type: string, followupType?: string, entry?: any) => {
        // If type is available, use it, otherwise check stage name for backward compatibility
        if (type === "stage") {
            return {
                icon: <IconArrowsLeftRight className="h-5 w-5" />,
                color: "text-blue-500",
                bgColor: "bg-blue-100 dark:bg-blue-900/30",
                borderColor: "border-blue-300 dark:border-blue-700",
                label: "Stage Change"
            };
        }

        if (type === "followup" || (entry && entry.stage === "Followup")) {
            if (followupType === "Call" || (entry && entry.action && entry.action.includes("Call"))) {
                return {
                    icon: <FaPhone className="h-4 w-4" />,
                    color: "text-green-500",
                    bgColor: "bg-green-100 dark:bg-green-900/30",
                    borderColor: "border-green-300 dark:border-green-700",
                    label: "Call Followup"
                };
            }
            if (followupType === "Email" || (entry && entry.action && entry.action.includes("Email"))) {
                return {
                    icon: <MessageSquare className="h-5 w-5" />,
                    color: "text-amber-500",
                    bgColor: "bg-amber-100 dark:bg-amber-900/30",
                    borderColor: "border-amber-300 dark:border-amber-700",
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
    }
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
            <ScrollArea className="h-[calc(300vh-400px)] max-h-[500px]">
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
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                                            className="relative"
                                        >
                                            {/* Timeline node - larger, more prominent */}
                                            <div className={`absolute -left-[20px] top-0 w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-5 ${bgColor} ${borderColor} border-2 shadow-md z-10 transition-all duration-200 hover:scale-110`}>
                                                <span className={`${color} transition-transform`}>
                                                    {icon}
                                                </span>
                                            </div>

                                            {/* Timeline content - glass morphism effect */}
                                            <div className="ml-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl border border-blue-100/80 dark:border-blue-900/30 p-5 shadow-sm hover:shadow-md transition-all duration-200">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={`${color} ${bgColor} border-0 rounded-full px-3 py-0.5 font-medium`}
                                                        >
                                                            {label}
                                                        </Badge>

                                                        {entry.type === "stage" && entry.stage && (
                                                            <div className="flex items-center gap-1.5">
                                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-3">
                                                                    {entry.stage}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-full">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {timeAgo}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{formattedDate}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>

                                                <p className="text-sm font-medium">{entry.action}</p>

                                                {entry.remark && (
                                                    <div className="mt-3 text-sm bg-muted/20 p-3 rounded-lg text-muted-foreground border-l-2 border-blue-300 dark:border-blue-700">
                                                        <span className="font-medium">Remark:</span> {entry.remark}
                                                    </div>
                                                )}

                                                <div className="mt-3 flex justify-between items-center pt-2 border-t border-muted/30">
                                                    {entry.movedBy || entry.addedBy ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-800 shadow-sm">
                                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                                    {(entry.movedBy || entry.addedBy).charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs text-muted-foreground">
                                                                {entry.type === "stage"
                                                                    ? `Moved by ${entry.movedBy}`
                                                                    : `Added by ${entry.addedBy}`}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span></span>
                                                    )}
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
