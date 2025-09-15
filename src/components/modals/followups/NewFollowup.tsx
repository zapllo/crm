"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    AlarmClock,
    CalendarDays,
    Check,
    Clock,
    Mail,
    PhoneCall,
    Plus,
    Loader2,
    X,
    Edit,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { FaWhatsapp } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Lead {
    _id: string;
    title: string;
    leadId: string;
    contact: {
        firstName: string;
        whatsappNumber: string;
        email: string;
    };
}

interface Reminder {
    notificationType: "email" | "whatsapp";
    value: number;
    type: "minutes" | "hours" | "days";
}

interface Followup {
    description: string;
    type: string;
    followupDate: string;
    stage: string;
    reminders: Reminder[];
}

interface AddFollowupProps {
    leadId: string;
    onFollowupAdded: () => void;
}

export default function NewFollowupDialog({ onFollowupAdded, leadId }: AddFollowupProps) {
    // Dialog & loading state.
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Followup state.
    const [newFollowup, setNewFollowup] = useState<Followup>({
        description: "",
        type: "",
        followupDate: "",
        stage: "Open",
        reminders: [],
    });

    // (Optional) Lead selection if needed.
    const [leads, setLeads] = useState<Lead[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sourceOpen, setSourceOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Reminder state.
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [tempReminders, setTempReminders] = useState<Reminder[]>([]);
    const [reminderType, setReminderType] = useState<"email" | "whatsapp">("email");
    const [reminderValue, setReminderValue] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<"minutes" | "hours" | "days">("minutes");
    const [editingReminderIndex, setEditingReminderIndex] = useState<number | null>(null);

    // Date-Time Picker state.
    const [isDateTimeDialogOpen, setIsDateTimeDialogOpen] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(undefined);

    // Reset form when dialog is closed.
    const resetForm = () => {
        setNewFollowup({
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

    const handleFormInputChange = (field: string, value: string) => {
        setNewFollowup((prev) => ({ ...prev, [field]: value }));
    };

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            // If leadId is needed, ensure selectedLead is set.
            await axios.post("/api/followups", { leadId, ...newFollowup });
            onFollowupAdded();
            toast({
                title: "Success",
                description: "Follow-up created successfully!",
                variant: "default",
                className: "z-[100]",
            });
            setIsLoading(false);
            setIsDialogOpen(false);
            resetForm();
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

    // Date-Time Picker handlers.
    const handleDateTimeChange = (date: Date) => {
        setSelectedDateTime(date);
    };

    const handleDateTimeConfirm = () => {
        if (selectedDateTime) {
            setNewFollowup((prev) => ({ ...prev, followupDate: selectedDateTime.toISOString() }));
            setIsDateTimeDialogOpen(false);
        }
    };

    // Reminder handlers.
    const addReminder = () => {
        const newReminder: Reminder = {
            notificationType: reminderType,
            value: reminderValue,
            type: timeUnit,
        };
        const duplicate = tempReminders.some(
            (r) =>
                r.notificationType === newReminder.notificationType &&
                r.value === newReminder.value &&
                r.type === newReminder.type
        );
        if (duplicate) return;
        setTempReminders((prev) => [...prev, newReminder]);
    };

    const removeReminder = (index: number) => {
        setTempReminders((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveReminders = () => {
        setNewFollowup((prev) => ({ ...prev, reminders: tempReminders }));
        toast({
            title: "Success",
            description: "Reminders saved successfully",
            variant: "default",
            className: "z-[200]",
        });
        setIsReminderModalOpen(false);
    };

    const openReminderModal = (isOpen: boolean) => {
        setIsReminderModalOpen(isOpen);
        if (isOpen) {
            setTempReminders([...newFollowup.reminders]);
        }
    };

    // (Optional) Fetch leads if needed.
    useEffect(() => {
        axios.get("/api/leads/all")
            .then(({ data }) => setLeads(data))
            .catch(console.error);
    }, []);

    return (
        <>
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogTrigger asChild>
                    <Button variant="default" className="flex gap-1 ml-auto bg-[#017a5b] hover:bg-[#017a5b]/80">
                        <Plus className="h-5" /> Follow-up
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg p-6 z-[100]">
                    <DialogHeader>
                        <DialogTitle>Create Follow-Up</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Description */}
                        <Textarea
                            label="Description"
                            value={newFollowup.description}
                            onChange={(e) => handleFormInputChange("description", e.target.value)}
                            className="text-sm"
                        />
                        {/* Follow-up Type */}
                        <div className="flex justify-between items-center gap-4">
                            <h1 className="text-muted-foreground text-sm">Followup Type</h1>
                            <Tabs onValueChange={(value) => handleFormInputChange("type", value)}>
                                <TabsList className="w-full gap-2">
                                    <TabsTrigger value="Email" className="flex items-center gap-1">
                                        <Mail className="h-4" /> Email
                                    </TabsTrigger>
                                    <TabsTrigger value="Call" className="flex items-center gap-1">
                                        <PhoneCall className="h-4" /> Call
                                    </TabsTrigger>
                                    <TabsTrigger value="WhatsApp" className="flex items-center gap-1">
                                        <FaWhatsapp className="scale-125" /> WhatsApp
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        {/* Date-Time Picker */}
                        <div className="flex justify-start bg-muted/40 hover:bg-muted/20 rounded items-start">
                            <Button
                                type="button"
                                className="w-full px-2 text-start flex justify-start items-center gap-2 border bg-transparent hover:bg-transparent dark:hover:text-white text-muted-foreground"
                                onClick={() => setIsDateTimeDialogOpen(true)}
                            >
                                <CalendarDays className="h-4" />
                                {newFollowup.followupDate
                                    ? new Date(newFollowup.followupDate).toLocaleString()
                                    : "Set Followup Date & Time"}
                            </Button>
                        </div>
                        {/* Reminders Button */}
                        <div className="flex justify-start bg-muted/40 hover:bg-muted/20 rounded items-start">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full px-2 text-start flex justify-start  bg-transparent items-center gap-2 border hover:bg-transparent text-muted-foreground"
                                onClick={() => setIsReminderModalOpen(true)}
                            >
                                <Clock className="h-4" />
                                {tempReminders.length > 0
                                    ? `${tempReminders.length} Reminders Added`
                                    : "Set Followup Reminders"}
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/80" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Create"}
                            </Button>
                            <DialogClose asChild>
                                {/* <Button variant="destructive">Cancel</Button> */}
                            </DialogClose>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reminder Dialog */}
            <Dialog open={isReminderModalOpen} onOpenChange={openReminderModal}>
                <DialogContent className="max-w-lg p-6 z-[100] mx-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AlarmClock className="h-6 w-6" />
                            <DialogTitle>Add Task Reminders</DialogTitle>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex gap-2 items-center mb-4">
                        <Select value={reminderType} onValueChange={(value) => setReminderType(value as "email" | "whatsapp")}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            value={reminderValue}
                            onChange={(e) => setReminderValue(Number(e.target.value))}
                        />
                        <Select value={timeUnit} onValueChange={(value) => setTimeUnit(value as "minutes" | "hours" | "days")}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="rounded-full h-10 w-10 p-2" onClick={addReminder}>
                            <Plus />
                        </Button>
                    </div>
                    <ul>
                        {tempReminders.map((reminder, index) => (
                            <li key={index} className="flex justify-between items-center border-b py-2">
                                {editingReminderIndex === index ? (
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
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[100]">
                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
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
                                        />
                                        <Select
                                            value={reminder.type}
                                            onValueChange={(value) =>
                                                setTempReminders((prev) => {
                                                    const newArr = [...prev];
                                                    newArr[index] = { ...newArr[index], type: value as "minutes" | "hours" | "days" };
                                                    return newArr;
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[100]">
                                                <SelectItem value="minutes">Minutes</SelectItem>
                                                <SelectItem value="hours">Hours</SelectItem>
                                                <SelectItem value="days">Days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingReminderIndex(null)}>
                                                <Check className="text-green-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingReminderIndex(null)}>
                                                <X className="text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-1 items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {reminder.notificationType === "email" ? (
                                                <Mail className="h-6 text-red-800 w-6" />
                                            ) : (
                                                <FaWhatsapp className="h-6 text-green-500 w-6" />
                                            )}
                                            <span>{reminder.value} {reminder.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingReminderIndex(index)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => removeReminder(index)}>
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
            <Dialog open={isDateTimeDialogOpen} onOpenChange={(open) => { if (!open) setSelectedDateTime(undefined); setIsDateTimeDialogOpen(open); }}>
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
            <Toaster />
        </>
    );
}
