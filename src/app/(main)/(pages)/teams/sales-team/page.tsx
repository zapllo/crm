"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/userContext";
import AddSalesTeamMember from "@/components/modals/sales-team/AddSalesTeamMember";

interface UserDoc {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string; // or an object
}

interface SalesTeam {
  _id: string;
  name: string;
  members: UserDoc[];
}

export default function SalesTeamPage() {
  const { user } = useUserContext();
  // The org ID from the current user context:
  const orgId = user?.organization ?? "";

  // The single "Sales Team" doc, storing its members
  const [team, setTeam] = useState<SalesTeam | null>(null);
  // All org users (we need them to see who’s already in the team, and who isn’t)
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);
  // All roles in the org
  const [allRoles, setAllRoles] = useState<{ _id: string; name: string }[]>([]);

  // For the “Add Member” dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeam();
    fetchAllUsers();
    fetchAllRoles();
  }, []);

  // 1) Fetch the "Sales Team" doc
  const fetchTeam = async () => {
    try {
      const res = await axios.get<SalesTeam>(`/api/team-sales?orgId=${orgId}`);
      setTeam(res.data);
    } catch (error) {
      console.error("Error fetching sales team:", error);
    }
  };

  // 2) Fetch all users in this org
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get<UserDoc[]>(`/api/members?orgId=${orgId}`);
      setAllUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // 3) Fetch all roles in the org
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

  // Called after we add a user in the AddSalesTeamMember dialog
  const handleAdded = () => {
    setIsAddDialogOpen(false);
    fetchTeam();     // Refresh team doc to see the new member
    fetchAllUsers(); // Optionally refresh the org users list
  };

  // Optional: Remove user from the team
  const handleRemoveMember = async (userId: string) => {
    try {
      // 1) find the current members array minus this user
      const memberIds = new Set(team?.members.map((m) => m._id) || []);
      memberIds.delete(userId);

      // 2) POST to /api/team-sales to update members
      await axios.post("/api/team-sales", {
        orgId,
        memberIds: Array.from(memberIds),
      });

      fetchTeam();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  return (
    <div className="p-6 text-xs">
      <h2 className="text-xl font-bold mb-4">Sales Team</h2>

      {/* If no Sales Team doc, let user create it */}
      {!team && (
        <div>
          <p>No Sales Team found. Create one?</p>
          <Button
            variant="default"
            onClick={() =>
              axios
                .post("/api/team-sales", { orgId, memberIds: [] })
                .then(fetchTeam)
            }
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-xs"
          >
            Create Sales Team
          </Button>
        </div>
      )}

      {/* If the team doc exists, show the members */}
      {team && (
        <>
          {/* Table listing all members already in the team */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-2">Team Members</h3>
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
                {team.members.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-2 text-center text-gray-400">
                      No members yet
                    </td>
                  </tr>
                )}
                {team.members.map((mem) => (
                  <tr key={mem._id} className="border-b">
                    <td className="p-2">
                      {mem.firstName} {mem.lastName}
                    </td>
                    <td className="p-2">{mem.email}</td>
                    <td className="p-2">{mem.role || "No Role"}</td>
                    <td className="p-2 flex gap-2">
                      <button className="text-blue-500">
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(mem._id)}
                        className="text-red-500"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Button to open the dialog to add new members */}
          <Button
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 flex items-center gap-1"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus size={14} /> Add Member
          </Button>
        </>
      )}

      {/* AddSalesTeamMember Dialog */}
      <AddSalesTeamMember
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        orgId={orgId}
        // Filter out only users not already in the team
        availableUsers={allUsers.filter(
          (u) => !team?.members.find((m) => m._id === u._id)
        )}
        availableRoles={allRoles}
        // For manager selection, you could pass entire org or just the team
        allOrgUsers={allUsers}
        onAdded={handleAdded}
      />
    </div>
  );
}
