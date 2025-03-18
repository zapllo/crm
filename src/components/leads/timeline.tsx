"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSyncAlt, FaPhone, FaComment, FaStickyNote, FaClock } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowsLeftRight } from "@tabler/icons-react";
import { format } from "date-fns";

interface TimelineEntry {
    type: "stage" | "followup" | "note";
    stage?: string;
    action: string;
    remark: string;
    timestamp: string; // ISO string
    followupType?: string;
}

export default function LeadTimeline({ leadId, onlyStages = false }: { leadId: string; onlyStages?: boolean }) {
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const response = await axios.get(`/api/leads/timeline?leadId=${leadId}`);
                setTimeline(
                    onlyStages ? response.data.filter((entry: TimelineEntry) => entry.type === "stage") : response.data
                );
            } catch (error) {
                console.error("Error fetching timeline:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimeline();
    }, [leadId, onlyStages]);

    console.log(timeline, 'timeline')

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        );
    }

    if (timeline.length === 0) {
        return <p className="text-muted-foreground">No timeline entries available for this lead.</p>;
    }

    // Map event type to icons
    const getIconForType = (type: string, followupType?: string) => {
        if (type === "stage") return <IconArrowsLeftRight className="text-primary text-lg h-5" />;
        if (type === "followup") return followupType === "Call" ? <FaPhone className="text-green-500 h-5 text-lg" /> : <FaComment className="text-primary -500 h-5 text-lg " />;
        if (type === "note") return <FaStickyNote className="text-yellow-500 h-5 text-lg" />;
        return <FaClock className="text-gray-400 text-lg h-5" />;
    };

    return (
        <Card className="p-6 border-none">
            <h3 className="text-lg font-semibold mb-4 text-primary">
            </h3>
            <div className="relative ml-20 border-l-2 border-[#FC8828] pl-6 space-y-6">
                {timeline.map((entry, index) => (
                    <div key={index} className="relative flex gap-4 items-start">
                        <p className="text-sm -ml-32 font-medium mt-2 w-16 absolute text-muted-foreground">
                            {format(new Date(entry.timestamp), "MMM E d hh:mm a")}
                        </p>

                        {/* Circle Icon */}
                        <div className="absolute -left-9 flex   items-center justify-center w-6 h-6 rounded-full bg-orange-100 border-4 border-[#FC8828] shadow-md">
                        </div>

                        {/* Timeline Content */}
                        <div className="space-y-1">

                            <div className="text-sm flex gap-2 items-center font-medium">
                                {getIconForType(entry.type, entry.followupType)}

                                {entry.type === "stage" ? (
                                    <span className="text-white font-semibold text-lg">{entry.stage}</span>
                                ) : (
                                    <span className="text-muted-foreground">Follow-up</span>
                                )}

                            </div>

                            {/* Moved By / Added By */}
                            <p className="text-sm absolute right-0  text-muted-foreground">
                                {entry.type === "stage" && entry.movedBy && `Moved By: ${entry.movedBy}`}
                                {entry.type === "followup" && entry.addedBy && `Added By: ${entry.addedBy}`}
                            </p>

                            <p className="text-sm">{entry.action}</p>
                            {entry.remark && <p className="text-xs text-muted-foreground">Remarks: {entry.remark}</p>}

                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
