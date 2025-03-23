"use client";

import React from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Clock, CalendarClock, BellRing, Sparkles, 
  ArrowRight, CheckCircle2, Zap, RefreshCw, Share2 
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

const AVAILABLE_INTEGRATIONS = ["indiamart", "tradeindia", "google"];

export default function IntegrationPage() {
    const params = useParams();
    const integration = params.integration as string;
    const [email, setEmail] = React.useState("");
    const [isNotified, setIsNotified] = React.useState(false);

    // Check if this is an integration that already has a dedicated page
    if (AVAILABLE_INTEGRATIONS.includes(integration)) {
        return null; // Next.js will continue to the more specific route
    }

    const handleNotifyMe = () => {
        if (email) {
            setIsNotified(true);
            // Here you would typically send this to your backend
            setTimeout(() => setIsNotified(false), 3000);
        }
    };

    const displayName = integration.replace(/-/g, ' ');

    // For all other integrations, show the coming soon page with enhanced styling
    return (
        <div className="p-6 space-y-8 h-screen overflow-y-scroll max-w-5xl mx-auto">
            <Link 
                href="/settings/integrations" 
                className="flex items-center text-sm text-primary mb-4 hover:underline transition-colors duration-200"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Marketplace
            </Link>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900"
                >
                    <Image
                        src={`/integrations/${integration}.png`}
                        alt={`${integration} logo`}
                        width={80}
                        height={80}
                        className="object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/integrations/placeholder.png";
                        }}
                    />
                </motion.div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold capitalize">{displayName}</h1>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                            Coming Soon
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Connect with {displayName} to streamline your workflow
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle>Exciting Features Coming Soon</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                            We're building something amazing with {displayName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-800 dark:text-blue-300">Under Active Development</h3>
                                    <p className="text-blue-700 dark:text-blue-400 mt-1">
                                        Our team is working diligently to bring this integration to life. You'll be among the first to know when it launches!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                            <motion.div 
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex flex-col p-4 rounded-lg border border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-900"
                            >
                                <Zap className="h-6 w-6 text-amber-500 mb-2" />
                                <h3 className="font-medium mb-1">Automated Workflows</h3>
                                <p className="text-sm text-muted-foreground">
                                    Create powerful automations between Zapllo and {displayName}
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex flex-col p-4 rounded-lg border border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-900"
                            >
                                <RefreshCw className="h-6 w-6 text-emerald-500 mb-2" />
                                <h3 className="font-medium mb-1">Real-time Sync</h3>
                                <p className="text-sm text-muted-foreground">
                                    Keep your data synchronized across platforms automatically
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex flex-col p-4 rounded-lg border border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-900"
                            >
                                <Share2 className="h-6 w-6 text-violet-500 mb-2" />
                                <h3 className="font-medium mb-1">Seamless Integration</h3>
                                <p className="text-sm text-muted-foreground">
                                    Connect without coding and start using immediately
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex flex-col p-4 rounded-lg border border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-900"
                            >
                                <CheckCircle2 className="h-6 w-6 text-blue-500 mb-2" />
                                <h3 className="font-medium mb-1">Easy Configuration</h3>
                                <p className="text-sm text-muted-foreground">
                                    Simple setup process with guided onboarding
                                </p>
                            </motion.div>
                        </div>

                        <Separator className="my-6" />

                        <div className={`rounded-lg bg-white dark:bg-gray-900 border ${isNotified ? 'border-green-200 dark:border-green-900' : 'border-blue-100 dark:border-blue-900'} p-5`}>
                            <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                                <BellRing className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Get notified when {displayName} launches
                            </h3>
                            
                            {isNotified ? (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <p>Thanks! We'll notify you when the integration is ready.</p>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Your email address" 
                                        className="max-w-md" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Button 
                                        onClick={handleNotifyMe}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <BellRing className="h-4 w-4 mr-2" />
                                        Notify Me
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-blue-100 dark:border-blue-900 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Available Alternatives</CardTitle>
                            <CardDescription>
                                Try these integrations while you wait
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {AVAILABLE_INTEGRATIONS.map(app => (
                                <Link href={`/settings/integrations/${app}`} key={app} className="block">
                                    <motion.div 
                                        whileHover={{ x: 5 }}
                                        className="flex items-center justify-between p-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                                                <Image
                                                    src={`/integrations/${app}.png`}
                                                    alt={`${app} logo`}
                                                    width={24}
                                                    height={24}
                                                    className="object-contain"
                                                />
                                            </div>
                                            <span className="font-medium capitalize">{app.replace(/-/g, ' ')}</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </motion.div>
                                </Link>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Link href="/settings/integrations" className="w-full">
                                <Button variant="outline" className="w-full">
                                    View All Integrations
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card className="border-blue-100 dark:border-blue-900 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Integration Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center z-10 relative">
                                            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                        </div>
                                        <div className="absolute top-6 left-3 h-full w-0.5 bg-blue-100 dark:bg-blue-900 -z-0"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Development</h4>
                                        <p className="text-sm text-muted-foreground">In Progress</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10 relative">
                                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                        </div>
                                        <div className="absolute top-6 left-3 h-full w-0.5 bg-gray-100 dark:bg-gray-800 -z-0"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-muted-foreground">Beta Testing</h4>
                                        <p className="text-sm text-muted-foreground">Coming soon</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-muted-foreground">Public Launch</h4>
                                        <p className="text-sm text-muted-foreground">Coming soon</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}