"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/userContext";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Home, Loader2, Mail, Lock, CheckIcon, BarChart3, Users, ClipboardList, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

export default function LoginPage() {
    const router = useRouter();
    const { user, loading, fetchUser } = useUserContext();
    const { toast } = useToast();

    // ... existing state and handlers ...
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add state to track when user has successfully logged in but is still seeing loader
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        // If user exists and we're not in the "logging in" state, redirect to dashboard
        if (!loading && user && !isLoggingIn) {
            router.replace("/overview");
        }
    }, [user, loading, router, isLoggingIn]);

    const handleLogin = async () => {
        // Basic checks
        if (!form.email || !form.password) {
            setError("Please fill in both email and password.");
            toast({
                title: "Missing information",
                description: "Please fill in both email and password.",
                variant: "destructive",
            });
            return;
        }
        setError("");
        try {
            setIsSubmitting(true);
            const res = await axios.post("/api/auth/login", form);
            if (res.status === 200) {
                // Set logging in state to true, which will prevent immediate redirect
                setIsLoggingIn(true);
                
                // Fetch user data
                await fetchUser();
                
                toast({
                    title: "Welcome back! 🎉",
                    description: "Login successful. Preparing your dashboard...",
                    variant: "default",
                });
                
                // Set a timeout to delay the redirect
                setTimeout(() => {
                    setIsLoggingIn(false); // This will trigger the redirect in the useEffect
                }, 3000); // 3-second delay
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
            <div className="h-screen bg-[#04071F] flex items-center  justify-center overflow-hidden relative">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-[#815bf5] rounded-full filter blur-[80px] opacity-20 animate-pulse"
                        style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#FC8929] rounded-full filter blur-[90px] opacity-15 animate-pulse"
                        style={{ animationDuration: '6s' }} />
                    <div className="absolute top-2/3 left-1/2 w-48 h-48 bg-[#9f75ff] rounded-full filter blur-[70px] opacity-20 animate-pulse"
                        style={{ animationDuration: '5s' }} />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Logo with subtle animation */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-10"
                    >
                        <img src="/logo.png" className="h-12" alt="Zapllo Logo" />
                    </motion.div>

                    {/* Primary loading animation */}
                    <div className="relative flex items-center justify-center mb-8">
                        <svg className="w-24 h-24" viewBox="0 0 100 100">
                            {/* Outer circle */}
                            <circle
                                cx="50" cy="50" r="40"
                                stroke="rgba(129, 91, 245, 0.1)"
                                strokeWidth="4"
                                fill="none"
                            />
                            {/* Animated progress circle */}
                            <motion.circle
                                cx="50" cy="50" r="40"
                                stroke="url(#gradientStroke)"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, rotate: 0 }}
                                animate={{
                                    pathLength: [0, 0.5, 1],
                                    rotate: 360
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{
                                    rotate: "0 0 0 0 50 50",
                                    transformOrigin: "center"
                                }}
                            />
                            {/* Gradient definition */}
                            <defs>
                                <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#815bf5" />
                                    <stop offset="100%" stopColor="#FC8929" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Center pulse element */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="w-10 h-10 bg-gradient-to-br from-[#815bf5] to-[#9f75ff] rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    </div>

                    {/* Loading message */}
                    <motion.div
                        animate={{
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-center"
                    >
                        <h3 className="text-white font-medium text-xl mb-2">Preparing Your Dashboard</h3>
                        <p className="text-[#a29bfe] text-sm max-w-xs text-center">
                            Loading your personalized CRM experience. Just a moment...
                        </p>
                    </motion.div>

                    {/* Loading steps indication */}
                    <div className="mt-8 flex space-x-2">
                        {[0, 1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-[#815bf5] rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>

                    {/* Helpful tips that cycle */}
                    <motion.div
                        className="mt-10 max-w-sm text-center px-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                    >
                        <AnimatePresence mode="wait">
                            {[
                                "Zapllo helps you convert 35% more leads on average",
                                "Use automation tools to save up to 12 hours per week",
                                "Track your team's performance with real-time analytics",
                                "Customize your dashboard for optimal productivity"
                            ].map((tip, index) => (
                                <motion.p
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-white/60 text-sm font-light"
                                    style={{
                                        display: Math.floor((Date.now() / 3000) % 4) === index ? 'block' : 'none'
                                    }}
                                >
                                    <span className="text-[#FC8929]">TIP:</span> {tip}
                                </motion.p>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        );
    }

    const FeatureItem = ({ text }: { text: string }) => (
        <div className="flex items-start gap-2">
            <div className="mt-0.5 bg-[#815bf5]/20 p-1 rounded-full">
                <CheckIcon className="h-3 w-3 text-[#815bf5]" />
            </div>
            <span className="text-zinc-400">{text}</span>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-y-scroll justify-center bg-[#04071F] overflow-hidden">
            {/* Left Section - Product Information */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#815bf5] rounded-full filter blur-[120px] opacity-30" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC8929] rounded-full filter blur-[120px] opacity-30" />
            <div className="hidden md:flex   relative p-10 flex-col h-screen m-auto    justify-center overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#815bf5] rounded-full filter blur-[120px] opacity-30" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC8929] rounded-full filter blur-[120px] opacity-30" />

                {/* Content */}
                <div className="relative z-10  mt-4 mx-auto h-screen overflow-y-scroll w-full scrollbar-hide  ">
                    <img src="/logo.png" className="h-10 mb-8" alt="Logo" />

                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#815bf5] to-[#FC8929]">
                                Transform your business with Zapllo CRM
                            </h1>
                            <p className="text-white/70 text-xl mt-4">
                                The all-in-one solution to manage leads, build relationships, and close more deals.
                            </p>
                        </motion.div>
                    </div>

                    <Tabs defaultValue="features" className="w-full mt-2">
                        <TabsList className="bg-white/5 border gap-4 border-white/10">
                            <TabsTrigger value="features" className="border-none">Features</TabsTrigger>
                            <TabsTrigger value="testimonials" className="border-none">Testimonials</TabsTrigger>
                            <TabsTrigger value="stats" className="border-none">Stats</TabsTrigger>
                        </TabsList>
                        <TabsContent value="features" className="mt-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 gap-5"
                            >
                                <FeatureCard
                                    icon={<BarChart3 className="h-6 w-6 text-[#FC8929]" />}
                                    title="Powerful Analytics"
                                    description="Gain valuable insights with real-time data visualization and customizable dashboards."
                                />
                                <FeatureCard
                                    icon={<Users className="h-6 w-6 text-[#815bf5]" />}
                                    title="Lead Management"
                                    description="Track and nurture leads through your sales pipeline with automated workflows."
                                />
                                <FeatureCard
                                    icon={<Zap className="h-6 w-6 text-[#FC8929]" />}
                                    title="Automation Tools"
                                    description="Save hours with smart triggers and actions that run your business on autopilot."
                                />
                            </motion.div>
                        </TabsContent>
                        <TabsContent value="testimonials" className="mt-6">
                            <Carousel className="w-full">
                                <CarouselContent>
                                    <CarouselItem>
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                                            <p className="text-white/80 italic">"Zapllo transformed our sales process. We've increased conversions by 45% in just three months."</p>
                                            <div className="mt-4 flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-[#815bf5]/20 flex items-center justify-center">
                                                    <span className="text-[#815bf5] font-bold">JD</span>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-white font-medium">Jane Doe</p>
                                                    <p className="text-white/60 text-sm">Sales Director, TechCorp</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                    <CarouselItem>
                                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                                            <p className="text-white/80 italic">"The automation features alone saved our team 20 hours per week. Best investment we've made."</p>
                                            <div className="mt-4 flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-[#FC8929]/20 flex items-center justify-center">
                                                    <span className="text-[#FC8929] font-bold">MS</span>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-white font-medium">Mark Smith</p>
                                                    <p className="text-white/60 text-sm">CEO, GrowthStarters</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                </CarouselContent>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </Carousel>
                        </TabsContent>
                        <TabsContent value="stats" className="mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard value="35%" label="Average Increase in Sales" />
                                <StatCard value="68%" label="More Leads Converted" />
                                <StatCard value="12hrs" label="Time Saved Weekly" />
                                <StatCard value="24/7" label="Premium Support" />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="pt-6">
                        <p className="text-white/60 flex items-center">
                            <CheckIcon className="h-4 w-4 mr-2 text-[#815bf5]" />
                            Trusted by 20,000+ businesses worldwide
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full md:w-1/2  h-screen m-auto flex items-center justify-center p-6 relative">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none md:hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#815bf5] rounded-full filter blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC8929] rounded-full filter blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full  h-screen m-auto flex items-center justify-center max-w-4xl  overflow-y-scroll scrollbar-hide z-10"
                >
                    <Card className="relative border-none h-  overflow-y-scroll scrollbar-hide bg-background/60 backdrop-blur-xl shadow-2xl text-white overflow-hidden">
                        {/* <div className="absolute top-0 left-0 right-0">
                            <Progress value={100} className="h-1 bg-muted-800" />
                        </div> */}

                        <CardHeader className="pt-6">
                            <div className="flex justify-center mb-5 md:hidden">
                                <img src="/logo.png" className="h-7" alt="Logo" />
                            </div>
                            <div className="flex items-center justify-center text-3xl ">
                                <h1 className="text-center font-bold mt-2 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                                    Welcome Back
                                </h1>
                                👋
                            </div>
                            <p className="text-zinc-400 text-sm text-center mt-2">
                                Enter your credentials to access your account
                            </p>
                        </CardHeader>

                        <CardContent className="px-6 pb-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                        <Input
                                            placeholder="Work Email"
                                            type="email"
                                            className="pl-10 placeholder:text-muted-foreground bg-transparent border focus-visible:ring-[#815bf5]"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                        <Input
                                            placeholder="Password"
                                            type="password"
                                            className="pl-10 placeholder:text-muted-foreground bg-transparent border focus-visible:ring-[#815bf5]"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleLogin();
                                            }}
                                        />
                                    </div>

                                    <div className="text-right">
                                        <Link
                                            href="/forgetPassword"
                                            className="text-sm text-[#815bf5] hover:text-[#9f75ff] transition-colors"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 pb-8 px-6">
                            <Button
                                onClick={handleLogin}
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-[#815bf5] to-[#9f75ff] hover:from-[#6842e3] hover:to-[#815bf5] transition-all duration-300 text-white font-medium"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            <div className="pt-2 text-center">
                                <p className="text-sm text-zinc-400">
                                    Not a{" "}
                                    <span className="bg-gradient-to-r from-[#815BF5] via-[#FC8929] to-[#FC8929] bg-clip-text text-transparent font-bold">
                                        Zapllonian
                                    </span>?{" "}
                                    <Link href="/signup" className="text-[#815bf5] hover:text-[#9f75ff] font-medium transition-colors">
                                        Register Here
                                    </Link>
                                </p>
                            </div>

                            <div className="w-full mt-4">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-full border-t border"></div>
                                    <div className="relative bg-black px-4 text-xs text-zinc-500">BENEFITS</div>
                                </div>
                                <div className="flex justify-center ">
                                    <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                                        <FeatureItem text="Free 7-day trial" />
                                        <FeatureItem text="Unlimited leads" />
                                        <FeatureItem text="CRM automation" />
                                        <FeatureItem text="Premium support" />
                                    </div>
                                </div>
                            </div>

                            <Link href="/" className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
                                <Home size={16} />
                                Back to Home
                            </Link>

                            <p className="text-xs text-center text-zinc-600">
                                🔒 We care about your privacy
                                <a href="/terms" className="text-zinc-400 hover:text-[#815bf5] transition-colors">
                                    {" "}  (Terms of Service
                                </a>{" "}
                                &{" "}
                                <a href="/privacypolicy" className="text-zinc-400 hover:text-[#815bf5] transition-colors">
                                    Privacy Policy)
                                </a>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

// Component for feature cards on the left side
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/5 border border-white/10 p-5 rounded-xl flex gap-4 transition-all hover:border-[#815bf5]/40"
    >
        <div className="bg-white/5 p-3 rounded-lg h-fit">
            {icon}
        </div>
        <div>
            <h3 className="font-medium text-white text-lg">{title}</h3>
            <p className="text-white/70 mt-1">{description}</p>
        </div>
    </motion.div>
);

// Component for statistics cards
const StatCard = ({ value, label }: { value: string, label: string }) => (
    <motion.div
        whileHover={{ scale: 1.03 }}
        className="bg-white/5 border border-white/10 p-4 rounded-xl text-center"
    >
        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#815bf5] to-[#FC8929]">
            {value}
        </h3>
        <p className="text-white/70 mt-1 text-sm">{label}</p>
    </motion.div>
);