"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    CreditCard,
    CheckCircle,
    PlusCircle,
    Info,
    AlertCircle,
    Brain,
    Sparkles,
    Zap,
    RefreshCw
} from "lucide-react";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription } from "@/components/ui/alert-dialog";
import { useUserContext } from "@/contexts/userContext";
import { Skeleton } from "@/components/ui/skeleton";

declare global {
    interface Window {
        Razorpay: any;
    }
}

// AI Credits packages
const AI_CREDIT_OPTIONS = [
    { credits: 100, price: 99, label: "Starter", description: "Perfect for small teams" },
    { credits: 500, price: 399, label: "Growth", description: "For growing businesses", popular: true },
    { credits: 1000, price: 699, label: "Professional", description: "For heavy AI usage" },
    { credits: 2500, price: 1499, label: "Enterprise", description: "For large organizations" },
];

export default function AiCreditsTab() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUserContext();
    const [isLoading, setIsLoading] = useState(false);
    const [creditsLoading, setCreditsLoading] = useState(true);
    const [aiCredits, setAiCredits] = useState(0);
    const [organizationName, setOrganizationName] = useState("");
    const [selectedPackage, setSelectedPackage] = useState(AI_CREDIT_OPTIONS[1]); // Default to Growth
    const [customCredits, setCustomCredits] = useState("");
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [paymentError, setPaymentError] = useState("");

    // Fetch current AI credits
    useEffect(() => {
        const fetchAiCredits = async () => {
            try {
                setCreditsLoading(true);
                const response = await axios.get("/api/organization/ai-credits");
                setAiCredits(response.data.aiCredits || 0);
                setOrganizationName(response.data.organizationName || "");
            } catch (error) {
                console.error("Error fetching AI credits:", error);
                toast({
                    title: "Error",
                    description: "Failed to load AI credits",
                    variant: "destructive",
                });
            } finally {
                setCreditsLoading(false);
            }
        };

        fetchAiCredits();
    }, [toast]);

    // Handle Razorpay script loading
    const handleScriptLoad = () => {
        setScriptLoaded(true);
    };

    // Handle package selection
    const handlePackageSelect = (packageOption: typeof AI_CREDIT_OPTIONS[0]) => {
        setSelectedPackage(packageOption);
        setCustomCredits("");
        setPaymentError("");
    };

    // Handle custom credits input
    const handleCustomCreditsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPaymentError("");
        if (value === "" || /^\d+$/.test(value)) {
            setCustomCredits(value);
            if (value) {
                const credits = parseInt(value, 10);
                const price = Math.round(credits * 0.99); // ₹0.99 per credit
                setSelectedPackage({
                    credits,
                    price,
                    label: "Custom",
                    description: "Custom AI credits package"
                });
            }
        }
    };

    // Verify payment after successful Razorpay transaction
    const verifyAiCreditsPayment = async (
        razorpay_payment_id: string,
        razorpay_order_id: string,
        razorpay_signature: string,
        credits: number
    ) => {
        try {
            const response = await axios.post('/api/ai-credits/payment-success', {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                credits
            });

            // Show success message
            toast({
                title: "Payment Successful",
                description: `${response.data.creditedAmount} AI credits have been added to your organization.`,
            });

            // Refresh AI credits
            const creditsResponse = await axios.get("/api/organization/ai-credits");
            setAiCredits(creditsResponse.data.aiCredits || 0);

            // Redirect to overview
            router.push('/settings/wallet');
        } catch (error) {
            console.error('AI Credits payment verification error:', error);
            toast({
                title: "Verification Failed",
                description: "Your payment couldn't be verified. Please contact support.",
                variant: "destructive",
            });
        }
    };

    // Initialize Razorpay payment for AI credits
    const handlePurchaseAiCredits = async () => {
        if (selectedPackage.credits < 10) {
            setPaymentError("Minimum purchase is 10 AI credits");
            return;
        }

        if (!user || !user.organization) {
            toast({
                title: "Authentication Error",
                description: "Please login again to continue",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);

            // Create a Razorpay order for AI credits
            const { data } = await axios.post('/api/ai-credits/create-order', {
                credits: selectedPackage.credits,
                amount: selectedPackage.price * 100 // Convert to paisa
            });

            if (!data.orderId) {
                throw new Error('Failed to create AI credits payment order');
            }

            // Initialize Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: "Zapllo AI Credits",
                description: `Purchase ${selectedPackage.credits} AI credits`,
                order_id: data.orderId,
                prefill: {
                    name: data.user.name,
                    email: data.user.email,
                    contact: data.user.contact
                },
                notes: {
                    purpose: 'ai_credits_purchase',
                    credits: selectedPackage.credits
                },
                handler: function (response: any) {
                    verifyAiCreditsPayment(
                        response.razorpay_payment_id,
                        response.razorpay_order_id,
                        response.razorpay_signature,
                        selectedPackage.credits
                    );
                },
                modal: {
                    ondismiss: function() {
                        setIsLoading(false);
                    }
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error("Error initiating AI credits payment:", error);
            toast({
                title: "Payment Failed",
                description: "Failed to initiate payment. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const refreshAiCredits = async () => {
        try {
            const response = await axios.get("/api/organization/ai-credits");
            setAiCredits(response.data.aiCredits || 0);
            toast({
                title: "AI Credits Updated",
                description: `Current AI credits: ${response.data.aiCredits}`,
            });
        } catch (error) {
            console.error("Error refreshing AI credits:", error);
            toast({
                title: "Error",
                description: "Failed to refresh AI credits",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={handleScriptLoad}
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Brain className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle>AI Credits</CardTitle>
                                    <CardDescription>
                                        Purchase AI credits for advanced features
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={refreshAiCredits} className="h-8 w-8">
                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Current AI Credits */}
                        <div className="p-4 bg-primary/5 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Balance</p>
                                    {creditsLoading ? (
                                        <Skeleton className="h-8 w-20" />
                                    ) : (
                                        <p className="text-2xl font-bold text-primary">{aiCredits}</p>
                                    )}
                                </div>
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Organization: {organizationName}
                            </p>
                        </div>

                        {/* Package Selection */}
                        <div>
                            <Label className="text-base font-medium">Select Package</Label>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                {AI_CREDIT_OPTIONS.map((option) => (
                                    <Button
                                        key={option.credits}
                                        type="button"
                                        variant={selectedPackage.credits === option.credits && !customCredits ? "default" : "outline"}
                                        className={`h-auto flex flex-col py-3 relative ${option.popular ? 'ring-2 ring-primary' : ''}`}
                                        onClick={() => handlePackageSelect(option)}
                                    >
                                        {option.popular && (
                                            <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                                                Popular
                                            </div>
                                        )}
                                        <span className="font-semibold">{option.credits} Credits</span>
                                        <span className="text-lg font-bold">₹{option.price}</span>
                                        <span className="text-xs  text-muted-foreground">{option.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Credits */}
                        <div className="space-y-2">
                            <Label htmlFor="custom-credits">Custom Credits</Label>
                            <Input
                                id="custom-credits"
                                placeholder="Enter number of credits"
                                value={customCredits}
                                onChange={handleCustomCreditsChange}
                            />
                            {customCredits && (
                                <p className="text-xs text-muted-foreground">
                                    Price: ₹{Math.round(parseInt(customCredits) * 0.99)} (₹0.99 per credit)
                                </p>
                            )}
                        </div>

                        {paymentError && (
                            <Alert>
                                <div className="flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{paymentError}</AlertDescription>
                                </div>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={handlePurchaseAiCredits}
                            disabled={isLoading || selectedPackage.credits < 10}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Purchase {selectedPackage.credits} Credits for ₹{selectedPackage.price}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2">
                                <span>AI Credits</span>
                                <span className="font-medium">{selectedPackage.credits} credits</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span>Base Price</span>
                                <span className="font-medium">₹{selectedPackage.price}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t">
                                <span>GST (18%)</span>
                                <span className="font-medium">₹{Math.round(selectedPackage.price * 0.18)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t">
                                <span className="font-semibold">Total Amount</span>
                                <span className="font-bold">₹{selectedPackage.price + Math.round(selectedPackage.price * 0.18)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Alert>
                        <div className="flex gap-1 items-center">
                            <Info className="h-8 w-8 text-primary" />
                            <AlertDescription className='text-xs'>
                                AI credits are used for advanced features like AI-powered lead scoring, 
                                automated responses, and intelligent analytics. Credits never expire.
                            </AlertDescription>
                        </div>
                    </Alert>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">What can you do with AI Credits?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <p className="text-sm">AI-powered lead scoring and prioritization</p>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <p className="text-sm">Automated email and WhatsApp responses</p>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <p className="text-sm">Intelligent analytics and insights</p>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <p className="text-sm">Smart data enrichment and cleansing</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}