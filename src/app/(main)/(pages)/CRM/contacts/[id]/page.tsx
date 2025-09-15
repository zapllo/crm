"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash, ArrowLeft, Loader2, Search, Edit2, Edit, PlusCircle, User, Mail, Phone, MapPin, Calendar, ExternalLink, Tag, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import EditContact from "@/components/modals/contacts/editContact";
import ManageContactTagsModal from "@/components/modals/contactTags/manageContactTags";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import CallHistory from "@/components/call/call-history";
import PhoneDialer from "@/components/call/phone-dialer";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
interface IContact {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    whatsappNumber: string;
    company?: {
        _id: string;
        companyName: string;
    };
    country: string;
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
    dateOfBirth?: string;
    dateOfAnniversary?: string;
    tags?: Array<{
        _id: string;
        name: string;
        color: string;
    }>;
    customFieldValues?: Array<{
        definition: {
            _id: string;
            name: string;
            fieldType: string;
            // ...
        };
        value: any;
    }>;
}

interface ILead {
    _id: string;
    title: string;
    contact: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    amount: number;
    stage: string;
    createdAt: string;
    updatedAt: string;
    closeDate: string;
    // etc. – fields from your lead model
}

export default function ContactDetailsPage() {
    const { id } = useParams(); // The contactId from route
    const router = useRouter();

    const [contact, setContact] = useState<IContact | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Tag management
    const [showTagModal, setShowTagModal] = useState(false);

    // For delete confirm
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // LEADS for this contact
    const [leads, setLeads] = useState<ILead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<ILead[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCallDialog, setShowCallDialog] = useState(false);
    const { isLoading: permissionsLoading, isInitialized } = usePermissions();

    useEffect(() => {
        if (id) {
            fetchContact();
            fetchLeadsForContact();
        }
    }, [id]);

    // Fetch contact details from /api/contacts/[id]
    async function fetchContact() {
        try {
            const res = await axios.get(`/api/contacts/${id}`);
            setContact(res.data);
        } catch (error) {
            console.error("Error fetching contact:", error);
        } finally {
            setLoading(false);
        }
    }

    // Fetch leads associated with this contact
    async function fetchLeadsForContact() {
        try {
            // Suppose we pass contactId as a query param
            // (You can adjust the actual route as needed.)
            const res = await axios.get<ILead[]>(`/api/leads/contacts?contact=${id}`);
            setLeads(res.data);
            setFilteredLeads(res.data); // default
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    }

    // Filter leads by searchTerm
    useEffect(() => {
        const filtered = leads.filter((lead) =>
            lead.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredLeads(filtered);
    }, [searchTerm, leads]);

    async function handleDelete() {
        try {
            await axios.delete(`/api/contacts/${id}`);
            router.push("/CRM/contacts"); // after delete
        } catch (error) {
            console.error("Error deleting contact:", error);
        }
    }
    // Add permission check before rendering content
    if (permissionsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading permissions...</p>
                </div>
            </div>
        );
    }

    // Check for view permission after permissions are loaded
    if (isInitialized && !canView("Contacts")) {
        return (
            <NoPermissionFallback
                title="No Access to Contact Details"
                description="You don't have permission to view contact details."
            />
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading contact information...</p>
                </div>
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Contact Not Found</h3>
                <p className="text-muted-foreground mb-6">The contact you're looking for doesn't exist or may have been deleted.</p>
                <Button onClick={() => router.push("/CRM/contacts")}>
                    Return to Contacts
                </Button>
            </div>
        );
    }

    // Extract initials for avatar
    const getInitials = () => {
        return `${contact.firstName?.charAt(0) || ''}${contact.lastName?.charAt(0) || ''}`.toUpperCase();
    };


    return (
        <div className="px-6 mx-auto py-6 space-y-8">
            {/* Header / Navigation */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/CRM/contacts")}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {contact.firstName} {contact.lastName}
                        </h1>
                        <p className="text-muted-foreground">
                            {contact.company?.companyName && `@${contact.company.companyName}`}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowCallDialog(true)}
                        className="gap-2"
                    >
                        <Phone className="h-4 w-4" />
                        Call
                    </Button>
                    {canEdit("Contacts") ? (
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(true)}
                            className="gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Button>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="gap-2 opacity-50 cursor-not-allowed"

                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>You don't have permission to edit contacts</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {canDelete("Contacts") && (
                        <AlertDialog
                            open={showDeleteDialog}
                            onOpenChange={setShowDeleteDialog}
                        >
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                    <Trash className="h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this contact? This action
                                        cannot be undone and will remove all associated data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full max-w-lg gap-4 bg-accent grid-cols-4">
                    <TabsTrigger className="border-none" value="overview">Overview</TabsTrigger>
                    <TabsTrigger className="border-none" value="leads">Leads</TabsTrigger>
                    <TabsTrigger className="border-none" value="calls">Calls</TabsTrigger>
                    <TabsTrigger className="border-none" value="custom">Custom Fields</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Contact Profile Card */}
                        <Card className="md:col-span-1">
                            <CardHeader className="pb-2 flex flex-row items-start space-y-0">
                                <div className="flex flex-col items-center justify-center w-full">
                                    <Avatar className="h-24 w-24 mb-2">
                                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <h2 className="text-xl font-semibold">
                                            {contact.firstName} {contact.lastName}
                                        </h2>
                                        {contact.company?.companyName && (
                                            <p className="text-sm text-muted-foreground">
                                                {contact.company.companyName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Separator className="my-4" />
                                <div className="space-y-4">
                                    {contact.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                                                {contact.email}
                                            </a>
                                        </div>
                                    )}
                                    {contact.whatsappNumber && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a href={`tel:${contact.whatsappNumber}`} className="text-sm hover:underline">
                                                {contact.whatsappNumber}
                                            </a>
                                        </div>
                                    )}
                                    {(contact.address || contact.city || contact.state) && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="text-sm">
                                                {contact.address && <p>{contact.address}</p>}
                                                {(contact.city || contact.state) && (
                                                    <p>
                                                        {contact.city}{contact.city && contact.state && ", "}
                                                        {contact.state} {contact.pincode}
                                                    </p>
                                                )}
                                                {contact.country && <p>{contact.country}</p>}
                                            </div>
                                        </div>
                                    )}
                                    {(contact.dateOfBirth || contact.dateOfAnniversary) && (
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="text-sm">
                                                {contact.dateOfBirth && (
                                                    <p><span className="text-muted-foreground">Birthday:</span> {new Date(contact.dateOfBirth)?.toLocaleDateString()}</p>
                                                )}
                                                {contact.dateOfAnniversary && (
                                                    <p><span className="text-muted-foreground">Anniversary:</span> {new Date(contact.dateOfAnniversary)?.toLocaleDateString()}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-4" />

                                {/* Tags Section */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium flex items-center gap-2">
                                            <Tag className="h-4 w-4" /> Tags
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2"
                                            onClick={() => setShowTagModal(true)}
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    {contact.tags && contact.tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {contact.tags.map((tag) => (
                                                <Badge
                                                    key={tag._id}
                                                    style={{
                                                        backgroundColor: tag.color || "#ccc",
                                                        color: "#fff"
                                                    }}
                                                    className="px-2.5 py-0.5 text-xs rounded-md"
                                                >
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-muted-foreground"
                                            onClick={() => setShowTagModal(true)}
                                        >
                                            <PlusCircle className="mr-2 h-3.5 w-3.5" />
                                            Add Tags
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity/Summary Section */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Contact Summary</CardTitle>
                                <CardDescription>
                                    Overview of activity and interactions with {contact.firstName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Leads</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{leads.length}</div>
                                            <p className="text-xs text-muted-foreground">Total associated leads</p>
                                        </CardContent>
                                        {/* <CardFooter className="pt-0">
                                            <Button
                                                variant="ghost"
                                                className="h-8 p-0 text-blue-500"
                                                onClick={() => set}
                                            >
                                                View Details
                                                <ExternalLink className="ml-1 h-3 w-3" />
                                            </Button>
                                        </CardFooter> */}
                                    </Card>

                                    {/* You can add more summary cards here */}
                                    {/* <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Last Contacted</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm font-medium">2 days ago</div>
                                            <p className="text-xs text-muted-foreground">Via email</p>
                                        </CardContent>
                                    </Card> */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="leads" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Leads</CardTitle>
                                    <CardDescription>
                                        Manage leads associated with {contact.firstName} {contact.lastName}
                                    </CardDescription>
                                </div>

                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        placeholder="Search leads..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <ScrollArea className="h-[500px]">
                                {filteredLeads.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="rounded-full bg-muted p-3 mb-3">
                                            <Search className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium">No leads found</h3>
                                        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                                            {searchTerm ?
                                                `No leads matching "${searchTerm}" were found.` :
                                                `There are no leads associated with this contact yet.`}
                                        </p>

                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background">
                                            <TableRow>
                                                <TableHead>Lead</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="text-center">Stage</TableHead>
                                                <TableHead className="text-right">Close Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredLeads.map((lead) => (
                                                <TableRow
                                                    key={lead._id}
                                                    onClick={() => router.push(`/CRM/leads/${lead._id}`)}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{lead.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Created: {new Date(lead.createdAt)?.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        ₹{lead.amount?.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <HoverCard>
                                                            <HoverCardTrigger>
                                                                <Badge
                                                                    className={
                                                                        lead.stage === "Closed Won" ? "bg-green-500" :
                                                                            lead.stage === "Closed Lost" ? "bg-red-500" :
                                                                                lead.stage === "Negotiation" ? "bg-amber-500" :
                                                                                    lead.stage === "Proposal" ? "bg-blue-500" :
                                                                                        undefined
                                                                    }
                                                                >
                                                                    {lead.stage}
                                                                </Badge>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-80">
                                                                <div className="space-y-1">
                                                                    <h4 className="text-sm font-semibold">{lead.stage} Stage</h4>
                                                                    <p className="text-sm">
                                                                        Last updated: {new Date(lead.updatedAt)?.toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {new Date(lead.closeDate)?.toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="calls" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Call History</CardTitle>
                            <CardDescription>
                                Recent calls with {contact.firstName} {contact.lastName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CallHistory contactId={contact._id} />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => setShowCallDialog(true)}
                                className="w-full gap-2">
                                <PhoneCall className="h-4 w-4" />
                                Call {contact.firstName}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="custom" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Custom Fields</CardTitle>
                            <CardDescription>
                                Additional information and attributes for this contact
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contact.customFieldValues && contact.customFieldValues.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {contact.customFieldValues.map((cf) => (
                                        <Card key={cf.definition._id} className="border">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    {cf.definition.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="font-medium">
                                                    {cf.definition.fieldType === 'date'
                                                        ? new Date(cf.value).toLocaleDateString()
                                                        : String(cf.value)}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {cf.definition.fieldType}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="rounded-full bg-muted p-3 mb-3">
                                        <PlusCircle className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium">No custom fields</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                                        You haven't added any custom fields to this contact yet.
                                    </p>
                                    {/* <Button>
                                        Add Custom Field
                                    </Button> */}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <PhoneDialer
                contactId={contact._id}
                contactName={`${contact.firstName} ${contact.lastName}`}
                contactPhone={contact.whatsappNumber}
                contactEmail={contact.email}
                isOpen={showCallDialog}
                setIsOpen={setShowCallDialog}
                onCallComplete={() => {
                    // Refresh call history on call completion
                    // You can add your implementation here
                }}
            />

            {/* Edit Contact Modal */}
            {isEditModalOpen && (
                <EditContact
                    isOpen={isEditModalOpen}
                    setIsOpen={setIsEditModalOpen}
                    contact={contact}
                // onSuccess={fetchContact}
                />
            )}

            {/* Manage Contact Tags Modal */}
            {showTagModal && (
                <ManageContactTagsModal
                    contactId={contact._id}
                    currentTags={contact.tags || []}
                    onClose={() => setShowTagModal(false)}
                    onUpdate={() => {
                        setShowTagModal(false);
                        fetchContact(); // refresh contact data
                    }}
                />
            )}
        </div>
    );
}
