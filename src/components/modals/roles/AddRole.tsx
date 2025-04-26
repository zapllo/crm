"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { X, Eye, Shield, ShieldCheck, Plus, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AddRoleProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onAdded: () => void;

}

// Define constants
const ALL_PAGES = [
  "Leads",
  "Contacts",
  "Pipeline",
  "Companies",
  "Products",
  "FollowUps",
  "Settings",
  "Teams",
  "Integrations"
];
const ALL_FEATURES = ["ExportCSV", "BulkEmail", "Analytics"];

// Form schema
const formSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  leadAccess: z.enum(["ALL", "ASSIGNED", "TEAM", "NONE"]),
});

export default function AddRole({
  isOpen,
  setIsOpen,
  onAdded,

}: AddRoleProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagePermissions, setPagePermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    ALL_PAGES.forEach((page) => {
      initial[page] = {
        canView: false,
        canEdit: false,
        canDelete: false,
        canAdd: false,
      };
    });
    return initial;
  });

  const [featurePermissions, setFeaturePermissions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_FEATURES.forEach((feature) => {
      initial[feature] = false;
    });
    return initial;
  });

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      leadAccess: "ASSIGNED" as const,
    },
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

  const handleSetPageTemplate = (template: "viewOnly" | "standard" | "full") => {
    const newPerms = { ...pagePermissions };
    ALL_PAGES.forEach(page => {
      switch (template) {
        case "viewOnly":
          newPerms[page] = {
            canView: true,
            canEdit: false,
            canDelete: false,
            canAdd: false
          };
          break;
        case "standard":
          newPerms[page] = {
            canView: true,
            canEdit: true,
            canDelete: false,
            canAdd: true
          };
          break;
        case "full":
          newPerms[page] = {
            canView: true,
            canEdit: true,
            canDelete: true,
            canAdd: true
          };
          break;
      }
    });
    setPagePermissions(newPerms);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      // Convert permissions to array format expected by API
      const pagesArray = Object.entries(pagePermissions).map(([page, perms]) => ({
        page,
        canView: perms.canView,
        canEdit: perms.canEdit,
        canDelete: perms.canDelete,
        canAdd: perms.canAdd,
      }));

      const featuresArray = Object.entries(featurePermissions).map(([feature, enabled]) => ({
        feature,
        enabled,
      }));

      await axios.post("/api/roles", {
        ...values,
        pages: pagesArray,
        features: featuresArray,
      });

      toast({
        title: "Role created successfully",
        description: `The "${values.name}" role has been created.`,
      });

      // Reset form
      form.reset();
      setPagePermissions(() => {
        const initial: Record<string, Record<string, boolean>> = {};
        ALL_PAGES.forEach((page) => {
          initial[page] = {
            canView: false,
            canEdit: false,
            canDelete: false,
            canAdd: false,
          };
        });
        return initial;
      });
      setFeaturePermissions(() => {
        const initial: Record<string, boolean> = {};
        ALL_FEATURES.forEach((feature) => {
          initial[feature] = false;
        });
        return initial;
      });

      onAdded();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error creating role:", error);
      toast({
        title: "Error creating role",
        description: error.response?.data?.error || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 z-[100] h-full overflow-y-scroll scrollbar-hide max-h-screen">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Role
          </DialogTitle>
          <DialogDescription>
            Define permissions and access levels for this role
          </DialogDescription>

        </DialogHeader>

        <Separator className="mt-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">ROLE DETAILS</h3>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter role name" />
                      </FormControl>
                      <FormDescription>
                        Choose a clear name that describes the responsibilities
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leadAccess"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Access Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lead access" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[100]">
                          <SelectItem className="hover:bg-accent" value="ALL">
                            <div className="flex items-center">
                              <span className="mr-2">All Leads</span>
                              <Badge variant="secondary" className="text-xs">Full Access</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem className="hover:bg-accent" value="ASSIGNED">
                            <div className="flex items-center">
                              <span className="mr-2">Assigned Leads</span>
                              <Badge variant="outline" className="text-xs">Limited</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem className="hover:bg-accent" value="TEAM">
                            <div className="flex items-center">
                              <span className="mr-2">Team Leads</span>
                              <Badge variant="outline" className="text-xs">Team View</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem className="hover:bg-accent" value="NONE">
                            <div className="flex items-center">
                              <span className="mr-2">No Access</span>
                              <Badge variant="destructive" className="text-xs">Restricted</Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Controls which leads this role can view and manage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Permissions Tabs */}
            <Tabs defaultValue="pages" className="mt-4">
              <TabsList className="grid w-full gap-2 grid-cols-2">
                <TabsTrigger value="pages" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Page Permissions
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Feature Access
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pages" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Access Control</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPageTemplate("viewOnly")}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPageTemplate("standard")}
                      className="flex items-center gap-1"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Standard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPageTemplate("full")}
                      className="flex items-center gap-1"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Full Access
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Page</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Create</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">View</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Edit</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_PAGES.map((page) => (
                        <tr key={page} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="p-3 text-sm font-medium">{page}</td>
                          <td className="text-center p-3">
                            <Checkbox
                              checked={pagePermissions[page].canAdd}
                              onCheckedChange={() => handleTogglePagePermission(page, "canAdd")}
                              className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                          </td>
                          <td className="text-center p-3">
                            <Checkbox
                              checked={pagePermissions[page].canView}
                              onCheckedChange={() => handleTogglePagePermission(page, "canView")}
                              className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                          </td>
                          <td className="text-center p-3">
                            <Checkbox
                              checked={pagePermissions[page].canEdit}
                              onCheckedChange={() => handleTogglePagePermission(page, "canEdit")}
                              className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                          </td>
                          <td className="text-center p-3">
                            <Checkbox
                              checked={pagePermissions[page].canDelete}
                              onCheckedChange={() => handleTogglePagePermission(page, "canDelete")}
                              className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ALL_FEATURES.map((feature) => (
                    <div
                      key={feature}
                      className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${featurePermissions[feature] ? "bg-primary/5 border-primary/20" : ""
                        }`}
                    >
                      <div className="space-y-1">
                        <Label className="font-medium">{feature}</Label>
                        <p className="text-xs text-muted-foreground">
                          {feature === "ExportCSV" && "Allow exporting data to CSV"}
                          {feature === "BulkEmail" && "Send emails to multiple contacts"}
                          {feature === "Analytics" && "Access to analytics dashboard"}
                        </p>
                      </div>
                      <Checkbox
                        checked={featurePermissions[feature]}
                        onCheckedChange={() => handleToggleFeaturePermission(feature)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>

        <Separator />

        <DialogFooter className="px-6 py-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="gap-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Role
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
