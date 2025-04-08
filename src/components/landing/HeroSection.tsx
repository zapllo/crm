"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, ChevronRight, Users, BarChart, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Typewriter from 'typewriter-effect'
import CountUp from 'react-countup'
import { Card, CardContent } from "@/components/ui/card"

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
        <section className="relative w-full py-16 mt-8 md:mt-4 md:py-24 lg:py-32 overflow-hidden">
            {/* Simple gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80" />

            {/* Subtle animated particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-primary/5"
                        initial={{
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 + "%",
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            opacity: 0.2 + Math.random() * 0.3
                        }}
                        animate={{
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 + "%",
                            opacity: [0.2 + Math.random() * 0.3, 0.1, 0.2 + Math.random() * 0.3]
                        }}
                        transition={{
                            duration: 15 + Math.random() * 20,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                ))}
            </div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
                    <motion.div
                        className="flex flex-col justify-center space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="w-fit mb-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            <span className="mr-1">🔥</span> Trusted by {" "}<span className="ml-1"><CountUp end={10000} separator="," duration={2.5} /></span>+ businesses
                        </Badge>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Transform Your Business with{" "}
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

                        <p className="text-xl text-muted-foreground max-w-[600px]">
                            Supercharge your team with intelligent tools to build
                            <span className="font-medium text-primary"> deeper customer relationships</span> and
                            <span className="font-medium text-primary"> close deals faster</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3  pt-2">
                            <Link href="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden">
                                    <span className="relative z-10 flex items-center">
                                        Start free trial
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Button>
                            </Link>
                            <Link href="/demo" className="w-full sm:w-auto">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                    Request Demo
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
                                    >
                                        <ChevronRight className="ml-1 h-4 w-4 text-primary" />
                                    </motion.div>
                                </Button>
                            </Link>
                        </div>

                        {/* Feature tabs */}
                        <div className="mt-20 space-y-4">
                            <p className="text-sm mt-6 font-medium">Why businesses choose us:</p>
                            <Card className="border border-border/50 shadow-sm">
                                <div className="relative">
                                    <motion.div
                                        className="absolute inset-0 rounded-lg bg-primary/5"
                                        animate={{ x: activeFeature * 100 + '%' }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        style={{ width: '33.333%' }}
                                    />
                                    <div className="relative grid grid-cols-3 gap-2 rounded-lg p-1">
                                        {features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className={`flex flex-col items-center text-center p-3 rounded cursor-pointer transition-colors ${activeFeature === index ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                                                onClick={() => setActiveFeature(index)}
                                            >
                                                <div className="mb-2 rounded-full bg-background p-2 shadow-sm">
                                                    {feature.icon}
                                                </div>
                                                <span className="text-sm font-medium">{feature.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    key={activeFeature}
                                    className="text-sm text-center text-muted-foreground p-3 border-t"
                                >
                                    {features[activeFeature].description}
                                </motion.div>
                            </Card>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-4 justify-center sm:justify-start text-sm">
                            {[
                                { text: "7-day free trial", tooltip: "Full access to all features for 7 days" },
                                { text: "No credit card required", tooltip: "Start immediately with just your email" },
                                { text: "Cancel anytime", tooltip: "No commitments or hidden fees" }
                            ].map((item, i) => (
                                <TooltipProvider key={i}>
                                    <Tooltip>
                                        <TooltipTrigger className="flex items-center gap-1.5 group">
                                            <div className="bg-primary/10 rounded-full p-1">
                                                <CheckCircle2 className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
                                            </div>
                                            <span>{item.text}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
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
                            <Card className="overflow-hidden border-2 border-border/50 shadow-xl rounded-xl">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <img
                                        alt="CRM Dashboard"
                                        className="w-full aspect-[16/10] object-cover object-center"
                                        src="/demo/dashboard.png"
                                    />
                                </motion.div>

                                {/* Live indicator */}
                                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-green-100/90 backdrop-blur-sm px-2.5 py-1 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                    </span>
                                    Live Dashboard
                                </div>
                            </Card>

                            {/* Floating stats card */}
                            <motion.div
                                className="absolute -right-4 -bottom-4 w-40 bg-background rounded-lg shadow-lg p-3 border"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                whileHover={{ y: -3, x: -3 }}
                            >
                                <div className="text-xs text-muted-foreground mb-1">Monthly Growth</div>
                                <div className="text-base font-bold text-primary">+27.4%</div>
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
                                className="absolute -left-4 top-16 w-48 bg-background rounded-lg shadow-lg p-3 border"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                whileHover={{ y: -3, x: 3 }}
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

                {/* Streamlined brands section */}
                {/* Brands section */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-center mt-20 space-y-8"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold">
                                Trusted by <span className="text-primary">leading brands</span> worldwide
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Thousands of companies rely on our platform to grow their business
                            </p>
                        </div>

                        <div className="relative overflow-hidden py-6">
                            {/* Gradient edges */}
                            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
                            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

                            <div className="flex space-x-12 md:space-x-16">
                                <motion.div
                                    className="flex space-x-12 md:space-x-16"
                                    animate={{ x: [0, -1000] }}
                                    transition={{
                                        x: {
                                            repeat: Infinity,
                                            repeatType: "loop",
                                            duration: 25,
                                            ease: "linear"
                                        }
                                    }}
                                >
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="flex space-x-12 md:space-x-16">
                                            {[
                                                "malabar", "emerald", "sabhyasachi", "pantaloons", "walkingtree",
                                                "lineargent", "greenlab", "birlabraniacs", "bvcventures"
                                            ].map((brand) => (
                                                <div key={brand} className="w-24 md:w-32 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                                                    <img
                                                        src={`/brands/${brand}.webp`}
                                                        alt={brand}
                                                        className="w-auto h-8 md:h-10 lg:h-12 object-contain grayscale hover:grayscale-0 transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>

                        {/* Key metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
                            {[
                                { value: <CountUp end={10} suffix="K+" duration={2} />, label: "Businesses" },
                                { value: <CountUp end={50} suffix="+" duration={2} />, label: "Countries" },
                                { value: <CountUp end={98} suffix="%" duration={2} />, label: "Satisfaction" },
                                { value: <CountUp prefix="$" end={2.8} suffix="M" decimals={1} duration={2} />, label: "Revenue" },
                            ].map((stat, i) => (
                                <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300">
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
