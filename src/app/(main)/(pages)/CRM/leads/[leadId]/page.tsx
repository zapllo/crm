'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaUser, FaClipboardList, FaProjectDiagram, FaLayerGroup, FaUserTie, FaGlobe, FaCalendar, FaRupeeSign, FaFileAlt, FaEnvelope, FaPhone, FaBox, FaBuilding, FaFlag, FaLocationArrow, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaTasks, FaUserCheck, FaStickyNote } from "react-icons/fa";

import LeadTimeline from '@/components/leads/timeline';
import FollowupSection from '@/components/leads/followups';
import NotesSection from '@/components/leads/notes';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Loader2, Move, Replace } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IconReplace } from '@tabler/icons-react';
import MoveLeadDialog from '@/components/modals/leads/moveLeads';
import AddNoteDialog from '@/components/modals/leads/addNotes';
import AddFollowupDialog from '@/components/modals/followups/AddFollowup';
import { useRouter, useSearchParams } from 'next/navigation';
import EmailsTab from '@/components/leads/email';

/* ----------- TYPES ----------- */
interface LeadDetailsType {
    leadId: string;
    title: string;
    pipeline: {
        id: string;
        name: string;
        openStages: string[];
        closeStages: string[];
    };
    stage: string;
    assignedTo: {
        id: string;
        name: string;
        email: string;
    } | null;
    source: string;
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
    createdAt: Date;
    updatedAt: Date;
}

export default function LeadDetails({ params }: { params: { leadId: string } }) {
    const { leadId } = params;
    const searchParams = useSearchParams();
    const [leadDetails, setLeadDetails] = useState<LeadDetailsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

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


    // Fetch Lead Details
    useEffect(() => {
        fetchLeadDetails();
    }, [leadId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-1/2">
                <Loader2 className="w-6 text-primary h-6 animate-spin" />
            </div>
        );
    }

    if (!leadDetails) {
        return <p>Lead not found.</p>;
    }
    console.log(leadDetails, 'ok')
    return (
        <div className="p-6 space-y-6 overflow-y-scroll h-screen">
            {/* ---- HEADER ---- */}
            <div className="flex justify-between items-center">
                {/* <h1 className="text-xl font-semibold">Lead Details</h1> */}
                <div onClick={() => router.push('/CRM/leads')} className='rounded-full h-8 w-8 items-center flex  justify-center border cursor-pointer hover:bg-white hover:text-black'>
                    <ArrowLeft />
                </div>
                <div className="flex gap-2">
                    <MoveLeadDialog leadId={leadId} currentStage={leadDetails.stage} onLeadMoved={() => fetchLeadDetails()} />
                    <AddNoteDialog leadId={leadId} onNoteAdded={() => fetchLeadDetails()} />
                    <AddFollowupDialog leadId={leadId} onFollowupAdded={() => fetchLeadDetails()} />
                </div>
            </div>

            <div className="grid grid-cols-12  gap-6">
                {/* ---- LEFT PANEL ---- */}
                <Card className="col-span-4 mb-12 p-6 fade-in-bottom bg-card shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-white">Lead Details</h3>
                    <div className="space-y-2 text-sm text-white -foreground">

                        {/* Lead ID */}
                        <div className="flex items-center gap-2">
                            {/* <FaClipboardList className="text-" /> */}
                            <Badge className="bg-primary text-primary-foreground">{leadDetails.leadId}</Badge>
                            <p className='text-white text-lg'> {leadDetails.title}</p>

                        </div>

                        {/* Title */}
                        <div className="flex items-center gap-2">
                        </div>

                        {/* Pipeline */}
                        <div className="flex items-center gap-2">
                            <FaLayerGroup className="text-" />
                            <p className='text-white'><strong>Pipeline:</strong> {leadDetails.pipeline.name}</p>
                        </div>

                        {/* Stage */}
                        <div className="flex items-center gap-2">
                            <FaLayerGroup className="text-" />
                            <p className='text-white'><strong>Stage:</strong>
                            </p>
                            <h1 className='border px-2 border-primary bg-secondary rounded-md'>
                                {leadDetails.stage}
                            </h1>
                        </div>

                        {/* Assigned To */}
                        <div className="flex items-center gap-2 -ml-1">
                            <Avatar className='h-5 w-5'>
                                <AvatarFallback> {`${leadDetails.assignedTo?.name || 'Unassigned'}`.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <p className='text-white'><strong></strong>{leadDetails.assignedTo?.name || 'Unassigned'}

                            </p>
                        </div>

                        {/* Source */}
                        <div className="flex items-center gap-2">
                            <FaGlobe className="text-" />
                            <p><strong>Source:</strong> {leadDetails.source}</p>
                        </div>

                        {/* Closing Date */}
                        <div className="flex items-center gap-2">
                            <FaCalendar className="text-" />
                            <p><strong>Closing Date:</strong> {leadDetails.closingDate ? format(new Date(leadDetails.closingDate), "dd MMM yyyy") : "N/A"}</p>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center gap-2">
                            <FaRupeeSign className="text-" />
                            <p><strong>Amount:</strong> ₹{leadDetails.amount}</p>
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-2">
                            <FaFileAlt className="text- mt-1" />
                            <p><strong>Description:</strong> {leadDetails.description}</p>
                        </div>
                    </div>

                    {/* ---- CONTACT DETAILS ---- */}
                    {leadDetails.contact && (
                        <>
                            <h3 className="text-lg font-semibold mt-6 mb-4 text-white">Contact Details</h3>
                            <div className="text-sm space-y-2 text-white -foreground">
                                <div className="flex items-center gap-2">
                                    <FaUser className="text-primary" />
                                    <p><strong>Name:</strong> {leadDetails.contact.name}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-primary" />
                                    <p><strong>Email:</strong> {leadDetails.contact.email}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaPhoneAlt className="text-primary" />
                                    <p><strong>Phone:</strong> {leadDetails.contact.phone}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ---- COMPANY DETAILS ---- */}
                    {leadDetails.contact?.company && (
                        <>
                            <h3 className="text-lg font-semibold mt-6 mb-4 text-white">Company Details</h3>
                            <div className="text-sm space-y-2 text-white">
                                <div className="flex items-center gap-2">
                                    <FaBuilding className="text-primary" />
                                    <p><strong>Company:</strong> {leadDetails.contact.company.name}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaFlag className="text-primary" />
                                    <p><strong>Country:</strong> {leadDetails.contact.company.country}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaLocationArrow className="text-primary" />
                                    <p><strong>State/City:</strong> {leadDetails.contact.company.state}, {leadDetails.contact.company.city}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-primary" />
                                    <p><strong>Address:</strong> {leadDetails.contact.company.address}</p>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="space-y-2 text-sm mt-6 text-muted-foreground -foreground">

                        <h1>Lead Created At: <span className='text-white'> {formatDistanceToNow(new Date(leadDetails.createdAt), { addSuffix: true })}</span></h1>
                        <h1>Lead Updated At: <span className='text-white'> {formatDistanceToNow(new Date(leadDetails.updatedAt), { addSuffix: true })}</span></h1>
                    </div>
                </Card>

                {/* ---- RIGHT PANEL ---- */}
                <Card className="col-span-8 mb-12 fade-in-bottom2  p-6 bg-card shadow-md">
                    <Tabs defaultValue={defaultTab} className=''>
                        <TabsList className=" w-full border-b rounded-none  flex space-x-4">
                            <TabsTrigger value="timeline" className='items-center'>
                                <FaClock className="mr-2 text-primary" />
                                Timeline
                            </TabsTrigger>
                            <TabsTrigger value="stages" className='items-center'>
                                <FaTasks className="mr-2 text-primary" />
                                Stages Timeline
                            </TabsTrigger>
                            <TabsTrigger value="followups" className='items-center'>
                                <FaUserCheck className="mr-2 text-primary" />
                                Follow-ups
                            </TabsTrigger>
                            <TabsTrigger value="emails">
                                <FaEnvelope className="mr-2 text-primary" />
                                Emails
                            </TabsTrigger>

                            <TabsTrigger value="notes" className='items-center'>
                                <FaStickyNote className="mr-2 text-primary" />
                                Notes
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline">
                            <LeadTimeline leadId={leadId} />
                        </TabsContent>

                        <TabsContent value="stages">
                            <LeadTimeline leadId={leadId} onlyStages />
                        </TabsContent>

                        <TabsContent value="followups">
                            <FollowupSection leadId={leadId} />
                        </TabsContent>

                        <TabsContent value="notes">
                            <NotesSection leadId={leadId} />
                        </TabsContent>
                        <TabsContent value="emails">
                            <EmailsTab leadId={leadId} />
                        </TabsContent>

                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
