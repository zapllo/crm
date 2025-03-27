'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  User2,
  Users2,
  ChevronRight,
  UserPlus,
  UserCog,
  Building,
  RefreshCw,
  LightbulbIcon,
  Briefcase,
  MessageSquare
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Import shadcn components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TeamNavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  shortcutKey?: string;
  badge?: { text: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' };
};

const TeamsSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTip, setActiveTip] = useState(0);
  const [tipAnimation, setTipAnimation] = useState(false);

  // Team tips that will rotate
  const teamTips = [
    "Regular team check-ins improve collaboration and alignment",
    "Define clear roles to avoid duplication of efforts",
    "Create shared documents for key project information",
    "Use tagging to bring attention to specific team members",
    "Schedule dedicated time for team innovation sessions",
    "Maintain a public team calendar for availability transparency",
    "Document decisions made during team meetings",
    "Celebrate team achievements to boost morale",
    "Establish team communication protocols for urgent matters",
    "Encourage knowledge sharing through regular team presentations"
  ];

  // Navigation items
  const navItems: TeamNavItem[] = [
    // {
    //   title: "Sales Team",
    //   href: "/teams/sales-team",
    //   icon: <Briefcase className="h-5 w-5" />,
    //   description: "View and manage the sales department",
    //   shortcutKey: "s",
    // //   badge: { text: "Active", variant: "outline" }
    // },
    {
      title: "User Roles",
      href: "/teams/user-roles",
      icon: <Shield className="h-5 w-5" />,
      description: "Configure user permissions and roles",
      shortcutKey: "r"
    },
    {
      title: "All Members",
      href: "/teams/members",
      icon: <Users2 className="h-5 w-5" />,
      description: "View and manage all team members"
    },
    // {
    //   title: "Invite Members",
    //   href: "/teams/invite",
    //   icon: <UserPlus className="h-5 w-5" />,
    //   description: "Send invitations to new team members",
    //   badge: { text: "New", variant: "secondary" }
    // },
    // {
    //   title: "Team Settings",
    //   href: "/teams/settings",
    //   icon: <UserCog className="h-5 w-5" />,
    //   description: "Configure team preferences and settings"
    // },
    // {
    //   title: "Departments",
    //   href: "/teams/departments",
    //   icon: <Building className="h-5 w-5" />,
    //   description: "Organize teams into departments"
    // },
  ];

  // Rotate tips every 12 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipAnimation(true);
      setTimeout(() => {
        setActiveTip(prev => (prev + 1) % teamTips.length);
        setTipAnimation(false);
      }, 500);
    }, 12000);

    return () => clearInterval(tipInterval);
  }, []);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only respond to Alt + key combinations
    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      navItems.forEach(item => {
        if (item.shortcutKey && event.key.toLowerCase() === item.shortcutKey) {
          event.preventDefault();
          router.push(item.href);
        }
      });
    }
  }, [navItems, router]);

  // Set up keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <TooltipProvider delayDuration={300}>
      <ScrollArea className="h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-6">
          {/* Teams Header */}
          {/* <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users2 className="h-6 w-6 text-[#815BF5]" />
                <h2 className="text-xl font-semibold tracking-tight text-[#815BF5]">Teams</h2>
              </div>
              <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">
                Organization
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground pl-0.5">
              Manage teams and members
            </p>
          </div> */}

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent cursor-pointer group relative",
                      pathname === item.href
                        ? "bg-[#815BF5] text-white hover:bg-primary/80"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <div className="flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="flex-1">{item.title}</span>

                    {item.badge && (
                      <Badge variant={item.badge.variant} className="ml-auto mr-1.5">
                        {item.badge.text}
                      </Badge>
                    )}

                    {item.shortcutKey && (
                      <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground opacity-70">
                        Alt+{item.shortcutKey.toUpperCase()}
                      </kbd>
                    )}

                    <ChevronRight
                      className={cn(
                        "h-4 w-4 opacity-0 transition-all group-hover:opacity-100",
                        pathname === item.href ? "text-white" : "text-muted-foreground"
                      )}
                    />

                    {/* Hover effect - subtle gradient line */}
                    {item.href !== pathname && (
                      <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#815BF5]/0 via-[#815BF5]/50 to-[#815BF5]/0"></div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="w-64">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  {item.shortcutKey && (
                    <div className="mt-1 flex items-center">
                      <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
                        Alt+{item.shortcutKey.toUpperCase()}
                      </kbd>
                      <span className="text-xs ml-1.5 text-muted-foreground">Quick access</span>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

          <Separator className="my-6" />

          {/* Rotating Tips Section */}
          <div className="px-3 py-2">
            <div
              className={cn(
                "rounded-md bg-gradient-to-br from-[#815BF5]/10 via-[#815BF5]/5 to-purple-500/10 p-4 text-xs border border-[#815BF5]/20 transition-all",
                tipAnimation ? "opacity-0 transform -translate-y-2" : "opacity-100"
              )}
            >
              <div className="flex items-center mb-2">
                <LightbulbIcon className="h-4 w-4 text-yellow-500 mr-1.5" />
                <p className="font-semibold text-[#815BF5] flex items-center">
                  Team Tip
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto rounded-full hover:bg-[#815BF5]/10"
                    onClick={() => {
                      setTipAnimation(true);
                      setTimeout(() => {
                        setActiveTip(prev => (prev + 1) % teamTips.length);
                        setTipAnimation(false);
                      }, 500);
                    }}
                    title="Next tip"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </p>
              </div>
              <p className="mt-1 text-muted-foreground">
                {teamTips[activeTip]}
              </p>
            </div>

            {/* Team Communication Box */}
            <div className="mt-4 rounded-md bg-[#815BF5]/10 p-3 text-xs">
              <div className='flex justify-between'>
                <p className="font-semibold text-[#815BF5]">Team Communication</p>
                <Badge variant="outline" className="bg-blue-50 text-[8px] text-blue-600 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                  Coming Soon
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground">
                Connect with your team members or join group discussions.
              </p>
              <div className="mt-2 flex space-x-2">
                <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                </Button>
                <Button size="sm" className="h-7 text-xs w-full bg-[#815BF5] hover:bg-[#815BF5]/90">
                  <Users2 className="h-3.5 w-3.5 mr-1" /> Meetings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
};

export default TeamsSidebar;