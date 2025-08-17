"use client";
import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  User2,
  Settings,
  LogOut,
  DollarSign,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  Phone,
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle2,
  BellRing,
  X,
  Crown,
  ExternalLink,
  Globe,
  Wallet,
  Users,
  Building2,
  GitBranch,
  Package,
  FileText,
  FormInput,
  Tag,
  UserCog,
  Brain,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { ModeToggle2 } from "../globals/mode-toggle2";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaAndroid, FaApple } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { useUserContext } from "@/contexts/userContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from "../ui/skeleton";

export default function InfoBar() {
  const router = useRouter();
  const pathName = usePathname();
  const { user, loading } = useUserContext();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Add wallet balance state
  const [walletBalance, setWalletBalance] = useState(0);
  // Add AI credits state
  const [aiCredits, setAiCredits] = useState(0);
  // Add state for logout dialog
  // Add state for logout dialog
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);


  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await axios.get("/api/wallet/balance");
        setWalletBalance(response.data.balance);
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
      }
    };

    fetchWalletBalance();
    // Set up a refresh interval (every 5 minutes)
    const interval = setInterval(fetchWalletBalance, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  // Fetch AI credits
  useEffect(() => {
    const fetchAiCredits = async () => {
      try {
        const response = await axios.get("/api/organization/ai-credits");
        setAiCredits(response.data.aiCredits || 0);
      } catch (err) {
        console.error("Error fetching AI credits:", err);
      }
    };

    fetchAiCredits();
    // Set up a refresh interval (every 5 minutes)
    const interval = setInterval(fetchAiCredits, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const getPageTitle = () => {
    const routeMap: Record<string, string> = {
      "/CRM/dashboard": "Dashboard",
      "/CRM/contacts": "Contacts",
      "/CRM/leads": "Lead Dashboard",
      "/CRM/companies": "Companies",
      "/CRM/products": "Products",
      "/CRM/follow-up": "Follow-ups",
      "/teams/members": "Team Members",
      "/dashboard/settings": "Settings",
      "/dashboard/profile": "My Profile",
      "/help/tickets": "Support Tickets",
      "/help/mobile-app": "Mobile App",
      "/intranet": "Intranet",
      "/help/tutorials": "Tutorials",
      "/help/events": "Events",
      // Add more routes as needed
    };

    // Check for dynamic routes
    if (pathName.startsWith("/help/tickets/")) {
      return "Ticket Details";
    }

    return routeMap[pathName] || "Dashboard";
  };

  const logout = async () => {
    try {
      const response = await axios.get("/api/auth/logout");
      if (response.data.success) {
        // Force a hard refresh to the login page instead of client navigation
        window.location.href = '/login';
      }
    } catch (error: any) {
      console.error("Logout error:", error.message);
    }
  };


  // Add a function to fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await axios.get("/api/crmnotifications", {
        params: { limit: 5, unread: false }
      });
      setNotifications(response.data.notifications);

      // Get unread count
      const unreadResponse = await axios.get("/api/crmnotifications", {
        params: { limit: 0, unread: true }
      });
      setUnreadCount(unreadResponse.data.pagination.total);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Quick actions for command menu
  const quickActions = [
    { name: "Add new contact", shortcut: "C", action: () => router.push("/CRM/contacts") },
    { name: "Create follow-up", shortcut: "F", action: () => router.push("/CRM/follow-up") },
    { name: "New ticket", shortcut: "T", action: () => router.push("/help/tickets") },
    { name: "View dashboard", shortcut: "D", action: () => router.push("/CRM/dashboard") }
  ];

  // User's initials for avatar
  const getInitials = () => {
    if (!user) return "ZP";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;
  };


  // Update the logout function to handle the confirmation flow
  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await axios.get("/api/auth/logout");
      if (response.data.success) {
        // Force a hard refresh to the login page
        window.location.href = '/login';
      }
    } catch (error: any) {
      console.error("Logout error:", error.message);
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  // Add these utility functions inside the InfoBar component

  // Get icon for notification type
  const getNotificationIcon = (entityType: string) => {
    switch (entityType) {
      case "lead":
        return <User2 className="h-4 w-4 text-blue-500" />;
      case "contact":
        return <Users className="h-4 w-4 text-green-500" />;
      case "company":
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case "pipeline":
        return <GitBranch className="h-4 w-4 text-orange-500" />;
      case "followup":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case "product":
        return <Package className="h-4 w-4 text-emerald-500" />;
      case "quotation":
        return <FileText className="h-4 w-4 text-rose-500" />;
      case "form":
        return <FormInput className="h-4 w-4 text-indigo-500" />;
      case "category":
        return <Tag className="h-4 w-4 text-teal-500" />;
      case "user":
        return <UserCog className="h-4 w-4 text-cyan-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get action verb for notification
  const getActionVerb = (action: string) => {
    switch (action) {
      case "create":
        return "created";
      case "update":
        return "updated";
      case "delete":
        return "deleted";
      case "assign":
        return "assigned";
      case "stage_change":
        return "changed stage of";
      case "comment":
        return "commented on";
      case "note":
        return "added a note to";
      case "followup":
        return "scheduled a follow-up for";
      case "approve":
        return "approved";
      case "reject":
        return "rejected";
      case "remind":
        return "set a reminder for";
      case "view":
        return "viewed";
      case "publish":
        return "published";
      default:
        return action;
    }
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex  justify-end"
    >
      <div className="fixed w-full justify-start  bg-background/95 backdrop-blur-sm border-b z-[10] shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left section with page title */}
          <div className="flex items-center ml-20 gap-2 md:gap-3">
            <h1 className="font-semibold text-xl hidden md:block">{getPageTitle()}</h1>
            <Link href='/settings/billing'>
              <Badge variant="outline" className="hidden cursor-pointer md:flex items-center gap-1 py-1 bg-primary/5">
                <Crown className="h-3 w-3 text-amber-500" />
                <span className="text-xs">Premium</span>
              </Badge>
            </Link>
          </div>

          {/* Center section with search */}
          <div className="flex-1 flex justify-center max-w-xl">
            <Button
              variant="outline"
              className="relative h-9 w-full md:w-64 lg:w-96 justify-start text-sm text-muted-foreground rounded-full px-4"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Search anything...</span>
              <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Right section with notifications and user menu */}
          <div className="flex items-center gap-3">
            {/* Add wallet balance display */}
            <Link href="/settings/wallet">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1.5 rounded-full"
              >
                <Wallet className="h-4 w-4 text-primary" />
                <span>₹{(walletBalance / 100).toFixed(2)}</span>
              </Button>
            </Link>
            {/* AI Credits display */}
            <Link href="/settings/wallet?tab=ai-credits">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1.5 rounded-full"
              >
                <Brain className="h-4 w-4 text-purple-600" />
                <span>{aiCredits} AI</span>
              </Button>
            </Link>
            {/* Help button with tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => router.push("/help")}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Help & Resources</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogContent className="sm:max-w-md z-[100]  ">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-red-400" />
                    Confirm Logout
                  </DialogTitle>
                  <DialogDescription className="">
                    Are you sure you want to log out of your account?
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <p className="text-sm ">
                    You will need to log in again to access your dashboard and data.
                  </p>
                </div>

                <DialogFooter className="flex sm:justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={cancelLogout}
                    className=" "
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmLogout}
                    className="bg-red-500/80 hover:bg-red-600 text-white"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging out...
                      </span>
                    ) : (
                      "Yes, log me out"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Notifications button */}
            <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent className="w-full sm:max-w-sm">
                <SheetHeader className="border-b mt-4 pb-4">
                  <SheetTitle className="flex items-center justify-between">
                    <div>Notifications</div>
                    <Badge variant="outline" className="font-normal">
                      {unreadCount} unread
                    </Badge>
                  </SheetTitle>
                </SheetHeader>

                <Tabs defaultValue="all" className="mt-4">
                  <TabsList className="grid bg-accent gap-2 grid-cols-3 mb-4">
                    <TabsTrigger className='border-none' value="all">All</TabsTrigger>
                    <TabsTrigger className='border-none' value="unread">Unread</TabsTrigger>
                    <TabsTrigger className='border-none' value="mentions">Mentions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    {notificationsLoading ? (
                      // Show loading skeletons
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 py-3 border-b">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-1 flex-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-10">
                        <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`flex items-start gap-3 py-3 border-b hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? "bg-primary/5" : ""
                            }`}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification._id);
                            }
                            if (notification.url) {
                              router.push(notification.url);
                              setNotificationsOpen(false);
                            }
                          }}
                        >
                          {notification.actorImage ? (
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={notification.actorImage} />
                              <AvatarFallback>
                                {notification.actorName?.split(" ").map((n: string) => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                              {getNotificationIcon(notification.entityType)}
                            </div>
                          )}

                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{notification.actorName || "System"}</span>{" "}
                              {getActionVerb(notification.action)} a{" "}
                              <span className="font-medium">{notification.entityType}</span>
                              {notification.entityName && ` "${notification.entityName}"`}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>

                          {!notification.read && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Other tabs can be implemented similarly */}
                </Tabs>

                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => {
                    router.push('/notifications');
                    setNotificationsOpen(false);
                  }}
                >
                  View all notifications
                </Button>
              </SheetContent>
            </Sheet>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 hover:bg-transparent h-9">
                  <div className="flex items-center gap-2 rounded-full px-2 :bg-accent transition-colors">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left mr-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/overview/profile")}>
                    <User2 className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings/customize")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings/billing")}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Mobile Apps</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="bg-white dark:bg-accent">
                      <DropdownMenuItem onClick={() => router.push("/help/mobile-app")}>
                        <FaAndroid className="mr-2 h-4 w-4" />
                        <span>Android App</span>
                        <DropdownMenuShortcut>
                          <ExternalLink className="h-3 w-3" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/help/mobile-app")}>
                        <FaApple className="mr-2 h-4 w-4" />
                        <span>iOS App</span>
                        <DropdownMenuShortcut>
                          <ExternalLink className="h-3 w-3" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <ModeToggle2 />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogoutClick} className="text-red-500  hover:text-white">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Command palette for global search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.name}
                onSelect={() => {
                  action.action();
                  setSearchOpen(false);
                }}
              >
                {action.name}
                <CommandShortcut>⌘{action.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent">
            <CommandItem
              onSelect={() => {
                router.push('/CRM/leads');
                setSearchOpen(false);
              }}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push('/CRM/contacts');
                setSearchOpen(false);
              }}
            >
              <User2 className="mr-2 h-4 w-4" />
              <span>Contacts</span>
            </CommandItem>

            {/* <CommandItem>
              <Phone className="mr-2 h-4 w-4" />
              <span>Call Log</span>
            </CommandItem> */}
            <CommandItem
              onSelect={() => {
                router.push('/settings/channels');
                setSearchOpen(false);
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Email Templates</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Help">
            <CommandItem onSelect={() => router.push("/help/tutorials")}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Documentation</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push("/help/tickets")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Support</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </motion.div>
  );
}
