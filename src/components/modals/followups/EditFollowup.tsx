"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Lead {
    _id: string;
    title: string;
}

interface Followup {
    _id: string;
    lead?: {
        _id?: string;
        title: string;
    };
    description: string;
    type: "Call" | "Email" | "WhatsApp";
    followupDate: string;
    stage: "Open" | "Closed";
    remarks: string[];
    reminders: { type: string; value?: number; date?: string }[];
}

interface EditFollowupProps {
    followup: Followup | null;
    onClose: () => void;
    onFollowupUpdated: () => void;
}

export default function EditFollowup({ followup, onClose, onFollowupUpdated }: EditFollowupProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [updatedFollowup, setUpdatedFollowup] = useState<Followup | null>(followup);

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        setUpdatedFollowup(followup);
    }, [followup]);

    const fetchLeads = async () => {
        try {
            const { data } = await axios.get("/api/leads/all");
            setLeads(data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const handleEditSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!updatedFollowup) return;

        try {
            await axios.patch(`/api/followups/${updatedFollowup._id}`, updatedFollowup);
            onFollowupUpdated();
            onClose();
        } catch (error) {
            console.error("Error updating follow-up:", error);
        }
    };

    return (
        <Dialog open={!!followup} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle>Edit Follow-Up</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-3">
                    {/* Lead Selection Dropdown */}
                    {/* <Select onValueChange={(value) => setUpdatedFollowup({ ...updatedFollowup!, lead: { _id: value, title: "" } })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Lead">
                                {updatedFollowup?.lead?._id ? leads.find(lead => lead._id === updatedFollowup?.lead?._id)?.title : "Select Lead"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                            {leads.map((lead) => (
                                <SelectItem key={lead._id} value={lead._id}>
                                    {lead.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select> */}

                    {/* Follow-up Description */}
                    <Textarea label="Description" value={updatedFollowup?.description || ""} onChange={(e) => setUpdatedFollowup({ ...updatedFollowup!, description: e.target.value })} placeholder="Description" />

                    {/* Follow-up Type Selection */}
                    <Select value={updatedFollowup?.type || ""} onValueChange={(value) => setUpdatedFollowup({ ...updatedFollowup!, type: value as "Call" | "Email" | "WhatsApp" })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Type">{updatedFollowup?.type}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Call">Call</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Follow-up Date */}
                    <Input type="datetime-local" value={updatedFollowup?.followupDate || ""} onChange={(e) => setUpdatedFollowup({ ...updatedFollowup!, followupDate: e.target.value })} />

                    {/* Reminders */}
                    <Select onValueChange={(value) => setUpdatedFollowup({ ...updatedFollowup!, reminders: [{ type: value, value: 2 }] })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Set Reminder">{updatedFollowup?.reminders[0]?.type}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="minutes">Minutes Before</SelectItem>
                            <SelectItem value="hours">Hours Before</SelectItem>
                            <SelectItem value="days">Days Before</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Stage Update */}
                    <Select value={updatedFollowup?.stage || ""} onValueChange={(value) => setUpdatedFollowup({ ...updatedFollowup!, stage: value as "Open" | "Closed" })}>
                        <SelectTrigger className="w-full">
                            <SelectValue>{updatedFollowup?.stage}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button type="submit" className="w-full bg-blue-500">Update Follow-Up</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
