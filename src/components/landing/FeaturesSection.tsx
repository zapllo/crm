"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3, Users, CalendarDays, MessageSquare,
    Zap, Lock, LineChart, Settings, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"

const features = [
    {
        id: "sales",
        title: "Sales Automation",
        description: "Automate your sales process and close deals faster",
        icon: <BarChart3 className="h-6 w-6" />,
        color: "from-blue-500 to-blue-600",
        details: [
            "Pipeline management",
            "Lead scoring & prioritization",
            "Sales forecasting",
            "Quote and proposal generation"
        ],
        stats: [
            { label: "Avg. close rate", value: "+45%" },
            { label: "Time saved", value: "15hrs/week" }
        ],
        image: "/demo/sales.png"
    },
    {
        id: "customer",
        title: "Customer Management",
        description: "Build stronger relationships with comprehensive customer insights",
        icon: <Users className="h-6 w-6" />,
        color: "from-purple-500 to-purple-600",
        details: [
            "360° customer profiles",
            "Interaction history",
            "Customer segmentation",
            "Personalized communication"
        ],
        stats: [
            { label: "Customer retention", value: "+28%" },
            { label: "Data accuracy", value: "99.9%" }
        ],
        image: "/demo/contact2.png"
    },
    {
        id: "calendar",
        title: "Smart Scheduling",
        description: "Never miss an opportunity with intelligent scheduling",
        icon: <CalendarDays className="h-6 w-6" />,
        color: "from-emerald-500 to-emerald-600",
        details: [
            "Automated reminders",
            "Meeting scheduling",
            "Calendar integration",
            "Team availability"
        ],
        stats: [
            { label: "No-shows", value: "-82%" },
            { label: "Meetings scheduled", value: "+124%" }
        ],
        image: "/demo/followup.png"
    },
    {
        id: "communication",
        title: "Unified Communication",
        description: "Keep all customer communications in one place",
        icon: <MessageSquare className="h-6 w-6" />,
        color: "from-orange-500 to-orange-600",
        details: [
            "Email integration",
            "SMS messaging",
            "Chat functionality",
            "Communication history"
        ],
        stats: [
            { label: "Response time", value: "-64%" },
            { label: "Customer satisfaction", value: "+35%" }
        ],
        image: "/demo/communication.png"
    }
]

const additionalFeatures = [
    {
        icon: <Zap className="h-10 w-10 text-blue-500" />,
        title: "Lightning Fast",
        description: "Our CRM is optimized for speed and performance."
    },
    {
        icon: <Lock className="h-10 w-10 text-red-500" />,
        title: "Secure Data",
        description: "Enterprise-grade security to protect your customer data."
    },
    {
        icon: <LineChart className="h-10 w-10 text-green-500" />,
        title: "Advanced Analytics",
        description: "Gain insights with powerful reporting and analytics."
    },
    {
        icon: <Settings className="h-10 w-10 text-purple-500" />,
        title: "Customizable",
        description: "Tailor the CRM to fit your unique business needs."
    }
]

export default function FeaturesSection({ id }: { id?: string }) {
    const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <section id={id} ref={ref} className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
                >
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                        Powerful Features
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                        Everything you need to <span className="text-primary">succeed</span>
                    </h2>
                    <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                        Our CRM platform is packed with powerful features to streamline your business operations
                        and drive growth like never before.
                    </p>
                </motion.div>

                <motion.div
                    className="w-full max-w-5xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <Tabs defaultValue="sales" className="w-full">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex w-max space-x-1 p-1">
                                <TabsList className="flex p-1 gap-4">
                                    {features.map((feature) => (
                                        <TabsTrigger
                                            key={feature.id}
                                            value={feature.id}
                                            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative px-4 py-2"
                                            onMouseEnter={() => setHoveredFeature(feature.id)}
                                            onMouseLeave={() => setHoveredFeature(null)}
                                        >
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                {feature.icon}
                                            </div>
                                            <span className="hidden md:inline font-medium">{feature.title}</span>
                                            {!isMobile && hoveredFeature === feature.id && (
                                                <motion.div
                                                    layoutId="tab-hover"
                                                    className="absolute inset-0 bg-accent rounded-md -z-10"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                            <ScrollBar orientation="horizontal" className="h-2" />
                        </ScrollArea>

                        {features.map((feature) => (
                            <TabsContent key={feature.id} value={feature.id} className="mt-8">
                                <Card className="overflow-hidden border-none bg-transparent shadow-none">
                                    <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                                        <div className="order-2 md:order-1">
                                            <CardHeader className="p-0">
                                                <div className="inline-flex items-center rounded-lg bg-gradient-to-r p-[2px] mb-4">
                                                    <div className={`inline-flex items-center justify-center rounded-[6px] bg-gradient-to-r ${feature.color} p-2 text-white`}>
                                                        {feature.icon}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-2xl md:text-3xl">{feature.title}</CardTitle>
                                                <CardDescription className="text-base md:text-lg mt-2">
                                                    {feature.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="px-0 mt-6">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <ul className="space-y-2">
                                                        {feature.details.map((detail, index) => (
                                                            <motion.li
                                                                key={index}
                                                                className="flex items-center gap-2"
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                            >
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                                                    <CheckIcon className="h-3.5 w-3.5 text-primary" />
                                                                </div>
                                                                <span className="text-base">{detail}</span>
                                                            </motion.li>
                                                        ))}
                                                    </ul>

                                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                                        {feature.stats.map((stat, index) => (
                                                            <motion.div
                                                                key={index}
                                                                className="rounded-lg border bg-card p-3"
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.3 + index * 0.1 }}
                                                            >
                                                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                                                                <div className="text-lg font-bold text-primary">{stat.value}</div>
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    <Button className="w-fit mt-2 group" size="sm">
                                                        Learn more about {feature.title.toLowerCase()}
                                                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </div>

                                        <div className="order-1 md:order-2">
                                            <motion.div
                                                className="relative rounded-lg overflow-hidden shadow-xl"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.2, duration: 0.5 }}
                                                whileHover={{ y: -5 }}
                                            >
                                                <img
                                                    src={feature.image}
                                                    alt={feature.title}
                                                    className="w-full h-auto object-cover rounded-lg"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-60" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </motion.div>

                <div className="mt-20">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-bold">More reasons why businesses love our platform</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {additionalFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-lg cursor-pointer group"
                            >
                                <div className="mb-4 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    className="mt-16 max-w-2xl mx-auto text-center"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                >
                    <blockquote className="relative">
                        <div className="relative z-10">
                            <p className="text-xl italic text-muted-foreground">
                                "After implementing this CRM, our sales team's productivity increased by 37% and our customer satisfaction scores went up by 42%. It's been transformational for our business."
                            </p>
                            <footer className="mt-4">
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-bold">JD</span>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium">Jessica Dawson</p>
                                        <p className="text-muted-foreground">VP of Sales, TechGlobal</p>
                                    </div>
                                </div>
                            </footer>
                        </div>
                        <div className="absolute top-0 left-0 transform -translate-x-6 -translate-y-6 text-6xl text-primary/20 font-serif">
                            "
                        </div>
                        <div className="absolute bottom-0 right-0 transform translate-x-6 translate-y-6 text-6xl text-primary/20 font-serif">
                            "
                        </div>
                    </blockquote>
                </motion.div>
            </div>
        </section>
    )
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}