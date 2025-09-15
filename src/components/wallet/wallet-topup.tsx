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
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
    CreditCard,
    CheckCircle,
    PlusCircle,
    Info,
    AlertCircle
} from "lucide-react";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription } from "@/components/ui/alert-dialog";
import { useUserContext } from "@/contexts/userContext";

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Quick amount options
const AMOUNT_OPTIONS = [
    { value: 100, label: "₹100", minutes: "20 mins" },
    { value: 200, label: "₹200", minutes: "40 mins" },
    { value: 500, label: "₹500", minutes: "100 mins" },
    { value: 1000, label: "₹1000", minutes: "200 mins" },
    { value: 2000, label: "₹2000", minutes: "400 mins" },
];

interface WalletTopupProps {
    currentBalance: number;
    currency: string;
    onTopupSuccess?: () => void;
}

export default function WalletTopup({ currentBalance, currency, onTopupSuccess }: WalletTopupProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUserContext();
    const [isLoading, setIsLoading] = useState(false);
    const [topupAmount, setTopupAmount] = useState(500);
    const [customAmount, setCustomAmount] = useState("");
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [paymentError, setPaymentError] = useState("");

    // Handle Razorpay script loading
    const handleScriptLoad = () => {
        setScriptLoaded(true);
    };

    // Handle quick amount selection
    const handleAmountSelect = (amount: number) => {
        setTopupAmount(amount);
        setCustomAmount("");
        setPaymentError("");
    };

    // Handle custom amount input
    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPaymentError("");
        if (value === "" || /^\d+$/.test(value)) {
            setCustomAmount(value);
            if (value) {
                setTopupAmount(parseInt(value, 10));
            }
        }
    };

    // Verify payment after successful Razorpay transaction
    const verifyPayment = async (
        razorpay_payment_id: string,
        razorpay_order_id: string,
        razorpay_signature: string,
        userId: string,
        organizationId: string,
        amount: number
    ) => {
        try {
            const response = await axios.post('/api/wallet/payment-success', {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                userId,
                organizationId,
                amount
            });

            // Show success message
            toast({
                title: "Payment Successful",
                description: `₹${(response.data.creditedAmount / 100).toFixed(2)} has been added to your wallet.`,
            });

            // Call the success callback if provided
            if (onTopupSuccess) {
                onTopupSuccess();
            }

            // Redirect to wallet overview
            router.push('/settings/wallet');
        } catch (error) {
            console.error('Payment verification error:', error);
            toast({
                title: "Verification Failed",
                description: "Your payment couldn't be verified. Please contact support.",
                variant: "destructive",
            });
        }
    };

    // Initialize Razorpay payment
// Initialize Razorpay payment
const handleTopup = async () => {
    // Validate the amount
    if (topupAmount < 100) {
        setPaymentError("Minimum topup amount is ₹100");
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

    // This check might be causing issues - let's remove it and initialize Razorpay directly
    // if (!scriptLoaded) {
    //     toast({
    //         title: "Payment System Loading",
    //         description: "Please wait while we initialize the payment system",
    //     });
    //     return;
    // }

    try {
        setIsLoading(true);

        // Create a Razorpay order
        const { data } = await axios.post('/api/wallet/topup', {
            amount: topupAmount
        });

        if (!data.orderId) {
            throw new Error('Failed to create payment order');
        }

        // Initialize Razorpay checkout - UPDATED TO MATCH BILLING PAGE
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.amount,
            currency: data.currency,
            name: "Zapllo",
            description: "Add credits to your calling wallet",
            order_id: data.orderId,
            prefill: {
                name: data.user.name,
                email: data.user.email,
                contact: data.user.contact
            },
            notes: {
                purpose: 'wallet_topup'
            },
            handler: function (response: any) {
                verifyPayment(
                    response.razorpay_payment_id,
                    response.razorpay_order_id,
                    response.razorpay_signature,
                    user.userId,
                    user.organization?._id || '',
                    data.amount
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

        // Create and open Razorpay - this matches your billing page implementation
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();

    } catch (error) {
        console.error("Error initiating payment:", error);
        toast({
            title: "Payment Failed",
            description: "Failed to initiate payment. Please try again later.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
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
                        <CardTitle>Add Credits</CardTitle>
                        <CardDescription>
                            Top up your wallet to make outbound calls
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <Label htmlFor="amount">Select Amount</Label>
                                <span className="text-sm text-muted-foreground">
                                    Current Balance: ₹{(currentBalance / 100).toFixed(2)}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {AMOUNT_OPTIONS.map((option) => (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={topupAmount === option.value && !customAmount ? "default" : "outline"}
                                        className="h-18 flex flex-col py-2"
                                        onClick={() => handleAmountSelect(option.value)}
                                    >
                                        <span className="text-lg font-semibold">{option.label}</span>
                                        <span className={`text-xs ${topupAmount === option.value && !customAmount ? "text-white" : "text-muted-foreground"} text-`}>{option.minutes}</span>
                                    </Button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="custom-amount">Custom Amount</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <span className="text-muted-foreground">₹</span>
                                    </div>
                                    <Input
                                        id="custom-amount"
                                        placeholder="Enter amount"
                                        className="pl-8"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                    />
                                </div>
                            </div>

                            {paymentError && (
                                <Alert >
                                    <div className="flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{paymentError}</AlertDescription>
                                    </div>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={handleTopup}
                            disabled={isLoading || topupAmount < 100 }
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
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add ₹{topupAmount} to Wallet
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
                                <span>Topup Amount</span>
                                <span className="font-medium">₹{topupAmount}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t">
                                <span>GST (18%)</span>
                                <span className="font-medium">₹{Math.round(topupAmount * 0.18)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t">
                                <span className="font-semibold">Total Amount</span>
                                <span className="font-bold">₹{topupAmount + Math.round(topupAmount * 0.18)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Alert >
                        <div className="flex gap-1 items-center">
                            <Info className="h-8 w-8 text-primary" />
                            <AlertDescription className='text-xs'>
                                Wallet credits are used for outbound calls at the rate of ₹5 per minute.
                                Credits never expire and can be used anytime.
                            </AlertDescription>
                        </div>
                    </Alert>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Why Add Credits?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <p className="text-sm">Call customers directly from the CRM</p>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <p className="text-sm">Automatic call recording and transcription</p>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <p className="text-sm">Detailed analytics and call logs</p>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                <p className="text-sm">Seamless integration with contacts</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
