"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus, Pencil, Trash2, Search, User, Mail, Shield,
  FilterIcon, RefreshCw, MoreHorizontal, UserPlus, Check, X,
  Loader2
} from "lucide-react";
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
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import AddMember from "@/components/modals/members/AddMember";
import EditMember from "@/components/modals/members/EditMember";
import { useUserContext } from "@/contexts/userContext";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";

interface Role {
  _id: string;
  name: string;
}

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: Role;
  organization: string;
  isOrgAdmin: boolean;
  createdAt: string;
}

export default function MembersPage() {
  const { user } = useUserContext();
  const { toast } = useToast();
const orgId = user?.organization?.toString() ?? "";

  const [members, setMembers] = useState<Member[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortField, setSortField] = useState<"name" | "email" | "role" | "date">("name");
  const { isLoading: permissionsLoading, isInitialized } = usePermissions();


  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Member[]>(`/api/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error fetching team members",
        description: "Could not retrieve the team members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/members/${id}`);
      fetchMembers();
      toast({
        title: "Member removed",
        description: "Team member has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Failed to remove member",
        description: "There was a problem removing this team member.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  // Filter by search query and role
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.role?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && member.isOrgAdmin) ||
      (roleFilter === "norole" && !member.role) ||
      (member.role?._id === roleFilter);

    return matchesSearch && matchesRole;
  });

  // Get unique roles for the filter dropdown
  const uniqueRoles = Array.from(
    new Set(
      members
        .filter(member => member.role)
        .map(member => member.role) as Role[]
    )
  );

  // Sort members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;

    switch (sortField) {
      case "name":
        return multiplier * (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`);
      case "email":
        return multiplier * a.email.localeCompare(b.email);
      case "role":
        return multiplier * ((a.role?.name || "") > (b.role?.name || "") ? 1 : -1);
      case "date":
        return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return 0;
    }
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  // Generate initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Check permissions before rendering content
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h3 className="text-lg font-medium">Loading permissions...</h3>
          <p className="text-muted-foreground">Please wait while we verify your access</p>
        </div>
      </div>
    );
  }

  // Check for view permission after permissions are loaded
  if (isInitialized && !canView("Teams")) {
    return (
      <NoPermissionFallback
        title="No Access to Team Members"
        description="You don't have permission to view the team members page."
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Team Members</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Manage your organization's team members, roles, and permissions
              </CardDescription>
            </div>
            {canAdd("Teams") ? (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Team Member
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-primary/50 hover:bg-primary/20 cursor-not-allowed"

                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Team Member
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You don't have permission to add team members</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Filters and search */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/40"
                />
              </div>

              <div className="flex gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[160px] bg-muted/40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                    <SelectItem value="norole">No Role</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={fetchMembers} className="h-10 w-10">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh members</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Members Table */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[300px] cursor-pointer" onClick={() => toggleSort("name")}>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          Team Member <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort("email")}>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          Email <SortIcon field="email" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort("role")}>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                          Role <SortIcon field="role" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <User className="h-8 w-8 opacity-40" />
                            <p>No team members found</p>
                            <p className="text-sm text-muted-foreground">
                              {searchQuery || roleFilter !== "all"
                                ? "Try adjusting your filters"
                                : "Add your first team member"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedMembers.map((member) => (
                        <TableRow key={member._id} className="group transition-colors hover:bg-muted/30">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(member.firstName, member.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {member.firstName} {member.lastName}
                                  {member.isOrgAdmin && (
                                    <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 font-normal">
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                                {/* <div className="text-sm text-muted-foreground">
                                  Added {new Date(member.createdAt).toLocaleDateString()}
                                </div> */}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-normal">{member.email}</div>
                          </TableCell>
                          <TableCell>
                            {member.role ? (
                              <Badge variant="secondary" className="font-normal">
                                {member.role.name}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground font-normal">
                                No Role Assigned
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1 opacity-80 group-hover:opacity-100">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    {canEdit("Teams") && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => handleEdit(member)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit member</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 hover:bg-muted"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  {canEdit("Teams") && (
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(member)}
                                      className="cursor-pointer"
                                    >
                                      <Pencil className="h-4 w-4 mr-2" /> Edit Details
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {canDelete("Teams") && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-600 cursor-pointer"
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" /> Remove Member
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to remove <span className="font-medium">{member.firstName} {member.lastName}</span> from the team?
                                            <p className="mt-2">
                                              This action cannot be undone and will revoke their access to the organization.
                                            </p>
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDelete(member._id)}
                                            className="bg-red-500 hover:bg-red-600 text-white"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t flex flex-col sm:flex-row justify-between items-center py-4 text-sm text-muted-foreground">
          <div>
            Showing {sortedMembers.length} of {members.length} team members
          </div>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            {/* <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Active members</span>
            </div> */}
            <span className="mx-3">•</span>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </CardFooter>
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