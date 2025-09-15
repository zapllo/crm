"use client";

import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlarmClock, CalendarDays, Check, Clock, Edit, Loader2, Mail, Phone, PhoneCall, Plus, User2, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { FaWhatsapp } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

interface Lead {
    _id: string;
    title: string;
    leadId: string;
    contact: {
        firstName: string;
        whatsappNumber: string;
        email: string;
    }
}

interface Reminder {
    notificationType: "email" | "whatsapp";
    value: number;
    type: "minutes" | "hours" | "days";
}

interface Followup {
    leadId: string;
    description: string;
    type: string;
    followupDate: string;
    stage: string;
    reminders: Reminder[];
}

export interface AddFollowupRef {
  open: () => void;
  close: () => void;
}

interface AddFollowupWrapperProps {
  onFollowupAdded?: () => void;
}

export const AddFollowupWrapper = forwardRef<AddFollowupRef, AddFollowupWrapperProps>(
  ({ onFollowupAdded }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [newFollowup, setNewFollowup] = useState<Followup>({
        leadId: "",
        description: "",
        type: "Call",
        followupDate: "",
        stage: "Open",
        reminders: [],
    });
    const { toast } = useToast();
    
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [tempReminders, setTempReminders] = useState<Reminder[]>([]);
    const [reminderType, setReminderType] = useState<"email" | "whatsapp">("email");
    const [reminderValue, setReminderValue] = useState<number>(1);
    const [timeUnit, setTimeUnit] = useState<"minutes" | "hours" | "days">("minutes");
    const [searchTerm, setSearchTerm] = useState("");
    const [sourceOpen, setSourceOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [editingReminderIndex, setEditingReminderIndex] = useState<number | null>(null);
    const [isDateTimeDialogOpen, setIsDateTimeDialogOpen] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
        fetchLeads();
      },
      close: () => {
        setIsOpen(false);
        resetForm();
      },
    }));

    const resetForm = () => {
        setNewFollowup({
            leadId: "",
            description: "",
            type: "Call",
            followupDate: "",
            stage: "Open",
            reminders: [],
        });
        setSelectedLead(null);
        setSearchTerm("");
        setTempReminders([]);
        setSelectedDateTime(undefined);
    };

    const fetchLeads = async () => {
        try {
            const { data } = await axios.get("/api/leads/all");
            setLeads(data);
        } catch (error) {
            console.error("Error fetching leads:", error);
            toast({
                title: "Error",
                description: "Failed to fetch leads",
                variant: "destructive",
            });
        }
    };

    const addReminder = () => {
        const newReminder = {
            notificationType: reminderType,
            value: reminderValue,
            type: timeUnit,
        };

        const duplicateReminder = tempReminders.some(
            (r) =>
                r.notificationType === newReminder.notificationType &&
                r.value === newReminder.value &&
                r.type === newReminder.type
        );

        if (duplicateReminder) {
            toast({
                title: "Duplicate reminder",
                description: "This reminder already exists",
                variant: "destructive",
            });
            return;
        }

        setTempReminders((prevReminders) => [...prevReminders, newReminder]);
        setReminderValue(1);
    };

    const removeReminder = (index: number) => {
        setTempReminders((prevReminders) =>
            prevReminders.filter((_, i) => i !== index)
        );
    };

    const handleSaveReminders = () => {
        setNewFollowup((prev) => ({
            ...prev,
            reminders: tempReminders,
        }));

        toast({
            title: "Success",
            description: "Reminders saved successfully",
            variant: "default",
        });
        setIsReminderModalOpen(false);
    };

    const openReminderModal = (isOpen: boolean) => {
        setIsReminderModalOpen(isOpen);
        if (isOpen) {
            setTempReminders([...newFollowup.reminders]);
        }
    };

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!newFollowup.leadId || !newFollowup.description || !newFollowup.followupDate) {
            toast({
                title: "Missing fields",
                description: "Please fill all required fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await axios.post("/api/followups", newFollowup);
            if (onFollowupAdded) {
                onFollowupAdded();
            }
            resetForm();
            toast({
                title: "Success",
                description: "Follow-up created successfully!",
                variant: "default",
            });
            setIsLoading(false);
            setIsOpen(false);
        } catch (error) {
            console.error("Error creating follow-up:", error);
            toast({
                title: "Error",
                description: "Failed to create follow-up.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    const handleSourceToggle = () => setSourceOpen((prevState) => !prevState);
    const handleSourceClose = () => setSourceOpen(false);

    const handleSelectLead = (lead: Lead) => {
        setSelectedLead(lead);
        setNewFollowup((prev) => ({
            ...prev,
            leadId: lead._id,
        }));
        handleSourceClose();
    };

    const filteredLeads = leads.filter(
        (lead) =>
            lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact.whatsappNumber.includes(searchTerm)
    );

    const handleDateTimeChange = (date: Date) => {
        setSelectedDateTime(date);
    };

    const handleDateTimeConfirm = () => {
        if (selectedDateTime) {
            setNewFollowup((prev) => ({
                ...prev,
                followupDate: selectedDateTime.toISOString(),
            }));
            setIsDateTimeDialogOpen(false);
        }
    };

    return (
      <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg p-6 z-[100]">
                <DialogHeader>
                    <DialogTitle>Create Follow-up</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* Lead Selection Button */}
                    <div className="relative">
                        <button
                            type="button"
                            className="p-2 text-sm flex border items-center bg-transparent text-muted-foreground focus:border-primary justify-between w-full text-start rounded"
                            onClick={handleSourceToggle}
                        >
                            {selectedLead ? `${selectedLead.title} - ${selectedLead.contact.firstName}` : "Select Customer *"}
                        </button>

                        {/* Lead Select Popup */}
                        {sourceOpen && (
                            <div className="absolute dark:bg-[#020713] bg-white border rounded shadow-md p-4 top-[44px] w-full z-50">
                                <input
                                    placeholder="Search Leads"
                                    className="h-8 text-xs px-4 mb-2 w-full border dark:border-border dark:bg-[#282D32] focus:border-[#815bf5] outline-none rounded"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                {filteredLeads.length === 0 ? (
                                    <div className="dark:text-white p-2 text-sm">No leads found</div>
                                ) : (
                                    <div className="w-full text-sm dark:text-white max-h-40 overflow-y-scroll scrollbar-hide">
                                        {filteredLeads.map((lead) => (
                                            <div
                                                key={lead._id}
                                                className="cursor-pointer p-2 hover:bg-accent items-center mb-1 rounded"
                                                onClick={() => handleSelectLead(lead)}
                                            >
                                                <h1>
                                                    <Badge className="bg-primary text-xs py-0 text-primary-foreground">{lead.leadId}</Badge>
                                                    <span className="px-2 dark:text-muted-foreground text-black text-xs">
                                                        {lead.title}
                                                    </span>
                                                </h1>
                                                <h2 className="text-xs px-2 mt-1 flex gap-1 items-center text-muted-foreground">
                                                    <User2 className="h-4 text-primary" /> {lead.contact.firstName} | 
                                                    <Phone className="h-3 text-primary" /> {lead.contact.whatsappNumber} |
                                                    <Mail className="h-3 text-primary" /> {lead.contact.email}
                                                </h2>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <Textarea 
                        className="text-sm" 
                        placeholder="Description *" 
                        value={newFollowup.description} 
                        onChange={(e) => setNewFollowup({ ...newFollowup, description: e.target.value })} 
                    />

                    {/* Followup Type */}
                    <div className="flex justify-between items-center gap-4">
                        <h1 className="text-muted-foreground text-sm">Followup Type</h1>
                        <Tabs defaultValue="Call" onValueChange={(value) => setNewFollowup({ ...newFollowup, type: value })}>
                            <TabsList className="w-full gap-2">
                                <TabsTrigger value="Email" className="gap-1 flex items-center">
                                    <Mail className="h-4" /> Email
                                </TabsTrigger>
                                <TabsTrigger value="Call" className="gap-1 flex items-center">
                                    <PhoneCall className="h-4" />Call
                                </TabsTrigger>
                                <TabsTrigger value="WhatsApp" className="gap-2 flex items-center">
                                    <FaWhatsapp className="scale-125" /> WhatsApp
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Date & Time */}
                    <div className="flex justify-start bg-muted/40 hover:bg-muted/20 rounded items-start">
                        <Button 
                            className="bg-transparent gap-2 w-full px-2 text-start justify-start flex dark:hover:text-white text-muted-foreground items-center border hover:bg-transparent" 
                            type="button" 
                            onClick={() => setIsDateTimeDialogOpen(true)}
                        >
                            <CalendarDays className="h-4" />
                            {newFollowup.followupDate
                                ? new Date(newFollowup.followupDate).toLocaleString()
                                : "Set Followup Date & Time *"}
                        </Button>
                    </div>

                    {/* Reminders */}
                    <div className="flex justify-start bg-muted/40 hover:bg-muted/20 rounded items-start">
                        <Button 
                            className="bg-transparent gap-2 w-full px-2 text-start justify-start flex text-muted-foreground items-center border hover:bg-transparent" 
                            type="button" 
                            variant="outline" 
                            onClick={() => openReminderModal(true)}
                        >
                            <Clock className="h-4" />
                            {newFollowup.reminders && newFollowup.reminders.length > 0 ? `${newFollowup.reminders.length} Reminders Added ` : "Set Followup Reminders"}
                        </Button>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/80" disabled={isLoading}>
                        {isLoading ? <Loader2 className="text-white animate-spin"/> : "Add Follow-up"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>

        {/* Reminder Modal */}
        <Dialog open={isReminderModalOpen} onOpenChange={openReminderModal}>
            <DialogContent className="max-w-lg p-6 z-[100]">
                <DialogHeader>
                    <DialogTitle>Set Reminders</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2">
                    <Select value={reminderType} onValueChange={(value: "email" | "whatsapp") => setReminderType(value)}>
                        <SelectTrigger className="">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='z-[100]'>
                            <SelectItem className="hover:bg-accent" value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem className="hover:bg-accent" value="email">Email</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        type="number"
                        value={reminderValue}
                        onChange={(e) => setReminderValue(Number(e.target.value))}
                        min="1"
                        className=""
                    />

                    <Select value={timeUnit} onValueChange={(value: "minutes" | "hours" | "days") => setTimeUnit(value)}>
                        <SelectTrigger className="">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='z-[100]'>
                            <SelectItem className="hover:bg-accent" value="minutes">Minutes</SelectItem>
                            <SelectItem className="hover:bg-accent" value="hours">Hours</SelectItem>
                            <SelectItem className="hover:bg-accent" value="days">Days</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button className="rounded-full h-10 w-10 p-2" onClick={addReminder}><Plus /></Button>
                </div>

                {/* Displaying Added Reminders */}
                <ul className="space-y-2">
                    {tempReminders.map((reminder, index) => (
                        <li key={index} className="flex justify-between items-center border-b py-2">
                            <div className="flex items-center gap-2">
                                {reminder.notificationType === "email" ? (
                                    <Mail className="h-6 text-red-800 w-6" />
                                ) : (
                                    <FaWhatsapp className="h-6 text-green-500 w-6" />
                                )}
                                <span>
                                    {reminder.value} {reminder.type}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => removeReminder(index)}>
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </li>
                    ))}
                </ul>

                <Button onClick={handleSaveReminders} className="w-full">Save Reminders</Button>
            </DialogContent>
        </Dialog>

        {/* Date-Time Picker Dialog */}
        <Dialog open={isDateTimeDialogOpen} onOpenChange={setIsDateTimeDialogOpen}>
            <DialogContent className="max-w-md p-6 m-auto z-[100]">
                <DialogHeader>
                    <DialogTitle>Select Date & Time</DialogTitle>
                </DialogHeader>
                <DateTimePicker value={selectedDateTime} onChange={handleDateTimeChange} />
                <Button className="mt-4" onClick={handleDateTimeConfirm}>
                    Confirm
                </Button>
            </DialogContent>
        </Dialog>
      </>
    );
  }
);

AddFollowupWrapper.displayName = "AddFollowupWrapper";