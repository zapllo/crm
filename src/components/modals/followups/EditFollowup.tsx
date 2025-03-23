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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlarmClock, CalendarDays, Check, Clock, Edit, Loader2, Mail, PhoneCall, Plus, X } from "lucide-react";
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
  }
}

interface Reminder {
  notificationType: "email" | "whatsapp";
  value: number;
  type: "minutes" | "hours" | "days";
}

interface Followup {
  _id: string;
  leadId: string;
  description: string;
  type: string;
  followupDate: string;
  stage: string;
  reminders: Reminder[];
}

interface EditFollowupProps {
  followup: Followup | null;
  onClose: () => void;
  onFollowupUpdated: () => void;
}

export default function EditFollowup({ followup, onClose, onFollowupUpdated }: EditFollowupProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(followup ? true : false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedFollowup, setUpdatedFollowup] = useState<Followup | null>(followup);
  const { toast } = useToast();

  // (Optional) Lead selection states if needed…
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);

  // Reminder state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [tempReminders, setTempReminders] = useState<Reminder[]>([]);
  const [reminderType, setReminderType] = useState<"email" | "whatsapp">("email");
  const [reminderValue, setReminderValue] = useState<number>(0);
  const [timeUnit, setTimeUnit] = useState<"minutes" | "hours" | "days">("minutes");
  const [editingReminderIndex, setEditingReminderIndex] = useState<number | null>(null);

  // Date-Time Picker state
  const [isDateTimeDialogOpen, setIsDateTimeDialogOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setUpdatedFollowup(followup);
    if (followup) {
      setSelectedDateTime(new Date(followup.followupDate));
      setTempReminders([...followup.reminders]);
      setIsDialogOpen(true);
    }
  }, [followup]);

  // Submit handler with loading state.
  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!updatedFollowup) return;
    setIsLoading(true);
    try {
      await axios.patch(`/api/followups/${updatedFollowup._id}`, updatedFollowup);
      onFollowupUpdated();
      toast({
        title: "Success",
        description: "Follow-up updated successfully!",
        variant: "default",
        className: "z-[100]",
      });
      setIsLoading(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating follow-up:", error);
      toast({
        title: "Error",
        description: "Failed to update follow-up.",
        variant: "destructive",
        className: "z-[100]",
      });
      setIsLoading(false);
    }
  };

  // DateTimePicker handlers.
  const handleDateTimeChange = (date: Date) => {
    setSelectedDateTime(date);
  };

  const handleDateTimeConfirm = () => {
    if (selectedDateTime && updatedFollowup) {
      setUpdatedFollowup({
        ...updatedFollowup,
        followupDate: selectedDateTime.toISOString(),
      });
      setIsDateTimeDialogOpen(false);
    }
  };

  // Reminder handlers.
  const openReminderModal = (isOpen: boolean) => {
    setIsReminderModalOpen(isOpen);
    if (isOpen && updatedFollowup) {
      setTempReminders([...updatedFollowup.reminders]);
    }
  };

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
    if (duplicate) {
      alert("Duplicate reminders are not allowed");
      return;
    }
    setTempReminders((prev) => [...prev, newReminder]);
  };

  const removeReminder = (index: number) => {
    setTempReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveReminders = () => {
    setUpdatedFollowup((prev) => prev ? { ...prev, reminders: tempReminders } : null);
    toast({
      title: "Success",
      description: "Reminders saved successfully",
      variant: "default",
      className: "z-[200]",
    });
    setIsReminderModalOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) onClose(); }}>
      <DialogContent className="max-w-lg p-6 z-[100]">
        <DialogHeader className="mb-4">
          <DialogTitle>Edit Follow-Up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* Follow-up Description */}
          <Textarea
            label="Description"
            value={updatedFollowup?.description || ""}
            onChange={(e) => setUpdatedFollowup({ ...updatedFollowup!, description: e.target.value })}
            placeholder="Description"
          />
          <div className="flex justify-between items-center gap-4">
            {/* Follow-up Type */}
            <h1 className="text-muted-foreground text-sm">Followup Type</h1>
            <Tabs defaultValue={updatedFollowup?.type || "Call"} onValueChange={(value) =>
              setUpdatedFollowup({ ...updatedFollowup!, type: value })
            }>
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
          <div className="flex justify-start bg-muted/40 hover:bg-muted/20 rounded items-start">
            {/* Date-Time Picker Button */}
            <Button
              className="bg-transparent gap-2 w-full px-2 text-start justify-start flex dark:hover:text-white text-muted-foreground items-center border hover:bg-transparent"
              type="button"
              onClick={() => setIsDateTimeDialogOpen(true)}
            >
              <CalendarDays className="h-4" />
              {updatedFollowup?.followupDate
                ? new Date(updatedFollowup.followupDate).toLocaleString()
                : "Set Followup Date & Time"}
            </Button>
          </div>
          <div className="flex justify-start bg-muted/40 hover:bg-muted/20 rounded items-start">
            {/* Reminder Button */}
            <Button
              className="bg-transparent gap-2 w-full px-2 text-start justify-start flex text-muted-foreground items-center border hover:bg-transparent"
              type="button"
              variant="outline"
              onClick={() => setIsReminderModalOpen(true)}
            >
              <Clock className="h-4" />
              {tempReminders && tempReminders.length > 0 ? `${tempReminders.length} Reminders Added` : "Set Followup Reminders"}
            </Button>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/80" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Update Follow-Up"}
          </Button>
        </form>
      </DialogContent>

      {/* Reminder Dialog */}
      <Dialog open={isReminderModalOpen} onOpenChange={openReminderModal}>
        <DialogContent className="max-w-lg z-[100] mx-auto p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlarmClock className="h-6 w-6" />
              <DialogTitle>Edit Followup Reminders</DialogTitle>
            </div>
          </div>
          <Separator />
          {/* Reminder Input */}
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
            <Input type="number" value={reminderValue} onChange={(e) => setReminderValue(Number(e.target.value))} />
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
          {/* Displaying Added Reminders */}
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
      <Dialog open={isDateTimeDialogOpen} onOpenChange={(open) => {
        if (!open) setSelectedDateTime(undefined);
        setIsDateTimeDialogOpen(open);
      }}>
        <DialogContent className="max-w-md p-6 m-auto z-[100]">
          <DialogHeader>
            <DialogTitle>Select Date & Time</DialogTitle>
          </DialogHeader>
          <DateTimePicker value={selectedDateTime} onChange={handleDateTimeChange} />
          <Button className="mt-4" onClick={handleDateTimeConfirm}>Confirm</Button>
        </DialogContent>
      </Dialog>
      <Toaster />
    </Dialog>
  );
}
