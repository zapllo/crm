"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash, Download, Loader2, Search, MoreHorizontal, ArrowUpDown, Building } from "lucide-react";
import AddCompany from "@/components/modals/companies/AddCompany";
import EditCompany from "@/components/modals/companies/EditCompany";
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
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Company {
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

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("companyName");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const router = useRouter();
    const { isLoading: permissionsLoading, isInitialized } = usePermissions();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await axios.get<Company[]>("/api/companies");
            setCompanies(response.data);
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await axios.delete(`/api/companies/${confirmDelete}`);
            fetchCompanies(); // Refresh list
        } catch (error) {
            console.error("Error deleting company:", error);
        }
        setConfirmDelete(null);
    };

    const handleExportCSV = () => {
        const csvData = [
            ["Company Name", "Tax No", "Company Code", "Country", "State", "City"],
            ...companies.map(({ companyName, taxNo, companyCode, country, state, city }) => [
                companyName,
                taxNo,
                companyCode,
                country,
                state,
                city,
            ]),
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvData.map((row) => row.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "companies.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleSortDirection = () => {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    };

    const handleRowClick = (companyId: string, e: React.MouseEvent) => {
        // Prevent navigation if clicking action buttons
        if ((e.target as HTMLElement).closest('.action-button')) return;
        router.push(`/CRM/companies/${companyId}`);
    };

    const sortedFilteredCompanies = companies
        .filter(({ companyName, country, taxNo, companyCode }) =>
            [companyName, country, taxNo, companyCode].some((field) =>
                field?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        .sort((a, b) => {
            const aValue = a[sortField as keyof Company] || '';
            const bValue = b[sortField as keyof Company] || '';

            if (sortDirection === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    // Check permissions before rendering content
    if (permissionsLoading) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
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
                title="No Access to Companies"
                description="You don't have permission to view the companies page."
            />
        );
    }
    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <h3 className="text-lg font-medium">Loading companies...</h3>
                    <p className="text-muted-foreground">Please wait while we fetch your company data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 mt-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your business relationships and company profiles.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {canAdd("Companies") ? (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary hover:bg-primary/90"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Company
                            </Button>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="bg-primary/50 hover:bg-primary/20 cursor-not-allowed"

                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Company
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You don't have permission to add companies</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Company Directory</CardTitle>
                                <CardDescription>
                                    {sortedFilteredCompanies.length} {sortedFilteredCompanies.length === 1 ? 'company' : 'companies'} in your database
                                </CardDescription>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleExportCSV}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" /> Export
                                </Button>
                                <Tabs defaultValue="table" className="w-[200px]">
                                    <TabsList className="grid w-full bg-accent grid-cols-2">
                                        <TabsTrigger value="table" className="border-none" onClick={() => setViewMode("table")}>Table</TabsTrigger>
                                        <TabsTrigger value="grid" className="border-none" onClick={() => setViewMode("grid")}>Grid</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-6 gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search companies..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={sortField} onValueChange={setSortField}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="companyName">Company Name</SelectItem>
                                    <SelectItem value="country">Country</SelectItem>
                                    <SelectItem value="taxNo">Tax ID</SelectItem>
                                    <SelectItem value="companyCode">Company Code</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSortDirection}
                                className="flex items-center"
                            >
                                <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180 transition-transform" : "transition-transform"}`} />
                            </Button>
                        </div>

                        {sortedFilteredCompanies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Building className="h-12 w-12 text-muted-foreground/60 mb-4" />
                                <h3 className="text-lg font-medium">No companies found</h3>
                                <p className="text-muted-foreground mt-1 max-w-md">
                                    {searchTerm ?
                                        "Try adjusting your search term or filters." :
                                        "Get started by adding your first company."}
                                </p>
                                {!searchTerm && (
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-6"
                                        variant="default"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add Company
                                    </Button>
                                )}
                            </div>
                        ) : viewMode === "table" ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40%]">Company</TableHead>
                                            <TableHead>Tax ID</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedFilteredCompanies.map((company) => (
                                            <TableRow
                                                key={company._id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={(e) => handleRowClick(company._id, e)}
                                            >
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div className="font-medium">{company.companyName}</div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {company.country}{company.state ? `, ${company.state}` : ""}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{company.taxNo || "—"}</TableCell>
                                                <TableCell>
                                                    {company.companyCode ? (
                                                        <Badge variant="outline">{company.companyCode}</Badge>
                                                    ) : "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        {canEdit("Companies") && (
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="action-button h-8 w-8"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Open menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                        )}
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/CRM/companies/${company._id}`);
                                                                }}
                                                            >
                                                                View details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCompany(company);
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                            >
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive"
                                                                        onSelect={(e) => e.preventDefault()}
                                                                    >
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete <span className="font-medium">{company.companyName}</span>?
                                                                            This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            onClick={() => {
                                                                                setConfirmDelete(company._id);
                                                                                handleDelete();
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            // Grid view
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedFilteredCompanies.map((company) => (
                                    <Card
                                        key={company._id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => router.push(`/CRM/companies/${company._id}`)}
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="mb-1">{company.companyName}</CardTitle>
                                                    <CardDescription>
                                                        {company.country}{company.state ? `, ${company.state}` : ""}
                                                    </CardDescription>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="action-button h-8 w-8"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/CRM/companies/${company._id}`);
                                                            }}
                                                        >
                                                            View details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCompany(company);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete <span className="font-medium">{company.companyName}</span>?
                                                                        This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        onClick={() => {
                                                                            setConfirmDelete(company._id);
                                                                            handleDelete();
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-muted-foreground">Tax ID</div>
                                                    <div className="font-medium">{company.taxNo || "—"}</div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-muted-foreground">Code</div>
                                                    <div>
                                                        {company.companyCode ? (
                                                            <Badge variant="outline">{company.companyCode}</Badge>
                                                        ) : "—"}
                                                    </div>
                                                </div>
                                                {company.website && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-muted-foreground">Website</div>
                                                        <div className="font-medium text-sm truncate max-w-[150px]">
                                                            {company.website}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination placeholder - implement actual pagination as needed */}
                        {sortedFilteredCompanies.length > 0 && (
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-primary text-primary-foreground"
                                >
                                    1
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    2
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    3
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Company Dialog */}
            <AddCompany
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                onCompanyCreated={fetchCompanies}
            />

            {/* Edit Company Dialog */}
            <EditCompany
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                company={selectedCompany}
                onCompanyUpdated={fetchCompanies}
            />
        </div>
    );
}