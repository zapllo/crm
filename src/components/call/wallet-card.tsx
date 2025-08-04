"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, ArrowUpRight, CreditCard, ChevronRight, MessageSquare, PhoneCall, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
// import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function WalletCard() {
    const [balance, setBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isTopupDialogOpen, setIsTopupDialogOpen] = useState<boolean>(false);
    const [selectedAmount, setSelectedAmount] = useState<number>(500);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState<{
        totalCalls: number;
        totalDuration: number;
        callsThisMonth: number;
    }>({
        totalCalls: 0,
        totalDuration: 0,
        callsThisMonth: 0
    });

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setIsLoading(true);

            // Get wallet balance
            const balanceRes = await axios.get('/api/wallet/balance');
            setBalance(balanceRes.data.balance);

            // Get recent transactions
            const txnRes = await axios.get('/api/wallet/transactions');
            setTransactions(txnRes.data.transactions.slice(0, 5));

            // Get call statistics
            const statsRes = await axios.get('/api/calls/stats');
            setStats(statsRes.data);

        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTopup = async () => {
        try {
            setIsProcessing(true);

            // Use selected amount or custom amount
            const amountToCharge = customAmount ? parseInt(customAmount) : selectedAmount;

            // Validate amount
            if (isNaN(amountToCharge) || amountToCharge < 100) {
                alert('Please enter a valid amount (minimum ₹100)');
                setIsProcessing(false);
                return;
            }

            // Create checkout session
            const response = await axios.post('/api/wallet/topup', {
                amount: amountToCharge
            });

            // Redirect to Stripe Checkout
            // const stripe = await stripePromise;
            // const { error } = await stripe!.redirectToCheckout({
            //     sessionId: response.data.sessionId
            // });

            // if (error) {
            //     console.error('Stripe Checkout Error:', error);
            // }

        } catch (error) {
            console.error('Error processing top-up:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <>
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        Calling Wallet
                    </CardTitle>
                    <CardDescription>
                        Manage your calling credits and usage
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Balance</p>
                                        <p className="text-3xl font-bold">₹{(balance / 100).toFixed(2)}</p>
                                    </div>
                                    <Button onClick={() => setIsTopupDialogOpen(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Credits
                                    </Button>
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Usage</span>
                                        <span className="font-medium">
                                            ~{Math.round((balance / 100) / 1.5)} minutes remaining
                                        </span>
                                    </div>
                                    <Progress
                                        value={balance > 1000 ? 100 : (balance / 10)}
                                        className="h-2"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Average cost: ₹1.5/minute for outbound calls
                                    </p>
                                </div>
                            </div>

                            <Tabs defaultValue="usage" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="usage">Call Usage</TabsTrigger>
                                    <TabsTrigger value="history">History</TabsTrigger>
                                </TabsList>

                                <TabsContent value="usage" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="bg-primary/10 p-3 rounded-full mb-2">
                                                        <PhoneCall className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <p className="text-2xl font-bold">{stats.totalCalls}</p>
                                                    <p className="text-sm text-muted-foreground">Total Calls</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="bg-primary/10 p-3 rounded-full mb-2">
                                                        <MessageSquare className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <p className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</p>
                                                    <p className="text-sm text-muted-foreground">Talk Time</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">This Month</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="text-2xl font-bold">{stats.callsThisMonth}</p>
                                                    <p className="text-sm text-muted-foreground">Calls Made</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 gap-1"
                                                    onClick={() => window.location.href = '/reports/calls'}
                                                >
                                                    View Reports
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="history" className="pt-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">Recent Transactions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {transactions.length === 0 ? (
                                                <div className="text-center py-6">
                                                    <p className="text-muted-foreground">No transactions yet</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y">
                                                    {transactions.map((txn, i) => (
                                                        <div key={i} className="flex justify-between items-center p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "p-2 rounded-full",
                                                                    txn.type === "credit" ? "bg-green-100" : "bg-red-100"
                                                                )}>
                                                                    {txn.type === "credit" ? (
                                                                        <Plus className="h-4 w-4 text-green-600" />
                                                                    ) : (
                                                                        <PhoneCall className="h-4 w-4 text-red-600" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm">{txn.description}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatDate(txn.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className={cn(
                                                                "font-medium",
                                                                txn.type === "credit" ? "text-green-600" : "text-red-600"
                                                            )}>
                                                                {txn.type === "credit" ? "+" : "-"}₹{(txn.amount / 100).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="pb-4 pt-2">
                                            <Button variant="ghost" size="sm" className="w-full" onClick={() => window.location.href = '/settings/wallet/transactions'}>
                                                View All Transactions
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </CardContent>

            </Card>
            <Dialog open={isTopupDialogOpen} onOpenChange={setIsTopupDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Credits to Your Wallet</DialogTitle>
                        <DialogDescription>
                            Choose an amount to add to your calling wallet
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        <RadioGroup
                            value={String(selectedAmount)}
                            onValueChange={(value) => {
                                setSelectedAmount(parseInt(value));
                                setCustomAmount("");
                            }}
                            className="grid grid-cols-3 gap-4"
                        >
                            {[500, 1000, 2000].map((amount) => (
                                <div key={amount} className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value={String(amount)}
                                        id={`amount-${amount}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`amount-${amount}`}
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <span className="mb-1 text-sm font-medium leading-none">₹{amount}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ~{Math.round(amount / 1.5)} minutes
                                        </span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="custom-amount">Custom Amount</Label>
                            <div className="flex items-center">
                                <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground">₹</span>
                                <Input
                                    id="custom-amount"
                                    placeholder="Enter amount (min ₹100)"
                                    value={customAmount}
                                    onChange={(e) => {
                                        setCustomAmount(e.target.value);
                                        setSelectedAmount(0);
                                    }}
                                    className="rounded-l-none"
                                    type="number"
                                    min="100"
                                />
                            </div>
                            {customAmount && parseInt(customAmount) > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    ~{Math.round(parseInt(customAmount) / 1.5)} minutes of talk time
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTopupDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleTopup} disabled={isProcessing} className="gap-2">
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    Add Credits
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}