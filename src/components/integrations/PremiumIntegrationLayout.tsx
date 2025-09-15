"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertCircle, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription, AlertDialogTitle as AlertTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Import useRouter for navigation after payment
import { useRouter } from "next/navigation";

export interface PremiumIntegrationProps {
    integration: {
        name: string;
        description: string;
        logo: string;
        price: number;
        features: string[];
        benefits: {
            title: string;
            description: string;
            icon: React.ReactNode;
        }[];
        faqs: {
            question: string;
            answer: string;
        }[];
        testimonials?: {
            quote: string;
            author: string;
            company: string;
        }[];
    };
}

export default function PremiumIntegrationLayout({
    integration,
}: PremiumIntegrationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const initiatePayment = async () => {
        setIsLoading(true);
        try {
            // First, create the Razorpay order
            const orderResponse = await axios.post("/api/create-order", {
                amount: integration.price * 100, // Convert to paise
                currency: "INR",
                receipt: `integration-${integration.name.toLowerCase().replace(/\s+/g, "-")}`,
                notes: {
                    integrationName: integration.name,
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
                amount: integration.price * 100,
                currency: "INR",
                name: "Zapllo",
                description: `${integration.name} Integration`,
                order_id: orderId,
                handler: function (response: any) {
                    handlePaymentSuccess(response, orderId);
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

    const handlePaymentSuccess = async (response: any, orderId: string) => {
        try {
            // Send payment verification details to server
            const verificationResponse = await axios.post("/api/payment-success", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_signature: response.razorpay_signature,
                userId: "", // Get from user context if available
                amount: integration.price * 100,
                planName: `${integration.name} Integration`,
                // Add other required fields that your payment success API needs
            });

            if (verificationResponse.data.success) {
                toast({
                    title: "Payment Successful!",
                    description: `Your ${integration.name} integration is now being processed.`,
                });

                // Redirect to the thank you page or refresh current page
                router.push(`/settings/integrations/${integration.name.toLowerCase().replace(/\s+/g, "-")}`);
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

    return (
        <div className="p-6 space-y-8 h-screen overflow-y-scroll scrollbar-hide mx-auto">
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
                                src={integration.logo}
                                alt={`${integration.name} logo`}
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
                                <h1 className="text-3xl font-bold">{integration.name}</h1>
                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                                    Premium
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-lg">
                                {integration.description}
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-4 gap-2  bg-accent">
                            <TabsTrigger className="border-none" value="overview">Overview</TabsTrigger>
                            <TabsTrigger className="border-none" value="features">Features</TabsTrigger>
                            <TabsTrigger className="border-none" value="faq">FAQ</TabsTrigger>
                            {integration.testimonials && (
                                <TabsTrigger className="border-none" value="testimonials">Testimonials</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                        Premium Integration Benefits
                                    </CardTitle>
                                    <CardDescription>
                                        Unlock powerful workflows and automations with the {integration.name} integration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {integration.benefits.map((benefit, index) => (
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

                                    <Alert>
                                        <div className="flex gap-1 items-center">
                                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <AlertTitle>Fully Managed Integration</AlertTitle>
                                        </div>
                                        <AlertDescription>
                                            Our team handles the entire integration process for you - from initial setup to testing and ongoing support.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                <Card>
                                    <CardHeader>
                                        <CardTitle>What's Included</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {integration.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Comprehensive Features</CardTitle>
                                    <CardDescription>
                                        Everything you get with the {integration.name} integration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {integration.features.map((feature, index) => (
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
                        <TabsContent value="faq" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Frequently Asked Questions</CardTitle>
                                    <CardDescription>
                                        Common questions about the {integration.name} integration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {integration.faqs.map((faq, index) => (
                                        <div key={index} className="border-b border-gray-200 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                                            <h3 className="font-medium mb-2">{faq.question}</h3>
                                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {integration.testimonials && (
                            <TabsContent value="testimonials" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Customer Testimonials</CardTitle>
                                        <CardDescription>
                                            See what others are saying about this integration
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {integration.testimonials.map((testimonial, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800"
                                                >
                                                    <p className="italic text-sm mb-3">{testimonial.quote}</p>
                                                    <div>
                                                        <p className="font-medium text-sm">{testimonial.author}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {testimonial.company}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>

                {/* Payment sidebar */}
                <div className="md:w-80 space-y-6">
                    <Card className="border-blue-200 dark:border-blue-800 sticky top-6">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
                            <CardTitle>Premium Integration</CardTitle>
                            <CardDescription>Monthly Recurring payment</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-6">
                                <p className="text-3xl font-bold">₹{integration.price.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Monthly Recurring payment + GST</p>
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

                   
                </div>
                
            </div>
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
    );
}