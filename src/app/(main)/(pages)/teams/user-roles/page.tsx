"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Plus, Pencil, Trash2, Search, Users, ShieldCheck,
    RefreshCw, Shield, User, Filter,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import AddRole from "@/components/modals/roles/AddRole";
import EditRole from "@/components/modals/roles/EditRole";
import { useUserContext } from "@/contexts/userContext";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";

interface PagePermission {
    page: string;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAdd: boolean;
}

interface FeaturePermission {
    feature: string;
    enabled: boolean;
}

interface RoleDoc {
    _id: string;
    name: string;
    leadAccess: string;
    pagePermissions: PagePermission[];
    featurePermissions: FeaturePermission[];
    createdAt: string;
}

export default function RolesPage() {
    const { user } = useUserContext();
    const orgId = typeof user?.organization === 'string' ? user.organization : "";
    const { toast } = useToast();

    const [roles, setRoles] = useState<RoleDoc[]>([]);
    const [selectedRole, setSelectedRole] = useState<RoleDoc | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [deleteError, setDeleteError] = useState("");
    const { isLoading: permissionsLoading, isInitialized } = usePermissions();


    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<RoleDoc[]>(`/api/roles`);
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
            toast({
                title: "Failed to load roles",
                description: "There was a problem fetching the role data.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (role: RoleDoc) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteError("");
        try {
            await axios.delete(`/api/roles/${id}?orgId=${orgId}`);
            fetchRoles();
            toast({
                title: "Role deleted",
                description: "The role has been successfully removed.",
            });
        } catch (error: any) {
            console.error("Error deleting role:", error);

            // Handle specific error when role is assigned to users
            if (error.response?.status === 409) {
                setDeleteError(error.response.data.message || "This role is assigned to users and cannot be deleted.");
            } else {
                toast({
                    title: "Failed to delete role",
                    description: "There was a problem removing this role.",
                    variant: "destructive",
                });
            }
        }
    };

    const getAccessLevelBadge = (accessLevel: string) => {
        switch (accessLevel) {
            case "ALL":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">All Leads</Badge>;
            case "ASSIGNED":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Assigned Only</Badge>;
            case "TEAM":
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">Team Leads</Badge>;
            case "NONE":
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">No Access</Badge>;
            default:
                return <Badge variant="outline">{accessLevel}</Badge>;
        }
    };

    const getPermissionCount = (role: RoleDoc) => {
        const pages = role.pagePermissions.filter(p => p.canView || p.canEdit || p.canDelete || p.canAdd).length;
        const features = role.featurePermissions.filter(f => f.enabled).length;
        return { pages, features };
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    // Check for view permission after permissions are loaded - use a more specific permission like "Settings"
    if (isInitialized && !canView("Settings")) {
        return (
            <NoPermissionFallback
                title="No Access to User Roles"
                description="You don't have permission to view or manage user roles."
            />
        );
    }


    return (
        <div className="p-6 space-y-6">
            <Card className="shadow-md border-0">
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center">
                                <Shield className="mr-2 h-5 w-5 text-primary" />
                                User Roles & Permissions
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground mt-1">
                                Define access levels and customize permissions for team members
                            </CardDescription>
                        </div>
                        {canAdd("Settings") ? (
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary hover:bg-primary/90"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Role
                            </Button>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="bg-primary/50 hover:bg-primary/20 cursor-not-allowed"

                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Role
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You don't have permission to add roles</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {/* Filters and search */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search roles by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-muted/40"
                                />
                            </div>

                            <Button variant="outline" size="icon" onClick={fetchRoles} className="h-10 w-10">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <RefreshCw className="h-4 w-4" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Refresh roles</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Button>
                        </div>

                        {/* Roles Table */}
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[250px]">
                                                <div className="flex items-center">
                                                    <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    Role Name
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center">
                                                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    Lead Access
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center">
                                                    <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    Permissions
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRoles.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center space-y-2">
                                                        <ShieldCheck className="h-8 w-8 opacity-40" />
                                                        <p>No roles found</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {searchQuery
                                                                ? "Try adjusting your search"
                                                                : "Create your first role to assign to team members"}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredRoles.map((role) => {
                                                const { pages, features } = getPermissionCount(role);
                                                return (
                                                    <TableRow key={role._id} className="group transition-colors hover:bg-muted/30">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <Shield className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">{role.name}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        Created {new Date(role.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getAccessLevelBadge(role.leadAccess)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex space-x-2">
                                                                <Badge variant="outline" className="bg-muted/70">
                                                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                                                    {pages} Pages
                                                                </Badge>
                                                                <Badge variant="outline" className="bg-muted/70">
                                                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                                                    {features} Features
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end space-x-1 opacity-80 group-hover:opacity-100">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        {canEdit("Settings") && (
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                                                    onClick={() => handleEdit(role)}
                                                                                >
                                                                                    <Pencil className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                        )}
                                                                        <TooltipContent>
                                                                            <p>Edit role</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                {canDelete("Settings") && (
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Are you sure you want to delete the role <span className="font-semibold">{role.name}</span>?
                                                                                    <p className="mt-2">
                                                                                        This action cannot be undone and may affect users assigned to this role.
                                                                                    </p>

                                                                                    {deleteError && (
                                                                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                                                                                            <p className="font-medium">Unable to delete role:</p>
                                                                                            <p>{deleteError}</p>
                                                                                        </div>
                                                                                    )}
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel onClick={() => setDeleteError("")}>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleDelete(role._id)}
                                                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="border-t flex flex-col sm:flex-row justify-between items-center py-4 text-sm text-muted-foreground">
                    <div>
                        Showing {filteredRoles.length} of {roles.length} roles
                    </div>
                    <div className="flex items-center mt-2 sm:mt-0">
                        <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                                Roles define what your team members can access and manage
                            </span>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            {/* Add Role Modal */}
            <AddRole
                isOpen={isAddModalOpen}
                setIsOpen={setIsAddModalOpen}
                onAdded={fetchRoles}
               
            />

            {/* Edit Role Modal */}
            <EditRole
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                onEdited={fetchRoles}
                role={selectedRole}
                orgId={typeof orgId === 'string' ? orgId : ""}
            />
        </div>
    );
}
