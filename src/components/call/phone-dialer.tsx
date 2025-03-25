"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Device } from "twilio-client";
import axios from "axios";
import {
    PhoneCall, PhoneOff, MicOff, Mic, Volume2, VolumeX,
    X, ChevronUp, Clock, Plus, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";

type PhoneDialerProps = {
    contactId: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    leadId?: string;
    onCallComplete?: (callData: any) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

export default function PhoneDialer({
    contactId,
    contactName,
    contactPhone,
    contactEmail,
    leadId,
    onCallComplete,
    isOpen,
    setIsOpen
}: PhoneDialerProps) {
    const { toast } = useToast();
    const [status, setStatus] = useState<string>("idle");
    const [callDuration, setCallDuration] = useState<number>(0);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isCallEnded, setIsCallEnded] = useState<boolean>(false);
    const [connection, setConnection] = useState<any>(null);
    const [device, setDevice] = useState<any>(null);
    const [showNotes, setShowNotes] = useState<boolean>(false);
    const [callNotes, setCallNotes] = useState<string>("");
    const [isLowBalance, setIsLowBalance] = useState<boolean>(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [callCost, setCallCost] = useState<number>(0);
    const [callId, setCallId] = useState<string>("");
    const [callRecording, setCallRecording] = useState<string | null>(null);
    const [callTranscript, setCallTranscript] = useState<string | null>(null);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch wallet balance on component mount
    useEffect(() => {
        const getWalletBalance = async () => {
            try {
                const response = await axios.get('/api/wallet/balance');
                setWalletBalance(response.data.balance);

                // Show low balance warning if balance is below threshold
                if (response.data.balance < 100) { // Less than 100 INR
                    setIsLowBalance(true);
                }
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
            }
        };

        if (isOpen) {
            getWalletBalance();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setupTwilioDevice();
        }

        return () => {
            if (device) {
                device.destroy();
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, [isOpen]);

    const setupTwilioDevice = async () => {
        try {
            const response = await axios.post('/api/calls/token');
            const token = response.data.token;

            const newDevice = new Device(token);

            newDevice.on('ready', () => {
                console.log('Twilio device is ready');
            });

            newDevice.on('error', (error: any) => {
                console.error('Twilio device error:', error);
                toast({
                    title: "Call Error",
                    description: error.message || "There was an error with the call",
                    variant: "destructive"
                });
                setStatus("failed");
            });

            setDevice(newDevice);
        } catch (error) {
            console.error('Error setting up Twilio device:', error);
            toast({
                title: "Setup Error",
                description: "Could not initialize the calling system",
                variant: "destructive"
            });
        }
    };

    const startCall = async () => {
        // First check if there's enough balance
        if (walletBalance < 50) { // Minimum balance requirement (₹50)
            setIsLowBalance(true);
            return;
        }

        try {
            setStatus("connecting");

            // Create a call record in our database first
            const callResponse = await axios.post('/api/calls/create', {
                contactId,
                leadId,
                phoneNumber: contactPhone,
                direction: 'outbound'
            });

            setCallId(callResponse.data._id);

            // Connect the call through Twilio
            const twilioParams = {
                To: contactPhone,
                callId: callResponse.data._id
            };

            const conn = await device.connect({ params: twilioParams });
            setConnection(conn);

            // Set up event handlers for the connection
            conn.on('accept', () => {
                setStatus("in-progress");

                // Start tracking call duration
                durationIntervalRef.current = setInterval(() => {
                    setCallDuration(prev => prev + 1);
                }, 1000);
            });

            conn.on('disconnect', () => {
                handleCallEnd();
            });

            // Update estimated cost based on duration
            const costsInterval = setInterval(() => {
                // Assuming a cost of ₹1 per minute
                const costPerSecond = 1 / 60;
                setCallCost(prevCost => prevCost + costPerSecond);
            }, 1000);

            // Clean up the cost interval when the call ends
            conn.on('disconnect', () => {
                clearInterval(costsInterval);
            });

        } catch (error) {
            console.error('Error making call:', error);
            setStatus("failed");
            toast({
                title: "Call Failed",
                description: "Unable to connect the call. Please try again.",
                variant: "destructive"
            });
        }
    };

    const endCall = () => {
        if (connection) {
            connection.disconnect();
        }
    };

    const handleCallEnd = async () => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
        }

        setStatus("completed");
        setIsCallEnded(true);

        try {
            // Update call record with final duration and status
            const response = await axios.put(`/api/calls/${callId}/update`, {
                duration: callDuration,
                status: 'completed'
            });

            // Get call recording if available
            if (response.data.recordingUrl) {
                setCallRecording(response.data.recordingUrl);
            }

            // Get transcription if available
            if (response.data.transcription) {
                setCallTranscript(response.data.transcription);
            }

            // Notify parent component that call is complete
            if (onCallComplete) {
                onCallComplete(response.data);
            }
        } catch (error) {
            console.error('Error updating call record:', error);
        }
    };

    const toggleMute = () => {
        if (connection) {
            if (isMuted) {
                connection.mute(false);
            } else {
                connection.mute(true);
            }
            setIsMuted(!isMuted);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const saveCallNotes = async () => {
        if (!callNotes.trim()) return;

        try {
            await axios.put(`/api/calls/${callId}/notes`, {
                notes: callNotes
            });

            toast({
                title: "Notes Saved",
                description: "Your call notes have been saved successfully",
            });

            setShowNotes(false);
        } catch (error) {
            console.error('Error saving call notes:', error);
            toast({
                title: "Error",
                description: "Failed to save call notes",
                variant: "destructive"
            });
        }
    };

    const handleCloseDialog = () => {
        if (status === "in-progress") {
            // Show confirmation dialog before closing if call is in progress
            return;
        }

        // Reset states
        setIsCallEnded(false);
        setCallDuration(0);
        setStatus("idle");
        setCallNotes("");
        setCallRecording(null);
        setCallTranscript(null);
        setCallCost(0);

        setIsOpen(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md z-[100]">
                <DialogHeader>
                    <DialogTitle className="text-center relative">
                        {status !== "in-progress" && status !== "connecting" ? (
                            "Call Contact"
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-semibold">{contactName}</span>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "mt-1 animate-pulse",
                                        status === "connecting" ? "text-amber-500" : "text-green-500"
                                    )}
                                >
                                    {status === "connecting" ?
                                        "Connecting..." : `Call in progress · ${formatDuration(callDuration)}`
                                    }
                                </Badge>
                            </div>
                        )}

                        {/* Balance indicator */}
                        <div className="absolute right-0 top-0">
                            <Badge variant="outline" className="bg-muted">
                                Balance: ₹{(walletBalance / 100).toFixed(2)}
                            </Badge>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* Contact Info & Call Status */}
                <div className="flex flex-col items-center py-4 space-y-4">
                    {status !== "completed" && (
                        <Avatar className="h-24 w-24 border-2 border-primary/20">
                            <AvatarFallback className="text-3xl bg-primary/10">
                                {getInitials(contactName)}
                            </AvatarFallback>
                        </Avatar>
                    )}

                    {status === "idle" && (
                        <div className="text-center">
                            <p className="text-xl font-semibold mb-1">{contactName}</p>
                            <p className="text-muted-foreground">{contactPhone}</p>
                            {contactEmail && <p className="text-muted-foreground text-sm">{contactEmail}</p>}
                        </div>
                    )}

                    {status === "connecting" && (
                        <div className="w-full">
                            <p className="text-center text-muted-foreground mb-4">
                                Establishing secure connection...
                            </p>
                            <Progress value={45} className="h-1.5 w-full" />
                        </div>
                    )}

                    {status === "failed" && (
                        <div className="text-center space-y-2">
                            <div className="rounded-full bg-red-100 p-3 inline-flex dark:bg-red-900">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-lg font-medium">Call Failed</p>
                            <p className="text-muted-foreground text-sm max-w-xs">
                                We couldn't connect your call. Please check the phone number and try again.
                            </p>
                        </div>
                    )}

                    {status === "completed" && !isCallEnded && (
                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium">Call Ended</p>
                            <p className="text-muted-foreground">
                                Duration: {formatDuration(callDuration)}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Call cost: ₹{callCost.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {status === "completed" && isCallEnded && (
                        <div className="w-full space-y-6">
                            <div className="text-center space-y-2">
                                <div className="rounded-full bg-green-100 p-3 inline-flex dark:bg-green-900">
                                    <PhoneCall className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium">Call Complete</p>
                                    <p className="text-muted-foreground">
                                        You spoke with {contactName} for {formatDuration(callDuration)}
                                    </p>
                                </div>
                            </div>

                            <Card className="w-full">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Call Summary</span>
                                        <Badge variant="outline" className="text-xs">
                                            ₹{callCost.toFixed(2)}
                                        </Badge>
                                    </div>

                                    {callRecording && (
                                        <div className="bg-muted p-3 rounded-md">
                                            <div className="text-xs font-medium mb-1 text-muted-foreground">Recording</div>
                                            <audio controls className="w-full h-10">
                                                <source src={callRecording} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    )}

                                    {callTranscript && (
                                        <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                                            <div className="text-xs font-medium mb-1 text-muted-foreground">Transcript</div>
                                            <p className="text-sm">{callTranscript}</p>
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setShowNotes(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Call Notes
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Active Call Controls */}
                {status === "in-progress" && (
                    <motion.div
                        className="flex justify-center space-x-4 py-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-full bg-muted"
                                        onClick={toggleMute}
                                    >
                                        {isMuted ? (
                                            <MicOff className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <Mic className="h-5 w-5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isMuted ? "Unmute" : "Mute"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-14 w-14 rounded-full"
                                        onClick={endCall}
                                    >
                                        <PhoneOff className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    End Call
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-full bg-muted"
                                    // onClick={toggleSpeaker}
                                    >
                                        <Volume2 className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Speaker
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </motion.div>
                )}

                <DialogFooter className="flex justify-center sm:justify-center gap-2">
                    {status === "idle" && (
                        <>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button
                                onClick={startCall}
                                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <PhoneCall className="h-4 w-4" />
                                Call Now
                            </Button>
                        </>
                    )}

                    {(status === "completed" || status === "failed") && (
                        <Button onClick={handleCloseDialog}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>

            {/* Low Balance Alert */}
            <AlertDialog open={isLowBalance} onOpenChange={setIsLowBalance}>
                <AlertDialogContent className="z-[100]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Low Balance Alert</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your calling balance is low (₹{(walletBalance / 100).toFixed(2)}). To ensure uninterrupted calling services,
                            we recommend adding more credits to your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Later</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setIsLowBalance(false);
                                // Redirect to top-up page (will implement this route next)
                                window.location.href = '/settings/wallet';
                            }}
                        >
                            Add Credits
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Notes Dialog */}
            <Dialog open={showNotes} onOpenChange={setShowNotes}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Call Notes</DialogTitle>
                        <DialogDescription>
                            Add notes about your call with {contactName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="What did you discuss in this call?"
                            className="min-h-32"
                            value={callNotes}
                            onChange={(e) => setCallNotes(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNotes(false)}>
                            Cancel
                        </Button>
                        <Button onClick={saveCallNotes}>
                            Save Notes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}