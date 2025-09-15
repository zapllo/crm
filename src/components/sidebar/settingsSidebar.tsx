'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Settings,
  Palette,
  Plug,
  MessageSquareText,
  BellRing,
  ChevronRight,
  InfoIcon,
  RefreshCw,
  ShieldCheck,
  Users,
  CreditCard,
  Code,
  Mail,
  Phone,
  MessageCircleDashed,
  MessageCircleMore
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

type SettingsNavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  shortcutKey?: string;
  badge?: { text: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' };
};

const SettingsSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTip, setActiveTip] = useState(0);
  const [tipAnimation, setTipAnimation] = useState(false);

  // Settings tips that will rotate
  const settingsTips = [
    "Enable two-factor authentication for enhanced security",
    "Customize your theme in the Appearance settings",
    "Connect your calendar for better schedule integration",
    "Set up notification preferences to stay informed",
    "Add team members via the Users & Permissions section",
    "Export your data regularly from the Data Management page",
    "Review API keys and app integrations periodically",
    "Customize email templates to maintain consistent branding",
    "Configure payment methods in the Billing section",
    "Use webhook integrations to automate workflows"
  ];

  const settingsNavItems: SettingsNavItem[] = [
    {
      title: "General",
      href: "/settings/general",
      icon: <Users className="h-5 w-5" />,
      description: "Manage your account settings and preferences",
      shortcutKey: "a"
    },
    {
      title: "Customize",
      href: "/settings/customize",
      icon: <Palette className="h-5 w-5" />,
      description: "Personalize your workspace appearance"
    },
    {
      title: "Channels",
      href: "/settings/channels",
      icon: <MessageCircleMore className="h-5 w-5" />,
      description: "Configure security settings and permissions",
    },
    {
      title: "Integrations",
      href: "/settings/integrations",
      icon: <Plug className="h-5 w-5" />,
      description: "Connect with third-party services",
      badge: { text: "New", variant: "secondary"  }
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: <BellRing className="h-5 w-5" />,
      description: "Configure your notification preferences",
      shortcutKey: "n"
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Manage your subscription and payment methods"
    },
    {
      title: "Caller Wallet",
      href: "/settings/wallet",
      icon: <Phone className="h-5 w-5" />,
      description: "Manage your subscription and payment methods"
    },
    {
      title: "API",
      href: "/settings/api",
      icon: <Code className="h-5 w-5" />,
      description: "Get API keys and configure developer settings",
      shortcutKey: "d"
    },
  ];

  // Rotate tips every 12 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipAnimation(true);
      setTimeout(() => {
        setActiveTip(prev => (prev + 1) % settingsTips.length);
        setTipAnimation(false);
      }, 500);
    }, 12000);

    return () => clearInterval(tipInterval);
  }, []);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only respond to Alt + key combinations
    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      settingsNavItems.forEach(item => {
        if (item.shortcutKey && event.key.toLowerCase() === item.shortcutKey) {
          event.preventDefault();
          router.push(item.href);
        }
      });
    }
  }, [settingsNavItems, router]);

  // Set up keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-6">
          {/* Settings Header */}
          <div className="mb-4 px-3 py-2 bg-gradient-to-r from-primary/10 to-blue-100/5 dark:from-primary/20 dark:to-blue-900/5 rounded-lg border border-primary/20">
            <div className="flex items-center text-sm font-medium text-primary">
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Configure your application preferences
            </p>
          </div>

          <nav className="space-y-1.5">
            {settingsNavItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent cursor-pointer group relative",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground hover:bg-primary/80"
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
                        pathname === item.href ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    />

                    {/* Hover effect - subtle gradient line */}
                    {item.href !== pathname && (
                      <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0"></div>
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
          <div className="px-3 py-4 relative">
            {/* <div
              className={cn(
                "rounded-md bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10 p-4 text-xs border border-primary/20 transition-all",
                tipAnimation ? "opacity-0 transform -translate-y-2" : "opacity-100"
              )}
            >
              <div className="flex items-center mb-2">
                <InfoIcon className="h-4 w-4 text-blue-500 mr-1.5" />
                <p className="font-semibold text-primary flex items-center">
                  Settings Tip
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto rounded-full hover:bg-primary/10"
                    onClick={() => {
                      setTipAnimation(true);
                      setTimeout(() => {
                        setActiveTip(prev => (prev + 1) % settingsTips.length);
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
                {settingsTips[activeTip]}
              </p>
            </div> */}

            {/* Help Box */}
            <div className=" rounded-md bg-primary/10 p-3 text-xs">
              <p className="font-semibold text-primary">Need help?</p>
              <p className="mt-1 text-muted-foreground">
                Check our documentation or contact support for assistance.
              </p>
              <div className="mt-2 flex space-x-2">
                <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                  Docs
                </Button>
                <Button size="sm" className="h-7 text-xs w-full">
                  Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SettingsSidebar;
