"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/userContext";
import AddSalesTeamMember from "@/components/modals/sales-team/AddSalesTeamMember";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface UserDoc {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

interface SalesTeam {
  _id: string;
  name: string;
  members: UserDoc[];
}

export default function SalesTeamPage() {
  const { user } = useUserContext();
  const orgId = user?.organization ? user.organization.toString() : "";
  const [team, setTeam] = useState<SalesTeam | null>(null);
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);
  const [allRoles, setAllRoles] = useState<{ _id: string; name: string }[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
    fetchAllUsers();
    fetchAllRoles();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await axios.get<SalesTeam>(`/api/team-sales?orgId=${orgId}`);
      setTeam(res.data);
    } catch (error) {
      console.error("Error fetching sales team:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get<UserDoc[]>(`/api/members?orgId=${orgId}`);
      setAllUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAllRoles = async () => {
    try {
      const res = await axios.get<{ _id: string; name: string }[]>(
        `/api/roles?orgId=${orgId}`
      );
      setAllRoles(res.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleAdded = () => {
    setIsAddDialogOpen(false);
    fetchTeam();
    fetchAllUsers();
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const memberIds = new Set(team?.members.map((m) => m._id) || []);
      memberIds.delete(userId);
      await axios.post("/api/team-sales", {
        orgId,
        memberIds: Array.from(memberIds),
      });
      fetchTeam();
      setUserToDelete(null);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold">Sales Team</CardTitle>
              <CardDescription>Manage your sales team members and their roles</CardDescription>
            </div>
            {team && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-[#815bf5] hover:bg-[#815bf5]/90"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!team ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No Sales Team found. Would you like to create one?</p>
              <Button
                onClick={() =>
                  axios
                    .post("/api/team-sales", { orgId, memberIds: [] })
                    .then(fetchTeam)
                }
                className="bg-[#815bf5] hover:bg-[#815bf5]/90"
              >
                Create Sales Team
              </Button>
            </div>
          ) : (
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
                {team.members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No team members yet
                    </TableCell>
                  </TableRow>
                ) : (
                  team.members.map((member) => (
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
                        <div className="flex justify-end gap-2">
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
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.firstName} {member.lastName} from the sales team?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member._id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Remove
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
          )}
        </CardContent>
      </Card>

      <AddSalesTeamMember
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        orgId={orgId as string}
        availableUsers={allUsers.filter(
          (u) => !team?.members.find((m) => m._id === u._id)
        )}
        availableRoles={allRoles}
        allOrgUsers={allUsers}
        onAdded={handleAdded}
      />
    </div>
  );
}