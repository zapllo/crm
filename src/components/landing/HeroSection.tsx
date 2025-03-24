"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, ChevronRight, Users, BarChart, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Typewriter from 'typewriter-effect';
import CountUp from 'react-countup';

export default function HeroSection() {
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 3);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: <Users className="h-5 w-5 text-blue-500" />,
            title: "Customer Management",
            description: "Centralize customer data for personalized experiences"
        },
        {
            icon: <BarChart className="h-5 w-5 text-green-500" />,
            title: "Sales Automation",
            description: "Close deals faster with intelligent workflows"
        },
        {
            icon: <Clock className="h-5 w-5 text-purple-500" />,
            title: "Time Savings",
            description: "Save 15+ hours weekly on administrative tasks"
        }
    ];

    return (
        <section className="relative w-full bg-background py-12 md:py-24 lg:py-32 overflow-hidden">
            {/* Animated background gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b  from-slate-950 to-slate-900"
                animate={{
                    background: [
                        "linear-gradient(to right bottom, rgba(249,250,251,1), rgba(243,244,246,1))",
                        "linear-gradient(to right bottom, rgba(243,244,246,1), rgba(249,250,251,1))",
                        "linear-gradient(to right bottom, rgba(249,250,251,1), rgba(243,244,246,1))"
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            />

            {/* Floating elements */}
            <div className="absolute bg-background inset-0 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-primary/5 dark:bg-primary/10"
                        initial={{
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 + "%",
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            opacity: 0.3 + Math.random() * 0.4
                        }}
                        animate={{
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 + "%",
                            opacity: [0.3 + Math.random() * 0.4, 0.1, 0.3 + Math.random() * 0.4]
                        }}
                        transition={{
                            duration: 15 + Math.random() * 20,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                ))}
            </div>

            <div className="container bg-background relative z-10 px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
                    <motion.div
                        className="flex flex-col justify-center space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="w-fit mb-2 bg-primary/20 text-primary hover:bg-primary/30 backdrop-blur-sm">
                            <span className="animate-pulse mr-1">🔥</span> Trusted by <CountUp end={10000} separator="," duration={2.5} />+ businesses
                        </Badge>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Transform Your Business with <br className="hidden sm:block" />
                                <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
                                    <Typewriter
                                        options={{
                                            strings: ['Smart CRM', 'AI-Powered Automation', 'Intelligent Workflows'],
                                            autoStart: true,
                                            loop: true,
                                        }}
                                    />
                                </span>
                            </h1>
                            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                                Supercharge your team's performance with our intelligent CRM platform that builds
                                <span className="font-medium text-primary"> deeper customer relationships</span> and
                                <span className="font-medium text-primary"> closes deals faster</span>.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Link href="/signup">
                                <Button size="lg" className="px-8 group relative overflow-hidden">
                                    <span className="relative z-10">Start Free Trial</span>
                                    <span className="absolute inset-0 bg-primary group-hover:translate-y-full transition-transform duration-300" />
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="lg" variant="outline" className="px-8 group hover:border-primary/50">
                                    Request Demo
                                    <motion.div
                                        initial={{ x: 0 }}
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
                                    >
                                        <ChevronRight className="ml-1 h-4 w-4 text-primary" />
                                    </motion.div>
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-3 pt-3">
                            <p className="text-sm font-medium">Why businesses choose us:</p>
                            <div className="relative">
                                <motion.div
                                    className="absolute inset-0 rounded-lg bg-primary/5 dark:bg-primary/10"
                                    animate={{ x: activeFeature * 100 + '%' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    style={{ width: '33.333%' }}
                                />
                                <div className="relative grid grid-cols-3 gap-2 rounded-lg p-1 text-xs sm:text-sm">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className={`flex flex-col items-center text-center p-2 rounded cursor-pointer transition-colors ${activeFeature === index ? 'text-primary font-medium' : 'text-muted-foreground'
                                                }`}
                                            onClick={() => setActiveFeature(index)}
                                        >
                                            <div className="mb-1 rounded-full bg-background p-1 shadow-sm">
                                                {feature.icon}
                                            </div>
                                            <span className="text-[11px] sm:text-xs font-medium">{feature.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                key={activeFeature}
                                className="text-sm text-center text-muted-foreground pt-1"
                            >
                                {features[activeFeature].description}
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-4 pt-2 justify-center text-sm">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1 group">
                                        <CheckCircle2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                        <span>7-day free trial</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Full access to all features for 14 days</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1 group">
                                        <CheckCircle2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                        <span>No credit card required</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Start immediately with just your email</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1 group">
                                        <CheckCircle2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                        <span>Cancel anytime</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>No commitments or hidden fees</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <div className="relative">
                            {/* Main dashboard image */}
                            <motion.div
                                className="rounded-lg overflow-hidden shadow-2xl"
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <img
                                    alt="CRM Dashboard"
                                    className="aspect-[16/10] overflow-hidden border blur-[0.5px] rounded-xl object-cover object-center"
                                    height="340"
                                    src="/demo/dashboard.png"
                                    width="600"
                                />

                                {/* Live indicators */}
                                <motion.div
                                    className="absolute top-5 right-5 flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-400"
                                    animate={{ opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                    </span>
                                    Live Dashboard
                                </motion.div>
                            </motion.div>

                            {/* Floating stats card */}
                            <motion.div
                                className="absolute -right-6 -bottom-6 w-32 sm:w-40 bg-background rounded-lg shadow-lg p-3 border border-muted"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                whileHover={{ y: -2, x: -2 }}
                            >
                                <div className="text-xs text-muted-foreground mb-1">Monthly Growth</div>
                                <div className="text-sm sm:text-base font-bold text-primary">+27.4%</div>
                                <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "80%" }}
                                        transition={{ delay: 1, duration: 1 }}
                                    />
                                </div>
                            </motion.div>

                            {/* Floating notification */}
                            <motion.div
                                className="absolute -left-6 sm:-left-10 top-20 w-40 sm:w-48 bg-background rounded-lg shadow-lg p-3 border border-muted"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                whileHover={{ y: -2, x: 2 }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Users className="h-3 w-3 text-primary" />
                                    </div>
                                    <div className="text-xs font-medium">New Lead Alert</div>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Acme Inc. just requested a demo
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Social proof - Logos */}
                <motion.div
                    className="mt-12 sm:mt-16 border-t pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    <p className="text-sm text-center text-muted-foreground mb-6">Trusted by leading companies worldwide</p>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                        {["netflix", "slack", "amazon", "spotify", "meta"].map((brand, i) => (
                            <motion.div
                                key={brand}
                                className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 1.2 + (i * 0.1), duration: 0.4 }}
                            >
                                <img src={`/brands/${brand}.png`} alt={`${brand} logo`} className="h-14  w-auto" />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}