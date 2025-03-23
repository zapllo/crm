"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash, ArrowLeft, Loader2, Search, Edit2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 text-primary h-6 animate-spin" />
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="p-6">
                <p className="text-gray-500">No contact found.</p>
            </div>
        );
    }

    return (
        <div className="p-6 overflow-y-scroll h-screen">
            {/* Header / Navigation */}
            <div className="flex justify-between items-center mb-6">
                {/* Back button */}
                <div
                    onClick={() => router.push("/CRM/contacts")}
                    className="flex items-center cursor-pointer gap-2"
                >
                    <div
                        className="rounded-full h-8 w-8 items-center flex justify-center border
                          hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    >
                        <ArrowLeft />
                    </div>
                    <span>Back to Contacts</span>
                </div>

                {/* Right side: Edit, Delete */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsEditModalOpen(true)}
                        className="gap-2"
                    >
                        <Pencil className="text-blue-400" size={16} />
                        Edit Contact
                    </Button>

                    <AlertDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                    >
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Trash className="text-red-500" size={16} />
                                Delete Contact
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <h3 className="text-lg font-bold">Delete Contact</h3>
                                <p>
                                    Are you sure you want to delete this contact? This action
                                    cannot be undone.
                                </p>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-500 text-white"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* LEFT: Basic Contact Info in a Card */}
                <Card className="min-w-[320px] w-1/3">
                    <CardHeader>
                        <h2 className="text-xl font-bold">Contact Details</h2>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p>
                            <strong>Name:</strong> {contact.firstName} {contact.lastName}
                        </p>
                        <p>
                            <strong>Email:</strong> {contact.email}
                        </p>
                        <p>
                            <strong>WhatsApp:</strong> {contact.whatsappNumber}
                        </p>
                        <p>
                            <strong>Company:</strong> {contact.company?.companyName || ""}
                        </p>
                        <p>
                            <strong>Address:</strong> {contact.address}
                        </p>
                        <p>
                            <strong>City:</strong> {contact.city}
                        </p>
                        <p>
                            <strong>State:</strong> {contact.state}
                        </p>
                        <p>
                            <strong>Pincode:</strong> {contact.pincode}
                        </p>
                        {/* etc. dateOfBirth, dateOfAnniversary, etc. */}
                    </CardContent>
                    {/* CONTACT TAGS SECTION */}
                    <div className="p-6">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Contact Tags</h2>
                                <Button className="text-xs flex items-center gap-1 border-none shadow-none bg-transparent hover:bg-transparent dark:text-white text-black hover:text-blue-500" onClick={() => setShowTagModal(true)}>
                                    <Edit className="h-5 font-thin" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            {contact.tags && contact.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {contact.tags.map((t) => (
                                        <span
                                            key={t._id}
                                            className="px-2 py-1 text-xs rounded-full text-white"
                                            style={{ backgroundColor: t.color || "#ccc" }}
                                        >
                                            {t.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">No tags assigned yet.</p>
                            )}
                        </div>
                    </div>
                    {/* Example: Custom Fields? */}
                    {contact.customFieldValues && contact.customFieldValues.length > 0 && (
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold">Custom Fields</h2>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {contact.customFieldValues.map((cf) => (
                                    <div
                                        key={cf.definition._id}
                                        className="border-b border-gray-700 pb-2"
                                    >
                                        <p>
                                            <strong>{cf.definition.name}:</strong>{" "}
                                            {String(cf.value)}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}


                </Card>

                {/* MIDDLE/RIGHT: Additional Info */}
                <div className="flex-grow space-y-6">


                    {/* LEADS SECTION */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col items-center justify-center mb-2">
                                <h2 className="text-lg font-bold">Leads Related to this Contact</h2>
                                <p className="text-sm italic text-gray-500">
                                    Total leads - {filteredLeads.length}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Optional search for leads */}
                            <div className="flex items-center mb-4">
                                <div className="relative items-center flex">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input
                                        className="pl-10 p-2 text-sm focus:border-primary rounded-lg outline-none bg-transparent border flex items-center"
                                        placeholder="Search Leads..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {filteredLeads.length === 0 ? (
                                <p className="text-gray-400 text-center">
                                    No leads found for this contact.
                                </p>
                            ) : (
                                <div className="rounded overflow-hidden">
                                    <Table className="border">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Stage</TableHead>
                                                <TableHead>Dates</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredLeads.map((lead) => (
                                                <TableRow
                                                    key={lead._id}
                                                    onClick={() => router.push(`/CRM/leads/${lead._id}`)}
                                                    className="border-b cursor-pointer  "
                                                >
                                                    <TableCell className="font-semibold">
                                                        {lead.title}
                                                    </TableCell>
                                                    <TableCell>₹{lead.amount.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Badge>{lead.stage}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        Created:{" "}
                                                        {new Date(lead.createdAt).toLocaleDateString()}
                                                        <br />
                                                        Updated:{" "}
                                                        {new Date(lead.updatedAt).toLocaleDateString()}
                                                        <br />
                                                        Close Date:{" "}
                                                        {new Date(lead.closeDate).toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Contact Modal */}
            {
                isEditModalOpen && (
                    <EditContact
                        isOpen={isEditModalOpen}
                        setIsOpen={setIsEditModalOpen}
                        contact={contact}
                    />
                )
            }

            {/* Manage Contact Tags Modal */}
            {
                showTagModal && (
                    <ManageContactTagsModal
                        contactId={contact._id}
                        currentTags={contact.tags || []}
                        onClose={() => setShowTagModal(false)}
                        onUpdate={() => {
                            setShowTagModal(false);
                            fetchContact(); // refresh contact data
                        }}
                    />
                )
            }
        </div >
    );
}
