"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import AddMember from "@/components/modals/members/AddMember";
import EditMember from "@/components/modals/members/EditMember";
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
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      await axios.delete(`/api/members/${id}`);
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const filteredMembers = members.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-semibold">Team Members</CardTitle>
              <CardDescription>
                Manage your organization's team members and their roles
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#815bf5] hover:bg-[#815bf5]/90"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>

            {/* Members Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {member.role ? (
                          <Badge variant="secondary">{member.role}</Badge>
                        ) : (
                          <Badge variant="outline">No Role</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                            onClick={() => handleEdit(member)}
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
                                <AlertDialogTitle>Delete Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.firstName} {member.lastName} from the team? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(member._id)}
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

      {/* Add Member Modal */}
      <AddMember
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        onAdded={fetchMembers}
        orgId={orgId}
      />

      {/* Edit Member Modal */}
      <EditMember
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        onEdited={fetchMembers}
        member={selectedMember}
        orgId={orgId}
      />
    </div>
  );
}