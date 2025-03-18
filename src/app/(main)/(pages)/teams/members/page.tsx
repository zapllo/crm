"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddMember from "@/components/modals/members/AddMember";
import { useUserContext } from "@/contexts/userContext";

interface Member {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    organization: string;
}

export default function MembersPage() {

    const { user } = useUserContext();
    const orgId = user?.organization ?? "";


    const [members, setMembers] = useState<Member[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get<Member[]>(`/api/members`);
            setMembers(response.data);
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };



    const handleDelete = async (id: string) => {
        try {
            // Example: /api/members/[id] or passing ?id= in query
            await axios.delete(`/api/members/${id}`);
            fetchMembers();
        } catch (error) {
            console.error("Error deleting member:", error);
        }
    };

    return (
        <div className="p-6 text-xs">
            <h2 className="text-xl font-bold mb-4">Members</h2>
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
                    <Plus size={16} /> Add Member
                </Button>
            </div>

            <table className="w-full border border-gray-700 rounded">
                <thead>
                    <tr className="bg-gray-800 text-white text-left">
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((m) => (
                        <tr key={m._id} className="border-b">
                            <td className="p-2">
                                {m.firstName} {m.lastName}
                            </td>
                            <td className="p-2">{m.email}</td>
                            <td className="p-2">{m.role || "No Role"}</td>
                            <td className="p-2 flex gap-2">
                                <button className="text-blue-500">
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(m._id)}
                                    className="text-red-500"
                                >
                                    <Trash size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <AddMember
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                onAdded={fetchMembers}
                orgId={orgId}
            />
        </div>
    );
}
