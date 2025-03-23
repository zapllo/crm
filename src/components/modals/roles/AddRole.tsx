"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Eye, Shield, ShieldCheck } from "lucide-react";

interface AddRoleProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onAdded: () => void;
  orgId: string;
}

const ALL_PAGES = ["Leads", "Contacts", "Pipeline"];
const ALL_FEATURES = ["ExportCSV", "BulkEmail", "Analytics"];

type PagePermissionsState = {
  [page: string]: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAdd: boolean;
  };
};

type FeaturePermissionsState = {
  [feature: string]: boolean;
};

export default function AddRole({
  isOpen,
  setIsOpen,
  onAdded,
  orgId,
}: AddRoleProps) {
  const [name, setName] = useState("");
  const [leadAccess, setLeadAccess] = useState("ASSIGNED");
  const [pagePermissions, setPagePermissions] = useState<PagePermissionsState>(() => {
    const initial: PagePermissionsState = {};
    ALL_PAGES.forEach((p) => {
      initial[p] = {
        canView: false,
        canEdit: false,
        canDelete: false,
        canAdd: false,
      };
    });
    return initial;
  });

  const [featurePermissions, setFeaturePermissions] = useState<FeaturePermissionsState>(() => {
    const initial: FeaturePermissionsState = {};
    ALL_FEATURES.forEach((f) => {
      initial[f] = false;
    });
    return initial;
  });

  const handleTogglePagePermission = (
    page: string,
    field: "canView" | "canEdit" | "canDelete" | "canAdd"
  ) => {
    setPagePermissions((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: !prev[page][field],
      },
    }));
  };

  const handleToggleFeaturePermission = (feature: string) => {
    setFeaturePermissions((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const handleSubmit = async () => {
    try {
      const pagesArray = ALL_PAGES.map((p) => ({
        page: p,
        canView: pagePermissions[p].canView,
        canEdit: pagePermissions[p].canEdit,
        canDelete: pagePermissions[p].canDelete,
        canAdd: pagePermissions[p].canAdd,
      }));

      const featuresArray = ALL_FEATURES.map((f) => ({
        feature: f,
        enabled: featurePermissions[f],
      }));

      await axios.post("/api/roles", {
        orgId,
        name,
        leadAccess,
        pagePermissions: pagesArray,
        featurePermissions: featuresArray,
      });

      onAdded();
      setIsOpen(false);
      // Reset form...
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 h-[90vh] z-[100] s overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Role Name */}
          <div className="space-y-2">
            {/* <Label>Role Name</Label> */}
            <Input
              label="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name"
            />
          </div>

          {/* Lead Access */}
          <div className="space-y-2">
            {/* <Label>Lead Access</Label> */}
            <Select
              value={leadAccess}
              onValueChange={setLeadAccess}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select lead access" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem className="hover:bg-accent" value="ALL">All Leads</SelectItem>
                <SelectItem className="hover:bg-accent" value="ASSIGNED">Assigned Leads</SelectItem>
                <SelectItem className="hover:bg-accent" value="TEAM">Team Leads</SelectItem>
                <SelectItem className="hover:bg-accent" value="NONE">No Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permissions Tabs */}
          <Tabs defaultValue="pages" className="mt-6">
            <TabsList className="w-full">
              <TabsTrigger value="pages" className="flex-1">Pages</TabsTrigger>
              <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
            </TabsList>

            {/* Pages Permissions - Table Format */}
            <TabsContent value="pages" className="mt-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-sm font-medium">Page</th>
                      <th className="text-center p-3 text-sm font-medium">Create</th>
                      <th className="text-center p-3 text-sm font-medium">Read</th>
                      <th className="text-center p-3 text-sm font-medium">Update</th>
                      <th className="text-center p-3 text-sm font-medium">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_PAGES.map((page) => (
                      <tr key={page} className="border-b">
                        <td className="p-3 text-sm font-medium">{page}</td>
                        <td className="text-center p-3">
                          <Checkbox
                            checked={pagePermissions[page].canAdd}
                            onCheckedChange={() => handleTogglePagePermission(page, "canAdd")}
                            className="mx-auto"
                          />
                        </td>
                        <td className="text-center p-3">
                          <Checkbox
                            checked={pagePermissions[page].canView}
                            onCheckedChange={() => handleTogglePagePermission(page, "canView")}
                            className="mx-auto"
                          />
                        </td>
                        <td className="text-center p-3">
                          <Checkbox
                            checked={pagePermissions[page].canEdit}
                            onCheckedChange={() => handleTogglePagePermission(page, "canEdit")}
                            className="mx-auto"
                          />
                        </td>
                        <td className="text-center p-3">
                          <Checkbox
                            checked={pagePermissions[page].canDelete}
                            onCheckedChange={() => handleTogglePagePermission(page, "canDelete")}
                            className="mx-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Permission Buttons */}
              <div className="mt-4 space-x-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPerms = { ...pagePermissions };
                    ALL_PAGES.forEach(page => {
                      newPerms[page] = {
                        canView: true,
                        canEdit: false,
                        canDelete: false,
                        canAdd: false
                      };
                    });
                    setPagePermissions(newPerms);
                  }}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPerms = { ...pagePermissions };
                    ALL_PAGES.forEach(page => {
                      newPerms[page] = {
                        canView: true,
                        canEdit: true,
                        canDelete: false,
                        canAdd: true
                      };
                    });
                    setPagePermissions(newPerms);
                  }}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Standard Access
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPerms = { ...pagePermissions };
                    ALL_PAGES.forEach(page => {
                      newPerms[page] = {
                        canView: true,
                        canEdit: true,
                        canDelete: true,
                        canAdd: true
                      };
                    });
                    setPagePermissions(newPerms);
                  }}
                  className="flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Full Access
                </Button>
              </div>
            </TabsContent>

            {/* Features Permissions */}
            <TabsContent value="features" className="space-y-4 mt-4">
              {Object.entries(featurePermissions).map(([feature, enabled]) => (
                <div
                  key={feature}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <Label className="text-sm">{feature}</Label>
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={() => handleToggleFeaturePermission(feature)}
                  />
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleSubmit}
            className="w-full bg-[#815bf5] hover:bg-[#815bf5]/90 mt-6"
          >
            Create Role
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}