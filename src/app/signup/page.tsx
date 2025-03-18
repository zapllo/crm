"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useUserContext } from "@/contexts/userContext"; // from your earlier snippet
import { Meteors } from "@/components/ui/meteors";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// import Loader from "@/components/ui/loader"; // Replace with your own loader

export default function SignupPage() {
    const router = useRouter();
    const { user, loading } = useUserContext();
    const { toast } = useToast();

    // If user is logged in, redirect to /CRM/dashboard
    useEffect(() => {
        if (!loading && user) {
            router.replace("/CRM/dashboard");
        }
    }, [loading, user, router]);

    const [step, setStep] = useState<"user" | "org">("user");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        // user fields
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        whatsappNo: "",
        // org fields
        companyName: "",
        industry: "",
        teamSize: "",
        description: "",
        country: "IN",
        categories: [] as string[],
    });

    const handleNextStep = () => {
        // Basic validation
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
            setError("Please fill all required User fields.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setStep("org");
        setError("");
    };

    const handleSubmit = async () => {
        // Basic validation for org
        if (!formData.companyName) {
            setError("Company name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const res = await axios.post("/api/auth/signup", formData);
            // server sets the HttpOnly cookie, we just verify success
            if (res.status === 200) {
                toast({
                    title: "Signup successful",
                    description: "Redirecting to Lead Dashboard",
                    variant: "default", // or "success" if you have a custom variant
                });
                router.replace("/CRM/leads");
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || "Signup failed";
            setError(msg);
            toast({
                title: "Error",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // If user is present or still checking, show a loader
    if (loading || user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-6 text-primary h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center h-screen bg-[#04071F] overflow-hidden">
            {/* Meteor animation behind the card */}
            <Meteors number={30} />

            <Card className="relative z-10 w-full max-w-md p-6 bg-black  text-white">

                <CardHeader>
                    <div className="flex justify-center">
                        <img src="/logo.png" className="h-7" alt="Logo" />
                    </div>
                    <h1 className="text-center font-bold mt-2 text-3xl">Start Free Trial</h1>
                    <p className="text-neutral-600 text-sm font-bold text-center max-w-sm mt-2 dark:text-neutral-300">
                        Let’s get started by filling up the form below
                    </p>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 mb-3">{error}</p>}

                    {step === "user" ? (
                        <div className="space-y-3">
                            {/* firstName, lastName, email, password, confirmPassword, whatsappNo */}
                            <Input
                                label="First Name"
                                className="w-full p-2 rounded  focus:outline-none"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <Input
                                label="Last Name"
                                className="w-full p-2 rounded  focus:outline-none"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                            <Input
                                label="Email"
                                type="email"
                                className="w-full p-2 rounded  focus:outline-none"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input
                                label="Password"
                                type="password"
                                className="w-full p-2 rounded  focus:outline-none"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                className="w-full p-2 rounded  focus:outline-none"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                            <Input
                                label="WhatsApp Number"
                                className="w-full p-2 rounded  focus:outline-none"
                                value={formData.whatsappNo}
                                onChange={(e) => setFormData({ ...formData, whatsappNo: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Input
                                label="Company Name"
                                className="w-full p-2 rounded focus:outline-none"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                            <Input
                                label="Industry"
                                className="w-full p-2 rounded  focus:outline-none"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            />
                            <Input
                                label="Team Size"
                                className="w-full p-2 rounded focus:outline-none"
                                value={formData.teamSize}
                                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                            />
                            <Textarea
                                placeholder="Description"
                                rows={3}
                                className="w-full p-2 rounded  focus:outline-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    {step === "user" ? (
                        <button
                            onClick={handleNextStep}
                            className="bg-[#815bf5] p-2 w-full rounded text-white hover:bg-[#5f31e9]"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="bg-[#815bf5] w-full p-2 rounded text-white hover:bg-[#5f31e9]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing Up..." : "Sign Up"}
                        </button>
                    )}
                    <button
                        onClick={() => router.push("/login")}
                        className="text-sm text-blue-400 hover:underline self-center"
                    >
                        Already have an account? Login
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
}
