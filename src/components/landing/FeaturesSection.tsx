"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3, Users, CalendarDays, MessageSquare, Phone, FileText, Zap, 
    Lock, LineChart, Settings, ChevronRight, Brain, Bot, Sparkles,
    FileSignature, Workflow, PhoneCall, Globe, CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Badge } from "@/components/ui/badge"

const features = [
    {
        id: "ai-sales",
        title: "AI Sales Automation",
        description: "Intelligent workflows that predict, prioritize, and close deals faster",
        icon: <Brain className="h-6 w-6" />,
        color: "from-blue-500 to-cyan-500",
        details: [
            "AI-powered lead scoring with 94% accuracy",
            "Predictive sales forecasting and pipeline management", 
            "Automated follow-up sequences based on customer behavior",
            "Smart deal recommendations and next-best actions"
        ],
        stats: [
            { label: "Conversion Rate", value: "+67%" },
            { label: "Sales Velocity", value: "+45%" }
        ],
        image: "/demo/sales.png"
    },
    {
        id: "smart-contacts",
        title: "Intelligent Contact Hub",
        description: "360° customer intelligence with AI-enhanced insights",
        icon: <Users className="h-6 w-6" />,
        color: "from-purple-500 to-pink-500",
        details: [
            "360° customer profiles with AI-powered insights",
            "Automated data enrichment from 200+ sources",
            "Behavioral pattern recognition and engagement scoring",
            "Smart segmentation and personalized communication"
        ],
        stats: [
            { label: "Data Accuracy", value: "99.2%" },
            { label: "Time Saved", value: "12hrs/week" }
        ],
        image: "/demo/contact2.png"
    },
    {
        id: "smart-quotations",
        title: "Smart Quotation Engine",
        description: "AI-powered proposal generation with dynamic pricing optimization",
        icon: <FileSignature className="h-6 w-6" />,
        color: "from-green-500 to-emerald-500",
        details: [
            "AI-generated quotes with optimal pricing strategies",
            "Dynamic templates that adapt to customer requirements",
            "Real-time competitor analysis and market positioning",
            "Automated approval workflows with e-signature integration"
        ],
        stats: [
            { label: "Quote Speed", value: "+89%" },
            { label: "Win Rate", value: "+34%" }
        ],
        image: "/demo/quotations.png"
    },
    {
        id: "ai-forms",
        title: "Conversational AI Forms",
        description: "Intelligent form builder with natural language processing",
        icon: <Bot className="h-6 w-6" />,
        color: "from-orange-500 to-red-500",
        details: [
            "Conversational AI forms that adapt to user responses",
            "Smart field suggestions and intelligent auto-completion",
            "Real-time validation with data quality scoring",
            "Multi-step workflows with conditional logic branching"
        ],
        stats: [
            { label: "Completion Rate", value: "+78%" },
            { label: "Data Quality", value: "+92%" }
        ],
        image: "/demo/forms.png"
    },
    {
        id: "voice-calling",
        title: "Integrated Calling System",
        description: "Direct phone calls with AI transcription and sentiment analysis",
        icon: <PhoneCall className="h-6 w-6" />,
        color: "from-indigo-500 to-purple-500",
        details: [
            "One-click calling directly from contact profiles",
            "AI-powered call transcription and sentiment analysis",
            "Automated call logging with follow-up reminders",
            "Call quality scoring and performance coaching insights"
        ],
        stats: [
            { label: "Call Efficiency", value: "+56%" },
            { label: "Conversion Rate", value: "+43%" }
        ],
        image: "/demo/calling.png"
    },
    {
        id: "universal-integrations",
        title: "Universal Integrations",
        description: "Connect with 20,000+ apps via Zapier, Pabbly Connect & custom APIs",
        icon: <Globe className="h-6 w-6" />,
        color: "from-teal-500 to-cyan-500",
        details: [
            "Seamless Zapier & Pabbly Connect integration",
            "Pre-built connectors for 500+ popular business apps",
            "Custom API integrations with developer-friendly tools",
            "Real-time data synchronization across all platforms"
        ],
        stats: [
            { label: "Available Apps", value: "20K+" },
            { label: "Sync Speed", value: "<2sec" }
        ],
        image: "/demo/integrations.png"
    }
]

const additionalFeatures = [
    {
        icon: <Zap className="h-10 w-10" />,
        title: "Lightning Fast Performance",
        description: "Sub-second response times with advanced caching and global CDN.",
        color: "text-blue-500"
    },
    {
        icon: <Lock className="h-10 w-10" />,
        title: "Enterprise Security",
        description: "Bank-grade encryption with SOC2, GDPR, and HIPAA compliance.",
        color: "text-red-500"
    },
    {
        icon: <LineChart className="h-10 w-10" />,
        title: "Predictive Analytics",
        description: "AI-powered insights that predict customer behavior and market trends.",
        color: "text-green-500"
    },
    {
        icon: <Settings className="h-10 w-10" />,
        title: "Hyper-Customizable",
        description: "Tailor every aspect with our intuitive no-code workflow builder.",
        color: "text-purple-500"
    }
]

export default function FeaturesSection({ id }: { id?: string }) {
    const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })
    const isMobile = useMediaQuery("(max-width: 768px)")

    return (
        <section 
            id={id} 
            ref={ref} 
            className="w-full py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background"
        >
            <div className="container px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center space-y-6 text-center mb-16"
                >
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Powered by Zapllo AI
                    </Badge>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                        Everything you need to{" "}
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            scale your business
                        </span>
                    </h2>
                    
                    <p className="mx-auto max-w-[800px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                        Our comprehensive CRM platform combines cutting-edge AI technology with intuitive design 
                        to transform how you manage relationships, automate workflows, and drive growth.
                    </p>
                </motion.div>

                <motion.div
                    className="w-full max-w-7xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <Tabs defaultValue="ai-sales" className="w-full">
                        <ScrollArea className="w-full whitespace-nowrap mb-8">
                            <TabsList className="grid md:grid-cols-3 h-auto p-1 gap-2 bg-muted/50 border">
                                {features.map((feature) => (
                                    <TabsTrigger
                                        key={feature.id}
                                        value={feature.id}
                                        className="relative flex items-center gap-3 px-4 py-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                                        onMouseEnter={() => setHoveredFeature(feature.id)}
                                        onMouseLeave={() => setHoveredFeature(null)}
                                    >
                                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${feature.color} p-1 text-white flex items-center justify-center`}>
                                            {feature.icon}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-sm">{feature.title}</div>
                                            {!isMobile && (
                                                <div className="text-xs text-muted-foreground mt-0.5 max-w-32 truncate">
                                                    AI-powered
                                                </div>
                                            )}
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {features.map((feature) => (
                            <TabsContent key={feature.id} value={feature.id} className="mt-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Card className="border shadow-sm overflow-hidden">
                                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center p-8">
                                            {/* Content */}
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
                                                        {feature.icon}
                                                    </div>
                                                    
                                                    <div>
                                                        <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                                            {feature.title}
                                                        </h3>
                                                        <p className="text-muted-foreground text-lg leading-relaxed">
                                                            {feature.description}
                                                            </p>
                                                    </div>
                                                </div>

                                                {/* Feature Details */}
                                                <ul className="space-y-3">
                                                    {feature.details.map((detail, index) => (
                                                        <motion.li
                                                            key={index}
                                                            className="flex items-start gap-3"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                                                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                                            </div>
                                                            <span className="text-sm leading-relaxed">{detail}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    {feature.stats.map((stat, index) => (
                                                        <motion.div
                                                            key={index}
                                                            className="rounded-lg border bg-muted/50 p-4 text-center"
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.4 + index * 0.1 }}
                                                            whileHover={{ y: -2 }}
                                                        >
                                                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                                                            <div className="text-xl font-bold text-primary">{stat.value}</div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Image */}
                                            <div>
                                                <motion.div
                                                    className="relative rounded-lg overflow-hidden shadow-xl"
                                                    whileHover={{ y: -5, scale: 1.02 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                >
                                                    <img
                                                        src={feature.image}
                                                        alt={feature.title}
                                                        className="w-full h-auto object-cover"
                                                    />
                                                    <div className={`absolute inset-0 bg-gradient-to-tr ${feature.color} opacity-10`} />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </motion.div>

                {/* Additional Features Grid */}
                <div className="mt-20">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">Built for modern businesses</h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Every feature is designed with performance, security, and user experience in mind.
                        </p>
                    </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {additionalFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="group"
                            >
                                <Card className="h-full border hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <div className="mb-4 flex justify-center">
                                            <div className={`${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                                {feature.icon}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Customer Quote */}
                <motion.div
                    className="mt-20 max-w-4xl mx-auto text-center"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <Card className="border-2 border-primary/10 bg-primary/5">
                        <CardContent className="p-8">
                            <blockquote className="text-xl italic text-foreground mb-6">
                                "Zapllo's AI capabilities have transformed our sales process. We've seen a 67% increase 
                                in qualified leads and our team saves over 15 hours per week on administrative tasks."
                            </blockquote>
                            <div className="flex items-center justify-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary font-bold text-sm">JD</span>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium">Jessica Dawson</p>
                                    <p className="text-muted-foreground">VP of Sales, TechGlobal</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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