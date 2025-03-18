"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Calendar, Clock, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface Followup {
    _id: string;
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
    assignedTo?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function FollowupSection({ leadId }: { leadId: string }) {
    const [followups, setFollowups] = useState<Followup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newFollowup, setNewFollowup] = useState({
        description: "",
        type: "",
        followupDate: "",
        reminders: [],
    });

    useEffect(() => {
        fetchFollowups();
    }, [leadId]);

    const fetchFollowups = async () => {
        try {
            const response = await axios.get(`/api/leads/followups?leadId=${leadId}`);
            setFollowups(response.data);
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormInputChange = (field: string, value: string) => {
        setNewFollowup((prev) => ({ ...prev, [field]: value }));
    };

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post("/api/followups", { leadId, ...newFollowup });

            if (response.status === 201) {
                setFollowups((prev) => [...prev, response.data]);
                setIsDialogOpen(false);
                setNewFollowup({ description: "", type: "", followupDate: "", reminders: [] });
            }
        } catch (error) {
            console.error("Error creating follow-up:", error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Follow-ups</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default">New Follow-up</Button>
                    </DialogTrigger>
                    <DialogContent className="p-6">
                        <DialogHeader>
                            <DialogTitle>Create Follow-Up</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            <Input
                                label="Description"
                                value={newFollowup.description}
                                onChange={(e) => handleFormInputChange("description", e.target.value)}
                            />
                            <select
                                className="w-full bg-background border rounded px-3 py-2"
                                value={newFollowup.type}
                                onChange={(e) => handleFormInputChange("type", e.target.value)}
                            >
                                <option value="">Select Type</option>
                                <option value="Call">Call</option>
                                <option value="Email">Email</option>
                                <option value="WhatsApp">WhatsApp</option>
                            </select>
                            <Input
                                type="date"
                                label="Follow-up Date"
                                value={newFollowup.followupDate}
                                onChange={(e) => handleFormInputChange("followupDate", e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button type="submit" variant="default">
                                    Create
                                </Button>
                                <DialogClose asChild>
                                    <Button variant="destructive">Cancel</Button>
                                </DialogClose>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Follow-ups List */}
            {isLoading ? (
                <p>Loading follow-ups...</p>
            ) : followups.length === 0 ? (
                <p>No follow-ups available for this lead.</p>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {followups.map((followup) => {
                        const latestRemark =
                            followup.remarks.length > 0
                                ? followup.remarks[followup.remarks.length - 1]
                                : null;

                        return (
                            <Card className="p-4 space-y-2 cursor-pointer hover:border-primary">
                                <AccordionItem key={followup._id} value={followup._id}>
                                    <AccordionTrigger className="flex items-center justify-between">
                                        <div className="flex gap-4 items-center">
                                            <div className="flex items-center">
                                                <Clock className="h-4" />
                                                {format(new Date(followup.createdAt), "dd-MM-yyyy")}
                                            </div>
                                            <span className="">
                                                {formatDistanceToNow(new Date(followup.createdAt))} ago
                                            </span>
                                            <Badge>{followup.type}</Badge>
                                            <Badge>{followup.stage}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-primary">{followup.description}</p>
                                        <p className="text-white">
                                            Follow-up Date:{" "}
                                            <strong>{new Date(followup.followupDate).toLocaleString()}</strong>
                                        </p>

                                        {/* Follow-up Details */}
                                        <div className="flex justify-between mt-4 items-center">
                                            {followup.lead.assignedTo && (
                                                <div className="flex items-center gap-2">
                                                    <h1>Assigned To:</h1>
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="bg-primary">
                                                            {followup.lead.assignedTo.firstName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <p className="text-sm">
                                                        {followup.lead.assignedTo.firstName} {followup.lead.assignedTo.lastName}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Follow-up Remarks */}
                                        {latestRemark && (
                                            <div className="text-sm mt-4 ">
                                                <span className="font-bold">Follow-up Remarks:</span>
                                                <div className="border p-2 rounded flex justify-between items-center">
                                                    <p>{latestRemark.text}</p>
                                                    <Badge variant="secondary">
                                                        {formatDistanceToNow(new Date(latestRemark.timestamp))} ago
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reminders */}
                                        {followup.reminders.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold ">
                                                    Follow-up Reminders
                                                </p>
                                                {followup.reminders.map((reminder, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 bg-muted px-3 py-1 rounded"
                                                    >
                                                        <MessageSquare className="h-4 w-4 t" />
                                                        <p className="text-sm">
                                                            {reminder.notificationType} {reminder.type} {reminder.value}{" "}
                                                            {reminder.sent ? "(Sent)" : "(Pending)"}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );
}
