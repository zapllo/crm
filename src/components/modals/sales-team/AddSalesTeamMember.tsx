"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Shadcn UI Switch
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
  // Array of users not yet in the team
  availableUsers: UserDoc[];
  // All roles in the org
  availableRoles: RoleDoc[];
  // For manager selection, might be entire org or just the team
  allOrgUsers: UserDoc[];
  // Callback to refresh or refetch the team
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
  // Selected user to add
  const [selectedUserId, setSelectedUserId] = useState("");
  // Selected role
  const [selectedRoleId, setSelectedRoleId] = useState("");
  // Selected manager
  const [managerId, setManagerId] = useState("");
  // Switch to assign online leads
  const [assignOnlineLeads, setAssignOnlineLeads] = useState(false);

  // When dialog opens, reset fields
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

      // 1) PATCH the user doc to set role, manager, assignOnlineLeads
      await axios.patch(`/api/members/${selectedUserId}`, {
        orgId,
        roleId: selectedRoleId || null,
        managerId: managerId || null,
        assignOnlineLeads,
      });

      // 2) Add user to the Sales Team
      // We'll do a POST /api/team-sales with new member
      await axios.post("/api/team-sales", {
        orgId,
        // We can pass managerId / memberIds array if needed
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
      <DialogContent className="p-4 max-w-md w-full bg-[#0b0d29] text-white text-xs">
        <div className="flex justify-between items-center mb-2">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Add Team Member</DialogTitle>
          </DialogHeader>
          <DialogClose className="cursor-pointer">
            <CrossCircledIcon className="h-5 w-5 text-gray-200 hover:text-white" />
          </DialogClose>
        </div>

        {/* FORM */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          {/* User to add */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs">Select User</label>
            <select
              className="border border-gray-600 bg-[#0b0d29] rounded px-2 py-1"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Select a user --</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs">Assign Role</label>
            <select
              className="border border-gray-600 bg-[#0b0d29] rounded px-2 py-1"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              <option value="">-- No Role --</option>
              {availableRoles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Manager */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs">Manager</label>
            <select
              className="border border-gray-600 bg-[#0b0d29] rounded px-2 py-1"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
            >
              <option value="">-- No Manager --</option>
              {allOrgUsers.map((usr) => (
                <option key={usr._id} value={usr._id}>
                  {usr.firstName} {usr.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Switch for assignOnlineLeads */}
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs">Assign Online Leads?</label>
            <Switch
              checked={assignOnlineLeads}
              onCheckedChange={(val) => setAssignOnlineLeads(val)}
            />
          </div>

          {/* Submit */}
          <Button
            variant="default"
            className="bg-green-500 text-white hover:bg-green-600 w-full text-xs mt-3"
            onClick={handleSubmit}
          >
            + Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
