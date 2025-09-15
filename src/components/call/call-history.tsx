"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
    Loader2, 
    PhoneCall, 
    PhoneIncoming, 
    PhoneOutgoing, 
    Check, 
    MoreVertical, 
    Download, 
    MessageSquare,
    FileText,
    ChevronDown,
    ChevronRight,
    Edit2,
    Sparkles,
    Volume2,
    Bot,
    Eye,
    TrendingUp,
    TrendingDown,
    Users,
    AlertTriangle,
    XCircle,
    CheckCircle,
    HelpCircle,
    Clock,
    Play,
    Calendar,
    Maximize2,
    AudioWaveform
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
    startTime: string;
    endTime?: string;
    createdAt: string;
};

export default function CallHistory({ contactId, limit = 10 }: { contactId?: string; limit?: number }) {
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
    const [expandedCalls, setExpandedCalls] = useState<Set<string>>(new Set());
    const [processingAI, setProcessingAI] = useState<Set<string>>(new Set());

    // Helper function to get outcome display
    const getOutcomeDisplay = (outcome?: string) => {
        switch (outcome) {
            case 'Success':
                return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Success' };
            case 'Follow-up':
                return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', label: 'Follow-up' };
            case 'Interested':
                return { icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/20', label: 'Interested' };
            case 'Declined':
                return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20', label: 'Declined' };
            case 'Inquiry':
                return { icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20', label: 'Inquiry' };
            case 'Support':
                return { icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20', label: 'Support' };
            case 'Complaint':
                return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', label: 'Complaint' };
            case 'Cancelled':
                return { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-950/20', label: 'Cancelled' };
            default:
                return null;
        }
    };

    const toggleCallExpansion = (callId: string) => {
        const newExpanded = new Set(expandedCalls);
        if (newExpanded.has(callId)) {
            newExpanded.delete(callId);
        } else {
            newExpanded.add(callId);
        }
        setExpandedCalls(newExpanded);
    };

    useEffect(() => {
        fetchCalls();
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

        const newProcessing = new Set(processingAI);
        newProcessing.add(callId);
        setProcessingAI(newProcessing);

        try {
            const response = await axios.post(`/api/calls/${callId}/ai-analysis`, { action });
            const { transcription, summary, outcome } = response.data;

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

            toast({
                title: "AI Analysis Complete",
                description: "Call has been analyzed successfully.",
            });

        } catch (error: any) {
            console.error('AI analysis error:', error);
            toast({
                title: "Analysis failed",
                description: "Please try again later.",
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
                description: "Unable to download recording.",
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
            <Card className="border-0 shadow-none">
                <CardContent className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-4">
                        <PhoneCall className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        {contactId ? 
                            "You haven't made any calls to this contact." :
                            "Your call history will appear here once you start making calls."
                        }
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {/* Compact Header */}
            {!contactId && (
                <div className="flex items-center gap-3 mb-4">
                    <Input
                        placeholder="Search calls..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 h-9 border-0 bg-muted/50 focus-visible:ring-1"
                    />
                    
                    <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                        <TabsList className="bg-muted/50 h-9">
                            <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                            <TabsTrigger value="outbound" className="text-xs px-3">Out</TabsTrigger>
                            <TabsTrigger value="inbound" className="text-xs px-3">In</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            )}

            {/* Compact Call List */}
            <div className="space-y-2">
                {filteredCalls.map((call) => {
                    const outcomeDisplay = getOutcomeDisplay(call.outcome);
                    const isExpanded = expandedCalls.has(call._id);
                    
                    return (
                        <Card key={call._id} className="border-0 shadow-sm bg-card transition-all duration-200">
                            <Collapsible open={isExpanded} onOpenChange={() => toggleCallExpansion(call._id)}>
                                {/* Compact Call Row */}
                                <CollapsibleTrigger className="w-full">
                                    <CardContent className="p-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-muted text-xs font-medium">
                                                        {getInitials(call.contactId.firstName, call.contactId.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                
                                                <div className="text-left">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                            {call.contactId.firstName} {call.contactId.lastName}
                                                        </span>
                                                        {call.direction === 'outbound' ? (
                                                            <PhoneOutgoing className="h-3.5 w-3.5 text-blue-500" />
                                                        ) : (
                                                            <PhoneIncoming className="h-3.5 w-3.5 text-emerald-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{formatDistanceToNow(new Date(call.startTime), { addSuffix: true })}</span>
                                                        <span>•</span>
                                                        <span>{formatDuration(call.duration)}</span>
                                                        {call.status === 'completed' && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-emerald-600">Completed</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Compact Outcome Badge */}
                                                {outcomeDisplay && (
                                                    <Badge variant="outline" className={cn(
                                                        "text-xs px-2 py-0.5 border-0",
                                                        outcomeDisplay.bg,
                                                        outcomeDisplay.color
                                                    )}>
                                                        <outcomeDisplay.icon className="h-3 w-3 mr-1" />
                                                        {outcomeDisplay.label}
                                                    </Badge>
                                                )}

                                                {/* Status Indicators */}
                                                <div className="flex items-center gap-1">
                                                    {call.recordingUrl && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has recording" />
                                                    )}
                                                    {call.transcription && (
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full" title="Transcribed" />
                                                    )}
                                                    {call.summary && (
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full" title="AI analyzed" />
                                                    )}
                                                    {call.notes && (
                                                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Has notes" />
                                                    )}
                                                </div>

                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </CollapsibleTrigger>

                                {/* Expanded Content */}
                                <CollapsibleContent>
                                    <CardContent className="px-4 pb-4 pt-0 border-t border-border/50 bg-muted/20">
                                        <div className="space-y-4">
                                            {/* Quick Actions */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {call.recordingUrl && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCall(call);
                                                                setShowDetailsDialog(true);
                                                            }}
                                                            className="gap-1 h-7 px-2 text-xs"
                                                        >
                                                            <Maximize2 className="h-3 w-3" />
                                                            Details
                                                        </Button>
                                                    )}
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                            <MoreVertical className="h-3.5 w-3.5" />
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
                                                            <DropdownMenuItem onClick={() => downloadRecording(call.recordingUrl || '', `call_${call._id}.mp3`)}>
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download Recording
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Compact AI Analysis */}
                                            {call.recordingUrl && (
                                                <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/80 dark:from-slate-900/40 dark:to-blue-900/40 rounded-lg p-3 border border-border/30">
                                                    {processingAI.has(call._id) ? (
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                            <span className="text-sm">Analyzing...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Sparkles className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm font-medium">AI Analysis</span>
                                                                {(call.transcription || call.summary) && (
                                                                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                                        Done
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex gap-1">
                                                                {!call.transcription && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAIAnalysis(call._id, 'transcribe');
                                                                        }}
                                                                        className="gap-1 h-7 px-2 text-xs"
                                                                    >
                                                                        <Volume2 className="h-3 w-3" />
                                                                        Transcribe
                                                                    </Button>
                                                                )}
                                                                {!call.transcription && (!call.summary || !call.outcome) && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAIAnalysis(call._id, 'both');
                                                                        }}
                                                                        className="gap-1 h-7 px-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600"
                                                                    >
                                                                        <Sparkles className="h-3 w-3" />
                                                                        Analyze
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Compact Summary */}
                                            {call.summary && (
                                                <div className="p-3 bg-blue-50/80 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                                                    <div className="flex items-start gap-2">
                                                        <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">AI Summary</div>
                                                            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                                                {call.summary}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Compact Notes */}
                                            {editingNotes === call._id ? (
                                                <div className="space-y-2">
                                                    <Textarea
                                                        value={notesText}
                                                        onChange={(e) => setNotesText(e.target.value)}
                                                        placeholder="Add notes..."
                                                        className="resize-none text-xs min-h-[60px] border-0 bg-muted/50"
                                                        rows={3}
                                                    />
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveNotes(call._id)}
                                                            disabled={saving}
                                                            className="gap-1 h-7 px-2 text-xs"
                                                        >
                                                            {saving ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Check className="h-3 w-3" />
                                                            )}
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setEditingNotes(null)}
                                                            className="h-7 px-2 text-xs"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        {call.notes ? (
                                                            <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                                                                {call.notes.length > 100 ? `${call.notes.substring(0, 100)}...` : call.notes}
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 bg-muted/20 border border-dashed border-muted rounded text-xs text-muted-foreground italic">
                                                                No notes
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingNotes(call._id);
                                                            setNotesText(call.notes || '');
                                                        }}
                                                        className="gap-1 h-7 w-7 p-0 ml-2 text-muted-foreground"
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    );
                })}
            </div>

            {/* Modern Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="sm:max-w-3xl z-[100] m-auto max-h-screen  p-0">
                    {selectedCall && (
                        <>
                            {/* Modern Header */}
                            <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                            {getInitials(selectedCall.contactId.firstName, selectedCall.contactId.lastName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <DialogTitle className="text-xl font-bold">
                                            {selectedCall.contactId.firstName} {selectedCall.contactId.lastName}
                                        </DialogTitle>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>{selectedCall.contactId.email}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                {selectedCall.direction === 'outbound' ? (
                                                    <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <PhoneIncoming className="h-4 w-4 text-emerald-500" />
                                                )}
                                                <span className="capitalize">{selectedCall.direction} call</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedCall.outcome && (
                                        <div className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                                            getOutcomeDisplay(selectedCall.outcome)?.bg,
                                            getOutcomeDisplay(selectedCall.outcome)?.color
                                        )}>
                                            {getOutcomeDisplay(selectedCall.outcome) && 
                                                React.createElement(getOutcomeDisplay(selectedCall.outcome)!.icon, { className: "h-4 w-4" })
                                            }
                                            {getOutcomeDisplay(selectedCall.outcome)?.label}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="text-lg font-bold">{formatDuration(selectedCall.duration)}</div>
                                        <div className="text-xs text-muted-foreground">Duration</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="text-sm font-semibold">{format(new Date(selectedCall.startTime), "MMM d")}</div>
                                        <div className="text-xs text-muted-foreground">Date</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="text-sm font-semibold capitalize">{selectedCall.status}</div>
                                        <div className="text-xs text-muted-foreground">Status</div>
                                    </div>
                                    <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                        <div className="text-sm font-semibold">{format(new Date(selectedCall.startTime), "HH:mm")}</div>
                                        <div className="text-xs text-muted-foreground">Time</div>
                                    </div>
                                </div>
                    </DialogHeader>

                            {/* Modern Content */}
                            <ScrollArea className="max-h-[70vh] px-6 py-6">
                                <div className="space-y-6">
                                    {/* AI Analysis Section */}
                                    {selectedCall.recordingUrl && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                                                    <Sparkles className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">AI Analysis</h3>
                                                    <p className="text-sm text-muted-foreground">Advanced call insights powered by Zapllo AI</p>
                                                </div>
                                            </div>
                                            
                                            {processingAI.has(selectedCall._id) ? (
                                                <div className="flex items-center justify-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                                                    <div className="text-center space-y-4">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
                                                            <AudioWaveform className="h-6 w-6 text-blue-600 dark:text-blue-400 absolute inset-0 m-auto animate-pulse" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-lg">Analyzing your call...</p>
                                                            <p className="text-sm text-muted-foreground">Our AI is processing the audio and generating insights</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {!selectedCall.transcription && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleAIAnalysis(selectedCall._id, 'transcribe')}
                                                            className="flex-col h-auto p-4 gap-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"
                                                        >
                                                            <Volume2 className="h-6 w-6 text-blue-600" />
                                                            <div className="text-center">
                                                                <div className="font-semibold">Transcribe</div>
                                                                <div className="text-xs text-muted-foreground">Convert speech to text</div>
                                                            </div>
                                                        </Button>
                                                    )}
                                                    
                                                    {selectedCall.transcription && (!selectedCall.summary || !selectedCall.outcome) && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleAIAnalysis(selectedCall._id, 'summarize')}
                                                            className="flex-col h-auto p-4 gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/30"
                                                        >
                                                            <Bot className="h-6 w-6 text-purple-600" />
                                                            <div className="text-center">
                                                                <div className="font-semibold">Analyze</div>
                                                                <div className="text-xs text-muted-foreground">Generate insights</div>
                                                            </div>
                                                        </Button>
                                                    )}
                                                    
                                                    {!selectedCall.transcription && (!selectedCall.summary || !selectedCall.outcome) && (
                                                        <Button
                                                            onClick={() => handleAIAnalysis(selectedCall._id, 'both')}
                                                            className="flex-col h-auto p-4 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 md:col-span-2"
                                                        >
                                                            <Sparkles className="h-6 w-6 text-white" />
                                                            <div className="text-center text-white">
                                                                <div className="font-semibold">Complete Analysis</div>
                                                                <div className="text-xs opacity-90">Transcribe + Generate insights</div>
                                                            </div>
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            {/* AI Results */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Summary Card */}
                                                {selectedCall.summary && (
                                                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                                                                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Business Summary</h4>
                                                                <p className="text-xs text-blue-700 dark:text-blue-300">AI-generated insights</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                                            {selectedCall.summary}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Transcription Card */}
                                                {selectedCall.transcription && (
                                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                                                <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold">Full Conversation</h4>
                                                                <p className="text-xs text-muted-foreground">Complete transcription</p>
                                                            </div>
                                                        </div>
                                                        <ScrollArea className="">
                                                            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                                                {selectedCall.transcription}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recording Section */}
                                    {selectedCall.recordingUrl && (
                                        <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900">
                                                    <Play className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Call Recording</h3>
                                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">High-quality audio recording</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <audio 
                                                    controls 
                                                    className="w-full h-12 rounded-lg bg-white/50 dark:bg-emerald-900/30"
                                                    style={{
                                                        filter: 'sepia(20%) saturate(70%) hue-rotate(90deg)'
                                                    }}
                                                >
                                                    <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                                
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => downloadRecording(selectedCall.recordingUrl || '', `call_${selectedCall._id}.mp3`)}
                                                    className="gap-2 bg-white/50 dark:bg-emerald-900/30 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/40"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download Recording
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes Section */}
                                    <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                                                    <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">Call Notes</h3>
                                                    <p className="text-xs text-amber-700 dark:text-amber-300">Personal notes and observations</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingNotes(selectedCall._id);
                                                    setNotesText(selectedCall.notes || '');
                                                }}
                                                className="gap-2 bg-white/50 dark:bg-amber-900/30 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/40"
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
                                                    placeholder="Add your thoughts, follow-up actions, or important points from this call..."
                                                    className="resize-none min-h-[120px] bg-white/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 focus-visible:ring-amber-500"
                                                    rows={5}
                                                />
                                                <div className="flex gap-3">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSaveNotes(selectedCall._id)}
                                                        disabled={saving}
                                                        className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
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
                                                        className="border-amber-200 dark:border-amber-800"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-white/50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50 min-h-[120px]">
                                                {selectedCall.notes ? (
                                                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed whitespace-pre-wrap">
                                                        {selectedCall.notes}
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                                        <MessageSquare className="h-8 w-8 text-amber-400 dark:text-amber-600 mb-2" />
                                                        <p className="text-amber-600 dark:text-amber-400 font-medium mb-1">No notes yet</p>
                                                        <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Add your thoughts about this call</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Call Timeline */}
                                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                                                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Call Timeline</h3>
                                                <p className="text-xs text-purple-700 dark:text-purple-300">Detailed call information</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-purple-900/20 rounded-lg">
                                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Started</span>
                                                <span className="text-sm text-purple-700 dark:text-purple-300">
                                                    {format(new Date(selectedCall.startTime), "MMM d, yyyy 'at' HH:mm")}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-purple-900/20 rounded-lg">
                                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Duration</span>
                                                <span className="text-sm text-purple-700 dark:text-purple-300">
                                                    {formatDuration(selectedCall.duration)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-purple-900/20 rounded-lg">
                                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Direction</span>
                                                <div className="flex items-center gap-2">
                                                    {selectedCall.direction === 'outbound' ? (
                                                        <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                                                    ) : (
                                                        <PhoneIncoming className="h-4 w-4 text-emerald-500" />
                                                    )}
                                                    <span className="text-sm text-purple-700 dark:text-purple-300 capitalize">
                                                        {selectedCall.direction}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-purple-900/20 rounded-lg">
                                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Status</span>
                                                <span className="text-sm text-purple-700 dark:text-purple-300 capitalize">
                                                    {selectedCall.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}