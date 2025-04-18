'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  List,
  Settings,
  User,
  Layers,
  Share2,
  FileCheck,
  ChevronRight,
  InfoIcon,
  Palette,
  History
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
import { IconTemplate } from '@tabler/icons-react';

type QuotationNavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  shortcutKey?: string;
  badge?: { text: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' };
};

const QuotationSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const quotationNavItems: QuotationNavItem[] = [
    {
      title: "Create Quotation",
      href: "/quotations/create",
      icon: <Plus className="h-5 w-5" />,
      description: "Create a new quotation for your clients",
      shortcutKey: "c",
      // badge: { text: "New", variant: "secondary" }
    },
    {
      title: "All Quotations",
      href: "/quotations/all",
      icon: <List className="h-5 w-5" />,
      description: "View and manage all quotations",
      shortcutKey: "a"
    },
    {
      title: "My Quotations",
      href: "/quotations/myQuotations",
      icon: <User className="h-5 w-5" />,
      description: "View quotations created by you"
    },
    {
      title: "Templates",
      href: "/quotations/templates",
      icon: <IconTemplate className="h-5 w-5" />,
      description: "Manage quotation templates",
      badge: { text: "Pro", variant: "default" }
    },

    {
      title: "Settings",
      href: "/quotations/settings",
      icon: <Settings className="h-5 w-5" />,
      description: "Configure quotation settings and preferences",
      shortcutKey: "s"
    },
  ];

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only respond to Alt + key combinations
    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      quotationNavItems.forEach(item => {
        if (item.shortcutKey && event.key.toLowerCase() === item.shortcutKey) {
          event.preventDefault();
          router.push(item.href);
        }
      });
    }
  }, [quotationNavItems, router]);

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
          {/* Quotation Header */}
          <div className="mb-4 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-lg border border-blue-500/20">
            <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4 mr-1.5" />
              Quotations
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Create and manage professional quotations
            </p>
          </div>

          <nav className="space-y-1.5">
            {quotationNavItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent cursor-pointer group relative",
                      pathname === item.href
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-muted-foreground hover:text-blue-600"
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
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0"></div>
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



          {/* Help Box */}
          {/* <div className="px-3 py-4 mt-4">
            <div className="rounded-md bg-blue-500/10 p-3 text-xs">
              <p className="font-semibold text-blue-600 dark:text-blue-400">Need help?</p>
              <p className="mt-1 text-muted-foreground">
                Learn how to create professional quotes that win more deals.
              </p>
              <div className="mt-2 flex space-x-2">
                <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                  Docs
                </Button>
                <Button size="sm" className="h-7 text-xs w-full bg-blue-600 hover:bg-blue-700">
                  Tutorial
                </Button>
              </div>
            </div> */}
          {/* </div> */}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QuotationSidebar;
