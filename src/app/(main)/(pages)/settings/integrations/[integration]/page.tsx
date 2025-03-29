"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Clock, CalendarClock, BellRing, Sparkles, 
  ArrowRight, CheckCircle2, Zap, RefreshCw, Share2,
  FileText, CheckCircle, AlertCircle, MessageSquare
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Define which integrations are free vs. premium
const FREE_INTEGRATIONS = ["indiamart", "tradeindia", "google", "zapllo-caller"]
const AVAILABLE_INTEGRATIONS = [...FREE_INTEGRATIONS, "justdial", "shopify"];

export default function IntegrationPage() {
    const params = useParams();
    const integration = params.integration as string;
    const [email, setEmail] = useState("");
    const [isNotified, setIsNotified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);
    const [setupStatus, setSetupStatus] = useState<any>(null);
    const { toast } = useToast();
    const router = useRouter();

    // Check if this is an integration that already has a dedicated page
    if (AVAILABLE_INTEGRATIONS.includes(integration)) {
        return null; // Next.js will continue to the more specific route
    }

    const isFree = FREE_INTEGRATIONS.includes(integration);
    const displayName = integration.replace(/-/g, ' ');
    const capitalizedName = displayName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    useEffect(() => {
        // Check if this integration has been purchased
        const checkIntegrationStatus = async () => {
            try {
                const response = await axios.get(`/api/integrations/status?platform=${integration}`);
                const integrations = response.data;
                
                if (integrations && integrations.length > 0) {
                    setIsPurchased(integrations[0].isPurchased);
                    setSetupStatus(integrations[0]);
                }
            } catch (error) {
                console.error("Error checking integration status:", error);
            }
        };
        
        checkIntegrationStatus();
    }, [integration]);

    const handleNotifyMe = () => {
        if (email) {
            setIsNotified(true);
            // Here you would typically send this to your backend
            setTimeout(() => setIsNotified(false), 3000);
        }
    };

    const initiatePayment = async () => {
        setIsLoading(true);
        try {
            // First, create the Razorpay order
            const price = 699; // Default price - you could have different prices for different integrations
            const orderResponse = await axios.post("/api/create-order", {
                amount: price * 100, // Convert to paise
                currency: "INR",
                receipt: `integration-${integration}`,
                notes: {
                    integrationName: capitalizedName,
                },
            });

            const { orderId } = orderResponse.data;

            // Load the Razorpay script dynamically
            if (!(window as any).Razorpay) {
                await loadRazorpayScript();
            }

            // Configure Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: price * 100,
                currency: "INR",
                name: "Zapllo",
                description: `${capitalizedName} Integration`,
                order_id: orderId,
                handler: function (response: any) {
                    handlePaymentSuccess(response, orderId, price);
                },
                prefill: {
                    name: "", // You can prefill this from user context if available
                    email: "",
                    contact: "",
                },
                theme: {
                    color: "#7451F8",
                },
            };

            // Initialize Razorpay
            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Payment initiation error:", error);
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: "Could not initialize payment. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadRazorpayScript = (): Promise<void> => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve();
            document.body.appendChild(script);
        });
    };

    const handlePaymentSuccess = async (response: any, orderId: string, amount: number) => {
        try {
            // Send payment verification details to server
            const verificationResponse = await axios.post("/api/payment-success", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_signature: response.razorpay_signature,
                userId: "", // This will be extracted from the token on the server side
                amount: amount * 100,
                planName: `${capitalizedName} Integration`,
                subscribedUserCount: 1, // Not really applicable for integrations
                additionalUserCount: 0,
                deduction: 0,
            });

            if (verificationResponse.data.success) {
                toast({
                    title: "Payment Successful!",
                    description: `Your ${capitalizedName} integration is now being processed.`,
                });
                
                // Redirect to thank you page
                router.push(`/settings/integrations/thank-you?integration=${integration}`);
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: "We couldn't verify your payment. Please contact support.",
            });
        }
    };

    // If the integration is purchased, show the setup status
    if (isPurchased) {
        // Define setup steps based on current status
        const setupSteps = [
            {
                title: "Payment Received",
                description: "Your payment for the integration has been successfully processed",
                status: "completed"
            },
            {
                title: "Integration Specialist Assigned",
                description: "A dedicated specialist has been assigned to your integration",
                status: setupStatus?.setupStatus === "in_progress" || setupStatus?.setupStatus === "completed" ? "completed" : "in-progress"
            },
            {
                title: "Initial Consultation",
                description: "Discussing your requirements and gathering necessary information",
                status: setupStatus?.setupStatus === "in_progress" ? "in-progress" : "pending"
            },
            {
                title: "Configuration & Setup",
                description: "Setting up the integration according to your specific needs",
                status: "pending"
            },
            {
                title: "Testing & Quality Assurance",
                description: "Testing the integration to ensure everything works correctly",
                status: "pending"
            },
            {
                title: "Integration Deployment",
                description: "Deploying the integration to your production environment",
                status: "pending"
            },
            {
                title: "Training & Handover",
                description: "Training your team on how to use the integration effectively",
                status: "pending"
            }
        ];

        return (
            <div className="p-6 space-y-8 h-screen overflow-y-scroll scrollbar-hide  mx-auto">
                <Link
                    href="/settings/integrations"
                    className="flex items-center text-sm text-primary mb-4 hover:underline transition-colors duration-200"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Marketplace
                </Link>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
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
                            <h1 className="text-3xl font-bold">{capitalizedName}</h1>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
                                Purchased
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            Integration with {capitalizedName} is being set up by our team
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Integration Status</CardTitle>
                        <CardDescription>
                            Track the progress of your {capitalizedName} integration setup
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {setupSteps.map((step, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="relative">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 relative
                                            ${step.status === 'completed' ? 'bg-green-100 dark:bg-green-900' : 
                                            step.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900' : 
                                            'bg-gray-100 dark:bg-gray-800'}`}>
                                            {step.status === 'completed' ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <div className={`h-2 w-2 rounded-full 
                                                ${step.status === 'in-progress' ? 'bg-blue-600 dark:bg-blue-400' : 
                                                    'bg-gray-400 dark:bg-gray-600'}`}></div>
                                            )}
                                        </div>
                                        {index < setupSteps.length - 1 && (
                                            <div className={`absolute top-6 left-3 h-full w-0.5 
                                            ${step.status === 'completed' ? 'bg-green-100 dark:bg-green-900' : 
                                                step.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900' : 
                                                'bg-gray-100 dark:bg-gray-800'} -z-0`}></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`font-medium ${
                                            step.status === 'pending' ? 'text-muted-foreground' : ''
                                        }`}>{step.title}</h4>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div className="flex items-start gap-3">
                                <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <h3 className="font-medium">Estimated Completion</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Our team typically completes integrations within 2-3 business days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Integration Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">Full data synchronization with {capitalizedName}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">Customized workflows tailored to your business needs</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">End-to-end setup by our integration specialists</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">Ongoing technical support for your integration</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">Training for your team on how to use the integration</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <p className="text-sm">
                                        Our integration specialist will contact you within 24 hours to gather
                                        necessary information and begin the setup process.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <p className="text-sm">
                                        Please have your {capitalizedName} credentials ready to expedite the setup process.
                                    </p>
                                </div>
                            </div>

                            <Button variant="outline" asChild className="mt-2 w-full">
                                <Link href="/support">
                                    Contact Support
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // For premium integrations that have not been purchased yet
    if (!isFree) {
        const integrationDetails = {
            price: 699, // Default price
            features: [
                `Full data synchronization with ${capitalizedName}`,
                "Custom field mapping according to your requirements",
                "Automated workflows between Zapllo and " + capitalizedName,
                "End-to-end setup by our integration specialists",
                "Comprehensive training for your team",
                "Detailed documentation and guides",
                "Priority technical support",
                "Regular updates and maintenance"
            ],
            benefits: [
                {
                    title: "Seamless Integration",
                    description: `Connect your Zapllo CRM with ${capitalizedName} without any coding`,
                    icon: <Share2 className="h-6 w-6 text-blue-500" />
                },
                {
                    title: "Time Saving",
                    description: "Eliminate manual data entry and reduce administrative tasks",
                    icon: <Clock className="h-6 w-6 text-violet-500" />
                },
                {
                    title: "Data Accuracy",
                    description: "Ensure consistency across all your business platforms",
                    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />
                },
                {
                    title: "Enhanced Efficiency",
                    description: "Streamline workflows and automate routine processes",
                    icon: <Zap className="h-6 w-6 text-amber-500" />
                }
            ]
        };

        return (
            <div className="p-6 space-y-8 h-screen overflow-y-scroll scrollbar-hide  mx-auto">
                <Link
                    href="/settings/integrations"
                    className="flex items-center text-sm text-primary mb-4 hover:underline transition-colors duration-200"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Marketplace
                </Link>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Main content */}
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-4">
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
                                    <h1 className="text-3xl font-bold">{capitalizedName}</h1>
                                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                                        Premium
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground text-lg">
                                    Connect your {capitalizedName} account with Zapllo CRM
                                </p>
                            </div>
                        </div>

                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="mb-4 bg-accent gap-2">
                                <TabsTrigger className="border-none" value="overview">Overview</TabsTrigger>
                                <TabsTrigger className="border-none" value="features">Features</TabsTrigger>
                                <TabsTrigger className="border-none" value="how-it-works">How It Works</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-amber-500" />
                                            Premium Integration Benefits
                                        </CardTitle>
                                        <CardDescription>
                                            Unlock powerful workflows and automations with the {capitalizedName} integration
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {integrationDetails.benefits.map((benefit, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex gap-3 p-4 rounded-lg border border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-900"
                                                >
                                                    <div className="mt-1">{benefit.icon}</div>
                                                    <div>
                                                        <h3 className="font-medium mb-1">{benefit.title}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {benefit.description}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Integration Process</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex gap-3">
                                                    <div className="relative">
                                                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center z-10 relative">
                                                            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                                        </div>
                                                        <div className="absolute top-6 left-3 h-full w-0.5 bg-blue-100 dark:bg-blue-900 -z-0"></div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">1. Purchase Integration</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Complete the monthly recurring payment process
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="relative">
                                                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center z-10 relative">
                                                            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                                        </div>
                                                        <div className="absolute top-6 left-3 h-full w-0.5 bg-blue-100 dark:bg-blue-900 -z-0"></div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">2. Team Contact</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Our integration specialists will reach out within 24 hours
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="relative">
                                                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center z-10 relative">
                                                            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                                        </div>
                                                        <div className="absolute top-6 left-3 h-full w-0.5 bg-blue-100 dark:bg-blue-900 -z-0"></div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">3. Configuration & Setup</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            We'll work with you to configure the integration to your needs
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">4. Live & Ongoing Support</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Integration goes live with our continuous technical support
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="features" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Comprehensive Features</CardTitle>
                                        <CardDescription>
                                            Everything you get with the {capitalizedName} integration
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {integrationDetails.features.map((feature, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-start gap-3"
                                                >
                                                    <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm">{feature}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="how-it-works" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>How It Works</CardTitle>
                                        <CardDescription>
                                            Learn how the {capitalizedName} integration enhances your workflow
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-base font-medium mb-3">Setting Up</h3>
                                                <ol className="list-decimal pl-5 space-y-3 text-sm">
                                                    <li>
                                                        <span className="font-medium">Purchase the integration</span>
                                                        <p className="text-muted-foreground mt-1">
                                                            Complete the monthly recurring payment to begin the setup process
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <span className="font-medium">Consultation call</span>
                                                        <p className="text-muted-foreground mt-1">
                                                            Our specialists will discuss your specific requirements and workflow
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <span className="font-medium">Configuration and setup</span>
                                                        <p className="text-muted-foreground mt-1">
                                                            We'll handle the technical setup based on your needs
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <span className="font-medium">Testing and go-live</span>
                                                        <p className="text-muted-foreground mt-1">
                                                            We'll thoroughly test and then deploy your integration
                                                        </p>
                                                    </li>
                                                </ol>
                                            </div>

                                            <div>
                                                <h3 className="text-base font-medium mb-3">Key Benefits</h3>
                                                <ul className="list-disc pl-5 space-y-3 text-sm">
                                                    <li>
                                                        <span className="font-medium">Data Syncing</span>
                                                        <p className="text-muted-foreground mt-1">
                                                            Automatic synchronization keeps your data consistent across platforms
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <span className="font-medium">Workflow Automation</span>
                                                        <p className="text-muted-foreground mt-1">
                                                            Create automated workflows between Zapllo and {capitalizedName}
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <span className="font-medium">Centralized Management</span>
                                                        <p className="text-muted-foreground mt-1">
                                                            Manage all your {capitalizedName} data directly from Zapllo
                                                        </p>
                                                    </li>
                                                    <li>
                                                        <span className="font-medium">Expert Support</span>
                                                        <p className="text-muted-foreground mt-1">
                                                            Dedicated support for your integration from our specialist team
                                                        </p>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4 dark:bg-blue-950 dark:border-blue-800">
                                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Our Approach</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                Unlike DIY integrations, our team handles all technical aspects, ensuring a smooth, reliable
                                                connection that's customized to your specific business needs. You get a fully operational
                                                integration without any technical hassle on your part.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Payment sidebar */}
                    <div className="md:w-80 space-y-6">
                        <Card className="border-blue-200 dark:border-blue-800 sticky top-6">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
                                <CardTitle>Premium Integration</CardTitle>
                                <CardDescription>Monthly Recurring Payment</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="mb-6">
                                    <p className="text-3xl font-bold">₹{integrationDetails.price.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">Monthly Recurring Payment + GST</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">End-to-End Integration</p>
                                            <p className="text-xs text-muted-foreground">
                                                Full setup by our expert team
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Priority Support</p>
                                            <p className="text-xs text-muted-foreground">
                                                Dedicated integration specialist
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Custom Configuration</p>
                                            <p className="text-xs text-muted-foreground">
                                                Tailored to your specific needs
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={initiatePayment}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    {isLoading ? "Processing..." : "Purchase Integration"}
                                </Button>
                            </CardContent>
                            <CardFooter className="flex flex-col items-center text-center px-6 pt-0">
                                <p className="text-xs text-muted-foreground mb-2">
                                    Secure payment processing by Razorpay
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <Image
                                        src="/brands/razorpay.svg"
                                        alt="Razorpay"
                                        width={60}
                                        height={20}
                                    />
                                </div>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Need Help?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col space-y-2 text-sm">
                                    <p>Have questions about this integration?</p>
                                    <Link href="/support" className="text-primary hover:underline flex items-center">
                                        <span>Contact our team</span>
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // For free integrations (showing the "Coming Soon" message)
    return (
        <div className="p-6 space-y-8 h-screen overflow-y-scroll scrollbar-hide  mx-auto">
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
                            {FREE_INTEGRATIONS.map(app => (
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