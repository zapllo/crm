"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayCircle, ChevronRight, CheckCircle, ArrowRight, MonitorSmartphone } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const demoTabs = [
    {
        id: "dashboard",
        title: "Dashboard",
        description: "Get a complete overview of your business at a glance.",
        benefits: [
            "Personalized KPI cards for quick insights",
            "Interactive charts and analytics",
            "Real-time activity feed",
            "Customizable widgets and layouts"
        ],
        screenshot: "/demo/dashboard.png",
        mobileScreenshot: "/demo/dashboard.png",
        color: "from-blue-500 to-blue-600"
    },
    {
        id: "contacts",
        title: "Contacts",
        description: "Manage all your customer relationships in one place.",
        benefits: [
            "Comprehensive contact profiles",
            "Communication history tracking",
            "Custom fields and tagging",
            "Automated data enrichment"
        ],
        screenshot: "/demo/contact.png",
        mobileScreenshot: "/demo/contact.png",
        color: "from-purple-500 to-purple-600"
    },
    {
        id: "pipeline",
        title: "Sales Pipeline",
        description: "Visualize and optimize your entire sales process.",
        benefits: [
            "Drag-and-drop deal management",
            "Multiple pipeline views",
            "Advanced filtering options",
            "Sales stage automation"
        ],
        screenshot: "/demo/sales.png",
        mobileScreenshot: "/demo/sales.png",
        color: "from-emerald-500 to-emerald-600"
    },
    {
        id: "reports",
        title: "Analytics",
        description: "Make data-driven decisions with powerful insights.",
        benefits: [
            "Customizable report builder",
            "AI-powered insights and recommendations",
            "Scheduled report delivery",
            "Export capabilities"
        ],
        screenshot: "/demo/analytics.png",
        mobileScreenshot: "/demo/analytics.png",
        color: "from-orange-500 to-orange-600"
    }
]

export default function DemoSection() {
    const [videoOpen, setVideoOpen] = useState(false)
    const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop")
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })

    return (
        <section ref={ref} className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <div className="container px-4 md:px-6">
                <motion.div
                    className="flex flex-col items-center text-center space-y-4 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                        See it in action
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Explore our powerful CRM platform
                    </h2>
                    <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                        Discover how our CRM can transform your business operations and boost your sales across any device.
                    </p>

                    <div className="flex items-center space-x-3 mt-2">
                        <Button
                            variant={deviceView === "desktop" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDeviceView("desktop")}
                            className="gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-monitor"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                            Desktop
                        </Button>
                        <Button
                            variant={deviceView === "mobile" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDeviceView("mobile")}
                            className="gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                            Mobile
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="dashboard" className="w-full">
                            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
                                {demoTabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                    >
                                        {tab.title}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {demoTabs.map((tab) => (
                                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                                    <div className="rounded-lg bg-gradient-to-b from-card to-card/50 p-1 shadow-xl relative">
                                        {deviceView === "desktop" ? (
                                            <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-black">
                                                <img
                                                    src={tab.screenshot}
                                                    alt={`${tab.title} Screenshot`}
                                                    className="w-full h-full border blur-[0.5px] object-cover transition-transform duration-700 hover:scale-105"
                                                />
                                                <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="default"
                                                            className="absolute top-1/2 left-1/2 border transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm hover:bg-primary"
                                                        >
                                                            <PlayCircle className="mr-1 h-5 w-5" /> Watch Demo
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl">
                                                        <div className="aspect-video">
                                                            <iframe
                                                                width="100%"
                                                                height="100%"
                                                                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                                                title="Product Demo"
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center py-6 px-4 bg-slate-900 rounded-md">
                                                <div className="relative w-[280px] h-[570px] bg-black rounded-[3rem] border-[14px] border-black overflow-hidden shadow-lg">
                                                    <img
                                                        src={tab.mobileScreenshot}
                                                        alt={`${tab.title} Mobile Screenshot`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl"></div>
                                                </div>
                                            </div>
                                        )}

                                        <Badge className={`absolute top-4 left-4 bg-gradient-to-r ${tab.color} text-white`}>
                                            {tab.title}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 text-center md:text-left">
                                        <h3 className="text-xl font-semibold">{tab.title}</h3>
                                        <p className="text-muted-foreground mt-1">{tab.description}</p>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    <div>
                        <motion.div
                            className="bg-card rounded-lg border shadow-sm h-full p-6"
                            initial={{ x: 50, opacity: 0 }}
                            animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Tabs defaultValue="dashboard" className="h-full  flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold mb-2">Key Benefits</h3>
                                    <p className="text-muted-foreground text-sm">
                                        See how each feature helps your business grow:
                                    </p>
                                </div>

                                <TabsList className="grid grid-cols-2 gap-4  md:grid-cols-4 lg:grid-cols-2 w-full mb-4">
                                    {demoTabs.map((tab) => (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                        >
                                            {tab.title}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                <div className="flex-grow mt-8">
                                    {demoTabs.map((tab) => (
                                        <TabsContent key={tab.id} value={tab.id} className="h-full flex flex-col space-y-4">
                                            <ul className="space-y-3 flex-grow">
                                                {tab.benefits.map((benefit, index) => (
                                                    <motion.li
                                                        key={index}
                                                        className="flex items-start gap-2"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: 0.1 * index }}
                                                        viewport={{ once: true }}
                                                    >
                                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                                        <span>{benefit}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-muted-foreground/30">
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-primary/20 p-2 rounded-full">
                                                                    <MonitorSmartphone className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Works across all devices</p>
                                                                    <p className="text-sm text-muted-foreground">Cloud-based access anywhere</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Available on desktop, tablet, and mobile devices</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <div className="pt-4">
                                                <Button className="w-full group">
                                                    <span>Schedule a personalized demo</span>
                                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    ))}
                                </div>

                                <div className="mt-6 border-t pt-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-100 dark:bg-green-900/30 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><path d="M12 7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-3V8c0-.55-.45-1-1-1Z" /><circle cx="12" cy="12" r="10" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">30-minute setup</p>
                                            <p className="text-xs text-muted-foreground">Quick implementation with our team</p>
                                        </div>
                                    </div>
                                </div>
                            </Tabs>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    className="mt-20 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <div className="relative">
                        <div className="absolute -inset-x-4 -inset-y-4 z-0 bg-primary/5 rounded-xl skew-y-1"></div>
                        <div className="relative z-10 bg-card border rounded-lg p-6 md:p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="md:flex-1">
                                    <h3 className="text-xl md:text-2xl font-bold mb-2">Ready to transform your business?</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Join thousands of successful companies using our CRM platform to grow their business.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button className="group relative overflow-hidden">
                                            <span className="relative z-10">Start free trial</span>
                                            <span className="absolute inset-0 bg-primary group-hover:translate-y-full transition-transform duration-300" />
                                            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        <Button variant="outline" className="group">
                                            Book a demo
                                            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="md:flex-1 flex justify-center md:justify-end">
                                    <div className="relative">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-sm font-medium">
                                                    <img
                                                        src={`/avatars/man${i}.jpg`} // Replace with the actual path to your images
                                                        alt={`user ${i}`} // Optional alt text
                                                        className="h-full w-full rounded-full object-cover" // Ensures the image fits inside the circle
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 text-center text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">2,000+</span> users joined last month
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}