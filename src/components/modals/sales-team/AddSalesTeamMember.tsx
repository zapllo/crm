"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

interface UserDoc {
  _id: string;
  firstName: string;
  lastName: string;
}

interface RoleDoc {
  _id: string;
  name: string;
}

interface AddSalesTeamMemberProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  orgId: string;
  availableUsers: UserDoc[];
  availableRoles: RoleDoc[];
  allOrgUsers: UserDoc[];
  onAdded: () => void;
}

export default function AddSalesTeamMember({
  isOpen,
  setIsOpen,
  orgId,
  availableUsers,
  availableRoles,
  allOrgUsers,
  onAdded,
}: AddSalesTeamMemberProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [assignOnlineLeads, setAssignOnlineLeads] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("");
      setSelectedRoleId("");
      setManagerId("");
      setAssignOnlineLeads(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      if (!selectedUserId) return;

      await axios.patch(`/api/members/${selectedUserId}`, {
        orgId,
        roleId: selectedRoleId || null,
        managerId: managerId || null,
        assignOnlineLeads,
      });

      await axios.post("/api/team-sales", {
        orgId,
        memberIds: [selectedUserId],
      });

      onAdded();
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding user to Sales Team:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 z-[100] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* User Selection */}
          <div className="space-y-2">
            {/* <label className="text-sm text-muted-foreground">Select User</label> */}
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="Select User" className="hover:bg-accent" >
                  Select an User
                </SelectItem>

                {availableUsers.map((user) => (
                  <SelectItem className="hover:bg-accent" key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            {/* <label className="text-sm text-muted-foreground">Assign Role</label> */}
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem  value="No Role">Select a Role</SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem className="hover:bg-accent" key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manager Selection */}
          <div className="space-y-2">
            {/* <label className="text-sm text-muted-foreground">Manager</label> */}
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="No Manager">No Manager</SelectItem>
                {allOrgUsers.map((user) => (
                  <SelectItem className="hover:bg-accent" key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Online Leads Switch */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Assign Online Leads</label>
            <Switch
              checked={assignOnlineLeads}
              onCheckedChange={setAssignOnlineLeads}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#815bf5] hover:bg-[#815bf5]/90 text-white"
          >
            Add Team Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}