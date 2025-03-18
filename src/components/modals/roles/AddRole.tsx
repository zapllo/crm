"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { CrossCircledIcon } from "@radix-ui/react-icons";
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
import axios from "axios";

interface AddRoleProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onAdded: () => void;
  orgId: string;
}

// Example pages
const ALL_PAGES = ["Leads", "Contacts", "Pipeline"];
// Example features
const ALL_FEATURES = ["ExportCSV", "BulkEmail", "Analytics"];

/** We want for each page: canView, canEdit, canDelete, canAdd. */
type PagePermissionsState = {
  [page: string]: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAdd: boolean;
  };
};

/** For each feature: enabled. */
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

  // 1) Track page permissions (4 booleans per page).
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

  // 2) Track feature permissions (1 boolean per feature).
  const [featurePermissions, setFeaturePermissions] =
    useState<FeaturePermissionsState>(() => {
      const initial: FeaturePermissionsState = {};
      ALL_FEATURES.forEach((f) => {
        initial[f] = false;
      });
      return initial;
    });

  // Toggling a page permission
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

  // Toggling a feature permission
  const handleToggleFeaturePermission = (feature: string) => {
    setFeaturePermissions((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  // Submitting the form
  const handleSubmit = async () => {
    try {
      // Transform the local states into arrays to match the Role schema
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
      // Reset fields
      setName("");
      setLeadAccess("ASSIGNED");

      // Reset permissions
      const resetPages: PagePermissionsState = {};
      ALL_PAGES.forEach((p) => {
        resetPages[p] = {
          canView: false,
          canEdit: false,
          canDelete: false,
          canAdd: false,
        };
      });
      const resetFeatures: FeaturePermissionsState = {};
      ALL_FEATURES.forEach((f) => {
        resetFeatures[f] = false;
      });
      setPagePermissions(resetPages);
      setFeaturePermissions(resetFeatures);
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-4 max-w-md w-full text-xs bg-[#0b0d29] text-white">
        <div className="flex justify-between items-center mb-2">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Create Role</DialogTitle>
          </DialogHeader>
          <DialogClose className="cursor-pointer">
            <CrossCircledIcon className="h-5 w-5 text-gray-200 hover:text-white" />
          </DialogClose>
        </div>

        <div className="space-y-2">
          {/* Role Name */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs">Role Name</label>
            <input
              className="border border-gray-600 bg-transparent rounded px-2 py-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Lead Access (Shadcn Select) */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs">Lead Access</label>
            <Select
              value={leadAccess}
              onValueChange={(val) => setLeadAccess(val)}
            >
              <SelectTrigger className="bg-transparent border border-gray-600 w-full text-xs">
                <SelectValue placeholder="Select lead access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL</SelectItem>
                <SelectItem value="ASSIGNED">ASSIGNED</SelectItem>
                <SelectItem value="TEAM">TEAM</SelectItem>
                <SelectItem value="NONE">NONE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TABS: Pages & Features */}
          <Tabs defaultValue="pages" className="mt-3 text-xs">
            <TabsList className="bg-[#161a2b] rounded-md mb-2">
              <TabsTrigger
                value="pages"
                className="px-3 py-1 data-[state=active]:bg-[#2c3152] text-xs"
              >
                Pages
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="px-3 py-1 data-[state=active]:bg-[#2c3152] text-xs"
              >
                Features
              </TabsTrigger>
            </TabsList>

            {/* Pages Tab: 4 checkboxes per page */}
            <TabsContent value="pages" className="space-y-2 text-xs">
              {Object.entries(pagePermissions).map(([page, perms]) => (
                <div
                  key={page}
                  className="border border-gray-600 p-2 rounded space-y-1"
                >
                  <h3 className="text-sm font-semibold">{page}</h3>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={perms.canView}
                      onCheckedChange={() =>
                        handleTogglePagePermission(page, "canView")
                      }
                    />
                    <label>View</label>

                    <Checkbox
                      checked={perms.canEdit}
                      onCheckedChange={() =>
                        handleTogglePagePermission(page, "canEdit")
                      }
                    />
                    <label>Edit</label>

                    <Checkbox
                      checked={perms.canDelete}
                      onCheckedChange={() =>
                        handleTogglePagePermission(page, "canDelete")
                      }
                    />
                    <label>Delete</label>

                    <Checkbox
                      checked={perms.canAdd}
                      onCheckedChange={() =>
                        handleTogglePagePermission(page, "canAdd")
                      }
                    />
                    <label>Add</label>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Features Tab: single checkbox 'enabled' per feature */}
            <TabsContent value="features" className="space-y-2 text-xs">
              {Object.entries(featurePermissions).map(([feature, enabled]) => (
                <div
                  key={feature}
                  className="border border-gray-600 p-2 rounded flex items-center gap-2"
                >
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={() => handleToggleFeaturePermission(feature)}
                  />
                  <label>{feature}</label>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <Button
            variant="default"
            className="mt-2 bg-green-500 text-white hover:bg-green-600 w-full text-xs"
            onClick={handleSubmit}
          >
            + Create Role
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
