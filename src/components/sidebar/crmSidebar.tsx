'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Grid2X2,
    Contact2,
    Building2,
    PhoneCallIcon,
    ShoppingCart,
    ChevronRight,
    LightbulbIcon,
    RefreshCw,
    InfoIcon
} from 'lucide-react';
import { FaFunnelDollar } from 'react-icons/fa';
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

type CRMNavItem = {
    title: string;
    href: string;
    icon: React.ReactNode;
    description: string;
    shortcutKey?: string;
    badge?: { text: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' };
};

interface CRMSidebarProps {
    collapsed?: boolean;
}

const CRMSidebar: React.FC<CRMSidebarProps> = ({ collapsed = false }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [activeTip, setActiveTip] = useState(0);
    const [tipAnimation, setTipAnimation] = useState(false);

    // CRM tips that will rotate
    const crmTips = [
        "Follow up with leads within 24 hours to increase conversion",
        "Use tags to segment your contacts for targeted outreach",
        "Set reminders for important client meetings and deadlines",
        "Review your pipeline weekly to identify any stalled deals",
        "Track customer interactions to personalize communications",
        "Keep contact information current for better relationship management",
        "Document key points from meetings in the notes section",
        "Use email templates to maintain consistent messaging",
        "Analyze your sales process to identify improvement areas",
        "Create custom fields to track industry-specific information"
    ];

    // Navigation items
    const navItems: CRMNavItem[] = [
        {
            title: "Dashboard",
            href: "/CRM/dashboard",
            icon: <Grid2X2 className="h-5 w-5" />,
            description: "Overview of your CRM activities",
            shortcutKey: "d"
        },
        {
            title: "Leads",
            href: "/CRM/leads",
            icon: <FaFunnelDollar className="h-5 w-5" />,
            description: "Manage your potential customers",
        },
        {
            title: "Contacts",
            href: "/CRM/contacts",
            icon: <Contact2 className="h-5 w-5" />,
            description: "View and manage your contacts",
            shortcutKey: "c"
        },
        {
            title: "Companies",
            href: "/CRM/companies",
            icon: <Building2 className="h-5 w-5" />,
            description: "Manage your company connections"
        },
        {
            title: "Follow-up",
            href: "/CRM/follow-up",
            icon: <PhoneCallIcon className="h-5 w-5" />,
            description: "Track and schedule follow-up activities",
           
        },
        {
            title: "Products",
            href: "/CRM/products",
            icon: <ShoppingCart className="h-5 w-5" />,
            description: "Manage your product catalog",
            shortcutKey: "p"
        },
    ];

    // Rotate tips every 12 seconds (only when not collapsed)
    useEffect(() => {
        if (collapsed) return;
        
        const tipInterval = setInterval(() => {
            setTipAnimation(true);
            setTimeout(() => {
                setActiveTip(prev => (prev + 1) % crmTips.length);
                setTipAnimation(false);
            }, 500);
        }, 12000);

        return () => clearInterval(tipInterval);
    }, [collapsed, crmTips.length]);

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
            <ScrollArea className="h-full border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className={cn("py-6 transition-all duration-300", collapsed ? "px-2" : "px-4")}>
                    <nav className="space-y-1.5">
                        {navItems.map((item) => (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <div
                                        onClick={() => router.push(item.href)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md text-sm font-medium transition-all hover:bg-accent cursor-pointer group relative",
                                            collapsed ? "px-2 py-3 justify-center" : "px-3 py-2.5",
                                            pathname === item.href
                                                ? "bg-[#815BF5] text-white hover:bg-primary/80"
                                                : "text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        <div className="flex items-center justify-center flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        
                                        {!collapsed && (
                                            <>
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
                                            </>
                                        )}

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

                    {!collapsed && (
                        <>
                            <Separator className="my-6" />

                            {/* Rotating Tips Section with refresh button */}
                            <div className="px-3 py-4 relative">
                                <div
                                    className={cn(
                                        "rounded-md bg-gradient-to-br from-[#815BF5]/10 via-[#815BF5]/10 to-purple-500/10 p-4 text-xs border border-[#815BF5]/20 transition-all",
                                        tipAnimation ? "opacity-0 transform -translate-y-2" : "opacity-100"
                                    )}
                                >
                                    <div className="flex items-center mb-2">
                                        <LightbulbIcon className="h-4 w-4 text-yellow-500 mr-1.5" />
                                        <p className="font-semibold text-[#815BF5] flex items-center">
                                            CRM Tip
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 ml-auto rounded-full hover:bg-[#815BF5]/10"
                                                onClick={() => {
                                                    setTipAnimation(true);
                                                    setTimeout(() => {
                                                        setActiveTip(prev => (prev + 1) % crmTips.length);
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
                                        {crmTips[activeTip]}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
        </TooltipProvider>
    );
};

export default CRMSidebar;