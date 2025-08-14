"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
    Loader2, 
    PhoneCall, 
    PhoneIncoming, 
    PhoneOutgoing, 
    Check, 
    X, 
    MoreVertical, 
    Download, 
    MessageSquare,
    FileText,
    ChevronDown,
    ChevronRight,
    Edit2,
    Sparkles,
    Volume2,
    CreditCard,
    AlertCircle,
    Play,
    Clock,
    Calendar,
    DollarSign,
    Bot,
    Eye,
    TrendingUp,
    TrendingDown,
    Users,
    Phone,
    AlertTriangle,
    XCircle,
    CheckCircle,
    HelpCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    summary?: string;
    outcome?: 'Success' | 'Follow-up' | 'Interested' | 'Declined' | 'Inquiry' | 'Support' | 'Complaint' | 'Cancelled';
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
    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [notesText, setNotesText] = useState('');
    const [saving, setSaving] = useState(false);
    const [expandedTranscriptions, setExpandedTranscriptions] = useState<Set<string>>(new Set());
    const [processingAI, setProcessingAI] = useState<Set<string>>(new Set());
    const [aiCredits, setAiCredits] = useState<number | null>(null);

    // Helper function to get outcome icon and color
    const getOutcomeDisplay = (outcome?: string) => {
        switch (outcome) {
            case 'Success':
                return { 
                    icon: CheckCircle, 
                    color: 'text-green-600 dark:text-green-400',
                    bg: 'bg-green-50 dark:bg-green-950/30',
                    border: 'border-green-200 dark:border-green-800'
                };
            case 'Follow-up':
                return { 
                    icon: Clock, 
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-950/30',
                    border: 'border-blue-200 dark:border-blue-800'
                };
            case 'Interested':
                return { 
                    icon: TrendingUp, 
                    color: 'text-orange-600 dark:text-orange-400',
                    bg: 'bg-orange-50 dark:bg-orange-950/30',
                    border: 'border-orange-200 dark:border-orange-800'
                };
            case 'Declined':
                return { 
                    icon: TrendingDown, 
                    color: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-50 dark:bg-red-950/30',
                    border: 'border-red-200 dark:border-red-800'
                };
            case 'Inquiry':
                return { 
                    icon: HelpCircle, 
                    color: 'text-purple-600 dark:text-purple-400',
                    bg: 'bg-purple-50 dark:bg-purple-950/30',
                    border: 'border-purple-200 dark:border-purple-800'
                };
            case 'Support':
                return { 
                    icon: Users, 
                    color: 'text-indigo-600 dark:text-indigo-400',
                    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
                    border: 'border-indigo-200 dark:border-indigo-800'
                };
            case 'Complaint':
                return { 
                    icon: AlertTriangle, 
                    color: 'text-yellow-600 dark:text-yellow-400',
                    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
                    border: 'border-yellow-200 dark:border-yellow-800'
                };
            case 'Cancelled':
                return { 
                    icon: XCircle, 
                    color: 'text-gray-600 dark:text-gray-400',
                    bg: 'bg-gray-50 dark:bg-gray-950/30',
                    border: 'border-gray-200 dark:border-gray-800'
                };
            default:
                return { 
                    icon: Phone, 
                    color: 'text-muted-foreground',
                    bg: 'bg-muted/30',
                    border: 'border-muted'
                };
        }
    };

    // Fetch AI credits
    const fetchAICredits = async () => {
        try {
            const response = await axios.get('/api/organization/ai-credits');
            setAiCredits(response.data.aiCredits);
        } catch (error) {
            console.error('Error fetching AI credits:', error);
        }
    };

    useEffect(() => {
        fetchCalls();
        fetchAICredits();
    }, [contactId]);

    const handleAIAnalysis = async (callId: string, action: 'transcribe' | 'summarize' | 'both') => {
        const call = calls.find(c => c._id === callId);
        if (!call?.recordingUrl) {
            toast({
                title: "No recording available",
                description: "This call doesn't have a recording to analyze.",
                variant: "destructive",
            });
            return;
        }

        let requiredCredits = 0;
        if ((action === 'transcribe' || action === 'both') && !call.transcription) requiredCredits += 3; // Updated credit cost
        if ((action === 'summarize' || action === 'both') && (!call.summary || !call.outcome)) requiredCredits += 3; // Summary + Outcome

        if (aiCredits !== null && aiCredits < requiredCredits) {
            toast({
                title: "Insufficient AI credits",
                description: `You need ${requiredCredits} AI credits but only have ${aiCredits}.`,
                variant: "destructive",
            });
            return;
        }

        const newProcessing = new Set(processingAI);
        newProcessing.add(callId);
        setProcessingAI(newProcessing);

        try {
            const response = await axios.post(`/api/calls/${callId}/ai-analysis`, {
                action
            });

            const { transcription, summary, outcome, creditsUsed, remainingCredits } = response.data;

            setCalls(calls.map(c => 
                c._id === callId 
                    ? { 
                        ...c, 
                        transcription: transcription || c.transcription,
                        summary: summary || c.summary,
                        outcome: outcome || c.outcome
                    } 
                    : c
            ));

            setAiCredits(remainingCredits);

            toast({
                title: "AI Analysis Complete",
                description: `Used ${creditsUsed} credits. ${remainingCredits} remaining.`,
            });

        } catch (error: any) {
            console.error('AI analysis error:', error);
            toast({
                title: "AI Analysis failed",
                description: error.response?.data?.error || "Please try again later.",
                variant: "destructive",
            });
        } finally {
            const newProcessing = new Set(processingAI);
            newProcessing.delete(callId);
            setProcessingAI(newProcessing);
        }
    };

    const downloadRecording = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast({
                title: "Download complete",
                description: "Recording downloaded successfully.",
            });
        } catch (error) {
            toast({
                title: "Download failed",
                description: "There was a problem downloading the recording.",
                variant: "destructive",
            });
        }
    };

    const handleSaveNotes = async (callId: string) => {
        try {
            setSaving(true);
            await axios.put(`/api/calls/${callId}/notes`, { notes: notesText });
            
            setCalls(calls.map(call => 
                call._id === callId ? { ...call, notes: notesText } : call
            ));
            
            setEditingNotes(null);
            toast({
                title: "Notes saved",
                description: "Call notes updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save notes.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleTranscription = (callId: string) => {
        const newExpanded = new Set(expandedTranscriptions);
        if (newExpanded.has(callId)) {
            newExpanded.delete(callId);
        } else {
            newExpanded.add(callId);
        }
        setExpandedTranscriptions(newExpanded);
    };

    const fetchCalls = async () => {
        try {
            setLoading(true);
            const url = contactId
                ? `/api/calls?contactId=${contactId}&limit=${limit}`
                : `/api/calls?limit=${limit}`;

            const response = await axios.get(url);
            setCalls(response.data);
        } catch (error) {
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
                return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
            case 'failed':
            case 'busy':
            case 'no-answer':
            case 'canceled':
                return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
        }
    };

    const filteredCalls = calls.filter(call => {
        if (filter !== 'all' && call.direction !== filter) return false;
        if (searchTerm) {
            const fullName = `${call.contactId.firstName} ${call.contactId.lastName}`.toLowerCase();
            const email = call.contactId.email.toLowerCase();
            const search = searchTerm.toLowerCase();
            return fullName.includes(search) || email.includes(search);
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading calls...</span>
                </div>
            </div>
        );
    }

    if (calls.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <PhoneCall className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No calls yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    {contactId ? 
                        "You haven't made any calls to this contact." :
                        "Your call history will appear here once you start making calls."
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with AI Credits */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {!contactId && (
                        <Input
                            placeholder="Search calls..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-80"
                        />
                    )}
                    
                    {!contactId && (
                        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="outbound">Outbound</TabsTrigger>
                                <TabsTrigger value="inbound">Inbound</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}
                </div>

                {aiCredits !== null && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{aiCredits}</span>
                        <span className="text-xs text-blue-700 dark:text-blue-300">AI Credits</span>
                        {aiCredits < 10 && (
                            <AlertCircle className="h-4 w-4 text-amber-500 ml-1" />
                        )}
                    </div>
                )}
            </div>

            {/* Call List */}
            <div className="space-y-3">
                {filteredCalls.map((call) => {
                    const outcomeDisplay = getOutcomeDisplay(call.outcome);
                    const OutcomeIcon = outcomeDisplay.icon;
                    
                    return (
                        <Card key={call._id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-border bg-card">
                            <CardContent className="p-6">
                                {/* Call Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 ring-2 ring-border">
                                            <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
                                                {getInitials(call.contactId.firstName, call.contactId.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                      <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-foreground text-lg">
                                                    {call.contactId.firstName} {call.contactId.lastName}
                                                </h3>
                                                {call.direction === 'outbound' ? (
                                                    <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <PhoneIncoming className="h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                <span>{formatDistanceToNow(new Date(call.startTime), { addSuffix: true })}</span>
                                                <span>•</span>
                                                <span>{formatDuration(call.duration)}</span>
                                                {call.cost > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>₹{(call.cost / 100).toFixed(2)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Call Outcome Badge */}
                                        {call.outcome && (
                                            <div className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                                                outcomeDisplay.bg,
                                                outcomeDisplay.border,
                                                outcomeDisplay.color,
                                                "border"
                                            )}>
                                                <OutcomeIcon className="h-3 w-3" />
                                                {call.outcome}
                                            </div>
                                        )}           
                                        {/* Call Status Badge */}
                                        <Badge variant="outline" className={cn("text-xs", getStatusColor(call.status))}>
                                            {call.status === 'completed' ? (
                                                <Check className="h-3 w-3 mr-1" />
                                            ) : (
                                                <X className="h-3 w-3 mr-1" />
                                            )}
                                            {call.status}
                                        </Badge>
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedCall(call);
                                                    setShowDetailsDialog(true);
                                                }}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {call.recordingUrl && (
                                                    <DropdownMenuItem onClick={() => downloadRecording(call.recordingUrl || '', `zapllo_call_${call._id}.mp3`)}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download Recording
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* AI Analysis Section - Enhanced */}
                                {call.recordingUrl && (
                                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl p-5 mb-4 border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                                                    <Sparkles className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground">AI Analysis</h4>
                                                    <p className="text-xs text-muted-foreground">Powered by GPT-4</p>
                                                </div>
                                            </div>
                                            
                                            {(call.transcription || call.summary || call.outcome) && (
                                                <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Analyzed
                                                </Badge>
                                            )}
                                        </div>

                                        {processingAI.has(call._id) ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="text-center space-y-3">
                                                    <div className="flex items-center justify-center">
                                                        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">AI is analyzing your call...</p>
                                                        <p className="text-xs text-muted-foreground">This may take 30-60 seconds</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {!call.transcription && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAIAnalysis(call._id, 'transcribe')}
                                                        className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                    >
                                                        <Volume2 className="h-4 w-4" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Transcribe</div>
                                                            <div className="text-xs opacity-70">3 credits</div>
                                                        </div>
                                                    </Button>
                                                )}
                                                
                                                {call.transcription && (!call.summary || !call.outcome) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAIAnalysis(call._id, 'summarize')}
                                                        className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                                    >
                                                        <Bot className="h-4 w-4" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Analyze</div>
                                                            <div className="text-xs opacity-70">3 credits</div>
                                                        </div>
                                                    </Button>
                                                )}
                                                
                                                {!call.transcription && (!call.summary || !call.outcome) && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAIAnalysis(call._id, 'both')}
                                                        className="sm:col-span-2 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Full Analysis</div>
                                                            <div className="text-xs opacity-90">Transcribe + Summarize (6 credits)</div>
                                                        </div>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Recording Player */}
                                {call.recordingUrl && (
                                    <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Play className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">Call Recording</span>
                                        </div>
                                        <audio controls className="w-full h-10">
                                            <source src={call.recordingUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}

                                {/* AI Results Display */}
                                <div className="space-y-4">
                                    {/* Business Summary */}
                                    {call.summary && (
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <span className="font-semibold text-blue-900 dark:text-blue-100">Business Summary</span>
                                                <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                                    AI Generated
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                                {call.summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Conversation Transcription */}
                                    {call.transcription && (
                                        <div>
                                            <Collapsible 
                                                open={expandedTranscriptions.has(call._id)}
                                                onOpenChange={() => toggleTranscription(call._id)}
                                            >
                                                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors border border-border">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div className="text-left">
                                                            <span className="font-medium text-foreground">Call Conversation</span>
                                                            <p className="text-xs text-muted-foreground">AI-formatted dialogue</p>
                                                        </div>
                                                    </div>
                                                    {expandedTranscriptions.has(call._id) ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <div className="mt-2 p-4 bg-card border border-border rounded-lg">
                                                        <ScrollArea className="max-h-60">
                                                            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
                                                                {call.transcription}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </div>
                                    )}
                                </div>

                                {/* Notes Section */}
                                <div className="border-t border-border pt-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-foreground">Call Notes</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingNotes(call._id);
                                                setNotesText(call.notes || '');
                                            }}
                                            className="gap-1 h-8"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                            {call.notes ? 'Edit' : 'Add Notes'}
                                        </Button>
                                    </div>
                                    
                                    {editingNotes === call._id ? (
                                        <div className="space-y-3">
                                            <Textarea
                                                value={notesText}
                                                onChange={(e) => setNotesText(e.target.value)}
                                                placeholder="Add your notes about this call..."
                                                className="resize-none min-h-[100px]"
                                                rows={4}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSaveNotes(call._id)}
                                                    disabled={saving}
                                                    className="gap-2"
                                                >
                                                    {saving ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Check className="h-3 w-3" />
                                                    )}
                                                    Save Notes
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingNotes(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-muted/30 rounded-lg min-h-[80px] border-2 border-dashed border-muted">
                                            {call.notes ? (
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                    {call.notes}
                                                </p>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <p className="text-sm text-muted-foreground italic">
                                                        No notes added for this call yet
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Enhanced Call Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="pb-4 border-b border-border">
                        <DialogTitle className="text-xl">Call Analysis & Details</DialogTitle>
                    </DialogHeader>

                    {selectedCall && (
                        <ScrollArea className="max-h-[75vh] pr-4">
                            <div className="space-y-6 py-4">
                                {/* Enhanced Contact Header */}
                                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl border border-border">
                                    <Avatar className="h-16 w-16 ring-4 ring-border">
                                        <AvatarFallback className="bg-muted text-muted-foreground text-xl font-semibold">
                                            {getInitials(selectedCall.contactId.firstName, selectedCall.contactId.lastName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-foreground">
                                            {selectedCall.contactId.firstName} {selectedCall.contactId.lastName}
                                        </h2>
                                        <p className="text-muted-foreground">{selectedCall.contactId.email}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2">
                                                {selectedCall.direction === 'outbound' ? (
                                                    <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <PhoneIncoming className="h-4 w-4 text-green-500" />
                                                )}
                                                <span className="text-sm capitalize font-medium">{selectedCall.direction} call</span>
                                            </div>
                                            
                                            {selectedCall.outcome && (
                                                <div className={cn(
                                                    "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                                                    getOutcomeDisplay(selectedCall.outcome).bg,
                                                    getOutcomeDisplay(selectedCall.outcome).border,
                                                    getOutcomeDisplay(selectedCall.outcome).color,
                                                    "border"
                                                )}>
                                                    {React.createElement(getOutcomeDisplay(selectedCall.outcome).icon, { className: "h-4 w-4" })}
                                                    {selectedCall.outcome}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Call Statistics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                                        <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                        <div className="text-xl font-bold text-foreground">{formatDuration(selectedCall.duration)}</div>
                                        <div className="text-xs text-muted-foreground">Duration</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                                        <Calendar className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                        <div className="text-sm font-semibold text-foreground">{format(new Date(selectedCall.startTime), "MMM d, yyyy")}</div>
                                        <div className="text-xs text-muted-foreground">Date</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                                        <DollarSign className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                        <div className="text-sm font-semibold text-foreground">₹{(selectedCall.cost / 100).toFixed(2)}</div>
                                        <div className="text-xs text-muted-foreground">Cost</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="text-sm font-semibold capitalize text-foreground">{selectedCall.status}</div>
                                        <div className="text-xs text-muted-foreground">Status</div>
                                    </div>
                                </div>

                                {/* AI Analysis Section for Dialog */}
                                {selectedCall.recordingUrl && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                                                <Sparkles className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground">AI Analysis</h3>
                                                <p className="text-sm text-muted-foreground">Powered by GPT-4 & Whisper</p>
                                            </div>
                                        </div>
                                        
                                        {processingAI.has(selectedCall._id) ? (
                                            <div className="flex items-center justify-center py-12 bg-muted/30 rounded-lg">
                                                <div className="text-center space-y-3">
                                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
                                                    <div>
                                                        <p className="font-medium text-foreground">AI is analyzing your call...</p>
                                                        <p className="text-sm text-muted-foreground">Processing with advanced AI models</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                {!selectedCall.transcription && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleAIAnalysis(selectedCall._id, 'transcribe')}
                                                        className="gap-2 flex-1"
                                                    >
                                                        <Volume2 className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">Transcribe Conversation</div>
                                                            <div className="text-xs opacity-70">3 credits</div>
                                                        </div>
                                                    </Button>
                                                )}
                                                {selectedCall.transcription && (!selectedCall.summary || !selectedCall.outcome) && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleAIAnalysis(selectedCall._id, 'summarize')}
                                                        className="gap-2 flex-1"
                                                    >
                                                        <Bot className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">Generate Analysis</div>
                                                            <div className="text-xs opacity-70">3 credits</div>
                                                        </div>
                                                    </Button>
                                                )}
                                                {!selectedCall.transcription && (!selectedCall.summary || !selectedCall.outcome) && (
                                                    <Button
                                                        onClick={() => handleAIAnalysis(selectedCall._id, 'both')}
                                                        className="gap-2 flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">Complete Analysis</div>
                                                            <div className="text-xs opacity-90">6 credits total</div>
                                                        </div>
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {/* AI Results in Dialog */}
                                        {(selectedCall.summary || selectedCall.transcription) && (
                                            <div className="space-y-4 mt-6">
                                                {selectedCall.summary && (
                                                    <div className="p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Business Analysis</h4>
                                                            <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                                                GPT-4 Generated
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                                            {selectedCall.summary}
                                                        </p>
                                                    </div>
                                                )}

                                                {selectedCall.transcription && (
                                                    <div className="p-6 bg-muted/30 border border-border rounded-xl">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                                            <h4 className="font-semibold text-foreground">Call Conversation</h4>
                                                            <Badge variant="outline" className="text-xs">
                                                                Whisper AI
                                                            </Badge>
                                                        </div>
                                                        <ScrollArea className="max-h-80">
                                                            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-card p-4 rounded-lg border border-border">
                                                                {selectedCall.transcription}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Recording Section */}
                                {selectedCall.recordingUrl && (
                                    <div className="p-6 bg-muted/30 rounded-xl border border-border">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Play className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="font-semibold text-foreground">Call Recording</h3>
                                        </div>
                                        <audio controls className="w-full mb-4">
                                            <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadRecording(selectedCall.recordingUrl || '', `zapllo_call_${selectedCall._id}.mp3`)}
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Recording
                                        </Button>
                                    </div>
                                )}

                                {/* Notes Section in Dialog */}
                                <div className="p-6 bg-muted/30 rounded-xl border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="font-semibold text-foreground">Call Notes</h3>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingNotes(selectedCall._id);
                                                setNotesText(selectedCall.notes || '');
                                            }}
                                            className="gap-2"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                            {selectedCall.notes ? 'Edit Notes' : 'Add Notes'}
                                        </Button>
                                    </div>
                                    
                                    {editingNotes === selectedCall._id ? (
                                        <div className="space-y-4">
                                            <Textarea
                                                value={notesText}
                                                onChange={(e) => setNotesText(e.target.value)}
                                                placeholder="Add your notes about this call..."
                                                className="resize-none min-h-[120px]"
                                                rows={5}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSaveNotes(selectedCall._id)}
                                                    disabled={saving}
                                                    className="gap-2"
                                                >
                                                    {saving ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Check className="h-3 w-3" />
                                                    )}
                                                    Save Notes
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingNotes(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-card rounded-lg border border-border min-h-[120px]">
                                            {selectedCall.notes ? (
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                    {selectedCall.notes}
                                                </p>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <p className="text-muted-foreground italic">
                                                        No notes added for this call
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}