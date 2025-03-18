"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/userContext";
import { useToast } from "@/hooks/use-toast";
import { Meteors } from "@/components/ui/meteors";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Home, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";



export default function LoginPage() {
    const router = useRouter();
    const { user, loading, fetchUser } = useUserContext();
    const { toast } = useToast();

    // // If user already logged in, redirect
    // useEffect(() => {
    //     if (!loading && user) {
    //         router.replace("/CRM/dashboard");
    //     }
    // }, [user, loading, router]);

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async () => {
        // Basic checks
        if (!form.email || !form.password) {
            setError("Please fill in both email and password.");
            return;
        }
        setError("");
        try {
            setIsSubmitting(true);
            const res = await axios.post("/api/auth/login", form);
            if (res.status === 200) {
                await fetchUser();
                toast({
                    title: "Login successful",
                    description: "Redirecting to dashboard...",
                    variant: "default",
                });
                router.replace("/CRM/dashboard");
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || "Invalid credentials";
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

    // If user is present or still loading
    if (loading || user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center m-auto h-screen bg-[#04071F] overflow-hidden">
            {/* Meteor animation behind the card */}
            <Meteors number={30} />

            <Card className="relative z-10 w-full max-w-md p-6 bg-black  text-white">

                <CardHeader>

                    <div className="flex  justify-center">
                        <img src="/logo.png" className="h-7    " alt="Logo" />
                    </div>
                    {/* <h1 className="text-center font-bold  text-xl">Login</h1> */}
                    <p className="text-neutral-600 text-sm font-bold text-center max-w-sm mt-2 dark:text-neutral-300">
                        Get Started
                    </p>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 mb-3">{error}</p>}
                    <div className="space-y-3">
                        <Input
                            label="Email"
                            type="email"
                            className="w-full p-2 rounded  focus:outline-none"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <Input
                            label="Password"
                            type="password"
                            className="w-full p-2 rounded  focus:outline-none"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <button
                        onClick={handleLogin}
                        disabled={isSubmitting}
                        className="bg-[#815bf5] w-full p-2 text-sm rounded text-white hover:bg-[#5f31e9]"
                    >
                        {isSubmitting ? "Logging In..." : "Login"}
                    </button>
                    <div className="p-4 flex justify-center">
                        <Link href="/signup" className="text-center hover:underline mt-2">
                            Not a <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold">Zapllonian</span>? Register Here
                        </Link>
                    </div>
                    <div className="text-center">
                        <Link href="/forgetPassword" className="hover:underline">
                            Forgot your password?
                        </Link>
                    </div>
                    <p className="text-xs text-center mt-2">
                        By clicking continue, you agree to our {" "}
                        <a href="/terms" className="underline text-blue-400">
                            Terms of Service
                        </a> {" "}
                        and {" "}
                        <a href="/privacypolicy" className="underline text-blue-400">
                            Privacy Policy
                        </a>.
                    </p>
                    <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
                    <div className="flex justify-center gap-2">
                        <div className="mt-[6px] scale-125">
                            <Home />
                        </div>
                        <Link href='/'>
                            <h1 className="hover:underline cursor-pointer">Back to Home</h1>
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
