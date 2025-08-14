"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayCircle, CheckCircle, ArrowRight, MonitorSmartphone, Smartphone, Monitor, Brain, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const demoTabs = [
    {
        id: "dashboard",
        title: "AI Dashboard",
        description: "Get intelligent insights and predictions at a glance",
        benefits: [
            "Real-time AI-powered analytics and forecasting",
            "Personalized KPI cards with smart recommendations",
            "Interactive charts with predictive modeling",
            "Customizable widgets with machine learning insights"
        ],
        screenshot: "/demo/dashboard.png",
        mobileScreenshot: "/demo/dashboard.png",
        color: "from-blue-500 to-blue-600",
        icon: <Brain className="h-4 w-4" />
    },
    {
        id: "contacts",
        title: "Smart Contacts",
        description: "AI-enhanced customer relationship management",
        benefits: [
            "360° customer profiles with AI-generated insights",
            "Automated contact scoring and prioritization",
            "Smart communication history with sentiment analysis",
            "Predictive customer behavior modeling"
        ],
        screenshot: "/demo/contact.png",
        mobileScreenshot: "/demo/contact.png",
        color: "from-purple-500 to-purple-600",
        icon: <Zap className="h-4 w-4" />
    },
    {
        id: "sales",
        title: "Sales Automation",
        description: "Intelligent deal management and forecasting",
        benefits: [
            "AI-powered lead scoring and qualification",
            "Automated pipeline management with smart alerts",
            "Predictive deal closing probability",
            "Intelligent next-best-action recommendations"
        ],
        screenshot: "/demo/sales.png",
        mobileScreenshot: "/demo/sales.png",
        color: "from-emerald-500 to-emerald-600",
        icon: <ArrowRight className="h-4 w-4" />
    },
    {
        id: "analytics",
        title: "Predictive Analytics",
        description: "AI-driven insights for data-driven decisions",
        benefits: [
            "Machine learning-powered sales forecasting",
            "Automated report generation with insights",
            "Customer behavior prediction models",
            "Performance optimization recommendations"
        ],
        screenshot: "/demo/analytics.png",
        mobileScreenshot: "/demo/analytics.png",
        color: "from-orange-500 to-orange-600",
        icon: <Brain className="h-4 w-4" />
    }
]

export default function DemoSection({ id }: { id?: string }) {
    const [videoOpen, setVideoOpen] = useState(false)
    const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop")
    const [activeTab, setActiveTab] = useState("dashboard")
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })

    const currentTab = demoTabs.find(tab => tab.id === activeTab) || demoTabs[0]

    return (
        <section id={id} ref={ref} className="w-full py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
            <div className="container px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="flex flex-col items-center text-center space-y-6 mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                >
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                        <PlayCircle className="h-3 w-3 mr-2" />
                        See it in action
                    </Badge>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                        Experience the power of{" "}
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            AI-driven CRM
                        </span>
                    </h2>
                    
                    <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                        Discover how our intelligent platform transforms your customer relationships, 
                        automates complex workflows, and predicts business opportunities.
                    </p>

                    {/* Device Toggle */}
                    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                        <Button
                            variant={deviceView === "desktop" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setDeviceView("desktop")}
                            className="gap-2"
                        >
                            <Monitor className="h-4 w-4" />
                            Desktop
                        </Button>
                        <Button
                            variant={deviceView === "mobile" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setDeviceView("mobile")}
                            className="gap-2"
                        >
                            <Smartphone className="h-4 w-4" />
                            Mobile
                        </Button>
                    </div>
                </motion.div>

                {/* Demo Interface */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    {/* Demo Preview */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full mb-8 h-auto p-2 bg-muted">
                                {demoTabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="flex flex-col gap-2 p-4 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg h-auto"
                                    >
                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${tab.color} text-white`}>
                                            {tab.icon}
                                        </div>
                                        <span className="text-sm font-medium">{tab.title}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {demoTabs.map((tab) => (
                                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Card className="overflow-hidden border shadow-lg">
                                            {deviceView === "desktop" ? (
                                                <div className="relative aspect-[16/9] bg-muted">
                                                    <img
                                                        src={tab.screenshot}
                                                        alt={`${tab.title} Screenshot`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    
                                                    {/* Play Button Overlay */}
                                                    <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
                                                        {/* <DialogTrigger asChild>
                                                            <Button
                                                                size="lg"
                                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-2 bg-background/90 backdrop-blur-sm hover:bg-background/95 text-foreground border shadow-lg"
                                                            >
                                                                <PlayCircle className="h-5 w-5" />
                                                                Watch Demo
                                                            </Button> */}
                                                        {/* </DialogTrigger> */}
                                                        <DialogContent className="max-w-4xl">
                                                            <div className="aspect-video">
                                                                <iframe
                                                                    width="100%"
                                                                    height="100%"
                                                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                                                    title="Zapllo CRM Demo"
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center py-8 bg-gradient-to-b from-muted to-muted/50">
                                                    <div className="relative w-[280px] h-[570px] bg-black rounded-[3rem] border-[8px] border-black shadow-xl">
                                                        <img
                                                            src={tab.mobileScreenshot}
                                                            alt={`${tab.title} Mobile Screenshot`}
                                                            className="w-full h-full object-left object-cover rounded-[2.2rem]"
                                                        />
                                                        {/* Mobile notch */}
                                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-2xl"></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Feature Badge */}
                                            <Badge className={`absolute top-4 left-4 bg-gradient-to-r ${tab.color} text-white border-0`}>
                                                {tab.title}
                                            </Badge>
                                        </Card>

                                        {/* Tab Description */}
                                        <div className="mt-6 text-center">
                                            <h3 className="text-xl font-semibold mb-2">{tab.title}</h3>
                                            <p className="text-muted-foreground">{tab.description}</p>
                                        </div>
                                    </motion.div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    {/* Benefits Sidebar */}
                    <div>
                        <motion.div
                            className="sticky top-8"
                            initial={{ x: 50, opacity: 0 }}
                            animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Card className="border shadow-sm">
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Key Benefits</h3>
                                            <p className="text-sm text-muted-foreground">
                                                See how {currentTab.title.toLowerCase()} drives results:
                                            </p>
                                        </div>

                                        <ul className="space-y-4">
                                            {currentTab.benefits.map((benefit, index) => (
                                                <motion.li
                                                    key={index}
                                                    className="flex items-start gap-3"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                >
                                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                                                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <span className="text-sm leading-relaxed">{benefit}</span>
                                                </motion.li>
                                            ))}
                                        </ul>

                                        {/* Device Compatibility */}
                                        <div className="pt-4 border-t">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <MonitorSmartphone className="h-4 w-4" />
                                                <span>Works on all devices</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Responsive design ensures perfect experience on desktop, tablet, and mobile
                                            </p>
                                        </div>

                                        {/* CTA */}
                                        <div className="pt-4">
                                            <Button className="w-full group" size="lg">
                                                Start free trial
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground mt-2">
                                                7-day free trial • No credit card required
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    className="mt-16 max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <Card className="border-2 border-primary/10 bg-gradient-to-r from-primary/5 to-blue-500/5">
                        <CardContent className="p-8">
                            <div className="text-center space-y-6">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                        Ready to transform your business?
                                    </h3>
                                    <p className="text-muted-foreground max-w-2xl mx-auto">
                                        Join thousands of companies using Zapllo to automate workflows, 
                                        enhance customer relationships, and drive unprecedented growth.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="lg" className="group">
                                        Start your free trial
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button size="lg" variant="outline">
                                        Schedule a demo
                                    </Button>
                                </div>

                                {/* Social Proof */}
                                <div className="flex items-center justify-center gap-6 pt-6 border-t">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                                <img
                                                    src={`/avatars/man${i}.jpg`}
                                                    alt={`User ${i}`}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">2,000+</span> businesses started this month
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </section>
    )
}