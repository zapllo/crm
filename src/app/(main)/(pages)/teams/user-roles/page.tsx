"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AddRole from "@/components/modals/roles/AddRole";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/userContext";
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

interface RoleDoc {
    _id: string;
    name: string;
    leadAccess: string;
}

export default function RolesPage() {
    const { user } = useUserContext();
    const orgId = user?.organization ?? "";
    const [roles, setRoles] = useState<RoleDoc[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await axios.get<RoleDoc[]>(`/api/roles`);
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/roles/${id}?orgId=${orgId}`);
            fetchRoles();
        } catch (error) {
            console.error("Error deleting role:", error);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-semibold">User Roles</CardTitle>
                            <CardDescription>
                                Manage and configure user roles and permissions
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#815bf5] hover:bg-[#815bf5]/90"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Role
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="flex items-center space-x-2">
                            <Input
                                label="Search Role"
                                placeholder="Search roles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm dark:text-white text-black"
                            />
                        </div>

                        {/* Roles Table */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Lead Access</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRoles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No roles found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRoles.map((role) => (
                                        <TableRow key={role._id}>
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {role.leadAccess}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete the role "{role.name}"?
                                                                    This action cannot be undone and may affect users assigned to this role.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(role._id)}
                                                                    className="bg-red-500 hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Role Modal */}
            <AddRole
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                onAdded={fetchRoles}
                orgId={orgId}
            />
        </div>
    );
}