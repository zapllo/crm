"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Users, BarChart, Clock, Brain, Play, Star } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Typewriter from 'typewriter-effect'
import CountUp from 'react-countup'
import { Card, CardContent } from "@/components/ui/card"

export default function HeroSection() {
    const [activeFeature, setActiveFeature] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 4)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const features = [
        {
            icon: <Users className="h-4 w-4" />,
            title: "Smart Contacts",
            description: "AI-powered customer intelligence and relationship tracking"
        },
        {
            icon: <BarChart className="h-4 w-4" />,
            title: "Sales Automation",
            description: "Automated workflows that close deals 67% faster"
        },
        {
            icon: <Clock className="h-4 w-4" />,
            title: "Time Intelligence",
            description: "Save 15+ hours weekly with intelligent automation"
        },
        {
            icon: <Brain className="h-4 w-4" />,
            title: "AI Predictions",
            description: "94% accurate forecasting for smarter decisions"
        }
    ]

    return (
        <section className="relative w-screen  mt-32 min-h-screen flex items-center justify-center bg-background">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2]" />

            {/* Radial gradient overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            </div>
            <div className="container relative z-10 px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Content */}
                    <motion.div
                        className="flex flex-col justify-center space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Trust Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20">
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-current" />
                                    <Star className="h-3 w-3 fill-current" />
                                    <Star className="h-3 w-3 fill-current" />
                                    <Star className="h-3 w-3 fill-current" />
                                    <Star className="h-3 w-3 fill-current" />
                                </div>
                                <span className="ml-2">Trusted by <CountUp end={15000} separator="," duration={2} />+ businesses</span>
                            </Badge>
                        </motion.div>
                        {/* Main Headline */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                                The CRM that grows{" "}
                                <span className="relative">
                                    <span className="text-primary">
                                        <Typewriter
                                            options={{
                                                strings: [
                                                    'with your business',
                                                    'customer relationships',
                                                    'sales performance',
                                                    'team productivity'
                                                ],
                                                autoStart: true,
                                                loop: true,
                                                deleteSpeed: 40,
                                                typeSpeed: 80,
                                            }}
                                        />
                                    </span>
                                </span>
                            </h1>

                            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                                Experience the next generation of customer relationship management.
                                AI-powered insights, seamless automation, and intuitive design
                                that transforms how you connect with customers and close deals.
                            </p>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                        >
                            <Link href="/signup" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto font-semibold px-8 py-6 text-lg group shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>

                            <Link href="/demo" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto font-semibold px-8 py-6 text-lg group transition-all duration-300"
                                >
                                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Watch Demo
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Feature Highlights */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >

                            <Card className="border scae shadow-sm">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        {features.map((feature, index) => (
                                            <motion.button
                                                key={index}
                                                className={`flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 ${
                                                    activeFeature === index
                                                        ? 'bg-primary/10 text-primary border-2 border-primary/20'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-2 border-transparent'
                                                }`}
                                                onClick={() => setActiveFeature(index)}
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className={`mb-3 p-3 rounded-lg ${
                                                    activeFeature === index
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                }`}>
                                                    {feature.icon}
                                                </div>
                                                <span className="text-sm font-medium">{feature.title}</span>
                                            </motion.button>
                                        ))}
                                    </div>

                                    <motion.div
                                        key={activeFeature}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center p-4 bg-muted/50 rounded-lg border"
                                    >
                                        <p className="text-sm text-muted-foreground">
                                            {features[activeFeature].description}
                                        </p>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        {/* Trust Indicators */}
                        <motion.div
                            className="flex flex-wrap items-center gap-6 pt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.6 }}
                        >
                            {[
                                { text: "7-day free trial", tooltip: "Full access to all features" },
                                { text: "No credit card", tooltip: "Start immediately" },
                                { text: "5-min setup", tooltip: "Quick onboarding" }
                            ].map((item, i) => (
                                <TooltipProvider key={i}>
                                    <Tooltip>
                                        <TooltipTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            {item.text}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </motion.div>
                    </motion.div>
                    {/* Dashboard Preview */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        <div className="relative max-w-2xl md:-mt-48 mx-auto">
                            {/* Main Dashboard */}
                            <motion.div
                                className="relative"
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Card className="overflow- border-2 shadow-2xl">
                                    <div className="relative">
                                        <img
                                            alt="Zapllo CRM Dashboard"
                                            className="w-  rounded-lg  object-center object-cover"
                                            src="/demo/dashboard.png"
                                        />
                                        {/* Live indicator */}
                                        <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-background/95 backdrop-blur-sm border px-3 py-1.5 text-xs font-medium">
                                            <div className="relative flex h-2 w-2">
                                                <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></div>
                                                <div className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></div>
                                            </div>
                                            Live Dashboard
                                        </div>
                                    </div>
                                </Card>

                                {/* Floating Stats Cards */}
                                <motion.div
                                    className="absolute  -right-6 top-16 w-48"
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 0.6 }}
                                    whileHover={{ y: -3 }}
                                >
                                    <Card className="border scale-90 md:scale-100 shadow-lg backdrop-blur-sm bg-background/95">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <Users className="h-3 w-3 text-primary" />
                                                </div>
                                                <div className="text-sm font-medium">New Lead</div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                DPG Media requested demo
                                            </div>
                                            <div className="text-xs text-green-600 mt-1 font-medium">
                                                High probability: 89%
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                                <motion.div
                                    className="absolute -left-6 -bottom-4 w-40"
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 1.4, duration: 0.6 }}
                                    whileHover={{ y: -3 }}
                                >
                                    <Card className="border md:scale-100 scale-90 shadow-lg backdrop-blur-sm bg-background/95">
                                        <CardContent className="p-3">
                                            <div className="text-xs text-muted-foreground mb-1">Monthly Growth</div>
                                            <div className="text-lg font-bold text-primary">
                                                +<CountUp end={34} duration={2} />%
                                            </div>
                                            <div className="mt-2 w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-primary rounded-full"
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: "85%" }}
                                                    transition={{ delay: 2, duration: 1.5 }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Brand logos section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                    className="text-center mt-20 space-y-8"
                >
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">
                            Trusted by <span className="text-primary">industry leaders</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of companies that rely on Zapllo to grow their business
                        </p>
                    </div>

                    {/* Flowing Brand Carousel */}
                    <div className="relative overflow-hidden py-6">
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
                                            <div key={brand} className="w-24 md:w-32 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                                                <img
                                                    src={`/brands/${brand}.webp`}
                                                    alt={brand}
                                                    className="w-auto h-8 md:h-10 lg:h-12 object-contain grayscale hover:grayscale-0 transition-all filter dark:invert"
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
                            { value: <CountUp end={15} suffix="K+" duration={2} />, label: "Businesses" },
                            { value: <CountUp end={50} suffix="+" duration={2} />, label: "Countries" },
                            { value: <CountUp end={98} suffix="%" duration={2} />, label: "Satisfaction" },
                            { value: <CountUp prefix="$" end={2.8} suffix="M" decimals={1} duration={2} />, label: "Revenue" },
                        ].map((stat, i) => (
                            <Card key={i} className="border hover:border-primary/20 transition-all duration-300">
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
