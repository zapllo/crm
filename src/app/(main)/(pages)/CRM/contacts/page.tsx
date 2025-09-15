"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Plus, 
  Pencil, 
  Trash, 
  Download, 
  Loader2, 
  Search, 
  UserCircle, 
  Building, 
  Phone, 
  Filter,
  CalendarDays,
  Users,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  X,
  Calendar as CalendarIcon
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";
import { format, isAfter, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

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
  createdAt: string;
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

type SortField = 'firstName' | 'lastName' | 'email' | 'whatsappNumber' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  
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
      ["First Name", "Last Name", "Email", "Mobile", "Company", "Created At"],
      ...filteredAndSortedContacts.map(({ firstName, lastName, email, whatsappNumber, company, createdAt }) => [
        firstName,
        lastName,
        email,
        whatsappNumber,
        company?.companyName || "",
        format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss'),
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvData.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contacts-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearDateRange = () => {
    setDateRange(undefined);
  };

  const filteredAndSortedContacts = contacts
    .filter(({ firstName, lastName, email, whatsappNumber, company, createdAt }) => {
      // Text search filter
      const matchesSearch = [firstName, lastName, email, whatsappNumber, company?.companyName || '']
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;

      // Date range filter
      if (dateRange?.from || dateRange?.to) {
        const contactDate = new Date(createdAt);
        contactDate.setHours(0, 0, 0, 0);
        
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (isBefore(contactDate, fromDate)) return false;
        }
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (isAfter(contactDate, toDate)) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = String(a[sortField] || '').toLowerCase();
          bValue = String(b[sortField] || '').toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const hasActiveFilters = searchTerm || dateRange?.from || dateRange?.to;
  const totalContacts = contacts.length;
  const filteredCount = filteredAndSortedContacts.length;

  if (permissionsLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="text-sm text-muted-foreground">Loading permissions...</span>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="text-sm text-muted-foreground">Loading contacts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 px-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your customer relationships and communications
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canAdd("Contacts") && (
              <Button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-primary hover:bg-primary/90 text-white gap-2 px-4"
              >
                <Plus size={16} />
                Add Contact
              </Button>
            )}
            <Button onClick={handleExportCSV} variant="outline" className="gap-2 px-4">
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Contacts</p>
                  <p className="text-2xl font-bold">{totalContacts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filtered Results</p>
                  <p className="text-2xl font-bold">{filteredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">With Companies</p>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.company).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-none shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Search and Filter Section */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-gray-800/80"
                />
              </div>

              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-white/80 dark:bg-gray-800/80 min-w-[240px]",
                      !dateRange?.from && "text-muted-foreground",
                      (dateRange?.from || dateRange?.to) && "border-primary text-primary"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Filter by creation date"
                    )}
                    {(dateRange?.from || dateRange?.to) && (
                      <Badge variant="secondary" className="ml-auto">
                        1
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <h4 className="font-medium text-sm">Filter by creation date</h4>
                  </div>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="p-3"
                  />
                  {(dateRange?.from || dateRange?.to) && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearDateRange}
                        className="w-full gap-1"
                      >
                        <X size={14} />
                        Clear date range
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden bg-white dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableHead className="font-semibold">
                    <Button 
                      variant="ghost" 
                      className="p-0 font-semibold text-left justify-start hover:bg-transparent"
                      onClick={() => handleSort('firstName')}
                    >
                      Contact
                      {sortField === 'firstName' && (
                        sortDirection === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button 
                      variant="ghost" 
                      className="p-0 font-semibold text-left justify-start hover:bg-transparent"
                      onClick={() => handleSort('whatsappNumber')}
                    >
                      Mobile
                      {sortField === 'whatsappNumber' && (
                        sortDirection === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">
                    <Button 
                      variant="ghost" 
                      className="p-0 font-semibold text-left justify-start hover:bg-transparent"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created At
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Users className="h-12 w-12 opacity-50" />
                        <div>
                          <p className="font-medium">No contacts found</p>
                          <p className="text-sm">
                            {hasActiveFilters 
                              ? "Try adjusting your search or date range" 
                              : "Add your first contact to get started"
                            }
                          </p>
                        </div>
                        {canAdd("Contacts") && !hasActiveFilters && (
                          <Button onClick={() => setIsModalOpen(true)} className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Contact
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedContacts.map((contact) => (
                    <TableRow
                      key={contact._id}
                      className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => router.push(`/CRM/contacts/${contact._id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 text-primary border-2 border-primary/20">
                            <AvatarFallback className="font-semibold">
                              {getInitials(contact.firstName, contact.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {contact.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{contact.whatsappNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.company ? (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{contact.company.companyName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-sm">No company</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(contact.createdAt), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/CRM/contacts/${contact._id}`)}
                              >
                                <UserCircle className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {canEdit("Contacts") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedContact(contact);
                                      setIsEditModalOpen(true);
                                    }}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Contact
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem 
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete Contact
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
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
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer with pagination info */}
          {filteredAndSortedContacts.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{filteredCount}</span> of{" "}
                <span className="font-medium">{totalContacts}</span> contacts
                {hasActiveFilters && (
                  <span className="ml-2">
                    • <span className="text-primary">Filtered</span>
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    clearDateRange();
                  }}
                  className="gap-1"
                >
                  <X size={14} />
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddContact isOpen={isModalOpen} onContactCreated={fetchContacts} setIsOpen={setIsModalOpen} />
      <EditContact isOpen={isEditModalOpen} onContactUpdated={fetchContacts} setIsOpen={setIsEditModalOpen} contact={selectedContact} />
    </div>
  );
}