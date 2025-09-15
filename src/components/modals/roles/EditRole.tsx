"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { X, Eye, Shield, ShieldCheck, Save, Loader2 } from "lucide-react";

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
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface EditRoleProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    onEdited: () => void;
    role: RoleData | null;
    orgId: string;
}

interface PagePermission {
    page: string;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAdd: boolean;
}

interface FeaturePermission {
    feature: string;
    enabled: boolean;
}

interface RoleData {
    _id: string;
    name: string;
    leadAccess: string;
    pagePermissions: PagePermission[];
    featurePermissions: FeaturePermission[];
}

// Define constants
const ALL_PAGES = ["Leads", "Contacts", "Pipeline"];
const ALL_FEATURES = ["ExportCSV", "BulkEmail", "Analytics"];

// Form schema
const formSchema = z.object({
    name: z.string().min(1, "Role name is required"),
    leadAccess: z.enum(["ALL", "ASSIGNED", "TEAM", "NONE"]),
});

export default function EditRole({
    isOpen,
    setIsOpen,
    onEdited,
    role,
    orgId,
}: EditRoleProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([]);
    const [featurePermissions, setFeaturePermissions] = useState<FeaturePermission[]>([]);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            leadAccess: "ASSIGNED" as const,
        },
    });

    // Initialize form when role data changes
    useEffect(() => {
        if (role) {
            form.reset({
                name: role.name,
                leadAccess: role.leadAccess as any,
            });

            // Initialize page permissions
            const initialPagePerms: PagePermission[] = [...role.pagePermissions];

            // Ensure all pages are included
            ALL_PAGES.forEach(page => {
                if (!initialPagePerms.some(p => p.page === page)) {
                    initialPagePerms.push({
                        page,
                        canView: false,
                        canEdit: false,
                        canDelete: false,
                        canAdd: false
                    });
                }
            });

            setPagePermissions(initialPagePerms);

            // Initialize feature permissions
            const initialFeaturePerms: FeaturePermission[] = [...role.featurePermissions];

            // Ensure all features are included
            ALL_FEATURES.forEach(feature => {
                if (!initialFeaturePerms.some(f => f.feature === feature)) {
                    initialFeaturePerms.push({
                        feature,
                        enabled: false
                    });
                }
            });

            setFeaturePermissions(initialFeaturePerms);
        }
    }, [role, form]);

    const handleTogglePagePermission = (
        pageName: string,
        field: "canView" | "canEdit" | "canDelete" | "canAdd"
    ) => {
        setPagePermissions(prev =>
            prev.map(p =>
                p.page === pageName
                    ? { ...p, [field]: !p[field] }
                    : p
            )
        );
    };

    const handleToggleFeaturePermission = (featureName: string) => {
        setFeaturePermissions(prev =>
            prev.map(f =>
                f.feature === featureName
                    ? { ...f, enabled: !f.enabled }
                    : f
            )
        );
    };

    const handleSetPageTemplate = (template: "viewOnly" | "standard" | "full") => {
        setPagePermissions(prev =>
            prev.map(p => {
                switch (template) {
                    case "viewOnly":
                        return {
                            ...p,
                            canView: true,
                            canEdit: false,
                            canDelete: false,
                            canAdd: false
                        };
                    case "standard":
                        return {
                            ...p,
                            canView: true,
                            canEdit: true,
                            canDelete: false,
                            canAdd: true
                        };
                    case "full":
                        return {
                            ...p,
                            canView: true,
                            canEdit: true,
                            canDelete: true,
                            canAdd: true
                        };
                }
            })
        );
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!role) return;

        setIsSubmitting(true);
        try {
            await axios.patch(`/api/roles/${role._id}`, {
                ...values,
                pages: pagePermissions,
                features: featurePermissions,
                orgId,
            });

            toast({
                title: "Role updated",
                description: `The "${values.name}" role has been updated successfully.`,
            });

            onEdited();
            setIsOpen(false);
        } catch (error: any) {
            console.error("Error updating role:", error);
            toast({
                title: "Error updating role",
                description: error.response?.data?.error || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPermissionStatus = (pageName: string) => {
        const page = pagePermissions.find(p => p.page === pageName);
        if (!page) return { canView: false, canEdit: false, canDelete: false, canAdd: false };
        return page;
    };

    const getFeatureStatus = (featureName: string) => {
        const feature = featurePermissions.find(f => f.feature === featureName);
        if (!feature) return false;
        return feature.enabled;
    };

    if (!role) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-3xl z-[100] h-full overflow-y-scroll scrollbar-hide p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Edit Role
                    </DialogTitle>
                    <DialogDescription>
                        Customize role permissions and access levels
                    </DialogDescription>
                   
                </DialogHeader>

                <Separator className="mt-2" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-4">
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
                                                <SelectContent>
                                                    <SelectItem value="ALL">
                                                        <div className="flex items-center">
                                                            <span className="mr-2">All Leads</span>
                                                            <Badge variant="secondary" className="text-xs">Full Access</Badge>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="ASSIGNED">
                                                        <div className="flex items-center">
                                                            <span className="mr-2">Assigned Leads</span>
                                                            <Badge variant="outline" className="text-xs">Limited</Badge>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="TEAM"><div className="flex items-center">
                                                        <span className="mr-2">Team Leads</span>
                                                        <Badge variant="outline" className="text-xs">Team View</Badge>
                                                    </div>
                                                    </SelectItem>
                                                    <SelectItem value="NONE">
                                                        <div className="flex items-center">
                                                            <span className="mr-2">No Access</span>
                                                            <Badge variant="destructive" className="text-xs">Restricted</Badge>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Permissions Tabs */}
                        <Tabs defaultValue="pages" className="mt-4">
                            <TabsList className="grid w-full grid-cols-2">
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
                                            {ALL_PAGES.map((page) => {
                                                const permissions = getPermissionStatus(page);
                                                return (
                                                    <tr key={page} className="border-b hover:bg-muted/20 transition-colors">
                                                        <td className="p-3 text-sm font-medium">{page}</td>
                                                        <td className="text-center p-3">
                                                            <Checkbox
                                                                checked={permissions.canAdd}
                                                                onCheckedChange={() => handleTogglePagePermission(page, "canAdd")}
                                                                className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                            />
                                                        </td>
                                                        <td className="text-center p-3">
                                                            <Checkbox
                                                                checked={permissions.canView}
                                                                onCheckedChange={() => handleTogglePagePermission(page, "canView")}
                                                                className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                            />
                                                        </td>
                                                        <td className="text-center p-3">
                                                            <Checkbox
                                                                checked={permissions.canEdit}
                                                                onCheckedChange={() => handleTogglePagePermission(page, "canEdit")}
                                                                className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                            />
                                                        </td>
                                                        <td className="text-center p-3">
                                                            <Checkbox
                                                                checked={permissions.canDelete}
                                                                onCheckedChange={() => handleTogglePagePermission(page, "canDelete")}
                                                                className="mx-auto data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            <TabsContent value="features" className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ALL_FEATURES.map((feature) => {
                                        const isEnabled = getFeatureStatus(feature);
                                        return (
                                            <div
                                                key={feature}
                                                className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${isEnabled ? "bg-primary/5 border-primary/20" : ""
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
                                                    checked={isEnabled}
                                                    onCheckedChange={() => handleToggleFeaturePermission(feature)}
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                />
                                            </div>
                                        );
                                    })}
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
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
