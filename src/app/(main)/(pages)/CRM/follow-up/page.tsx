"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow, isToday, isPast, isTomorrow, isThisWeek } from "date-fns";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Icons
import {
    Calendar as CalendarIcon,
    Check,
    Clock,
    Loader2,
    MessageSquare,
    PencilLine,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    AlertCircle,
    CheckCircle,
    MoreHorizontal,
    CalendarRange,
    Phone,
    Filter,
    ArrowUpDown,
    ChevronDown,
    X,
    Info
} from "lucide-react";
import { FaUser, FaPhone, FaEnvelope, FaWhatsapp, FaTags, FaUserClock } from "react-icons/fa";

// Custom components
import AddFollowup from "@/components/modals/followups/AddFollowup";
import EditFollowup from "@/components/modals/followups/EditFollowup";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";


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

    const { isLoading: permissionsLoading, isInitialized } = usePermissions();

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
    
            // Update the followup status to Closed
            await axios.patch(`/api/followups/${closingFollowupId}`, {
                stage: "Closed",
                $push: { remarks: closingRemark },
            });
    
            // Add to lead timeline with a stage that indicates this is a followup
            await axios.patch(`/api/leads/${followup.lead._id}`, {
                stage: "Followup", // Use a special stage name to indicate this is a followup
                action: `Closed ${followup.type} Followup`,
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

    // Check permissions before rendering
    if (permissionsLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-background/40 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">Loading permissions...</p>
            </div>
        );
    }

    // Check for view permission after permissions are loaded
    if (isInitialized && !canView("FollowUps")) {
        return (
            <NoPermissionFallback
                title="No Access to Follow-ups"
                description="You don't have permission to view the follow-ups page."
            />
        );
    }

    return (
        <div className="flex flex-col h-screen mt-4 max-h-screen overflow-y-scroll scrollbar-hide bg-background">
            {/* Dashboard Header Section */}
            <div className="border-b bg-card">
                <div className="p-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Follow-up Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Track, manage, and close your follow-ups efficiently</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchFollowups}
                                disabled={isRefreshing}
                                className="h-9"
                            >
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
                            {canAdd("FollowUps") ? (
                                <AddFollowup onFollowupAdded={fetchFollowups} />
                            ) : (
                                <Button
                                    variant="default"
                                    className="gap-1 opacity-50 cursor-not-allowed"
                                    disabled
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Follow-up
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards Section */}
            <div className="p-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Follow-ups"
                    value={stats.total}
                    icon={<MessageSquare className="h-5 w-5 text-primary" />}
                    description="All time follow-ups"
                    onClick={() => setSelectedTab("all")}
                />
                <StatsCard
                    title="Overdue"
                    value={stats.overdue}
                    icon={<AlertCircle className="h-5 w-5 text-destructive" />}
                    description="Needs immediate attention"
                    variant="destructive"
                    onClick={() => setSelectedTab("overdue")}
                />
                <StatsCard
                    title="Today's Tasks"
                    value={stats.todayCount}
                    icon={<Clock className="h-5 w-5 text-amber-500" />}
                    description="Follow-ups due today"
                    variant="amber"
                    onClick={() => setSelectedTab("today")}
                />
                <StatsCard
                    title="Completed"
                    value={stats.closed}
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                    description="Successfully closed"
                    variant="success"
                    onClick={() => setSelectedTab("closed")}
                />
            </div>

            {/* Filters Section */}
            <div className=" pb-4">
                <Card className="bg-card">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Date Filter Group */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Date Range</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select value={dateFilter} onValueChange={setDateFilter}>
                                        <SelectTrigger className="h-9 w-[180px] bg-background">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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
                                            className="h-9 bg-background"
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
                            </div>

                            {/* User Filter */}
                            <div className="space-y-1 ml-auto">
                                <label className="text-xs font-medium text-muted-foreground">Assigned User</label>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger className="h-9 w-fit   bg-background">
                                        <FaUser className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
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

                            {/* Search */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search Followup"
                                        className="pl-9 h-9 bg-background"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1 h-7 w-7"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="p-6 mb-12 h-screen pb-4 flex-1 flex flex-col ">
                <Tabs
                    defaultValue="all"
                    value={selectedTab}
                    onValueChange={setSelectedTab}
                    className="h-full flex flex-col"
                >
                    <div className="">
                        <TabsList className=" bg-accent   gap-4 ">
                            <TabsTrigger
                                value="all"
                                className="border-none "
                            >
                                All Follow-ups
                                {/* <Badge variant="secondary" className="ml-2 bg-muted">{stats.total}</Badge> */}
                            </TabsTrigger>
                            <TabsTrigger
                                value="overdue"
                                className="border-none"
                            >
                                <AlertCircle className="mr-1 h-4 w-4" />
                                Overdue
                                {/* <Badge variant="secondary" className="ml-2 bg-muted">{stats.overdue}</Badge> */}
                            </TabsTrigger>
                            <TabsTrigger
                                value="today"
                                className="border-none"
                            >
                                <Clock className="mr-1 h-4 w-4" />
                                Today
                                {/* <Badge variant="secondary" className="ml-2 bg-muted">{stats.todayCount}</Badge> */}
                            </TabsTrigger>
                            <TabsTrigger
                                value="upcoming"
                                className="border-none"
                            >
                                <CalendarIcon className="mr-1 h-4 w-4" />
                                Upcoming
                                {/* <Badge variant="secondary" className="ml-2 bg-muted">{stats.upcoming}</Badge> */}
                            </TabsTrigger>
                            <TabsTrigger
                                value="closed"
                                className="border-none"
                            >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Closed
                                {/* <Badge variant="secondary" className="ml-2 bg-muted">{stats.closed}</Badge> */}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value={selectedTab} className="flex-1 pt-4 overflow-">
                        {isLoading ? (
                            <LoadingState />
                        ) : filteredFollowups.length === 0 ? (
                            <EmptyState
                                searchQuery={searchQuery}
                                onClearFilters={() => {
                                    setSearchQuery("");
                                    setSelectedUser("all");
                                    setDateFilter("AllTime");
                                }}
                                onAddFollowup={fetchFollowups}
                            />
                        ) : (
                            <div className="h-full  pr-4">
                                <div className="space-y-4  pb-4">
                                    {filteredFollowups.map((followup) => (
                                        <EnhancedFollowupCard
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
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Custom Date Dialog */}
            <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <CalendarRange className="mr-2 h-5 w-5 text-primary" />
                            Select Custom Date Range
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <div className="border rounded-lg p-1">
                                    <Calendar
                                        mode="single"
                                        selected={customDateRange.start ?? undefined}
                                        onSelect={(date) =>
                                            setCustomDateRange((prev) => ({ ...prev, start: date ? date : null }))
                                        }
                                        initialFocus
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <div className="border rounded-lg p-1">
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
                        <div className="bg-muted rounded-lg p-3 text-sm flex items-start">
                            <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Date Range Selection</p>
                                <p className="text-muted-foreground mt-1">Select both a start and end date to filter your follow-ups by creation date within the specified range.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCustomDateRange({ start: null, end: null });
                                setIsCustomModalOpen(false);
                                setDateFilter("AllTime");
                            }}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setDateFilter("Custom");
                                setIsCustomModalOpen(false);
                            }}
                            disabled={!customDateRange.start || !customDateRange.end}
                            className="gap-2"
                        >
                            <Check className="h-4 w-4" />
                            Apply Range
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Remark Dialog */}
            <AlertDialog open={!!remarkFollowupId} onOpenChange={(open) => !open && setRemarkFollowupId(null)}>
                <AlertDialogContent className="max-w-[500px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                            Add Follow-up Remark
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Document your interaction details, outcomes, and next steps for better follow-up tracking
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-2">
                        <Textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="What happened during this interaction? Any decisions made or action items to note?"
                            className="min-h-[150px] resize-none"
                        />
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Info className="h-4 w-4 mr-2" />
                            <span>Good remarks help with lead tracking and team collaboration</span>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setRemark("")}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAddRemark}
                            disabled={!remark.trim()}
                            className="gap-2"
                        >
                            <Check className="h-4 w-4" />
                            Save Remark
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Follow-up Dialog */}
            <AlertDialog open={!!deleteFollowupId} onOpenChange={(open) => !open && setDeleteFollowupId(null)}>
                <AlertDialogContent className="max-w-[500px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-destructive">
                            <Trash2 className="mr-2 h-5 w-5" />
                            Delete Follow-up
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this follow-up and all its remarks. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm my-2">
                        <p className="font-medium text-destructive">Warning:</p>
                        <p className="mt-1 text-muted-foreground">Deleting a follow-up will remove it from the lead history and all team members will lose access to this information.</p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Follow-up</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 gap-2"
                            onClick={handleDeleteFollowup}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Follow-up
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Close Follow-up Dialog */}
            <AlertDialog open={!!closingFollowupId} onOpenChange={(open) => !open && setClosingFollowupId(null)}>
                <AlertDialogContent className="max-w-[500px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center text-green-600">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Close Follow-up
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Add a final remark to close this follow-up and record the outcome
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-2">
                        <Textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Describe the outcome, any decisions made, or why this follow-up is being closed..."
                            className="min-h-[150px] resize-none"
                        />
                        <div className="flex items-start gap-3 p-3 bg-muted rounded-lg text-sm">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">This information will be added to the lead timeline</p>
                                <p className="text-muted-foreground mt-1">Closing a follow-up marks it as completed and adds the closing remarks to the lead's history for future reference.</p>
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setRemark("")}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCloseFollowup}
                            disabled={!remark.trim()}
                            className="bg-green-600 hover:bg-green-700 gap-2"
                        >
                            <Check className="h-4 w-4" />
                            Complete & Close
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

// Stats Card Component
function StatsCard({ title, value, icon, description, variant, onClick = () => { } }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
    variant?: string;
    onClick?: () => void
}) {
    return (
        <Card
            className={cn(
                "h-full transition-all  hover:shadow-md cursor-pointer",
                variant === "destructive" && "border-l-4 border-l-destructive",
                variant === "amber" && "border-l-4 border-l-amber-500",
                variant === "success" && "border-l-4 border-l-green-500"
            )}
            onClick={onClick}
        >
            <CardContent className="p-2 flex justify-between items-center">
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
                    <div className="text-xl font-bold">{value}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
                </div>
                <div className={cn(
                    "p-2 rounded-full",
                    variant === "destructive" && "bg-destructive/10",
                    variant === "amber" && "bg-amber-500/10",
                    variant === "success" && "bg-green-500/10",
                    !variant && "bg-primary/10"
                )}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

// Loading State Component
function LoadingState(): React.ReactNode {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="relative">
                    <Clock className="h-12 w-12 text-muted-foreground animate-pulse" />
                    <div className="absolute -top-1 -right-1">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                </div>
                <h3 className="mt-4 font-medium">Loading follow-ups...</h3>
                <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch your data</p>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ searchQuery, onClearFilters, onAddFollowup }: {
    searchQuery: string;
    onClearFilters: () => void;
    onAddFollowup: () => void;
}) {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md p-8 rounded-lg border bg-card shadow-sm">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No follow-ups found</h3>
                <p className="text-muted-foreground mb-6">
                    {searchQuery
                        ? "No results match your search criteria. Try adjusting your filters."
                        : "There are no follow-ups matching your current filters"}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button variant="outline" size="lg" onClick={onClearFilters}>
                        <Filter className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                    {canAdd("FollowUps") && (
                        <AddFollowup onFollowupAdded={onAddFollowup} />
                    )}
                </div>
            </div>
        </div>
    );
}

// Enhanced Followup Card Component
// Compact Modern Followup Card Component
function EnhancedFollowupCard({
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
    const isDueToday = followup.stage === "Open" && isToday(new Date(followup.followupDate));

    const dueDate = new Date(followup.followupDate);
    const dueDateFormatted = format(dueDate, "EEE, MMM d • h:mm a");
    const timeAgo = formatDistanceToNow(new Date(followup.createdAt), { addSuffix: true });

    return (
        <Card  onClick={() => router.push(`/CRM/leads/${followup.lead?._id}?tab=followups`)} className={cn(
            "hover:shadow-sm transition-all cursor-pointer overflow-hidden border group",
            isOverdue ? "border-l-[3px] border-l-destructive" :
                isClosed ? "border-l-[3px] border-l-green-500 bg-muted/10" :
                    isDueToday ? "border-l-[3px] border-l-amber-500" :
                        "border-l-[3px] border-l-blue-500"
        )}>
            <CardContent className="p-0">
                <div className="p-3">
                    {/* Header section with badges and actions */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className={cn(
                                "h-5 px-1.5 text-xs",
                                followup.type === "Call" && "bg-blue-50 text-blue-600 border-blue-200",
                                followup.type === "Email" && "bg-purple-50 text-purple-600 border-purple-200",
                                followup.type === "WhatsApp" && "bg-green-50 text-green-600 border-green-200"
                            )}>
                                <span className="flex items-center">
                                    {getFollowupTypeIcon(followup.type)}
                                    <span className="ml-0.5">{followup.type}</span>
                                </span>
                            </Badge>
                            {renderStatusBadge(followup)}

                            {/* Due date - inline with badges */}
                            <div className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {dueDateFormatted}
                            </div>
                        </div>

                        {/* Actions - right aligned */}
                        <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
                            {followup.stage !== "Closed" && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={onRemarkClick}
                                            >
                                                <MessageSquare className="h-3 w-3" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">
                                            <p>Add remark</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {canEdit("FollowUps") && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={onEditClick}
                                            >
                                                <PencilLine className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                        <p>Edit</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <DropdownMenu>
                                {canEdit("FollowUps") && (
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                )}
                                <DropdownMenuContent align="end" className="w-[160px]">

                                    <DropdownMenuItem onClick={onEditClick} className="cursor-pointer text-xs">
                                        <PencilLine className="mr-1.5 h-3 w-3" />
                                        Edit Follow-up
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onRemarkClick} className="cursor-pointer text-xs">
                                        <MessageSquare className="mr-1.5 h-3 w-3" />
                                        Add Remark
                                    </DropdownMenuItem>
                                    {followup.stage !== "Closed" && (
                                        <DropdownMenuItem onClick={onCloseClick} className="cursor-pointer text-xs">
                                            <Check className="mr-1.5 h-3 w-3" />
                                            Close Follow-up
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={onDeleteClick}
                                        className="text-destructive focus:text-destructive cursor-pointer text-xs"
                                    >
                                        <Trash2 className="mr-1.5 h-3 w-3" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Title and description */}
                    <div className="mt-2">
                        <h3 className="text-sm font-medium flex items-center">
                            <button
                                onClick={() => router.push(`/CRM/leads/${followup.lead?._id}?tab=followups`)}
                                className="hover:text-primary transition-colors focus:outline-none hover:underline truncate mr-1"
                            >
                                {followup.lead?.title || "Untitled Follow-up"}
                            </button>
                            <span className="text-xs text-muted-foreground ml-auto">
                                {timeAgo}
                            </span>
                        </h3>

                        {followup.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {followup.description}
                            </p>
                        )}
                    </div>

                    {/* Contact info and details - condensed into a single row */}
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                        {/* Contact info - compact */}
                        {followup.lead?.contact && (
                            <div className="flex items-center">
                                <Avatar className="h-5 w-5 mr-1.5">
                                    <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                                        {followup.lead.contact.firstName?.charAt(0) || ''}
                                        {followup.lead.contact.lastName?.charAt(0) || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-xs font-medium flex items-center gap-1.5">
                                        <span className="truncate max-w-[150px]">
                                            {followup.lead.contact.firstName} {followup.lead.contact.lastName}
                                        </span>

                                        {followup.lead.contact.email && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <FaEnvelope className="h-2.5 w-2.5 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-xs">
                                                        <p>{followup.lead.contact.email}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}

                                        {followup.lead.contact.whatsappNumber && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Phone className="h-2.5 w-2.5 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-xs">
                                                        <p>{followup.lead.contact.whatsappNumber}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Added by - compact */}
                        <div className="flex items-center">
                            <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                    <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">
                                        {followup.addedBy?.firstName?.charAt(0) || ''}
                                        {followup.addedBy?.lastName?.charAt(0) || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-[10px] text-muted-foreground">
                                    <span className="font-medium">
                                        {followup.addedBy?.firstName} {followup.addedBy?.lastName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Latest remark - if exists */}
                    {followup.remarks && followup.remarks.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed border-muted/70 flex gap-1.5 items-start">
                            <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="line-clamp-1 text-xs">
                                    {followup.remarks[followup.remarks.length - 1]?.text}
                                </p>
                                {followup.remarks[followup.remarks.length - 1]?.timestamp && (
                                    <p className="text-[10px] text-muted-foreground">
                                        {format(new Date(followup.remarks[followup.remarks.length - 1]?.timestamp as Date), "MMM d, h:mm a")}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}