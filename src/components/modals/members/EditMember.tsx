"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { X, User, Mail, Shield, BadgeCheck, Phone, Check, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Member {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: any;
    organization: string;
    whatsappNo?: string;
    isOrgAdmin?: boolean;
}

interface Role {
    _id: string;
    name: string;
}

interface EditMemberProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    onEdited: () => void;
    member: Member | null;
    orgId: string;
}

const formSchema = z.object({
    firstName: z.string().min(2, { message: "First name is required" }),
    lastName: z.string().min(2, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    roleId: z.string().optional(),
    whatsappNo: z.string().optional(),
    isOrgAdmin: z.boolean().default(false),
    // Optional password field (only set if user is changing it)
    password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditMember({
    isOpen,
    setIsOpen,
    onEdited,
    member,
    orgId,
}: EditMemberProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            roleId: "",
            whatsappNo: "",
            isOrgAdmin: false,
            password: undefined,
        },
    });

    useEffect(() => {
        if (isOpen && member) {
            form.reset({
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                roleId: member.role?._id || "",
                whatsappNo: member.whatsappNo || "",
                isOrgAdmin: member.isOrgAdmin || false,
            });
            fetchRoles();
        }
    }, [isOpen, member, form]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get<Role[]>("/api/roles");
            setRoles(response.data);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
            toast({
                title: "Error loading roles",
                description: "Could not load team roles. Please try again.",
                variant: "destructive",
            });
        }
    };

    const onSubmit = async (data: FormValues) => {
        if (!member) return;

        setIsSubmitting(true);
        try {
            const payload: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                roleId: data.roleId || null,
                whatsappNo: data.whatsappNo,
                isOrgAdmin: data.isOrgAdmin,
                orgId,
            };

            // Only include password if it's been set
            if (data.password) {
                payload.password = data.password;
            }

            await axios.patch(`/api/members/${member._id}`, payload);

            toast({
                title: "Member updated",
                description: `${data.firstName} ${data.lastName}'s information has been updated.`,
            });

            onEdited();
            setIsOpen(false);
        } catch (error: any) {
            console.error("Failed to update member:", error);
            toast({
                title: "Failed to update member",
                description: error.response?.data?.error || "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get initials for avatar
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    if (!member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md z-[100]  h-screen p-0 overflow-y-scroll scrollbar-hide">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-xl font-semibold flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        Edit Team Member
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Update member details and access permissions
                    </DialogDescription>
                  
                </DialogHeader>

                <div className="px-6 py-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-16 w-16 border text-lg">
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(member.firstName, member.lastName)}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <h3 className="font-medium text-lg">{member.firstName} {member.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                    </div>
                </div>

                <Separator />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="px-6  space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="First name"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Last name"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="Email address"
                                                className="pl-10"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field: { onChange, ...rest } }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="Leave blank to keep current password"
                                                className="pl-10"
                                                onChange={onChange}
                                                {...rest}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-xs text-muted-foreground">
                                        Only fill this if you want to change the password
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="roleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <div className="relative">
                                                <BadgeCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <SelectTrigger className="w-full pl-10">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </div>
                                        </FormControl>
                                        <SelectContent className="z-[100]">
                                            <SelectItem value="No Role">No Role</SelectItem>
                                            {roles.map((role) => (
                                                <SelectItem className="hover:bg-accent" key={role._id} value={role._id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="whatsappNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp Number</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="WhatsApp number (optional)"
                                                className="pl-10"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isOrgAdmin"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-6">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Administrator Access</FormLabel>
                                        <FormDescription>
                                            Grant full access to manage the organization
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <Separator />

                <DialogFooter className="px-6 py-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="mr-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin h-5 text-primary" /> Saving Changes...</>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" /> Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}