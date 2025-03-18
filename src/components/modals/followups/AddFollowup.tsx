"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlarmClock, Plus, X } from "lucide-react";

interface Lead {
    _id: string;
    title: string;
}

interface AddFollowupProps {
    onFollowupAdded: () => void;
}

export default function AddFollowup({ onFollowupAdded }: AddFollowupProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [newFollowup, setNewFollowup] = useState({
        leadId: "",
        description: "",
        type: "",
        followupDate: "",
        stage: "Open",
        reminders: [],
    });

    // Reminder state
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [tempReminders, setTempReminders] = useState<any[]>([]);
    const [reminderType, setReminderType] = useState<"email" | "whatsapp">("email");
    const [reminderValue, setReminderValue] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<"minutes" | "hours" | "days">("minutes");

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data } = await axios.get("/api/leads/all");
            setLeads(data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    // Add Reminder
    const addReminder = () => {
      

        const newReminder = {
            notificationType: reminderType,
            value: reminderValue,
            type: timeUnit,
        };

        // Check for duplicate reminders
        const duplicateReminder = tempReminders.some(
            (r) =>
                r.notificationType === newReminder.notificationType &&
                r.value === newReminder.value &&
                r.type === newReminder.type
        );

        if (duplicateReminder) {
            alert("Duplicate reminders are not allowed");
            return;
        }

        setTempReminders((prevReminders) => [...prevReminders, newReminder]);
    };

    // Remove Reminder
    const removeReminder = (index: number) => {
        setTempReminders((prevReminders) =>
            prevReminders.filter((_, i) => i !== index)
        );
    };

    // Save Reminders
    const handleSaveReminders = () => {
        setNewFollowup((prev) => ({
            ...prev,
            reminders: tempReminders, // Save reminders
        }));
        alert("Reminders saved successfully");
        setIsReminderModalOpen(false);
    };

    // Open Reminder Modal (Fixes Unexpected Reset Issue)
    const openReminderModal = (isOpen: boolean) => {
        setIsReminderModalOpen(isOpen);
        if (isOpen) {
            setTempReminders([...newFollowup.reminders]); // Load existing reminders
        }
    };

    // Submit Followup
    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await axios.post("/api/followups", newFollowup);
            onFollowupAdded();
            setNewFollowup({
                leadId: "",
                description: "",
                type: "",
                followupDate: "",
                stage: "Open",
                reminders: [],
            });
            alert("Follow-up created successfully!");
        } catch (error) {
            console.error("Error creating follow-up:", error);
            alert("Failed to create follow-up.");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="flex gap-1">+ Follow-up</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg p-6">
                <DialogHeader>
                    <DialogTitle>Create Follow-Up</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-3">
                    {/* Lead Selection Dropdown */}
                    <Select onValueChange={(value) => setNewFollowup({ ...newFollowup, leadId: value })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Lead" />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                            {leads.map((lead) => (
                                <SelectItem key={lead._id} value={lead._id}>
                                    {lead.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Follow-up Description */}
                    <Input label="Description" value={newFollowup.description} onChange={(e) => setNewFollowup({ ...newFollowup, description: e.target.value })} />

                    {/* Follow-up Type Selection */}
                    <Select onValueChange={(value) => setNewFollowup({ ...newFollowup, type: value })}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Call">Call</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Follow-up Date */}
                    <Input type="datetime-local" value={newFollowup.followupDate} onChange={(e) => setNewFollowup({ ...newFollowup, followupDate: e.target.value })} />

                    {/* Reminder Button */}
                    <Button type="button" variant="outline" onClick={() => setIsReminderModalOpen(true)}>
                        Set Reminders
                    </Button>

                    <Button type="submit" className="w-full bg-[#017A5B]">Create Follow-Up</Button>
                </form>
            </DialogContent>

            {/* Reminder Dialog */}
            <Dialog open={isReminderModalOpen} onOpenChange={openReminderModal}>
                <DialogContent className="max-w-lg mx-auto p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AlarmClock className="h-6 w-6" />
                            <DialogTitle>Add Task Reminders</DialogTitle>
                        </div>
                    </div>
                    <Separator />

                    {/* Reminder Input */}
                    <div className="flex gap-2 items-center mb-4">
                        <Select value={reminderType} onValueChange={(value) => setReminderType(value as "email" | "whatsapp")}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input type="number" value={reminderValue} onChange={(e) => setReminderValue(Number(e.target.value))} />

                        <Select value={timeUnit} onValueChange={(value) => setTimeUnit(value as "minutes" | "hours" | "days")}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={addReminder}><Plus /></Button>
                    </div>

                    {/* Displaying Added Reminders */}
                    <ul>
                        {tempReminders.map((reminder, index) => (
                            <li key={index} className="flex justify-between items-center">
                                {reminder.notificationType} - {reminder.value} {reminder.type}
                                <Button variant="ghost" onClick={() => removeReminder(index)}><X /></Button>
                            </li>
                        ))}
                    </ul>

                    <Button onClick={handleSaveReminders}>Save Reminders</Button>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
