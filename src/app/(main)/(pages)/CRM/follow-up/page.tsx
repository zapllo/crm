"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Calendar as CalendarIcon,
    Check,
    Clock,
    Filter,
    Loader2,
    MessageSquare,
    PencilLine,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    X,
    AlertCircle,
    CheckCircle,
    MoreHorizontal,
    CalendarRange,
    Phone
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isPast, isTomorrow, isThisWeek } from "date-fns";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AddFollowup from "@/components/modals/followups/AddFollowup";
import EditFollowup from "@/components/modals/followups/EditFollowup";
import { FaUser, FaPhone, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface Reminder {
    notificationType: "email" | "whatsapp";
    value: number;
    type: "minutes" | "hours" | "days";
}

interface Followup {
    _id: string;
    followupId: string;
    leadId: string;
    addedBy?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    lead?: {
        _id?: string;
        title: string;
        assignedTo?: {
            _id?: string;
            firstName: string;
            lastName: string;
        };
        contact?: {
            _id?: string;
            firstName: string;
            lastName: string;
            email: string;
            whatsappNumber: string;
        };
    };
    description: string;
    type: "Call" | "Email" | "WhatsApp";
    followupDate: string;
    stage: "Open" | "Closed";
    remarks: { text: string; timestamp?: Date }[];
    reminders: Reminder[];
    createdAt: Date;
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
    const [editFollowup, setEditFollowup] = useState<Followup | null>(null);
    const [deleteFollowupId, setDeleteFollowupId] = useState<string | null>(null);
    const [remarkFollowupId, setRemarkFollowupId] = useState<string | null>(null);
    const [closingFollowupId, setClosingFollowupId] = useState<string | null>(null);
    const [remark, setRemark] = useState("");
    const [dateFilter, setDateFilter] = useState<string>("AllTime");
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchFollowups();
        fetchUsers();
    }, []);

    const fetchFollowups = async () => {
        try {
            setIsRefreshing(true);
            const { data } = await axios.get("/api/followups");
            setFollowups(data);
        } catch (error) {
            console.error("Error fetching follow-ups:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
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
            setDeleteFollowupId(null);
        } catch (error) {
            console.error("Error deleting follow-up:", error);
        }
    };

    const handleAddRemark = async () => {
        if (!remarkFollowupId || !remark.trim()) return;
        const newRemark = {
            text: remark,
            timestamp: new Date(),
        };

        try {
            await axios.patch(`/api/followups/${remarkFollowupId}`, {
                $push: { remarks: newRemark },
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

            const closingRemark = {
                text: `Closed - ${remark}`,
                timestamp: new Date(),
            };

            await axios.patch(`/api/followups/${closingFollowupId}`, {
                stage: "Closed",
                $push: { remarks: closingRemark },
            });

            // Push to lead's timeline
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

    // Apply filters to followups
    const filteredFollowups = useMemo(() => {
        return followups.filter((followup) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const leadName = `${followup.lead?.contact?.firstName || ''} ${followup.lead?.contact?.lastName || ''}`.toLowerCase();
                const leadTitle = followup.lead?.title?.toLowerCase() || '';
                const description = followup.description?.toLowerCase() || '';
                const addedByName = `${followup.addedBy?.firstName || ''} ${followup.addedBy?.lastName || ''}`.toLowerCase();

                if (!leadName.includes(query) &&
                    !leadTitle.includes(query) &&
                    !description.includes(query) &&
                    !addedByName.includes(query)) {
                    return false;
                }
            }

            // User filter
            if (selectedUser !== "all" && followup.addedBy?._id !== selectedUser) {
                return false;
            }

            // Date filters
            if (dateFilter === "Custom" && customDateRange.start && customDateRange.end) {
                const followupDate = new Date(followup.createdAt);
                return followupDate >= customDateRange.start &&
                    followupDate <= new Date(customDateRange.end.setHours(23, 59, 59, 999));
            }

            if (dateFilter === "Today") {
                return isToday(new Date(followup.createdAt));
            }

            if (dateFilter === "Yesterday") {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const followupDate = new Date(followup.createdAt);
                return followupDate.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0];
            }

            if (dateFilter === "ThisWeek") {
                return isThisWeek(new Date(followup.createdAt));
            }

            if (dateFilter === "ThisMonth") {
                const now = new Date();
                const followupDate = new Date(followup.createdAt);
                return followupDate.getMonth() === now.getMonth() &&
                    followupDate.getFullYear() === now.getFullYear();
            }

            if (dateFilter === "LastMonth") {
                const now = new Date();
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
                const followupDate = new Date(followup.createdAt);
                return followupDate.getMonth() === lastMonth.getMonth() &&
                    followupDate.getFullYear() === lastMonth.getFullYear();
            }

            // Tab filters
            if (selectedTab === "overdue") {
                return followup.stage === "Open" && isPast(new Date(followup.followupDate));
            }

            if (selectedTab === "today") {
                return followup.stage === "Open" && isToday(new Date(followup.followupDate));
            }

            if (selectedTab === "upcoming") {
                return followup.stage === "Open" && !isPast(new Date(followup.followupDate)) && !isToday(new Date(followup.followupDate));
            }

            if (selectedTab === "closed") {
                return followup.stage === "Closed";
            }

            return true;
        });
    }, [followups, searchQuery, selectedUser, dateFilter, customDateRange, selectedTab]);

    // Stats calculations
    const stats = useMemo(() => {
        const today = new Date();
        return {
            total: followups.length,
            overdue: followups.filter(f => f.stage === "Open" && isPast(new Date(f.followupDate))).length,
            todayCount: followups.filter(f => f.stage === "Open" && isToday(new Date(f.followupDate))).length,
            upcoming: followups.filter(f => f.stage === "Open" && !isPast(new Date(f.followupDate)) && !isToday(new Date(f.followupDate))).length,
            closed: followups.filter(f => f.stage === "Closed").length
        };
    }, [followups]);

    // FollowUp type icon
    const getFollowupTypeIcon = (type: string) => {
        switch (type) {
            case "Call":
                return <Phone className="h-3.5 w-3.5" />;
            case "Email":
                return <FaEnvelope className="h-3.5 w-3.5" />;
            case "WhatsApp":
                return <FaWhatsapp className="h-3.5 w-3.5" />;
            default:
                return <MessageSquare className="h-3.5 w-3.5" />;
        }
    };

    // Status badge renderer
    const renderStatusBadge = (followup: Followup) => {
        if (followup.stage === "Closed") {
            return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Closed</Badge>;
        }

        const dueDate = new Date(followup.followupDate);

        if (isPast(dueDate) && !isToday(dueDate)) {
            return <Badge variant="destructive">Overdue</Badge>;
        }

        if (isToday(dueDate)) {
            return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Today</Badge>;
        }

        if (isTomorrow(dueDate)) {
            return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Tomorrow</Badge>;
        }

        return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Upcoming</Badge>;
    };

    return (
        <div className="h-screen mt-4 flex flex-col max-h-screen overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Follow-up Manager</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and track all your follow-ups in one place
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchFollowups} disabled={isRefreshing}>
                        {isRefreshing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </>
                        )}
                    </Button>
                    <AddFollowup onFollowupAdded={fetchFollowups} />
                </div>
            </div>

            {/* Filter bar */}
            <div className="p-4 ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left side - Date filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="h-9 w-[180px] ">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Select date filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Today">Today</SelectItem>
                                <SelectItem value="Yesterday">Yesterday</SelectItem>
                                <SelectItem value="ThisWeek">This Week</SelectItem>
                                <SelectItem value="ThisMonth">This Month</SelectItem>
                                <SelectItem value="LastMonth">Last Month</SelectItem>
                                <SelectItem value="Custom">Custom Range</SelectItem>
                                <SelectItem value="AllTime">All Time</SelectItem>
                            </SelectContent>
                        </Select>

                        {dateFilter === "Custom" && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 "
                                onClick={() => setIsCustomModalOpen(true)}
                            >
                                <CalendarRange className="mr-2 h-4 w-4" />
                                {customDateRange.start && customDateRange.end
                                    ? `${format(customDateRange.start, "d MMM")} - ${format(customDateRange.end, "d MMM")}`
                                    : "Select dates"
                                }
                            </Button>
                        )}
                    </div>

                    {/* Middle - Assigned to filter */}
                    <div className="flex items-center">
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="h-9 w-fit ml-auto ">
                                <FaUser className="mr-2 h-3.5 w-3.5 opacity-70" />
                                <SelectValue placeholder="Filter by user" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user._id} value={user._id}>
                                        {user.firstName} {user.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Right - Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search follow-ups..."
                            className="pl-9 h-9 "
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Main content area with tabs and cards */}
            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
                    <div className="border-b px-4">
                        <TabsList className="h-11 bg-accent gap-4 justify-start mt-1 w-auto">
                            <TabsTrigger value="all" className="gap-2 border-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
                                All
                                <Badge variant="secondary" className="ml-1 border-none bg-muted text-muted-foreground">{stats.total}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="overdue" className="gap-2 border-none data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive data-[state=active]:shadow-none">
                                <AlertCircle className="h-4 w-4" />
                                Overdue
                                <Badge variant="secondary" className="ml-1 border-none bg-muted text-muted-foreground">{stats.overdue}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="today" className="gap-2 border-none data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 data-[state=active]:shadow-none">
                                <Clock className="h-4 w-4" />
                                Today
                                <Badge variant="secondary" className="ml-1 border-none bg-muted text-muted-foreground">{stats.todayCount}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="upcoming" className="gap-2 border-none data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
                                <CalendarIcon className="h-4 w-4" />
                                Upcoming
                                <Badge variant="secondary" className="ml-1 border-none bg-muted text-muted-foreground">{stats.upcoming}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="closed" className="gap-2 border-none data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600 data-[state=active]:shadow-none">
                                <CheckCircle className="h-4 w-4" />
                                Closed
                                <Badge variant="secondary" className="ml-1 border-none bg-muted text-muted-foreground">{stats.closed}</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value={selectedTab} className="flex-1 p-4 overflow-hidden">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                    <p className="text-sm text-muted-foreground">Loading follow-ups...</p>
                                </div>
                            </div>
                        ) : filteredFollowups.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center max-w-md p-8 rounded-lg border bg-background shadow-sm">
                                    <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No follow-ups found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchQuery
                                            ? "No results match your search query"
                                            : "There are no follow-ups matching your current filters"}
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <Button variant="outline" onClick={() => {
                                            setSearchQuery("");
                                            setSelectedUser("all");
                                            setDateFilter("AllTime");
                                        }}>
                                            Clear Filters
                                        </Button>
                                        <AddFollowup onFollowupAdded={fetchFollowups} />

                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-3 pb-4">
                                    {filteredFollowups.map((followup) => (
                                        <FollowupCard
                                            key={followup._id}
                                            followup={followup}
                                            onEditClick={() => setEditFollowup(followup)}
                                            onDeleteClick={() => setDeleteFollowupId(followup._id)}
                                            onRemarkClick={() => setRemarkFollowupId(followup._id)}
                                            onCloseClick={() => setClosingFollowupId(followup._id)}
                                            getFollowupTypeIcon={getFollowupTypeIcon}
                                            renderStatusBadge={renderStatusBadge}
                                            router={router}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Custom Date Dialog */}
            <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Select Date Range</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <div className="border rounded-md p-1">
                                    <Calendar
                                        mode="single"
                                        selected={customDateRange.start ?? undefined}
                                        onSelect={(date) =>
                                            setCustomDateRange((prev) => ({ ...prev, start: date ? date : null }))
                                        }

                                        disabled={undefined}
                                        initialFocus
                                        className="w-full"
                                    />

                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <div className="border rounded-md p-1">
                                    <Calendar
                                        mode="single"
                                        selected={customDateRange.end ?? undefined}
                                        onSelect={(date) =>
                                            setCustomDateRange((prev) => ({ ...prev, end: date ? date : null }))
                                        }
                                        disabled={(date) => customDateRange.start ? date < customDateRange.start : false}
                                        initialFocus
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCustomDateRange({ start: null, end: null });
                                setIsCustomModalOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setDateFilter("Custom");
                                setIsCustomModalOpen(false);
                            }}
                            disabled={!customDateRange.start || !customDateRange.end}
                        >
                            Apply Range
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Remark Dialog */}
            <AlertDialog open={!!remarkFollowupId} onOpenChange={() => setRemarkFollowupId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Add Remark</AlertDialogTitle>
                        <AlertDialogDescription>
                            Add notes about this follow-up interaction
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Enter details about the conversation, decisions, or next steps..."
                        className="min-h-[120px]"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRemark("")}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAddRemark} disabled={!remark.trim()}>
                            Save Remark
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Follow-up Dialog */}
            <AlertDialog open={!!deleteFollowupId} onOpenChange={() => setDeleteFollowupId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Follow-up</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this follow-up? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteFollowup}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Close Follow-up Dialog */}
            <AlertDialog open={!!closingFollowupId} onOpenChange={() => setClosingFollowupId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Close Follow-up</AlertDialogTitle>
                        <AlertDialogDescription>
                            Add a closing remark to complete this follow-up
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Summarize the outcome of this follow-up..."
                        className="min-h-[120px]"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRemark("")}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCloseFollowup} disabled={!remark.trim()}>
                            Close & Save
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Follow-up Dialog */}
            {editFollowup && (
                <EditFollowup
                    followup={editFollowup}
                    onClose={() => setEditFollowup(null)}
                    onFollowupUpdated={fetchFollowups}
                />
            )}
        </div>
    );
}

// Followup Card Component
function FollowupCard({
    followup,
    onEditClick,
    onDeleteClick,
    onRemarkClick,
    onCloseClick,
    getFollowupTypeIcon,
    renderStatusBadge,
    router
}: {
    followup: Followup;
    onEditClick: () => void;
    onDeleteClick: () => void;
    onRemarkClick: () => void;
    onCloseClick: () => void;
    getFollowupTypeIcon: (type: string) => React.ReactNode;
    renderStatusBadge: (followup: Followup) => React.ReactNode;
    router: any;
}) {
    const isOverdue = followup.stage === "Open" && isPast(new Date(followup.followupDate)) && !isToday(new Date(followup.followupDate));
    const isClosed = followup.stage === "Closed";

    return (
        <Card className={cn(
            "hover:shadow-md transition-all border overflow-hidden",
            isOverdue ? "border-l-4 border-l-destructive" :
                isClosed ? "border-l-4 border-l-green-500 opacity-80" :
                    isToday(new Date(followup.followupDate)) ? "border-l-4 border-l-amber-500" :
                        "border-l-4 border-l-blue-500"
        )}>
            <CardContent className="p-0">
                <div className="p-5">
                    <div className="flex justify-between items-start gap-4">
                        {/* Left side: Title and status */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge variant="outline" className="h-5 px-1.5 bg-primary/10 text-primary border-primary/20">
                                    <span className="flex items-center">
                                        {getFollowupTypeIcon(followup.type)}
                                        <span className="ml-1 text-xs">{followup.type}</span>
                                    </span>
                                </Badge>
                                {renderStatusBadge(followup)}
                            </div>

                            <h3 className="text-base font-medium truncate mb-0.5">
                                <button
                                    onClick={() => router.push(`/CRM/leads/${followup.lead?._id}?tab=followups`)}
                                    className="hover:text-primary transition-colors truncate focus:outline-none focus:underline"
                                >
                                    {followup.lead?.title || "Untitled Follow-up"}
                                </button>
                            </h3>

                            {followup.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                    {followup.description}
                                </p>
                            )}
                        </div>

                        {/* Right side: Action buttons */}
                        <div className="flex flex-col items-end gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onEditClick();
                                    }}>
                                        <PencilLine className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onRemarkClick();
                                    }}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Add Remark
                                    </DropdownMenuItem>
                                    {followup.stage !== "Closed" && (
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            onCloseClick();
                                        }}>
                                            <Check className="mr-2 h-4 w-4" />
                                            Close
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteClick();
                                        }}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="text-xs text-muted-foreground flex items-center">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {format(new Date(followup.followupDate), "d MMM, h:mm a")}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Due {formatDistanceToNow(new Date(followup.followupDate), { addSuffix: true })}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Contact and assigned details */}
                    <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
                        {/* Contact info */}
                        {followup.lead?.contact && (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 rounded-full">
                                    <AvatarFallback className="bg-muted">
                                        <FaUser className="h-3.5 w-3.5 text-muted-foreground" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-medium">
                                        {followup.lead.contact.firstName} {followup.lead.contact.lastName}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        {followup.lead.contact.email && (
                                            <div className="flex items-center">
                                                <FaEnvelope className="mr-1 h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{followup.lead.contact.email}</span>
                                            </div>
                                        )}
                                        {followup.lead.contact.whatsappNumber && (
                                            <div className="flex items-center">
                                                <Phone className="mr-1 h-3 w-3" />
                                                {followup.lead.contact.whatsappNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Added by */}
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {followup.addedBy?.firstName?.charAt(0) || ''}
                                        {followup.addedBy?.lastName?.charAt(0) || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-xs">
                                    <span className="text-muted-foreground">Added by </span>
                                    <span className="font-medium">
                                        {followup.addedBy?.firstName} {followup.addedBy?.lastName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Last remark if present */}
                    {followup.remarks && followup.remarks.length > 0 && (
                        <div className="mt-3 pt-3 border-t text-sm">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-muted-foreground mb-0.5">Latest remark:</p>
                                    <p className="line-clamp-1">
                                        {followup.remarks[followup.remarks.length - 1]?.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}