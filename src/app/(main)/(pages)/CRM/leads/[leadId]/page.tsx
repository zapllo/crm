'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FaUser, FaLayerGroup, FaGlobe, FaCalendar, FaRupeeSign,
    FaFileAlt, FaEnvelope, FaBuilding, FaFlag, FaLocationArrow,
    FaMapMarkerAlt, FaPhoneAlt, FaClock, FaTasks, FaUserCheck, FaStickyNote,
    FaFile,
    FaDownload,
    FaPlayCircle,
    FaLink,
    FaExternalLinkAlt,
    FaPaperclip,
    FaMoneyBill,
    FaFileInvoiceDollar
} from "react-icons/fa";

import LeadTimeline from '@/components/leads/timeline';
import FollowupSection from '@/components/leads/followups';
import NotesSection from '@/components/leads/notes';
import QuotationsTab from '@/components/leads/quotations';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Clock, Eye, Loader2, Mail, MoreHorizontal, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MoveLeadDialog from '@/components/modals/leads/moveLeads';
import AddNoteDialog from '@/components/modals/leads/addNotes';
import AddFollowupDialog from '@/components/modals/followups/AddFollowup';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import EmailsTab from '@/components/leads/email';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from '@/components/ui/no-permission-fallback';

/* ----------- TYPES ----------- */
interface LeadDetailsType {
    leadId: string;
    title: string;
    pipeline: {
        id: string;
        name: string;
        openStages: string[];
        closeStages: string[];
        customFields?: {
            name: string;
            type: "Text" | "Date" | "Number" | "MultiSelect";
            options?: string[];
        }[];
    };
    stage: string;
    assignedTo: {
        id: string;
        name: string;
        email: string;
    } | null;
    source: {
        name: string;
    };
    closingDate: string;
    amount: number;
    description: string;
    product?: {
        id: string;
        name: string;
    };
    contact?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        company?: {
            id: string;
            name: string;
            country: string;
            city: string;
            address: string;
            state: string;
        };
    };

    timeline: {
        event: string;
        date: string;
        details: string;
    }[];
    customFieldValues?: Record<string, any>;
    files?: string[];
    audioRecordings?: string[];
    links?: { url: string; title: string }[];

    createdAt: Date;
    updatedAt: Date;
}

export default function LeadDetails() {
    const params = useParams();
    const leadId = Array.isArray(params.leadId) ? params.leadId[0] : params.leadId;
    const searchParams = useSearchParams();
    const [leadDetails, setLeadDetails] = useState<LeadDetailsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quotationsCount, setQuotationsCount] = useState(0);
    const router = useRouter();

    // Add permission check
    const { isLoading: permissionsLoading, isInitialized } = usePermissions();
    const hasViewPermission = canView("Leads");

    // Add this state for email dialog control
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

    // Read "tab" parameter from URL
    const defaultTab = searchParams.get("tab") || "timeline";

    const fetchLeadDetails = async () => {
        try {
            const response = await axios.get(`/api/leads/details?leadId=${leadId}`);
            setLeadDetails(response.data);
        } catch (error) {
            console.error('Error fetching lead details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Add function to fetch quotations count
    const fetchQuotationsCount = async () => {
        try {
            const response = await axios.get(`/api/leads/quotations?leadId=${leadId}`);
            setQuotationsCount(response.data.quotations?.length || 0);
        } catch (error) {
            console.error('Error fetching quotations count:', error);
        }
    };

    // Fetch Lead Details and Quotations Count
    useEffect(() => {
        fetchLeadDetails();
        fetchQuotationsCount();
    }, [leadId]);

    // Add this before any rendering logic
    if (permissionsLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground">Loading permissions...</p>
                </div>
            </div>
        );
    }

    // Check for view permission after permissions are loaded
    if (isInitialized && !hasViewPermission) {
        return (
            <NoPermissionFallback
                title="No Access to Lead Details"
                description="You don't have permission to view lead details."
            />
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground">Loading lead details...</p>
                </div>
            </div>
        );
    }

    if (!leadDetails) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <div className="p-4 bg-muted rounded-full">
                    <FaUser className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">Lead not found</h2>
                <p className="text-muted-foreground">The lead you're looking for doesn't exist or has been deleted.</p>
                <Button onClick={() => router.push('/CRM/leads')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to leads
                </Button>
            </div>
        );
    }

    // Get stage color
    const getStageColor = (stage: string) => {
        if (leadDetails.pipeline.closeStages.includes(stage)) {
            return "bg-green-100 text-green-800 border-green-300";
        } else if (leadDetails.pipeline.openStages.includes(stage)) {
            return "bg-blue-100 text-blue-800 border-blue-300";
        }
        return "bg-gray-100 text-gray-800 border-gray-300";
    };

    // Component for file attachments
    const FileAttachments = ({ files }: { files: string[] }) => {
        if (!files || files.length === 0) return (
            <div className="text-center text-muted-foreground py-3">
                No file attachments available
            </div>
        );

        return (
            <div className="space-y-2">
                {files.map((fileUrl, index) => {
                    const fileName = fileUrl.split('/').pop() || `File ${index + 1}`;
                    return (
                        <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                            <div className="flex items-center">
                                <div className="bg-primary/10 p-2 rounded mr-3">
                                    <FaFile className="h-4 w-4 text-primary" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate" style={{ maxWidth: "150px" }}>{fileName}</p>
                                    <p className="text-xs text-muted-foreground">Attachment</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                                    <a href={fileUrl} download>
                                        <FaDownload className="h-3.5 w-3.5" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Component for audio recordings with shortened filenames
    const AudioRecordings = ({ recordings }: { recordings: string[] }) => {
        if (!recordings || recordings.length === 0) return (
            <div className="text-center text-muted-foreground py-3">
                No audio recordings available
            </div>
        );

        // Helper function to shorten filename while keeping extension
        const shortenFileName = (fileName: string, maxLength: number = 20) => {
            const parts = fileName.split('.');
            const extension = parts.length > 1 ? `.${parts.pop()}` : '';
            const name = parts.join('.');

            if (name.length <= maxLength) return fileName;

            return `${name.substring(0, maxLength)}...${extension}`;
        };

        return (
            <div className="space-y-2">
                {recordings.map((audioUrl, index) => {
                    const fileName = audioUrl.split('/').pop() || `Recording ${index + 1}`;
                    const shortName = shortenFileName(fileName);

                    return (
                        <div key={index} className="bg-muted/50 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="bg-primary/10 p-2 rounded mr-3">
                                        <FaPlayCircle className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium truncate" style={{ maxWidth: "150px" }}
                                            title={fileName}>
                                            {shortName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Audio Recording</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                                    <a href={audioUrl} download>
                                        <FaDownload className="h-3.5 w-3.5" />
                                    </a>
                                </Button>
                            </div>
                            <audio controls className="w-full h-8">
                                <source src={audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Component for links
    const LinksList = ({ links }: { links: { url: string; title: string }[] }) => {
        if (!links || links.length === 0) return (
            <div className="text-center text-muted-foreground py-3">
                No links available
            </div>
        );

        return (
            <div className="space-y-2">
                {links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                        <div className="flex items-center">
                            <div className="bg-primary/10 p-2 rounded mr-3">
                                <FaLink className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{link.title || 'Untitled Link'}</p>
                                <p className="text-xs text-muted-foreground truncate" style={{ maxWidth: "180px" }}>{link.url}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <FaExternalLinkAlt className="h-3.5 w-3.5" />
                            </a>
                        </Button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-6 mt-6">
            {/* ---- HEADER ---- */}
            <div className="flex justify-between items-center p-6 border-b bg-card sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => router.push('/CRM/leads')}
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{leadDetails.title}</h1>
                            <Badge variant="outline" className="ml-2 text-xs">
                                {leadDetails.leadId}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                            <p>{leadDetails.pipeline?.name}</p>
                            <span>•</span>
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", getStageColor(leadDetails.stage))}>
                                {leadDetails.stage}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEmailDialogOpen(true)}
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </Button>

                    {canEdit("Leads") && (
                        <MoveLeadDialog
                            leadId={leadId || ''}
                            currentStage={leadDetails.stage}
                            onLeadMoved={() => fetchLeadDetails()}
                        />
                    )}
                    {canAdd("Leads") && (
                        <AddNoteDialog
                            leadId={leadId || ''}
                            onNoteAdded={() => fetchLeadDetails()}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 px-6">
                {/* ---- LEFT PANEL - LEAD INFO (Fixed) ---- */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <Card className="shadow-sm border-muted">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center">
                                <FaUser className="mr-2 h-4 w-4 text-primary" />
                                Lead Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Assigned To */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 bg-primary/10">
                                        <AvatarFallback className="text-primary font-medium">
                                            {leadDetails.assignedTo?.name ? leadDetails.assignedTo?.name.charAt(0) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{leadDetails.assignedTo?.name || 'Unassigned'}</p>
                                        <p className="text-xs text-muted-foreground">Owner</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Source */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Source</p>
                                    <div className="flex items-center">
                                        <FaGlobe className="mr-2 h-3 w-3 text-primary" />
                                        <p className="text-sm">{leadDetails.source?.name}</p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                                    <div className="flex items-center">
                                        <FaMoneyBill className="mr-2 h-3 w-3 text-primary" />
                                        <p className="text-sm">{leadDetails.amount?.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>

                                {/* Pipeline */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Pipeline</p>
                                    <div className="flex items-center">
                                        <FaLayerGroup className="mr-2 h-3 w-3 text-primary" />
                                        <p className="text-sm">{leadDetails.pipeline.name}</p>
                                    </div>
                                </div>
                                {/* Closing Date */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Expected Close</p>
                                    <div className="flex items-center">
                                        <FaCalendar className="mr-2 h-3 w-3 text-primary" />
                                        <p className="text-sm">{leadDetails.closingDate ? format(new Date(leadDetails.closingDate), "dd MMM yyyy") : "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Description</p>
                                <div className="flex items-start mt-1">
                                    <FaFileAlt className="mr-2 h-3 w-3 text-primary mt-1" />
                                    <p className="text-sm">{leadDetails.description || "No description added."}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Created & Updated */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Created</span>
                                    <span className="font-medium">
                                        {format(new Date(leadDetails.createdAt), "dd MMM yyyy")}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Last updated</span>
                                    <span className="font-medium">
                                        {formatDistanceToNow(new Date(leadDetails.updatedAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Details Card */}
                    {leadDetails.contact && (
                        <Card className="shadow-sm border-muted">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <FaUser className="mr-2 h-4 w-4 text-primary" />
                                    Contact Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 bg-primary/10">
                                        <AvatarFallback className="text-primary font-medium">
                                            {leadDetails.contact.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{leadDetails.contact.name}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {leadDetails.contact.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="flex items-center">
                                        <FaPhoneAlt className="h-3 w-3 text-primary mr-2" />
                                        <a href={`tel:${leadDetails.contact.phone}`} className="text-sm hover:underline">
                                            {leadDetails.contact.phone}
                                        </a>
                                    </div>

                                    <div className="flex items-center mt-2">
                                        <FaEnvelope className="h-3 w-3 text-primary mr-2" />
                                        <a href={`mailto:${leadDetails.contact.email}`} className="text-sm hover:underline">
                                            {leadDetails.contact.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-between">
                                    <Button onClick={() => setEmailDialogOpen(true)} variant="outline" size="sm" className="w-full">
                                        <FaEnvelope className="mr-2 h-3 w-3" />
                                        Email
                                    </Button>
                                    <Button onClick={() => router.push(`/CRM/contacts/${leadDetails.contact?.id}`)} variant="outline" size="sm" className="w-full">
                                        <Eye className="mr-2 h-3 w-3" />
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Company Details Card */}
                    {leadDetails.contact?.company && (
                        <Card className="shadow-sm border-muted">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <FaBuilding className="mr-2 h-4 w-4 text-primary" />
                                    Company Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <FaBuilding className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{leadDetails.contact.company.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {leadDetails.contact.company.city}, {leadDetails.contact.company.country}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <FaFlag className="h-3 w-3 text-primary mt-1" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Country</p>
                                            <p className="text-sm">{leadDetails.contact.company.country}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <FaLocationArrow className="h-3 w-3 text-primary mt-1" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">State/City</p>
                                            <p className="text-sm">{leadDetails.contact.company.state}, {leadDetails.contact.company.city}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="h-3 w-3 text-primary mt-1" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Address</p>
                                            <p className="text-sm">{leadDetails.contact.company.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={() => router.push(`/CRM/companies/${leadDetails.contact?.company?.id}`)} variant="outline" size="sm" className="w-full">
                                    <FaBuilding className="mr-2 h-3 w-3" />
                                    View Company Profile
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Files, Audio, Links Cards - Only show if they exist */}
                    {leadDetails.files && leadDetails.files.length > 0 && (
                        <Card className="shadow-sm border-muted">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaPaperclip className="mr-2 h-4 w-4 text-primary" />
                                        File Attachments
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FileAttachments files={leadDetails.files} />
                            </CardContent>
                        </Card>
                    )}

                    {leadDetails.audioRecordings && leadDetails.audioRecordings.length > 0 && (
                        <Card className="shadow-sm border-muted">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaPlayCircle className="mr-2 h-4 w-4 text-primary" />
                                        Audio Recordings
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AudioRecordings recordings={leadDetails.audioRecordings} />
                            </CardContent>
                        </Card>
                    )}

                    {leadDetails.links && leadDetails.links.length > 0 && (
                        <Card className="shadow-sm border-muted">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaLink className="mr-2 h-4 w-4 text-primary" />
                                        Links
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LinksList links={leadDetails.links} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Custom Fields Card */}
                    {leadDetails.customFieldValues &&
                        Object.keys(leadDetails.customFieldValues).length > 0 && (
                            <Card className="shadow-sm border-muted">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-medium flex items-center">
                                        <FaLayerGroup className="mr-2 h-4 w-4 text-primary" />
                                        Custom Fields
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(leadDetails.customFieldValues).map(([fieldName, value]) => {
                                        const fieldDef = leadDetails.pipeline.customFields?.find(
                                            field => field.name === fieldName
                                        );

                                        return (
                                            <div key={fieldName}>
                                                <p className="text-xs text-muted-foreground mb-1">{fieldName}</p>
                                                <div className="flex items-center">
                                                    {fieldDef?.type === "Date" ? (
                                                        <FaCalendar className="mr-2 h-3 w-3 text-primary" />
                                                    ) : fieldDef?.type === "Number" ? (
                                                        <FaMoneyBill className="mr-2 h-3 w-3 text-primary" />
                                                    ) : (
                                                        <FaFileAlt className="mr-2 h-3 w-3 text-primary" />
                                                    )}

                                                    {fieldDef?.type === "Date" && value ? (
                                                        <p className="text-sm">{format(new Date(value), "dd MMM yyyy")}</p>
                                                    ) : Array.isArray(value) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {value.map((item, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">
                                                                    {item}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm">{value?.toString() || "N/A"}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}

             
                </div>

                {/* ---- RIGHT PANEL - TABS (Dynamic Content) ---- */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <Card className="shadow-sm border-muted">
                        <Tabs defaultValue={defaultTab} className="">
                            <CardHeader className="flex justify-center pb-0 overflow-x-scroll scrollbar-hide">
                                <TabsList className="w-fit  h-auto gap-4 bg-accent">
                                    <TabsTrigger
                                        value="timeline"
                                        className="text- border-none"
                                    >
                                        <FaClock className="mr-2 h-4 w-4" />
                                        Timeline
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="stages"
                                        className="text- border-none"
                                    >
                                        <FaTasks className="mr-2 h-4 w-4" />
                                        Stages
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="followups"
                                        className="text- border-none"
                                    >
                                        <FaUserCheck className="mr-2 h-4 w-4" />
                                        Follow-ups
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="emails"
                                        className="text- border-none"
                                    >
                                        <FaEnvelope className="mr-2 h-4 w-4" />
                                        Emails
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="notes"
                                        className="text- border-none"
                                    >
                                        <FaStickyNote className="mr-2 h-4 w-4" />
                                        Notes
                                    </TabsTrigger>
                                    {/* Add Quotations Tab - only show if there are quotations */}
                                    {quotationsCount > 0 && (
                                        <TabsTrigger
                                            value="quotations"
                                            className="text- border-none"
                                        >
                                            <FaFileInvoiceDollar className="mr-2 h-4 w-4" />
                                            Quotations ({quotationsCount})
                                        </TabsTrigger>
                                    )}
                                </TabsList>
                            </CardHeader>
                            <CardContent className="p-6">
                                <TabsContent value="timeline" className="m-0 mt-6">
                                    <LeadTimeline leadId={leadId || ''} />
                                </TabsContent>
                                <TabsContent value="stages" className="m-0 mt-6">
                                    <LeadTimeline leadId={leadId || ''} onlyStages />
                                </TabsContent>
                                <TabsContent value="followups" className="m-0 mt-6">
                                    <FollowupSection leadId={leadId || ''} />
                                </TabsContent>
                                <TabsContent value="notes" className="m-0 mt-6">
                                    <NotesSection leadId={leadId || ''} />
                                </TabsContent>
                                <TabsContent value="emails" className="m-0 mt-6">
                                    <EmailsTab leadId={leadId || ''} />
                                </TabsContent>
                                {/* Add Quotations Tab Content */}
                                <TabsContent value="quotations" className="m-0 mt-6">
                                    <QuotationsTab leadId={leadId || ''} />
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>
            </div>

         
        </div>
    );
}