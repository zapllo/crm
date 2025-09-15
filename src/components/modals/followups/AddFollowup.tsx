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
    DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlarmClock, CalendarDays, Check, Clock, Edit, Loader2, Mail, Phone, PhoneCall, Plus, User2, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { FaWhatsapp } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Textarea } from "@/components/ui/textarea";

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

interface AddFollowupProps {
    onFollowupAdded: () => void;
}

export default function AddFollowup({ onFollowupAdded }: AddFollowupProps) {
    // Add these states at the top of your component:
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [newFollowup, setNewFollowup] = useState<Followup>({
        leadId: "",
        description: "",
        type: "",
        followupDate: "",
        stage: "Open",
        reminders: [],
    });
    const { toast } = useToast();
    // Reminder state
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [tempReminders, setTempReminders] = useState<any[]>([]);
    const [reminderType, setReminderType] = useState<"email" | "whatsapp">("email");
    const [reminderValue, setReminderValue] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<"minutes" | "hours" | "days">("minutes");
    const [searchTerm, setSearchTerm] = useState("");
    const [sourceOpen, setSourceOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    // Add this state at the top of your component:
    const [editingReminderIndex, setEditingReminderIndex] = useState<number | null>(null);

    // Date-Time Picker state
    const [isDateTimeDialogOpen, setIsDateTimeDialogOpen] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(undefined);

    // Reset all fields when the main dialog is closed without saving.
    const resetForm = () => {
        setNewFollowup({
            leadId: "",
            description: "",
            type: "",
            followupDate: "",
            stage: "Open",
            reminders: [],
        });
        setSelectedLead(null);
        setSearchTerm("");
        setTempReminders([]);
        setSelectedDateTime(undefined);
    };

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
            // alert("Duplicate reminders are not allowed");
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

        toast({
            title: "Success",
            description: "Reminders saved successfully",
            variant: "default",
            className: "z-[200]"
        });
        setIsReminderModalOpen(false);
    };

    // Open Reminder Modal (Fixes Unexpected Reset Issue)
    const openReminderModal = (isOpen: boolean) => {
        setIsReminderModalOpen(isOpen);
        if (isOpen) {
            setTempReminders([...newFollowup.reminders]); // Load existing reminders
        }
    };

    // Handle Date Selection from Calendar


    // Submit Followup
    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await axios.post("/api/followups", newFollowup);
            onFollowupAdded();
            // Reset form after successful submission.
            resetForm()
            toast({
                title: "Success",
                description: "Follow-up created successfully!",
                variant: "default",
                className: "z-[100]",
            });
            setIsLoading(false);
            setIsDialogOpen(false); // close dialog on success
            // alert("Follow-up created successfully!");
        } catch (error) {
            console.error("Error creating follow-up:", error);
            toast({
                title: "Error",
                description: "Failed to create follow-up.",
                variant: "destructive",
                className: "z-[100]",
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
        handleSourceClose(); // Close the popup after selection
    };

    const filteredLeads = leads.filter(
        (lead) =>
            lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact.whatsappNumber.includes(searchTerm)
    );

    // When the DateTimePicker returns a date/time, store it here.
    const handleDateTimeChange = (date: Date) => {
        setSelectedDateTime(date);
    };

    // Confirm date–time selection from the dialog.
    const handleDateTimeConfirm = () => {
        if (selectedDateTime) {
            setNewFollowup((prev) => ({
                ...prev,
                followupDate: selectedDateTime.toISOString(),
            }));
            setIsDateTimeDialogOpen(false);
        }
    };

    // function resetAddFollowupForm() {
    //     setLeadTitle("");
    //     setDescription("");
    //     setEstimateAmount("");
    //     setCloseDate(undefined);       // date is reset here
    //     setSelectedProduct(null);
    //     setSelectedContact(null);
    //     setModalPipeline("");
    //     setModalStage("");
    //     setModalStages([]);
    //     setAssignedTo("");
    //     setSource("");
    //     setNewSource("");
    //     setCustomDateRange({});
    //     setPopoverSourceInputValue("");
    //     // ...any other fields you'd like to reset
    // }


    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
        }}>
            <Toaster />
            <DialogTrigger asChild>
                <Button className="flex gap-1 bg-[#017a5b] hover:bg-[#017a5b]/80">
                    <Plus className="h-5" /> Follow-up</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg p-6 z-[100]">
                <DialogHeader>
                    <DialogTitle>Create Follow-up</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4">

                    {/* Lead Selection Button */}
                    <div className="">
                        <button
                            type="button"
                            className="p-2 text-sm flex border items-center bg-transparent text-muted-foreground focus:border-primary justify-between w-full text-start rounded"
                            onClick={handleSourceToggle}
                        >
                            {selectedLead ? `${selectedLead.title} - ${selectedLead.contact.firstName}` : "Select Customer"}

                        </button>
                    </div>

                    {/* Conditionally Render the Lead Select Popup */}
                    {sourceOpen && (
                        <div className="absolute dark:bg-[#020713]   bg-white border   rounded shadow-md p-4 top-[88px] w-[90%] z-50">
                            <input
                                placeholder="Search Leads"
                                className="h-8 text-xs px-4 mb-2 w-full border dark:border-border dark:bg-[#282D32] focus:border-[#815bf5] outline-none rounded"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Display filtered leads */}
                            {filteredLeads.length === 0 ? (
                                <div className="dark:text-white p-2 text-sm">No leads found</div>
                            ) : (
                                <div className="w-full text-sm dark:text-white max-h-40 overflow-y-scroll scrollbar-hide">
                                    {filteredLeads.map((lead) => (
                                        <div
                                            key={lead._id}
                                            className="cursor-pointer p-2 hover:bg-accent   items-center mb-1"
                                            onClick={() => handleSelectLead(lead)}
                                        >
                                            <h1>
                                                <Badge className="bg-primary text-xs py-0 text-primary-foreground">{lead.leadId}</Badge>
                                                <span className="px-2 dark:text-muted-foreground text-black text-xs">
                                                    {lead.title}
                                                </span>
                                            </h1>

                                            <h2 className="text-xs px-2 mt-1 flex gap-1 items-center text-muted-foreground">

                                                <User2 className="h-4 text-primary" />  {lead.contact.firstName} | <Phone className="h-3 text-primary" /> {lead.contact.whatsappNumber} |<Mail className="h-3 text-primary" /> {lead.contact.email}

                                            </h2>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Follow-up Description */}
                    <Textarea className="text-sm" label="Description" value={newFollowup.description} onChange={(e) => setNewFollowup({ ...newFollowup, description: e.target.value })} />
                    <div className="flex justify-between items-center gap-4">
                        {/* Follow-up Type Selection */}
                        <h1 className="text-muted-foreground text-sm">     Followup Type</h1>
                        <Tabs defaultValue="Call" onValueChange={(value) => setNewFollowup({ ...newFollowup, type: value })}>
                            <TabsList className="w-full gap-2">

                                <TabsTrigger value="Email" className="gap-1 flex items-center">
                                    <Mail className="h-4" /> Email
                                </TabsTrigger>
                                <TabsTrigger value="Call" className="gap-1 flex items-center">
                                    <PhoneCall className="h-4" />Call
                                </TabsTrigger>
                                <TabsTrigger value="WhatsApp" className="gap-2 flex items-center">
                                    <FaWhatsapp className="scale-125" />  WhatsApp
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex justify-start bg-muted/40 hover:bg-muted/20 rounded  items-start">
                        {/* Date-Time Picker Button */}
                        <Button className="bg-transparent gap-2 w-full px-2 text-start justify-start flex dark:hover:text-white text-muted-foreground items-center border hover:bg-transparent" type="button" onClick={() => setIsDateTimeDialogOpen(true)}>
                            <CalendarDays className="h-4" />
                            {newFollowup.followupDate
                                ? new Date(newFollowup.followupDate).toLocaleString()
                                : "Set Followup Date & Time"}
                        </Button>

                    </div>
                    <div className="flex justify-start bg-muted/40 hover:bg-muted/20 rounded  items-start">
                        {/* Date-Time Picker Button */}

                        <Button className="bg-transparent gap-2  w-full px-2 text-start justify-start flex text-muted-foreground items-center border hover:bg-transparent" type="button" variant="outline" onClick={() => setIsReminderModalOpen(true)}>
                            <Clock className=" h-4" />{tempReminders && tempReminders.length > 0 ? `${tempReminders.length} Reminders Added ` : "Set Followup Reminders"}

                        </Button>

                    </div>
                    {/* Reminder Button */}

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/80"> {isLoading ? <Loader2 className="text-white animate-spin"/> : "Add Follow-up"}</Button>
                </form>
            </DialogContent>

            {/* Reminder Dialog */}
            <Dialog open={isReminderModalOpen} onOpenChange={openReminderModal}>
                <DialogContent className="max-w-lg z-[100] mx-auto p-6">
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
                            <SelectContent className='z-[100]'>
                                <SelectItem className="hover:bg-accent" value="email">Email</SelectItem>
                                <SelectItem className="hover:bg-accent" value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input type="number" value={reminderValue} onChange={(e) => setReminderValue(Number(e.target.value))} />

                        <Select value={timeUnit} onValueChange={(value) => setTimeUnit(value as "minutes" | "hours" | "days")}>
                            <SelectTrigger className="w-full">
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
                    <ul>
                        {tempReminders.map((reminder, index) => (
                            <li key={index} className="flex justify-between items-center border-b py-2">
                                {editingReminderIndex === index ? (
                                    // Edit mode: display inputs for editing this reminder.
                                    <div className="flex flex-1 items-center gap-2">
                                        <Select
                                            value={reminder.notificationType}
                                            onValueChange={(value) =>
                                                setTempReminders((prev) => {
                                                    const newArr = [...prev];
                                                    newArr[index] = { ...newArr[index], notificationType: value as "email" | "whatsapp" };
                                                    return newArr;
                                                })
                                            }
                                        >
                                            <SelectTrigger className="">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[100]">
                                                <SelectItem className="hover:bg-accent" value="whatsapp">WhatsApp</SelectItem>
                                                <SelectItem className="hover:bg-accent" value="email">Email</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            value={reminder.value}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setTempReminders((prev) => {
                                                    const newArr = [...prev];
                                                    newArr[index] = { ...newArr[index], value: val };
                                                    return newArr;
                                                });
                                            }}
                                            className=""
                                        />
                                        <Select
                                            value={reminder.type}
                                            onValueChange={(value) =>
                                                setTempReminders((prev) => {
                                                    const newArr = [...prev];
                                                    newArr[index] = { ...newArr[index], type: value };
                                                    return newArr;
                                                })
                                            }
                                        >
                                            <SelectTrigger className="">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[100]">
                                                <SelectItem className="hover:bg-accent" value="minutes">Minutes</SelectItem>
                                                <SelectItem className="hover:bg-accent" value="hours">Hours</SelectItem>
                                                <SelectItem className="hover:bg-accent" value="days">Days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={() => setEditingReminderIndex(null)}>
                                                <Check className="text-green-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={() => setEditingReminderIndex(null)}>
                                                <X className="text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // Display mode: show the reminder with an icon and edit/delete buttons.
                                    <div className="flex flex-1 items-center justify-between">
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
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setEditingReminderIndex(index)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => removeReminder(index)}>
                                                <X className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    <Button onClick={handleSaveReminders}>Save Reminders</Button>
                </DialogContent>
            </Dialog>
            {/* Date-Time Picker Dialog */}
            <Dialog open={isDateTimeDialogOpen} onOpenChange={setIsDateTimeDialogOpen}>
                <DialogContent className="max-w-md p-6  m-auto z-[100]">
                    <DialogHeader>
                        <DialogTitle>Select Date & Time</DialogTitle>
                    </DialogHeader>
                    {/* Render the modern DateTimePicker component */}
                    <DateTimePicker value={selectedDateTime} onChange={handleDateTimeChange} />
                    <Button className="mt-4" onClick={handleDateTimeConfirm}>
                        Confirm
                    </Button>
                </DialogContent>
            </Dialog>
        </Dialog >
    );
}
