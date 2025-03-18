"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pencil, Trash, Plus, Clock, AlertCircle, CheckCircle, Circle, MessageSquare, User, Mail, MessageSquareDashed, MessageSquareText, PencilRuler, PencilLine } from "lucide-react";
import AddFollowup from "@/components/modals/followups/AddFollowup";
import EditFollowup from "@/components/modals/followups/EditFollowup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaClock, FaPencilAlt, FaReply, FaUser } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IoMdCall, IoMdMail } from "react-icons/io";

interface Followup {
    _id: string;
    followupId: string;
    lead?: {
        _id?: string;
        title: string;
        assignedTo?: {
            _id?: string;
            firstName: string;
            lastName: string;
        };
    };
    description: string;
    type: "Call" | "Email" | "WhatsApp";
    followupDate: string;
    stage: "Open" | "Closed";
    remarks: string[];
    reminders: { type: string; value?: number; date?: string }[];
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
}

export default function FollowupPage() {
    const [followups, setFollowups] = useState<Followup[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("all");
    const [selectedTab, setSelectedTab] = useState("all");
    // const [filteredFollowups, setFilteredFollowups] = useState<Followup[]>([]);
    const [editFollowup, setEditFollowup] = useState<Followup | null>(null);
    const [deleteFollowupId, setDeleteFollowupId] = useState<string | null>(null);
    const [remarkFollowupId, setRemarkFollowupId] = useState<string | null>(null);
    const [closingFollowupId, setClosingFollowupId] = useState<string | null>(null);
    const [remark, setRemark] = useState("");
    const [dateFilter, setDateFilter] = useState<string>("AllTime");
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
    });
    const router = useRouter();
    useEffect(() => {
        fetchFollowups();
        fetchUsers();
    }, []);

    const filteredFollowups = followups.filter(followup => {
        if (selectedTab === "all") return true;
        if (selectedTab === "overdue") return new Date(followup.followupDate) < new Date();
        return followup.stage.toLowerCase() === selectedTab;
    });


    const fetchFollowups = async () => {
        try {
            const { data } = await axios.get("/api/followups");
            setFollowups(data);
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("/api/members");
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleDeleteFollowup = async () => {
        if (!deleteFollowupId) return;
        try {
            await axios.delete(`/api/followups/${deleteFollowupId}`);
            fetchFollowups();
        } catch (error) {
            console.error("Error deleting follow-up:", error);
        }
        setDeleteFollowupId(null);
    };

    const handleAddRemark = async () => {
        if (!remarkFollowupId || !remark.trim()) return;
        // Special remark for closing the follow-up
        const Addremark = {
            text: `${remark}`,
            timestamp: new Date(),
        };

        try {
            await axios.patch(`/api/followups/${remarkFollowupId}`, {
                $push: { remarks: Addremark },
            });
            fetchFollowups();
            setRemark("");
            setRemarkFollowupId(null);
        } catch (error) {
            console.error("Error adding remark:", error);
        }
    };


    const handleCloseFollowup = async () => {
        if (!closingFollowupId || !remark.trim()) return;
        try {
            const followup = followups.find(f => f._id === closingFollowupId);
            if (!followup || !followup.lead?._id) return;
            const rescheduleTimestamp = new Date().toISOString(); // 🆕 Rescheduled timestamp

            // Special remark for closing the follow-up
            const closingRemark = {
                text: `Closed - ${remark}`,
                timestamp: new Date(),
            };

            await axios.patch(`/api/followups/${closingFollowupId}`, {
                stage: "Closed",
                $push: { remarks: closingRemark },
            });

            // ✅ Push to lead's timeline via new endpoint
            await axios.patch(`/api/leads/${followup.lead._id}`, {
                remark: closingRemark.text,
            });


            fetchFollowups();
            setRemark("");
            setClosingFollowupId(null);
        } catch (error) {
            console.error("Error closing follow-up:", error);
        }
    };

    return (
        <div className="p-6 text-white">
            {/* Filters Section */}
            <div className="flex justify-center gap-4 mb-6">
                {["Today", "Yesterday", "ThisWeek", "ThisMonth", "LastMonth", "AllTime"].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-4 text-xs h-8 rounded ${dateFilter === filter ? "bg-[#815BF5] text-white" : "border text-white"
                            }`}
                    >
                        {filter.replace(/([A-Z])/g, " $1").trim()} {/* Converts "ThisWeek" to "This Week" */}
                    </button>
                ))}
                <button
                    onClick={() => setIsCustomModalOpen(true)}
                    className={`px-4 text-xs h-8 rounded ${dateFilter === "Custom" ? "bg-[#815BF5] text-white" : "border text-white"}`}
                >
                    Custom
                </button>
            </div>
            <div className="flex gap-4 w-full justify-center items-center mb-6">
                <div className="flex gap-4">
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger className="">
                            <SelectValue>
                                {selectedUser === "all" ? "Assigned To (All)" : users.find((u) => u._id === selectedUser)?.firstName}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {users.map((user) => (
                                <SelectItem key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input className=" text-white border" label="Search Followups" />

                    {/* Add Follow-up Dialog */}
                    <AddFollowup onFollowupAdded={fetchFollowups} />
                </div>
            </div>
            <Tabs defaultValue="all" onValueChange={setSelectedTab}>
                <TabsList className="w-full  rounded-none flex space-x-4">
                    <TabsTrigger value="all">
                        <Circle className="mr-2 h-4" /> All ({followups.length})
                    </TabsTrigger>
                    <TabsTrigger value="overdue">
                        <AlertCircle className="mr-2 h-4 text-red-500" /> Overdue ({followups.filter(f => new Date(f.followupDate) < new Date()).length})
                    </TabsTrigger>
                    <TabsTrigger value="open">
                        <Clock className="mr-2 text-yellow-500 h-4" /> Open ({followups.filter(f => f.stage === "Open").length})
                    </TabsTrigger>
                    <TabsTrigger value="closed">
                        <CheckCircle className="mr-2 h-4 text-green-500" /> Closed ({followups.filter(f => f.stage === "Closed").length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab}>
                    <div className="grid gap-4">
                        {filteredFollowups.length === 0 ? (
                            <p className="text-center">No Follow-ups Available</p>
                        ) : (
                            filteredFollowups.map(followup => (
                                <Card onClick={() => router.push(`/CRM/leads/${followup.lead?._id}?tab=followups`)} className="p-4 rounded-lg cursor-pointer flex flex-col gap-2 border hover:border-primary">
                                    {/* Status & Type */}
                                    <div className="flex  gap-4">
                                        <div className="">
                                            <div className="flex gap-2 text-sm">
                                                <span className="text-muted-foreground">
                                                    Status: <strong className="text-white">{followup.stage}</strong>
                                                </span>
                                                <span className="text-muted-foreground">Type: <strong className="text-white">{followup.type}</strong></span>
                                            </div>

                                            {/* Timestamp */}
                                            <div className="text-xs text-">
                                                {format(new Date(followup.createdAt), "Pp")} • {formatDistanceToNow(new Date(followup.createdAt))} ago
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary scale-90 h-10 w-10">
                                                    <span className="text-lg font-semibold">{`${followup.addedBy.firstName}`.slice(0, 1)}{`${followup.addedBy.lastName}`.slice(0, 1)}</span>
                                                </AvatarFallback>
                                            </Avatar>
                                            {/* Added By */}
                                            {followup.addedBy && (
                                                <div className=" items-center gap-2">
                                                    <span className="text-sm font-semibold">{followup.addedBy.firstName} {followup.addedBy.lastName}</span>
                                                    <p className="text-xs">{followup.addedBy.email}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        {/* Lead Contact Details */}
                                        <div>
                                            {followup.lead?.contact && (
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-primary" />
                                                    <span className="text-sm font-semibold ">{followup.lead.contact.firstName} {followup.lead.contact.lastName}</span>
                                                    <IoMdMail className="text-primary" />
                                                    {followup.lead.contact.email && <span className="text-xs text">{followup.lead.contact.email}</span>}
                                                    <IoMdCall className="text-primary" />

                                                    {followup.lead.contact.whatsappNumber && <span className="text-xs "> {followup.lead.contact.whatsappNumber}</span>}
                                                </div>
                                            )}
                                            <div className="mt-2">

                                                {/* Remarks */}
                                                {followup.remarks.length > 0 && (
                                                    <div className="text-sm text-muted-foreground">
                                                        <span className="font-bold text-white">Remark: </span>
                                                        {followup.remarks[followup.remarks.length - 1]?.text}
                                                    </div>
                                                )}

                                            </div>
                                        </div>






                                        {/* Action Buttons */}
                                        <div className="flex gap-2 items-center mt-2">
                                            <Pencil className="text-blue-500 hover:text-blue-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditFollowup(followup); }} />
                                            <MessageSquareText className="text-green-500 hover:text-green-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); setRemarkFollowupId(followup._id); }} />
                                            <CheckCircle className="text-yellow-500 hover:text-yellow-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); setClosingFollowupId(followup._id); }} />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Trash className="text-red-500 hover:text-red-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); setDeleteFollowupId(followup._id); }} />
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>Are you sure you want to delete this follow-up?</AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => {
                                                            axios.delete(`/ api / followups / ${followup._id}`).then(fetchFollowups);
                                                            setDeleteFollowupId(null);
                                                        }} className="bg-red-500 text-white">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {
                remarkFollowupId && (
                    <AlertDialog open={!!remarkFollowupId} onOpenChange={() => setRemarkFollowupId(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>Add Remark</AlertDialogHeader>
                            <Input value={remark} onChange={(e) => setRemark(e.target.value)} />
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleAddRemark}>Add</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )
            }
            {
                closingFollowupId && (
                    <AlertDialog open={!!closingFollowupId} onOpenChange={() => setClosingFollowupId(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>Close Follow-Up</AlertDialogHeader>
                            <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Closing remark" />
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCloseFollowup}>Close</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )
            }

            {/* Edit Followup Dialog */}
            {
                editFollowup && (
                    <EditFollowup
                        followup={editFollowup}
                        onClose={() => setEditFollowup(null)}
                        onFollowupUpdated={fetchFollowups}
                    />
                )
            }
        </div >
    );
}
