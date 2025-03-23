"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axios from "axios";

interface Member {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    organization: string;
}

interface Role {
    _id: string;
    name: string;
}

interface EditMemberProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    onEdited: () => void;
    member: Member | null;
    orgId: string;
}

export default function EditMember({
    isOpen,
    setIsOpen,
    onEdited,
    member,
    orgId,
}: EditMemberProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [roleId, setRoleId] = useState("");
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        if (isOpen && member) {
            setFirstName(member.firstName);
            setLastName(member.lastName);
            setEmail(member.email);
            setRoleId(member.role || "");
            fetchRoles();
        }
    }, [isOpen, member]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get<Role[]>('/api/roles');
            setRoles(response.data);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };

    const handleSubmit = async () => {
        if (!member) return;

        try {
            await axios.patch(`/api/members/${member._id}`, {
                firstName,
                lastName,
                email,
                roleId: roleId || null,
                orgId,
            });
            onEdited();
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update member:", error);
        }
    };

    if (!member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="p-6 h-[80vh] z-[100] overflow-y-scroll scrollbar-hide">
                <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* First Name */}
                    <div className="space-y-2">
                        {/* <Label>First Name</Label> */}
                        <Input
                            label="First Name"
                            placeholder="Enter first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        {/* <Label>Last Name</Label> */}
                        <Input
                            label="Last Name"
                            placeholder="Enter last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        {/* <Label>Email Address</Label> */}
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        {/* <Label>Role</Label> */}
                        <Select value={roleId} onValueChange={setRoleId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="No Role">No Role</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role._id} value={role._id}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-[#815bf5] hover:bg-[#815bf5]/90 mt-6"
                    >
                        Update Member
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
