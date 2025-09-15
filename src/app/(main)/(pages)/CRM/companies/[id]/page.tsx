"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
    Pencil,
    Trash,
    ArrowLeft,
    Loader2,
    Search,
    Building2,
    MapPin,
    Globe,
    FileText,
    Phone,
    Mail,
    Tag,
    Users,
    CircleUser,
    ExternalLink,
    CalendarDays,
    MoreHorizontal,
    ChevronRight,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
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
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import EditCompany from "@/components/modals/companies/EditCompany";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
interface ICompany {
    _id: string;
    companyName: string;
    taxNo: string;
    companyCode: string;
    country: string;
    shippingAddress: string;
    billingAddress: string;
    state: string;
    city: string;
    website: string;
    pincode: string;
}

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
        };
        value: any;
    }>;
}

export default function CompanyDetailsPage() {
    const { id } = useParams(); // The companyId from route
    const router = useRouter();

    const [company, setCompany] = useState<ICompany | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    // For delete confirm
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // LEADS for this company
    const [contacts, setContacts] = useState<IContact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<IContact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { isLoading: permissionsLoading, isInitialized } = usePermissions();

    useEffect(() => {
        if (id) {
            fetchCompany();
            fetchLeadsForCompany();
        }
    }, [id]);

    // Fetch company details from /api/companies/[id]
    async function fetchCompany() {
        try {
            const res = await axios.get(`/api/companies/${id}`);
            setCompany(res.data);
        } catch (error) {
            console.error("Error fetching company:", error);
        } finally {
            setLoading(false);
        }
    }

    // Fetch leads associated with this company
    async function fetchLeadsForCompany() {
        try {
            const res = await axios.get<IContact[]>(`/api/contacts/companies?company=${id}`);
            setContacts(res.data);
            setFilteredContacts(res.data); // default
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    }

    // Filter leads by searchTerm
    useEffect(() => {
        const filtered = contacts.filter((contact) =>
            `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.whatsappNumber?.includes(searchTerm) ||
            contact.country?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredContacts(filtered);
    }, [searchTerm, contacts]);

    async function handleDelete() {
        try {
            await axios.delete(`/api/companies/${id}`);
            router.push("/CRM/companies"); // after delete
        } catch (error) {
            console.error("Error deleting company:", error);
        }
    }

    function getCompanyInitials(name: string) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    // Check permissions before rendering content
    if (permissionsLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <h3 className="text-lg font-medium">Loading permissions...</h3>
                    <p className="text-muted-foreground">Please wait while we verify your access</p>
                </div>
            </div>
        );
    }

    // Check for view permission after permissions are loaded
    if (isInitialized && !canView("Companies")) {
        return (
            <NoPermissionFallback
                title="No Access to Company Details"
                description="You don't have permission to view company details."
            />
        );
    }
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <h3 className="text-lg font-medium">Loading company details</h3>
                    <p className="text-muted-foreground">Please wait while we fetch the company information</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className=" mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <Building2 className="h-16 w-16 text-muted-foreground/60 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Company Not Found</h2>
                    <p className="text-muted-foreground mb-6">The company you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => router.push("/CRM/companies")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className=" mx-auto px-4 py-6 max-w-7xl">
            {/* Header / Navigation */}
            <div className="mb-8">
                <div className="flex items-center mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/CRM/companies")}
                        className="gap-1 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" /> Companies
                    </Button>
                    {/* <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                    <span className="text-sm font-medium truncate">{company.companyName}</span> */}
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                            {getCompanyInitials(company.companyName)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{company.companyName}</h1>
                            <div className="flex items-center gap-4 mt-1">
                                <Badge variant="outline" className="font-normal">
                                    {company.companyCode}
                                </Badge>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {[company.city, company.state, company.country].filter(Boolean).join(", ")}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {canEdit("Companies") ? (
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
                                            disabled
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You don't have permission to edit companies</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canEdit("Companies") && (
                                    <DropdownMenuItem
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="cursor-pointer"
                                    >
                                        <Pencil className="h-4 w-4 mr-2" /> Edit Details
                                    </DropdownMenuItem>
                                )}
                                {company.website && (
                                    <DropdownMenuItem
                                        onClick={() => window.open(`https://${company.website.replace(/^https?:\/\//, '')}`, '_blank')}
                                        className="cursor-pointer"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" /> Visit Website
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {canDelete("Companies") && (
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="text-destructive cursor-pointer"
                                    >
                                        <Trash className="h-4 w-4 mr-2" /> Delete Company
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Tabs for company information */}
            <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
                <TabsList className="mb-4 gap-4 bg-accent">
                    <TabsTrigger className="border-none" value="overview">Overview</TabsTrigger>
                    <TabsTrigger className="border-none" value="contacts">
                        Contacts {contacts.length > 0 && `(${contacts.length})`}
                    </TabsTrigger>
                    <TabsTrigger className="border-none" value="addresses">Addresses</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Company Info Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                                    Company Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-3">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Company Name</div>
                                    <div className="font-medium">{company.companyName}</div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Tax Number</div>
                                        <div className="font-medium">{company.taxNo || "—"}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Company Code</div>
                                        <div className="font-medium">{company.companyCode || "—"}</div>
                                    </div>
                                </div>
                                {company.website && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Website</div>
                                            <a
                                                href={`https://${company.website.replace(/^https?:\/\//, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary hover:underline flex items-center"
                                            >
                                                {company.website}
                                                <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Location Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                                    Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-3">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Country</div>
                                    <div className="font-medium">{company.country || "—"}</div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">State/Province</div>
                                        <div className="font-medium">{company.state || "—"}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">City</div>
                                        <div className="font-medium">{company.city || "—"}</div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Postal Code</div>
                                    <div className="font-medium">{company.pincode || "—"}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contacts Summary Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-primary" />
                                    Contact Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3">
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                                        <Users className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-1">{contacts.length}</h3>
                                    <p className="text-muted-foreground mb-4">Total Contacts</p>

                                    {/* <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveTab("contacts")}
                                        className="w-full"
                                    >
                                        View All Contacts
                                    </Button> */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Contacts Section */}
                    {contacts.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Recent Contacts</CardTitle>
                                    
                                </div>
                                <CardDescription>
                                    The most recent contacts associated with {company.companyName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {contacts.slice(0, 3).map((contact) => (
                                        <div key={contact._id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {contact.firstName[0]}{contact.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {contact.firstName} {contact.lastName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {contact.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                                onClick={() => {
                                                    // Navigate to contact detail view
                                                    // Assuming route exists: /CRM/contacts/[id]
                                                    router.push(`/CRM/contacts/${contact._id}`);
                                                }}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Contacts Tab */}
                <TabsContent value="contacts">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Contacts</CardTitle>
                                    <CardDescription>
                                        All contacts associated with {company.companyName}
                                    </CardDescription>
                                </div>

                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search contacts by name, email, or phone..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {filteredContacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <CircleUser className="h-12 w-12 text-muted-foreground/60 mb-4" />
                                    <h3 className="text-lg font-medium">No contacts found</h3>
                                    <p className="text-muted-foreground mt-1 max-w-md">
                                        {searchTerm ?
                                            "Try adjusting your search term or filters." :
                                            "This company doesn't have any contacts yet."}
                                    </p>
                                    {!searchTerm && (
                                        <Button
                                            onClick={() => {
                                                router.push(`/CRM/contacts/add?company=${company._id}`);
                                            }}
                                            className="mt-6"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Contact
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>WhatsApp</TableHead>
                                                <TableHead>Location</TableHead>
                                                {/* <TableHead className="text-right">Actions</TableHead> */}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredContacts.map((contact) => (
                                                <TableRow
                                                    key={contact._id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => router.push(`/CRM/contacts/${contact._id}`)}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                    {contact.firstName[0]}{contact.lastName[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="font-medium">
                                                                {contact.firstName} {contact.lastName}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span>{contact.email || "—"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {contact.whatsappNumber ? (
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span>{contact.whatsappNumber}</span>
                                                            </div>
                                                        ) : "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {contact.country ? (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span>{[contact.city, contact.country].filter(Boolean).join(", ")}</span>
                                                            </div>
                                                        ) : "—"}
                                                    </TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Addresses Tab */}
                <TabsContent value="addresses">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Shipping Address Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-lg">
                                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {company.shippingAddress ? (
                                    <div className="space-y-2">
                                        <p className="font-medium">{company.companyName}</p>
                                        <p className="text-muted-foreground whitespace-pre-line">{company.shippingAddress}</p>
                                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                            {[company.city, company.state, company.country, company.pincode].filter(Boolean).join(", ")}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <MapPin className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                        <p className="text-muted-foreground">No shipping address provided</p>
                                        <Button
                                            variant="link"
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="mt-2"
                                        >
                                            Add Shipping Address
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-0">
                                {company.shippingAddress && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            // Copy address to clipboard
                                            const address = `${company.companyName}\n${company.shippingAddress}\n${[company.city, company.state, company.country, company.pincode].filter(Boolean).join(", ")}`;
                                            navigator.clipboard.writeText(address);
                                            // You could add a toast notification here
                                        }}
                                    >
                                        <FileText className="mr-2 h-4 w-4" /> Copy Address
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>

                        {/* Billing Address Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-lg">
                                    <FileText className="mr-2 h-5 w-5 text-primary" />
                                    Billing Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {company.billingAddress ? (
                                    <div className="space-y-2">
                                        <p className="font-medium">{company.companyName}</p>
                                        <p className="text-muted-foreground whitespace-pre-line">{company.billingAddress}</p>
                                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                            {[company.city, company.state, company.country, company.pincode].filter(Boolean).join(", ")}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <FileText className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                        <p className="text-muted-foreground">No billing address provided</p>
                                        <Button
                                            variant="link"
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="mt-2"
                                        >
                                            Add Billing Address
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-0">
                                {company.billingAddress && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            // Copy address to clipboard
                                            const address = `${company.companyName}\n${company.billingAddress}\n${[company.city, company.state, company.country, company.pincode].filter(Boolean).join(", ")}`;
                                            navigator.clipboard.writeText(address);
                                            // You could add a toast notification here
                                        }}
                                    >
                                        <FileText className="mr-2 h-4 w-4" /> Copy Address
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Delete Company Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {company.companyName}</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the company
                            and remove all associated data from our servers.
                            {contacts.length > 0 && (
                                <div className="mt-2 p-3 bg-destructive/10 rounded-md text-destructive">
                                    <strong>Warning:</strong> This company has {contacts.length} associated contacts.
                                    Deleting it may affect those records.
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Company
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Company Modal */}
            {isEditModalOpen && (
                <EditCompany
                    isOpen={isEditModalOpen}
                    setIsOpen={setIsEditModalOpen}
                    company={company}
                    onCompanyUpdated={fetchCompany}
                />
            )}
        </div>
    );
}
