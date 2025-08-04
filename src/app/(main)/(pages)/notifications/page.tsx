"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns";
import {
  Bell,
  User,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Clock,
  ArrowUpDown,
  X,
  Users,
  Building2,
  Package,
  FileText,
  FormInput,
  Tag,
  UserCog,
  GitBranch,
  Star,
  Info,
  Settings2,
  AlarmClock,
  Eye,
  AlertTriangle,
  HandCoins,
  CalendarClock,
  Trash2,
  Plus,
  MessageSquare,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Define types
interface Notification {
  _id: string;
  organization: string;
  recipient: string;
  actor?: string;
  actorName?: string;
  actorImage?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  message: string;
  details?: any;
  read: boolean;
  important: boolean;
  url?: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    entityTypes: string[];
    actions: string[];
    dateRange: { from?: Date; to?: Date } | null;
    read: boolean | null;
    important: boolean | null;
  }>({
    entityTypes: [],
    actions: [],
    dateRange: null,
    read: null,
    important: null,
  });
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 25,
    skip: 0,
    hasMore: false,
  });

  // Fetch notifications based on current filters
  const fetchNotifications = async (reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      const skip = reset ? 0 : pagination.skip;

      const params: any = {
        limit: pagination.limit,
        skip,
      };

      // Add filters
      if (activeTab === "unread") {
        params.unread = true;
      } else if (activeTab === "important") {
        params.important = true;
      }

      if (selectedFilters.entityTypes.length > 0) {
        params.entityTypes = selectedFilters.entityTypes.join(",");
      }

      if (selectedFilters.actions.length > 0) {
        params.actions = selectedFilters.actions.join(",");
      }

      if (selectedFilters.dateRange?.from) {
        params.fromDate = selectedFilters.dateRange.from.toISOString();
      }

      if (selectedFilters.dateRange?.to) {
        // Adding one day to include the end date fully
        const endDate = new Date(selectedFilters.dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        params.toDate = endDate.toISOString();
      }

      if (selectedFilters.read !== null) {
        params.read = selectedFilters.read;
      }

      if (selectedFilters.important !== null) {
        params.important = selectedFilters.important;
      }

      if (sortOrder) {
        params.sortOrder = sortOrder;
      }


    const response = await axios.get("/api/crmnotifications", { params });

    // Safely handle response data structure
    const responseNotifications = Array.isArray(response.data?.notifications)
      ? response.data.notifications
      : [];

    const newNotifications = reset
      ? responseNotifications
      : [...notifications, ...responseNotifications];

    setNotifications(newNotifications);

    // Safely handle pagination data with fallback values
    const paginationData = response.data?.pagination || {};
    setPagination({
      total: paginationData.total || 0,
      limit: pagination.limit,
      skip: reset ? 0 : pagination.skip + pagination.limit,
      hasMore: !!paginationData.hasMore // Convert to boolean
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (reset) {
      setNotifications([]);
    }
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications(true);
  }, [activeTab, selectedFilters, sortOrder]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.post("/api/crmnotifications", {
        notificationIds: [notificationId]
      });

      // Update local state
      setNotifications(notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.post("/api/crmnotifications", { markAll: true });

      // Update local state
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

// Update the filter function to handle potential non-array values
const filteredNotifications = Array.isArray(notifications) && searchQuery.trim()
  ? notifications.filter(notification =>
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notification.entityName && notification.entityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (notification.actorName && notification.actorName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  : Array.isArray(notifications) ? notifications : [];
  // Get icon for notification type
  const getNotificationIcon = (entityType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      lead: <User className="h-5 w-5 text-blue-500" />,
      contact: <Users className="h-5 w-5 text-green-500" />,
      company: <Building2 className="h-5 w-5 text-purple-500" />,
      pipeline: <GitBranch className="h-5 w-5 text-orange-500" />,
      followup: <Calendar className="h-5 w-5 text-amber-500" />,
      product: <Package className="h-5 w-5 text-emerald-500" />,
      quotation: <FileText className="h-5 w-5 text-rose-500" />,
      form: <FormInput className="h-5 w-5 text-indigo-500" />,
      category: <Tag className="h-5 w-5 text-teal-500" />,
      user: <UserCog className="h-5 w-5 text-cyan-500" />,
    };

    return iconMap[entityType] || <Bell className="h-5 w-5" />;
  };

  // Get appropriate action icon
  const getActionIcon = (action: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      create: <Plus className="h-4 w-4 text-green-500" />,
      update: <RefreshCw className="h-4 w-4 text-blue-500" />,
      delete: <Trash2 className="h-4 w-4 text-red-500" />,
      assign: <HandCoins className="h-4 w-4 text-violet-500" />,
      stage_change: <GitBranch className="h-4 w-4 text-orange-500" />,
      comment: <MessageSquare className="h-4 w-4 text-yellow-500" />,
      note: <FileText className="h-4 w-4 text-emerald-500" />,
      followup: <CalendarClock className="h-4 w-4 text-amber-500" />,
      approve: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      reject: <X className="h-4 w-4 text-red-500" />,
      remind: <AlarmClock className="h-4 w-4 text-indigo-500" />,
      view: <Eye className="h-4 w-4 text-slate-500" />,
      publish: <Globe className="h-4 w-4 text-cyan-500" />,
    };

    return iconMap[action] || <Info className="h-4 w-4" />;
  };

  // Get action verb for notification
  const getActionVerb = (action: string) => {
    const actionMap: Record<string, string> = {
      create: "created",
      update: "updated",
      delete: "deleted",
      assign: "assigned",
      stage_change: "changed stage of",
      comment: "commented on",
      note: "added a note to",
      followup: "scheduled a follow-up for",
      approve: "approved",
      reject: "rejected",
      remind: "set a reminder for",
      view: "viewed",
      publish: "published",
    };

    return actionMap[action] || action;
  };

  // Get human-readable entity type
  const getEntityTypeLabel = (entityType: string) => {
    const typeMap: Record<string, string> = {
      lead: "Lead",
      contact: "Contact",
      company: "Company",
      pipeline: "Pipeline",
      followup: "Follow-up",
      product: "Product",
      quotation: "Quotation",
      form: "Form",
      category: "Category",
      user: "User",
    };

    return typeMap[entityType] || entityType;
  };

  // Available filter options
  const entityTypeOptions = [
    { value: "lead", label: "Leads" },
    { value: "contact", label: "Contacts" },
    { value: "company", label: "Companies" },
    { value: "pipeline", label: "Pipelines" },
    { value: "followup", label: "Follow-ups" },
    { value: "product", label: "Products" },
    { value: "quotation", label: "Quotations" },
    { value: "form", label: "Forms" },
    { value: "category", label: "Categories" },
    { value: "user", label: "Users" },
  ];

  const actionOptions = [
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
    { value: "assign", label: "Assign" },
    { value: "stage_change", label: "Stage Change" },
    { value: "comment", label: "Comment" },
    { value: "note", label: "Note" },
    { value: "followup", label: "Follow-up" },
    { value: "approve", label: "Approve" },
    { value: "reject", label: "Reject" },
    { value: "remind", label: "Reminder" },
    { value: "view", label: "View" },
    { value: "publish", label: "Publish" },
  ];

 // Update the groupedNotifications to ensure we're working with an array
const groupedNotifications = (Array.isArray(filteredNotifications) ? filteredNotifications : []).reduce((groups: Record<string, Notification[]>, notification) => {
  const date = new Date(notification.createdAt).toDateString();
  if (!groups[date]) {
    groups[date] = [];
  }
  groups[date].push(notification);
  return groups;
}, {});

  // Reset filters
  const resetFilters = () => {
    setSelectedFilters({
      entityTypes: [],
      actions: [],
      dateRange: null,
      read: null,
      important: null,
    });
    setSortOrder("newest");
    setSearchQuery("");
  };

  // Show notification details
  const showNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  // Toggle filter for entity type
  const toggleEntityTypeFilter = (entityType: string) => {
    setSelectedFilters(prev => {
      const newEntityTypes = prev.entityTypes.includes(entityType)
        ? prev.entityTypes.filter(type => type !== entityType)
        : [...prev.entityTypes, entityType];

      return {
        ...prev,
        entityTypes: newEntityTypes
      };
    });
  };

  // Toggle filter for action
  const toggleActionFilter = (action: string) => {
    setSelectedFilters(prev => {
      const newActions = prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action];

      return {
        ...prev,
        actions: newActions
      };
    });
  };

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return (
      selectedFilters.entityTypes.length > 0 ||
      selectedFilters.actions.length > 0 ||
      selectedFilters.dateRange !== null ||
      selectedFilters.read !== null ||
      selectedFilters.important !== null ||
      sortOrder !== "newest" ||
      searchQuery.trim() !== ""
    );
  };

  return (
    <div className="container py-6 space-y-6 max-w-screen-xl h-fit max-h-screen overflow-y-scroll mt-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bell className="h-7 w-7" />
            Notifications
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Mark all as read</span>
                    <span className="sm:hidden">Read all</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all notifications as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="default" size="sm" onClick={() => fetchNotifications(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Tabs and Search/Filter bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-9">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-6 bg-accent">
                <TabsTrigger value="all" className="text-sm border-none">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-sm border-none">Unread</TabsTrigger>
                <TabsTrigger value="important" className="text-sm border-none">Important</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters() && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {[
                      selectedFilters.entityTypes.length,
                      selectedFilters.actions.length,
                      selectedFilters.dateRange ? 1 : 0,
                      selectedFilters.read !== null ? 1 : 0,
                      selectedFilters.important !== null ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
                    Reset all
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[320px]">
                <div className="p-4 space-y-4">
                  {/* Entity Types */}
                  {/* <div>
                    <h5 className="font-medium text-sm mb-2">Entity Types</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {entityTypeOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`entity-${option.value}`}
                            checked={selectedFilters.entityTypes.includes(option.value)}
                            onCheckedChange={() => toggleEntityTypeFilter(option.value)}
                          />
                          <label
                            htmlFor={`entity-${option.value}`}
                            className="text-sm cursor-pointer flex items-center"
                          >
                            {getNotificationIcon(option.value)}
                            <span className="ml-1.5">{option.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div> */}

                  {/* <Separator />


                  <div>
                    <h5 className="font-medium text-sm mb-2">Actions</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {actionOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`action-${option.value}`}
                            checked={selectedFilters.actions.includes(option.value)}
                            onCheckedChange={() => toggleActionFilter(option.value)}
                          />
                          <label
                            htmlFor={`action-${option.value}`}
                            className="text-sm cursor-pointer flex items-center"
                          >
                            {getActionIcon(option.value)}
                            <span className="ml-1.5">{option.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />



                  <Separator />

                  <div>
                    <h5 className="font-medium text-sm mb-2">Read Status</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="read-true"
                          checked={selectedFilters.read === true}
                          onCheckedChange={() => setSelectedFilters({
                            ...selectedFilters,
                            read: selectedFilters.read === true ? null : true
                          })}
                        />
                        <label htmlFor="read-true" className="text-sm cursor-pointer">Read</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="read-false"
                          checked={selectedFilters.read === false}
                          onCheckedChange={() => setSelectedFilters({
                            ...selectedFilters,
                            read: selectedFilters.read === false ? null : false
                          })}
                        />
                        <label htmlFor="read-false" className="text-sm cursor-pointer">Unread</label>
                      </div>
                    </div>
                  </div>

                  <Separator />


                  <div>
                    <h5 className="font-medium text-sm mb-2">Importance</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="important-true"
                          checked={selectedFilters.important === true}
                          onCheckedChange={() => setSelectedFilters({
                            ...selectedFilters,
                            important: selectedFilters.important === true ? null : true
                          })}
                        />
                        <label htmlFor="important-true" className="text-sm cursor-pointer">
                          <span className="flex items-center">
                            <Star className="h-4 w-4 text-amber-500 mr-1.5" />
                            Important
                          </span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="important-false"
                          checked={selectedFilters.important === false}
                          onCheckedChange={() => setSelectedFilters({
                            ...selectedFilters,
                            important: selectedFilters.important === false ? null : false
                          })}
                        />
                        <label htmlFor="important-false" className="text-sm cursor-pointer">Normal</label>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setFilterMenuOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent> */}
          {/* </Popover> */}
        </div>

        {/* Active filters display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-sm text-muted-foreground">Active Filters:</span>

            {searchQuery.trim() !== "" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                <span>Search: "{searchQuery.substring(0, 15)}{searchQuery.length > 15 ? '...' : ''}"</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSearchQuery("")}
                >
              <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedFilters.entityTypes.map(type => (
              <Badge key={type} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                <span>Type: {getEntityTypeLabel(type)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => toggleEntityTypeFilter(type)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}

            {selectedFilters.actions.map(action => (
              <Badge key={action} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                <span>Action: {action.charAt(0).toUpperCase() + action.slice(1)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => toggleActionFilter(action)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}

            {selectedFilters.dateRange && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                <span>
                  Date: {selectedFilters.dateRange.from ? format(selectedFilters.dateRange.from, 'MMM d') : ''}
                  {selectedFilters.dateRange.to ? ` - ${format(selectedFilters.dateRange.to, 'MMM d')}` : ''}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSelectedFilters({ ...selectedFilters, dateRange: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedFilters.read !== null && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                <span>Status: {selectedFilters.read ? 'Read' : 'Unread'}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSelectedFilters({ ...selectedFilters, read: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {selectedFilters.important !== null && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                <span>{selectedFilters.important ? 'Important' : 'Normal'}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSelectedFilters({ ...selectedFilters, important: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {sortOrder !== "newest" && (
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                <span>Sort: Oldest first</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSortOrder("newest")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs h-7"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Main content */}
        <div className="space-y-6">
          {loading && notifications.length === 0 ? (
            // Loading skeletons
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center pt-2">
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">No notifications found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {hasActiveFilters()
                      ? "Try adjusting your filters or search terms to see more results."
                      : "You don't have any notifications yet. They'll appear here when activities occur."}
                  </p>
                  {hasActiveFilters() && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      Reset filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Notification groups by date
            <AnimatePresence initial={false}>
              {Object.entries(groupedNotifications).map(([date, notifs]: [string, Notification[]]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm p-2 rounded-md">
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {(() => {
                        const today = new Date().toDateString();
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);

                        if (date === today) {
                          return "Today";
                        } else if (date === yesterday.toDateString()) {
                          return "Yesterday";
                        } else {
                          return format(new Date(date), "MMMM d, yyyy");
                        }
                      })()}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {notifs.map((notification: Notification) => (
                      <motion.div
                        key={notification._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`transition-all duration-200 hover:shadow-md cursor-pointer ${!notification.read ? "border-l-4 border-l-primary" : ""
                            } ${notification.important ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}
                          ${selectedNotification?._id === notification._id ? "ring-2 ring-primary/20" : ""}
                          `}
                          onClick={() => showNotificationDetails(notification)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {notification.actorImage ? (
                                <Avatar>
                                  <AvatarImage src={notification.actorImage} />
                                  <AvatarFallback>
                                    {notification.actorName?.split(" ").map((n: string) => n[0]).join("") || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  {getNotificationIcon(notification.entityType)}
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getActionIcon(notification.action)}
                                  <Badge
                                    variant="outline"
                                    className="px-1.5 py-0 text-xs rounded-sm"
                                  >
                                    {getEntityTypeLabel(notification.entityType)}
                                  </Badge>

                                  {notification.important && (
                                    <Badge
                                      className="bg-amber-500 px-1.5 py-0 text-xs hover:bg-amber-600"
                                    >
                                      <Star className="h-3 w-3 mr-1" />
                                      Important
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-sm font-medium leading-relaxed">
                                  {notification.actorName && (
                                    <span className="font-semibold">{notification.actorName} </span>
                                  )}
                                  <span>{getActionVerb(notification.action)} </span>
                                  <span className="font-semibold">
                                    {notification.entityName && `"${notification.entityName}"`}
                                  </span>
                                </p>

                                {notification.message && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                )}

                                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <time dateTime={notification.createdAt}>
                                    {format(new Date(notification.createdAt), "h:mm a")}
                                  </time>

                                  {!notification.read && (
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    >
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="hidden sm:flex items-center gap-2 self-center">
                                {notification.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(notification.url!);
                                    }}
                                  >
                                    View
                                  </Button>
                                )}

                                {!notification.read && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification._id);
                                    }}
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Load more button */}
          {pagination.hasMore && !loading && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setPagination({
                    ...pagination,
                    skip: pagination.skip + pagination.limit,
                  });
                  fetchNotifications();
                }}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Load more notifications
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Statistics */}
          {!loading && filteredNotifications.length > 0 && (
            <div className="text-xs text-muted-foreground text-center mt-6">
              Showing {filteredNotifications.length} of {pagination.total} notifications
            </div>
          )}
        </div>

        {/* Notification Detail Dialog */}
        <Dialog
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
        >
          <DialogContent className="sm:max-w-md">
            {selectedNotification && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getNotificationIcon(selectedNotification.entityType)}
                    <span>
                      {selectedNotification.entityName || getEntityTypeLabel(selectedNotification.entityType)}
                      {selectedNotification.important && (
                        <Badge className="ml-2 bg-amber-500 text-white">
                          Important
                        </Badge>
                      )}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 pt-1">
                    {getActionIcon(selectedNotification.action)}
                    <span className="capitalize">{getActionVerb(selectedNotification.action)} by {selectedNotification.actorName || "System"}</span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Actor info */}
                  {selectedNotification.actorName && (
                    <div className="flex items-center gap-3 pt-2">
                      <Avatar>
                        <AvatarImage src={selectedNotification.actorImage} />
                        <AvatarFallback>
                          {selectedNotification.actorName?.split(" ").map((n: string) => n[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedNotification.actorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(selectedNotification.createdAt), "PPpp")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm">{selectedNotification.message}</p>
                  </div>

                  {/* Additional details */}
                  {selectedNotification.details && (
                    <div className="border rounded-md p-3">
                      <h4 className="text-sm font-medium mb-2">Additional Details</h4>
                      <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-32">
                        {JSON.stringify(selectedNotification.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedNotification(null)}
                  >
                    Close
                  </Button>

                  {selectedNotification.url && (
                    <Button
                      variant="default"
                      onClick={() => {
                        router.push(selectedNotification.url!);
                        setSelectedNotification(null);
                      }}
                    >
                      View details
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
