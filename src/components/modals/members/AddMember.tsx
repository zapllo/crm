"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface AddMemberProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onAdded: () => void;
  orgId: string;
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

  const handleSubmit = async () => {
    try {
      await axios.post("/api/members", {
        firstName,
        lastName,
        email,
        password, // <--- REQUIRED
        orgId,
        roleId,
      });
      onAdded();
      setIsOpen(false);
      // reset fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRoleId("");
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 max-w-md w-full text-xs bg-[#0b0d29] text-white">
        <div className="flex justify-between items-center mb-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Add Member</DialogTitle>
          </DialogHeader>
          <DialogClose className="cursor-pointer">
            <CrossCircledIcon className="h-5 w-5 text-gray-200 hover:text-white" />
          </DialogClose>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-2 text-xs">
          <div className="flex flex-col space-y-1">
            <label>First Name</label>
            <input
              className="border border-gray-600 bg-transparent rounded px-2 py-1"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label>Last Name</label>
            <input
              className="border border-gray-600 bg-transparent rounded px-2 py-1"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label>Email</label>
            <input
              type="email"
              className="border border-gray-600 bg-transparent rounded px-2 py-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label>Password</label>
            <input
              type="password"
              className="border border-gray-600 bg-transparent rounded px-2 py-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* If you want a role selection */}
          {/* <div className="flex flex-col space-y-1">
            <label>Role</label>
            <select
              className="border border-gray-600 bg-transparent rounded px-2 py-1"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="">No Role</option>
              // map roles if you want
            </select>
          </div> */}

          <Button
            variant="default"
            className="mt-2 bg-green-500 text-white hover:bg-green-600"
            onClick={handleSubmit}
          >
            + Add Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
