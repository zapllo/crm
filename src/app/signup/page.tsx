"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUserContext } from "@/contexts/userContext";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
    Loader2, User, Building2, ChevronRight, ArrowLeft, Mail, Lock,
    CheckIcon, Phone, Home, BarChart3, Users, ClipboardList, Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { countries } from "countries-list";
import ReactCountryFlag from "react-country-flag";

export default function SignupPage() {
    const router = useRouter();
    const { user, loading } = useUserContext();
    const { toast } = useToast();

    // If user is logged in, redirect to /CRM/dashboard
    useEffect(() => {
        if (!loading && user) {
            router.replace("/overview");
        }
    }, [loading, user, router]);

    const [step, setStep] = useState<"user" | "org">("user");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(50);

    // Animated progress
    useEffect(() => {
        setProgress(step === "user" ? 50 : 100);
    }, [step]);

    const industryOptions = [
        "Retail/E-Commerce",
        "Technology",
        "Service Provider",
        "Healthcare(Doctors/Clinics/Physicians/Hospital)",
        "Logistics",
        "Financial Consultants",
        "Trading",
        "Education",
        "Manufacturing",
        "Real Estate/Construction/Interior/Architects",
        "Other",
    ];

    const teamSizeOptions = [
        "1-10",
        "11-20",
        "21-30",
        "31-50",
        "51+"
    ];

    const [formData, setFormData] = useState({
        // user fields
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        whatsappNo: "",
        // org fields
        countryCode: "+91",
        companyName: "",
        industry: "",
        teamSize: "",
        description: "",
        country: "IN",
        categories: [] as string[],
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNextStep = () => {
        // Basic validation
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
            setError("Please fill all required user fields");
            toast({
                title: "Missing information",
                description: "Please fill all required user fields",
                variant: "destructive",
            });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            toast({
                title: "Password mismatch",
                description: "Make sure both passwords match",
                variant: "destructive",
            });
            return;
        }
        setStep("org");
        setError("");
    };

    const handleSubmit = async () => {
        // Basic validation for org
        if (!formData.companyName || !formData.industry || !formData.teamSize || !formData.description) {
            setError("All organization fields are required");
            toast({
                title: "Missing information",
                description: "Please fill all required organization fields",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const res = await axios.post("/api/auth/signup", formData);
            // server sets the HttpOnly cookie, we just verify success
            if (res.status === 200) {
                toast({
                    title: "Welcome to Zapllo! 🎉",
                    description: "Your account has been created successfully!",
                    variant: "default",
                });
                router.replace("/overview");
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
            <div className="h-screen bg-[#04071F] flex items-center justify-center overflow-hidden relative">
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
                        <h3 className="text-white font-medium text-xl mb-2">Preparing Your Account</h3>
                        <p className="text-[#a29bfe] text-sm max-w-xs text-center">
                            Setting up your Zapllo experience. Just a moment...
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
        <div className="flex flex-col md:flex-row h-screen scrollbar-hide bg-[#04071F] ">
            {/* Left Section - Product Information */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#815bf5] rounded-full filter blur-[120px] opacity-30" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC8929] rounded-full filter blur-[120px] opacity-30" />
            <div className="hidden md:flex md:w-1/2 relative p-10 flex-col justify-center ">
                {/* Background effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#815bf5] rounded-full filter blur-[120px] opacity-30" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC8929] rounded-full filter blur-[120px] opacity-30" />

                {/* Content */}
                <div className="relative z-10  mt-4 mx-auto h-screen overflow-y-scroll scrollbar-hide   ">
                    <img src="/logo.png" className="h-10 mb-8" alt="Logo" />

                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* <img src="/logo.png" className="h-10 mb-8" alt="Logo" />/ */}
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#815bf5] flex items-center to-[#FC8929]">
                                Start your journey with Zapllo CRM <img src='/icons/rocket.png' className="h-14"/>
                                
                               
                            </h1>
                            <p className="text-white/70 text-xl mt-4">
                                Join thousands of businesses growing their revenue with our powerful CRM platform.
                            </p>
                        </motion.div>
                    </div>

                    <Tabs defaultValue="features" className="w-full ">
                        <TabsList className="bg-white/5 border border-white/10 gap-4 mt-4">
                            <TabsTrigger className="border-none" value="features">Features</TabsTrigger>
                            <TabsTrigger className="border-none" value="testimonials">Success Stories</TabsTrigger>
                            <TabsTrigger className="border-none" value="support">Support</TabsTrigger>
                        </TabsList>
                        <TabsContent value="features" className="mt-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 gap-5"
                            >
                                <FeatureCard
                                    icon={<BarChart3 className="h-6 w-6 text-[#FC8929]" />}
                                    title="360° Customer View"
                                    description="Access complete customer history, interactions, and preferences in one place."
                                />
                                <FeatureCard
                                    icon={<Users className="h-6 w-6 text-[#815bf5]" />}
                                    title="Team Collaboration"
                                    description="Work seamlessly with your team on deals, tasks, and customer relationships."
                                />
                                <FeatureCard
                                    icon={<Zap className="h-6 w-6 text-[#FC8929]" />}
                                    title="Sales Pipeline Automation"
                                    description="Automate follow-ups and task assignments based on deal progression."
                                />
                            </motion.div>
                        </TabsContent>
                        <TabsContent value="testimonials" className="mt-6 space-y-4">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                                <p className="text-white/80 italic">"We increased our sales conversion rate by 45% within just two months of using Zapllo."</p>
                                <div className="mt-4 flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#815bf5]/20 flex items-center justify-center">
                                        <span className="text-[#815bf5] font-bold">AJ</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-white font-medium">Alex Johnson</p>
                                        <p className="text-white/60 text-sm">VP Sales, GrowthTech Inc.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                                <p className="text-white/80 italic">"Zapllo's automation tools saved our team 15 hours per week in manual follow-ups."</p>
                                <div className="mt-4 flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#FC8929]/20 flex items-center justify-center">
                                        <span className="text-[#FC8929] font-bold">SP</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-white font-medium">Sarah Parker</p>
                                        <p className="text-white/60 text-sm">Sales Director, CloudSolutions</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="support" className="mt-6">
                            <div className="space-y-5">
                                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                                    <h3 className="text-white font-medium text-lg mb-2">24/7 Premium Support</h3>
                                    <p className="text-white/70">Our dedicated support team is ready to help you succeed with Zapllo.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                                        <h4 className="text-white font-medium">Implementation</h4>
                                        <p className="text-white/70 text-sm">Expert setup assistance</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                                        <h4 className="text-white font-medium">Training</h4>
                                        <p className="text-white/70 text-sm">Live workshops & tutorials</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="pt-6 space-y-4">
                        <p className="text-white/60 flex items-center">
                            <CheckIcon className="h-4 w-4 mr-2 text-[#815bf5]" />
                            Free 7-day trial, no credit card required
                        </p>
                        <div className="flex -space-x-2">
                            {[
                                '/avatars/female1.jpg',
                                '/avatars/man2.jpg',
                                '/avatars/man4.jpg',
                                '/avatars/female2.jpg',
                            ].map((avatar, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full border-2 border-[#04071F] bg-gradient-to-br from-[#815bf5]/20 to-[#FC8929]/20 overflow-hidden"
                                >
                                    <img
                                        src={avatar}
                                        alt={`User ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback to colored circles if images fail to load
                                            const colors = ['#815bf5', '#9f75ff', '#FC8929', '#6842e3'];
                                            const target = e.target as HTMLImageElement;
                                            target.style.visibility = 'hidden';
                                            target.parentElement!.style.backgroundColor = colors[i];
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-white/60 text-sm">Trusted by 20000+ businesses worldwide</p>
                    </div>
                </div>
            </div>

            {/* Right Section - Sign Up Form */}
            <div className="w-full md:w-1/2 mt-4 flex items-center h-screen overflow-y-scroll scrollbar-hide justify-center p-4 md:p-6 relative">
     
                {/* Decorative background elements for mobile */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none md:hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#815bf5] rounded-full filter blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FC8929] rounded-full filter blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md h-screen z-10"
                >
                    <Card className="relative border-none  bg-background/60 backdrop-blur-xl shadow-2xl text-white scrollbar-hide">
                        <div className="absolute top-0 left-0 right-0">
                            <Progress value={progress} className="h-1 bg-muted-800" />
                        </div>

                        <CardHeader className="pt-6">
                            <div className="flex justify-center mb-5 md:hidden">
                                <img src="/logo.png" className="h-7" alt="Logo" />
                            </div>
                            <h1 className="text-center font-bold mt-2 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                                {step === "user" ? "Create Your Account" : "Company Details"}
                            </h1>
                            <p className="text-zinc-400 text-sm text-center mt-2">
                                {step === "user"
                                    ? "Enter your details to get started with Zapllo"
                                    : "Tell us about your organization"}
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
                                {step === "user" ? (
                                    <motion.div
                                        key="user-form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                                <Input
                                                    placeholder="First Name"
                                                    className="pl-10 placeholder:text-muted-foreground bg-transparent border focus-visible:ring-[#815bf5]"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Last Name"
                                                    className="bg-transparent placeholder:text-muted-foreground border focus-visible:ring-[#815bf5]"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                            <Input
                                                placeholder="Work Email"
                                                type="email"
                                                className="pl-10 placeholder:text-muted-foreground bg-transparent border focus-visible:ring-[#815bf5]"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                            />
                                        </div>

                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                            <Input
                                                placeholder="Password"
                                                type="password"
                                                className="pl-10 placeholder:text-muted-foreground bg-transparent border focus-visible:ring-[#815bf5]"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange("password", e.target.value)}
                                            />
                                            <div className="text-xs text-zinc-500 mt-1 ml-1">
                                                Min. 6 characters with letters & numbers
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                            <Input
                                                placeholder="Confirm Password"
                                                type="password"
                                                className="pl-10 placeholder:text-muted-foreground bg-transparent border focus-visible:ring-[#815bf5]"
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                            />
                                        </div>

                                        {/* Phone input with country code */}
                                        <div className="relative">
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">WhatsApp Number</label>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={formData.country}
                                                        onValueChange={(value) => handleInputChange("country", value)}
                                                    >
                                                        <SelectTrigger className="w-fit bg-transparent border focus:ring-[#815bf5]">
                                                            <div className="flex items-center gap-2">
                                                                <SelectValue placeholder="Select Country" />
                                                            </div>
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-[200px]">
                                                            {Object.entries(countries).map(([code, data]) => (
                                                                <SelectItem key={code} value={code} className="hover:bg-accent focus:bg-white-800">
                                                                    <div className="flex items-center gap-2">
                                                                        <ReactCountryFlag
                                                                            countryCode={code}
                                                                            svg
                                                                            style={{
                                                                                width: '1em',
                                                                                height: '1em',
                                                                                marginRight: '0.5em'
                                                                            }}
                                                                        />
                                                                        <span>{code}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        placeholder="WhatsApp Number"
                                                        className="flex-1 w-full placeholder:text-muted-foreground bg-transparent border focus-visible:ring-[#815bf5]"
                                                        value={formData.whatsappNo}
                                                        onChange={(e) => handleInputChange("whatsappNo", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="org-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4 "
                                    >
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                            <Input
                                                placeholder="Company Name"
                                                className="pl-10 placeholder:text-muted-foreground bg-transparent border focus-visible:ring-[#815bf5]"
                                                value={formData.companyName}
                                                onChange={(e) => handleInputChange("companyName", e.target.value)}
                                            />
                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <Select
                                                            value={formData.industry}
                                                            onValueChange={(value) => handleInputChange("industry", value)}
                                                        >
                                                            <SelectTrigger className="w-full bg-transparent border focus:ring-[#815bf5]">
                                                                <SelectValue placeholder="Select Industry" />
                                                            </SelectTrigger>
                                                            <SelectContent className="border">
                                                                {industryOptions.map((option) => (
                                                                    <SelectItem key={option} value={option}>
                                                                        {option}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-zinc-300 border">
                                                    <p>Select the industry your company operates in</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <Select
                                                            value={formData.teamSize}
                                                            onValueChange={(value) => handleInputChange("teamSize", value)}
                                                        >
                                                            <SelectTrigger className="w-full bg-transparent border focus:ring-[#815bf5]">
                                                                <SelectValue placeholder="Team Size" />
                                                            </SelectTrigger>
                                                            <SelectContent className="border">
                                                                {teamSizeOptions.map((option) => (
                                                                    <SelectItem key={option} value={option}>
                                                                        {option}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-zinc-300 border">
                                                    <p>How many people work at your company?</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <Textarea
                                            placeholder="Describe your business in a few words..."
                                            rows={3}
                                            className="bg-transparent placeholder:text-muted-foreground text-sm border focus-visible:ring-[#815bf5] resize-none"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                        />

                                        <Select
                                            value={formData.country}
                                            onValueChange={(value) => handleInputChange("country", value)}
                                        >
                                            <SelectTrigger className="w-full bg-transparent border focus:ring-[#815bf5]">
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent className="border">
                                                <SelectItem value="US">United States</SelectItem>
                                                <SelectItem value="GB">United Kingdom</SelectItem>
                                                <SelectItem value="IN">India</SelectItem>
                                                <SelectItem value="CA">Canada</SelectItem>
                                                <SelectItem value="AU">Australia</SelectItem>
                                                <SelectItem value="DE">Germany</SelectItem>
                                                <SelectItem value="FR">France</SelectItem>
                                                <SelectItem value="JP">Japan</SelectItem>
                                                <SelectItem value="CN">China</SelectItem>
                                                <SelectItem value="BR">Brazil</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 pb-8 px-6">
                            {step === "user" ? (
                                <Button
                                    onClick={handleNextStep}
                                    className="w-full bg-gradient-to-r from-[#815bf5] to-[#9f75ff] hover:from-[#6842e3] hover:to-[#815bf5] transition-all duration-300 text-white font-medium"
                                >
                                    Continue
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <div className="space-y-3 w-full">
                                    <Button
                                        onClick={() => setStep("user")}
                                        variant="outline"
                                        className="w-full border-zinc-700 text-zinc-300 hover:bg-white/5 hover:text-white"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Personal Details
                                    </Button>

                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full bg-gradient-to-r from-[#815bf5] to-[#9f75ff] hover:from-[#6842e3] hover:to-[#815bf5] transition-all duration-300 text-white font-medium"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Setting Up Your Account...
                                            </>
                                        ) : (
                                            "Create Your Zapllo Account"
                                        )}
                                    </Button>
                                </div>
                            )}

                            <div className="pt-2 text-center">
                                <p className="text-sm text-zinc-400">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-[#815bf5] hover:text-[#9f75ff] font-medium transition-colors">
                                        Sign in instead
                                    </Link>
                                </p>
                            </div>

                            <div className="w-full mt-4">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-full border-t border"></div>
                                    <div className="relative bg-black px-4 text-xs text-zinc-500">BENEFITS</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                                    <FeatureItem text="Free 7-day trial" />
                                    <FeatureItem text="Unlimited leads" />
                                    <FeatureItem text="CRM automation" />
                                    <FeatureItem text="Premium support" />
                                </div>
                            </div>

                            <Link href="/" className="flex items-center justify-center gap-2 mt-2 text-sm text-zinc-500 hover:text-white transition-colors">
                                <Home size={16} />
                                Back to Home
                            </Link>

                            <p className="text-xs text-center mt-4 text-zinc-600">
                                By creating an account, you agree to our{" "}
                                <a href="/terms" className="text-zinc-400 hover:text-[#815bf5] transition-colors">
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="/privacypolicy" className="text-zinc-400 hover:text-[#815bf5] transition-colors">
                                    Privacy Policy
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