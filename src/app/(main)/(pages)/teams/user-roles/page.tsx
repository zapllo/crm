"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash } from "lucide-react";

import AddRole from "@/components/modals/roles/AddRole"; // or "@/components/modals/roles/AddRole"
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/userContext";

interface RoleDoc {
    _id: string;
    name: string;
    leadAccess: string;
    // pagePermissions, featurePermissions, etc.
}

export default function RolesPage() {

    const { user } = useUserContext();
    const orgId = user?.organization ?? "";
    const [roles, setRoles] = useState<RoleDoc[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            // GET roles for this org
            const response = await axios.get<RoleDoc[]>(`/api/roles`);
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Example: pass orgId in query
            await axios.delete(`/api/roles/${id}?orgId=${orgId}`);
            fetchRoles();
        } catch (error) {
            console.error("Error deleting role:", error);
        }
    };

    return (
        <div className="p-6 text-xs">
            <h2 className="text-xl font-bold mb-4">Roles</h2>
            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search"
                    className="border px-4 py-2 rounded"
                />
                <Button
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex items-center gap-2 text-xs"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={16} /> Add Role
                </Button>
            </div>

            <table className="w-full border border-gray-700 rounded">
                <thead>
                    <tr className="bg-gray-800 text-white text-left">
                        <th className="p-2">Role Name</th>
                        <th className="p-2">Lead Access</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role) => (
                        <tr key={role._id} className="border-b">
                            <td className="p-2">{role.name}</td>
                            <td className="p-2">{role.leadAccess}</td>
                            <td className="p-2 flex gap-2">
                                <button className="text-blue-500">
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(role._id)}
                                    className="text-red-500"
                                >
                                    <Trash size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Dialog for adding new role */}
            <AddRole
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                onAdded={fetchRoles}
                orgId={orgId}
            />
        </div>
    );
}
