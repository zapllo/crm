"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash, Download, Loader2, Search, UserCircle, Building, Phone } from "lucide-react";
import AddContact from "@/components/modals/contacts/addContact";
import EditContact from "@/components/modals/contacts/editContact";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";


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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const router = useRouter();
  const { isLoading: permissionsLoading, isInitialized } = usePermissions();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get<IContact[]>("/api/contacts");
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete("/api/contacts", { data: { id: confirmDelete } });
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
    setConfirmDelete(null);
  };

  const handleExportCSV = () => {
    const csvData = [
      ["First Name", "Last Name", "Email", "Mobile", "Company"],
      ...contacts.map(({ firstName, lastName, email, whatsappNumber, company }) => [
        firstName,
        lastName,
        email,
        whatsappNumber,
        company?.companyName || "",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvData.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const sortedFilteredContacts = contacts
    .filter(({ firstName, lastName, email }) =>
      [firstName, lastName, email].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      const aValue = String(a[sortField as keyof IContact] || '');
      const bValue = String(b[sortField as keyof IContact] || '');
      return aValue.localeCompare(bValue);
    });

  if (permissionsLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="text-sm text-muted-foreground">Loading permissions...</span>
        </div>
      </div>
    );
  }

  // Check for view permission after permissions are loaded
  if (isInitialized && !canView("Contacts")) {
    return (
      <NoPermissionFallback
        title="No Access to Contacts"
        description="You don't have permission to view the contacts page."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="text-sm text-muted-foreground">Loading contacts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Card className="border-none shadow-sm  backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-bold">Contacts</CardTitle>
            <div className="flex flex-wrap gap-2">
              {canAdd("Contacts") && (
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white gap-1">
                  <Plus size={16} /> Add Contact
                </Button>
              )}
              <Button onClick={handleExportCSV} variant="outline" className="gap-1">
                <Download size={16} /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 "
              />
            </div>
            <Select onValueChange={setSortField} defaultValue="firstName">
              <SelectTrigger className="w-[180px] ">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="firstName">First Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsappNumber">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border overflow-hidden ">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-medium">Contact</TableHead>
                  <TableHead className="font-medium">Mobile</TableHead>
                  <TableHead className="font-medium">Company</TableHead>
                  <TableHead className="font-medium w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFilteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No contacts found. Add some contacts to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedFilteredContacts.map((contact) => (
                    <TableRow
                      key={contact._id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => router.push(`/CRM/contacts/${contact._id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 bg-primary/10 text-primary">
                            <AvatarFallback>
                              {getInitials(contact.firstName, contact.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {contact.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.whatsappNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.company ? (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{contact.company.companyName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-sm">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {canEdit("Contacts") && (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                setSelectedContact(contact);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-red-100">
                                <AlertDialogHeader>
                                  <h3 className="text-lg font-semibold">Delete Contact</h3>
                                  <p className="text-muted-foreground">
                                    Are you sure you want to delete <span className="font-medium">{contact.firstName} {contact.lastName}</span>?
                                    This action cannot be undone.
                                  </p>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setConfirmDelete(contact._id);
                                      handleDelete();
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {sortedFilteredContacts.length > 0 && (
            <div className="flex justify-between items-center mt-4 px-2 text-sm text-muted-foreground">
              <span>Showing {sortedFilteredContacts.length} of {contacts.length} contacts</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Contact Dialog */}
      <AddContact isOpen={isModalOpen}    onContactCreated={fetchContacts}  setIsOpen={setIsModalOpen} />

      {/* Edit Contact Dialog */}
      <EditContact isOpen={isEditModalOpen}   onContactUpdated={fetchContacts} setIsOpen={setIsEditModalOpen} contact={selectedContact} />
    </div >
  );
}