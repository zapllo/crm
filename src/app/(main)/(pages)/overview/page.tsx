"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Users,
    BarChart3,
    Calendar,
    Package,
    Building2,
    ArrowUpRight,
    Layers,
    Zap,
    BellRing,
    Star,
    Briefcase,
    Settings,
    PieChart,
    MessageSquare,
    PlusCircle,
    ChevronRight,
    Search,
    Clock,
    Trophy,
    Sparkles,
    Users2,
    ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaWhatsapp } from "react-icons/fa";

const OverviewPage = () => {
    const router = useRouter();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const [progress, setProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Add state to track onboarding completion
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [onboardingProgress, setOnboardingProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(68), 500);

        // Check onboarding completion from localStorage
        const checkOnboardingStatus = () => {
            const savedTasks = localStorage.getItem('onboarding_tasks');
            if (savedTasks) {
                const tasks = JSON.parse(savedTasks);
                const completedCount = tasks.filter((task: any) => task.completed).length;
                const progressPercentage = Math.round((completedCount / tasks.length) * 100);
                setOnboardingProgress(progressPercentage);
                setOnboardingCompleted(progressPercentage === 100);
            }
        };

        checkOnboardingStatus();

        return () => clearTimeout(timer);
    }, []);

    const navigateToModule = (path: string) => {
        router.push(path);
    };
    // Main CRM modules
    const mainModules = [
        {
            id: "dashboard",
            title: "Analytics Dashboard",
            description: "Get insights with customizable reports and real-time data",
            icon: <BarChart3 className="h-6 w-6" />,
            path: "/CRM/dashboard",
            color: "bg-sky-500",
            count: null,
            aiPowered: false,
            badgeColor: "text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/30",
        },
        {
            id: "leads",
            title: "Leads Dashboard",
            description: "Track and convert prospects with our powerful lead management system",
            icon: <Users className="h-6 w-6" />,
            path: "/CRM/leads",
            color: "bg-blue-500",
            count: 42,

            aiPowered: true,
            badgeColor: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30",
        },
        {
            id: "followups",
            title: "Follow-ups",
            description: "Never miss a follow-up with automated reminders and task tracking",
            icon: <Clock className="h-6 w-6" />,
            path: "/CRM/follow-up",
            color: "bg-purple-500",
            count: 16,

            aiPowered: true,
            badgeColor: "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30",
        },
        {
            id: "contacts",
            title: "Contacts",
            description: "Track all client contacts and their interactions in one place",
            icon: <Users2 className="h-6 w-6" />,
            path: "/CRM/contacts",
            color: "bg-red-500",
            count: 8,

            badgeColor: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30",
        },
        {
            id: "companies",
            title: "Companies",
            description: "Track all client companies and their interactions in one place",
            icon: <Building2 className="h-6 w-6" />,
            path: "/CRM/companies",
            color: "bg-orange-500",
            count: 68,

            badgeColor: "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30",
        },
        {
            id: "products",
            title: "Products",
            description: "Manage your product catalog with detailed tracking and insights",
            icon: <Package className="h-6 w-6" />,
            path: "/CRM/products",
            color: "bg-emerald-500",
            count: 118,

            badgeColor: "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30",
        },
        {
            id: "quotations",
            title: "Quotations",
            description: "Create and manage sales quotes for your customers",
            icon: <MessageSquare className="h-6 w-6" />,
            path: "/quotations/create",
            color: "bg-indigo-500",
            count: 24,
            badge: "New",
            badgeColor: "text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30",
        },
        {
            id: "form",
            title: "AI Form Builder",
            description: "Create custom forms for lead generation, surveys, feedback and more.",
            icon: <FormIcon className="h-6 w-6" />,
            path: "/forms",
            color: "bg-green-900",
            count: 24,
            badge: "New",
            aiPowered: true,
            badgeColor: "text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30",
        },
        {
            id: "whatsAppAPI",
            title: "Whatsapp API",
            description: "Integrate with our Official WhatsApp API for seamless communication",
            icon: <FaWhatsapp className="h-6 w-6 text-white -500" />,
            path: "https://app.zapllo.com/signup",
            color: "bg-green-500",
            badge: "New",
            aiPowered: true,
            badgeColor: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30",
        },
    ];

    // Quick access modules
    const quickModules = [
        {
            id: "dashboard",
            title: "Analytics Dashboard",
            icon: <BarChart3 className="h-5 w-5" />,
            path: "/CRM/dashboard",
            color: "bg-violet-500",
        },
        {
            id: "leads",
            title: "Leads Dashboard",
            icon: <Layers className="h-5 w-5" />,
            path: "/CRM/leads",
            color: "bg-amber-500",
        },
        {
            id: "integrations",
            title: "Integrations",
            icon: <Zap className="h-5 w-5" />,
            path: "/settings/integrations",
            color: "bg-pink-500",
        },
        {
            id: "followups",
            title: "Followups",
            icon: <BellRing className="h-5 w-5" />,
            path: "/CRM/follow-up",
            color: "bg-green-500",
        },
    ];


    // Filter modules based on search query
    const filteredModules = mainModules.filter((module) =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    const iconVariants = {
        rest: { scale: 1 },
        hover: { scale: 1.2, rotate: 5, transition: { type: "spring", stiffness: 400, damping: 10 } },
    };



    return (
        <div className="w-full pt-8 pb-16 px-4 mt-8 h-full overflow-y-auto scrollbar-hide md:px-6 lg:px-8"
            style={{
                maxHeight: 'calc(100vh - 16px)', // Adjust based on your layout
                scrollBehavior: 'auto' // Prevent smooth scrolling which can interfere
            }} ref={ref}>
            <div className=" w- mt-8 space-y-6">

                <div className="grid grid-cols-1 gap-6">
                    {/* Replace Quick access section with Onboarding card but only if not completed */}
                    {!onboardingCompleted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Card className="border-2 border-primary/10 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        Complete Your Setup
                                    </CardTitle>
                                    <CardDescription>
                                        {onboardingProgress < 50
                                            ? "Get started by completing these essential setup tasks"
                                            : "You're making great progress! Complete remaining tasks to finish setup"
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <div className="flex justify-between mb-2 items-center">
                                            <span className="text-sm text-muted-foreground">Setup Progress</span>
                                            <span className="text-sm font-medium">{onboardingProgress}%</span>
                                        </div>
                                        <Progress value={onboardingProgress} className="h-2" />
                                    </div>
                                    <Button
                                        onClick={() => router.push('/checklist')}
                                        className="w-"
                                    >
                                        {onboardingProgress === 0
                                            ? "Start Onboarding"
                                            : onboardingProgress < 100
                                                ? "Continue Setup"
                                                : "View Completed Tasks"
                                        }
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Main modules section */}
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="text-xl font-semibold mb-4"
                        >
                            CRM Modules
                        </motion.h2>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate={isInView ? "show" : "hidden"}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {filteredModules.length > 0 ? (
                                filteredModules.map((module) => (
                                    <motion.div
                                        key={module.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                        onClick={() => navigateToModule(module.path)}
                                        onMouseEnter={() => setHoveredCard(module.id)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        className="cursor-pointer"
                                    >

                                        <Card className="h-full border overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <motion.div
                                                        className={`h-12 w-12 rounded-lg ${module.color} flex items-center justify-center text-white shadow-sm`}
                                                        variants={iconVariants}
                                                        animate={hoveredCard === module.id ? "hover" : "rest"}
                                                    >
                                                        {module.icon}
                                                    </motion.div>
                                                    {module.aiPowered && (
                                                        <div className="flex items-center gap-1 py-0.5 px-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md shadow-lg border border-white/20 dark:border-black/20 overflow-hidden relative">
                                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
                                                            <Sparkles className="h-3 w-3 animate-pulse text-amber-300" />
                                                            <span className="text-xs font-medium tracking-wide">Zapllo AI</span>
                                                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/30 dark:to-white/10 opacity-40 animate-shine"></div>
                                                        </div>
                                                    )}

                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-semibold text-lg">{module.title}</h3>
                                                    {module.badge && (
                                                        <Badge variant="outline" className={module.badgeColor}>
                                                            {module.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{module.description}</p>
                                            </CardContent>
                                            <CardFooter className="pt-0">
                                                <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent h-auto text-primary w-full justify-between">
                                                    <span className="flex items-center gap-1">
                                                        <span>Open Module</span>
                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                    </span>
                                                    <AnimatePresence>
                                                        {hoveredCard === module.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 20 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="text-sm text-muted-foreground"
                                                            >

                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full text-center py-10"
                                >
                                    <p className="text-muted-foreground">No modules found matching "{searchQuery}"</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        Clear search
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;



// Add this helper component
function FormIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 7h10" />
            <path d="M7 12h10" />
            <path d="M7 17h5" />
        </svg>
    );
}

// Helper components
function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
