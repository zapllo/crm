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

interface AddMemberProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onAdded: () => void;
  orgId: string;
}

interface Role {
  _id: string;
  name: string;
}

export default function AddMember({
  isOpen,
  setIsOpen,
  onAdded,
  orgId,
}: AddMemberProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get<Role[]>('/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/api/members", {
        firstName,
        lastName,
        email,
        password,
        orgId,
        roleId: roleId || null,
      });
      onAdded();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRoleId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 h-fit z-[100] overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
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
              label="Email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            {/* <Label>Password</Label> */}
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <SelectContent className="z-[100]">
                <SelectItem className="hover:bg-accent" value="No Role">No Role</SelectItem>
                {roles.map((role) => (
                  <SelectItem className="hover:bg-accent" key={role._id} value={role._id}>
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
            Add Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}