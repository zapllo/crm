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

export default function InfoBar() {
  const router = useRouter();
  const pathName = usePathname();
  const { user, loading } = useUserContext();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
        // Use client-side navigation to redirect
        router.push('/login');
      }
    } catch (error: any) {
      console.error("Logout error:", error.message);
    }
  };
  // Mock notifications for demo
  const notifications = [
    {
      id: 1,
      title: "New lead assigned",
      description: "Jane Cooper has been assigned to you",
      time: "10 minutes ago",
      read: false,
      type: "lead"
    },
    {
      id: 2,
      title: "Meeting reminder",
      description: "Call with Alex Morgan in 30 minutes",
      time: "30 minutes ago",
      read: false,
      type: "meeting"
    },
    {
      id: 3,
      title: "Task completed",
      description: "Product demo presentation has been completed",
      time: "2 hours ago",
      read: true,
      type: "task"
    },
    {
      id: 4,
      title: "Follow-up needed",
      description: "Deal with Acme Inc. requires follow-up",
      time: "1 day ago",
      read: true,
      type: "followup"
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "lead":
        return <User2 className="h-4 w-4 text-blue-500" />;
      case "meeting":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "task":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "followup":
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex  justify-end"
    >
      <div className="fixed w-[95%]  bg-background/95 backdrop-blur-sm border-b z-[10] shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left section with page title */}
          <div className="flex items-center gap-2 md:gap-3">
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
            {/* Help button with tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => router.push("/help/tutorials")}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Help & Resources</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="flex items-center justify-between">
                    <div>Notifications</div>
                    <Badge variant="outline" className="font-normal">
                      {unreadCount} unread
                    </Badge>
                  </SheetTitle>
                </SheetHeader>

                <Tabs defaultValue="all" className="mt-4">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="mentions">Mentions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex gap-3 p-3 rounded-lg transition-colors",
                          notification.read ? "bg-background" : "bg-primary/5"
                        )}
                      >
                        <div className="p-2 rounded-full bg-muted flex items-center justify-center h-9 w-9">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="unread" className="space-y-3">
                    {notifications.filter(n => !n.read).map((notification) => (
                      <div
                        key={notification.id}
                        className="flex gap-3 p-3 rounded-lg bg-primary/5"
                      >
                        <div className="p-2 rounded-full bg-muted flex items-center justify-center h-9 w-9">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="mentions" className="p-4 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No mentions yet</p>
                  </TabsContent>
                </Tabs>

                <Button variant="ghost" className="w-full mt-4">
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
                      {/* <AvatarImage src={user?.profileImage} /> */}
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
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/billing")}>
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
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
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
            <CommandItem>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem>
              <User2 className="mr-2 h-4 w-4" />
              <span>Contacts</span>
            </CommandItem>
            <CommandItem>
              <Phone className="mr-2 h-4 w-4" />
              <span>Call Log</span>
            </CommandItem>
            <CommandItem>
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