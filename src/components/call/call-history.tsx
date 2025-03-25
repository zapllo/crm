"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, PhoneCall, PhoneIncoming, PhoneOutgoing, Check, X, Play, MoreVertical, Download, MessageSquare } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type CallType = {
    _id: string;
    contactId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    leadId?: {
        _id: string;
        title: string;
    };
    twilioCallSid: string;
    recordingUrl?: string;
    duration: number;
    direction: 'inbound' | 'outbound';
    status: string;
    notes?: string;
    transcription?: string;
    cost: number;
    startTime: string;
    endTime?: string;
    createdAt: string;
};

export default function CallHistory({ contactId, limit = 5 }: { contactId?: string; limit?: number }) {
    const { toast } = useToast();
    const [calls, setCalls] = useState<CallType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState<CallType | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCalls();
    }, [contactId]);

    const fetchCalls = async () => {
        try {
            setLoading(true);
            const url = contactId
                ? `/api/calls?contactId=${contactId}&limit=${limit}`
                : `/api/calls?limit=${limit}`;

            const response = await axios.get(url);
            setCalls(response.data);
        } catch (error) {
            console.error('Error fetching calls:', error);
            toast({
                title: "Error",
                description: "Failed to load call history",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case 'failed':
            case 'busy':
            case 'no-answer':
            case 'canceled':
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const filteredCalls = calls.filter(call => {
        // Apply direction filter
        if (filter !== 'all' && call.direction !== filter) return false;

        // Apply search filter
        if (searchTerm) {
            const fullName = `${call.contactId.firstName} ${call.contactId.lastName}`.toLowerCase();
            const email = call.contactId.email.toLowerCase();
            const search = searchTerm.toLowerCase();

            return fullName.includes(search) || email.includes(search);
        }

        return true;
    });

    const viewCallDetails = (call: CallType) => {
        setSelectedCall(call);
        setShowDetailsDialog(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
        );
    }

    if (calls.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                        <PhoneCall className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No Call History</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                        {contactId ?
                            "You haven't made any calls to this contact yet." :
                            "There are no calls recorded in your history yet."}
                    </p>
                    <Button variant="outline" size="sm">
                        Make Your First Call
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {!contactId && (
                    <div className="flex justify-between items-center gap-4 mb-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search contacts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <Tabs
                            value={filter}
                            onValueChange={(value) => setFilter(value as 'all' | 'inbound' | 'outbound')}
                            className="w-auto"
                        >
                            <TabsList className="grid w-full grid-cols-3 h-9">
                                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                <TabsTrigger value="outbound" className="text-xs">Outgoing</TabsTrigger>
                                <TabsTrigger value="inbound" className="text-xs">Incoming</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                )}

                <ScrollArea className={`${contactId ? 'h-[280px]' : 'h-[540px]'}`}>
                    <div className="space-y-3">
                        {filteredCalls.map((call) => (
                            <Card key={call._id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-start p-4 gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getInitials(call.contactId.firstName, call.contactId.lastName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium truncate">
                                                        {call.contactId.firstName} {call.contactId.lastName}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {call.direction === 'outbound' ? (
                                                            <PhoneOutgoing className="h-3 w-3 text-blue-500" />
                                                        ) : (
                                                            <PhoneIncoming className="h-3 w-3 text-green-500" />
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(call.startTime), { addSuffix: true })}
                                                        </span>
                                                        {call.leadId && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Lead: {call.leadId.title}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={cn("text-xs", getStatusColor(call.status))}>
                                                        {call.status === 'completed' ? (
                                                            <span className="flex items-center gap-1">
                                                                <Check className="h-3 w-3" />
                                                                {formatDuration(call.duration)}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1">
                                                                <X className="h-3 w-3" />
                                                                {call.status}
                                                            </span>
                                                        )}
                                                    </Badge>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Call Options</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => viewCallDetails(call)}>
                                                                View Details
                                                            </DropdownMenuItem>
                                                            {call.recordingUrl && (
                                                                <DropdownMenuItem>
                                                                    <a
                                                                        href={call.recordingUrl}
                                                                        download
                                                                        className="flex items-center w-full"
                                                                    >
                                                                        Download Recording
                                                                    </a>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {call.recordingUrl && (
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="bg-muted p-2 rounded-md">
                                                <audio controls className="w-full h-8">
                                                    <source src={call.recordingUrl} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Call Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Call Details</DialogTitle>
                    </DialogHeader>

                    {selectedCall && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                        {getInitials(selectedCall.contactId.firstName, selectedCall.contactId.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">
                                        {selectedCall.contactId.firstName} {selectedCall.contactId.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{selectedCall.contactId.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted rounded-md p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Direction</p>
                                    <div className="flex items-center gap-2">
                                        {selectedCall.direction === 'outbound' ? (
                                            <>
                                                <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                                                <span>Outgoing Call</span>
                                            </>
                                        ) : (
                                            <>
                                                <PhoneIncoming className="h-4 w-4 text-green-500" />
                                                <span>Incoming Call</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-muted rounded-md p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                    <div className="flex items-center gap-2">
                                        <PhoneCall className="h-4 w-4 text-primary" />
                                        <span>{formatDuration(selectedCall.duration)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted rounded-md p-3 space-y-2">
                                <p className="text-xs text-muted-foreground">Call Details</p>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <p className="text-muted-foreground">Date</p>
                                    <p>{format(new Date(selectedCall.startTime), "PPP")}</p>

                                    <p className="text-muted-foreground">Time</p>
                                    <p>{format(new Date(selectedCall.startTime), "p")}</p>

                                    <p className="text-muted-foreground">Status</p>
                                    <p className="capitalize">{selectedCall.status}</p>

                                    <p className="text-muted-foreground">Cost</p>
                                    <p>₹{(selectedCall.cost / 100).toFixed(2)}</p>
                                </div>
                            </div>

                            {selectedCall.recordingUrl && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Call Recording</p>
                                    <div className="bg-muted rounded-md p-3">
                                        <audio controls className="w-full">
                                            <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-2 gap-2"
                                            onClick={() => window.open(selectedCall.recordingUrl, '_blank')}
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Recording
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedCall.notes && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Call Notes
                                    </p>
                                    <div className="bg-muted rounded-md p-3 text-sm">
                                        {selectedCall.notes}
                                    </div>
                                </div>
                            )}

                            {selectedCall.transcription && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Transcription</p>
                                    <ScrollArea className="h-24 rounded-md border p-3">
                                        <p className="text-sm">{selectedCall.transcription}</p>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}