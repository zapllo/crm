"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Plus, PlusCircle, Zap, CheckCircle, Globe, Workflow } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Link from "next/link"

const integrations = [
    {
        name: "Zapllo Caller",
        logo: "/integrations/zapllo-caller.png",
        description: "AI-powered cloud calling with transcription",
        category: "Communication",
        featured: true,
        verified: true
    },
    {
        name: "IndiaMART",
        logo: "/integrations/indiamart.png",
        description: "Auto-import leads from India's largest B2B marketplace",
        category: "Lead Generation",
        featured: true,
        verified: true
    },
    {
        name: "TradeIndia",
        logo: "/integrations/tradeindia.png", 
        description: "Sync inquiries from TradeIndia marketplace",
        category: "Lead Generation",
        featured: true,
        verified: true
    },
    {
        name: "Zapier",
        logo: "/brands/zapier.png",
        description: "Connect 5000+ apps with automated workflows",
        category: "Automation",
        featured: true,
        verified: true
    },
    {
        name: "Pabbly Connect",
        logo: "/brands/pabbly.svg",
        description: "Automate tasks across 1000+ applications",
        category: "Automation", 
        featured: true,
        verified: true
    },
    {
        name: "Gmail",
        logo: "/integrations/gmail.png",
        description: "Email automation and tracking integration",
        category: "Communication",
        featured: true,
        verified: true
    },
    {
        name: "Razorpay",
        logo: "/integrations/razorpay.png",
        description: "Accept payments and manage subscriptions",
        category: "Payments",
        featured: true,
        verified: true
    },
    {
        name: "PayU",
        logo: "/integrations/payu.png",
        description: "Secure payment gateway for Indian businesses",
        category: "Payments",
        verified: true
    },
    {
        name: "JustDial",
        logo: "/integrations/justdial.png",
        description: "Import leads from local business directory",
        category: "Lead Generation",
        verified: true
    },
    {
        name: "Shopify",
        logo: "/integrations/shopify.png",
        description: "Sync e-commerce data and customer orders",
        category: "E-Commerce",
        featured: true,
        verified: true
    },
    {
        name: "Twilio",
        logo: "/integrations/twilio.jpg",
        description: "SMS and voice communication platform",
        category: "Communication",
        verified: true
    },
    {
        name: "Stripe",
        logo: "/integrations/stripe.png",
        description: "Global payment processing and billing",
        category: "Payments",
        featured: true,
        verified: true
    },
    {
        name: "Interakt",
        logo: "/integrations/interakt.jpeg",
        description: "WhatsApp Business API integration",
        category: "Communication",
        verified: true
    },
    {
        name: "Zoho Inventory",
        logo: "/integrations/zoho-inventory.png",
        description: "Inventory management and order fulfillment",
        category: "E-Commerce",
        verified: true
    },
    {
        name: "Google Ads",
        logo: "/integrations/google-ads.png",
        description: "Import leads from Google advertising campaigns",
        category: "Marketing",
        featured: true,
        verified: true
    },
    {
        name: "Facebook Ads",
        logo: "/integrations/facebook.webp",
        description: "Social media advertising lead integration",
        category: "Marketing",
        featured: true,
        verified: true
    }
];

const categories = ["All", "Communication", "Lead Generation", "Automation", "Payments", "E-Commerce", "Marketing"];

const integrationStats = [
    { number: "20,000+", label: "Available Apps", description: "Via Zapier & Pabbly" },
    { number: "500+", label: "Native Integrations", description: "Pre-built connectors" },
    { number: "<2sec", label: "Sync Speed", description: "Real-time updates" },
    { number: "99.9%", label: "Uptime", description: "Enterprise reliability" }
];

export default function IntegrationSection({ id }: { id?: string }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })
    const [selectedCategory, setSelectedCategory] = useState("All")

    const filteredIntegrations = selectedCategory === "All"
        ? integrations
        : integrations.filter(integration => integration.category === selectedCategory)

    return (
        <section id={id} ref={ref} className="w-full py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
            <div className="container px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="flex flex-col items-center text-center space-y-6 mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                >
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Globe className="h-3 w-3 mr-2" />
                        20,000+ App Integrations
                    </Badge>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                        Connect everything you use{" "}
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            in one platform
                        </span>
                    </h2>
                    
                    <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                        Seamlessly integrate with your favorite tools through Zapier, Pabbly Connect, 
                        and our native connectors. No more data silos or manual work.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {integrationStats.map((stat, index) => (
                        <Card key={index} className="text-center border hover:border-primary/20 transition-colors">
                            <CardContent className="p-4">
                                <div className="text-2xl font-bold text-primary mb-1">{stat.number}</div>
                                <div className="text-sm font-medium mb-1">{stat.label}</div>
                                <div className="text-xs text-muted-foreground">{stat.description}</div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-8"
                >
                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <div className="flex justify-center space-x-2 px-4">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category)}
                                    className="whitespace-nowrap"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </motion.div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredIntegrations.map((integration, index) => (
                        <motion.div
                            key={integration.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="group"
                        >
                            <Card className="h-full relative overflow-hidden border hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                                {/* Featured Badge */}
                                {integration.featured && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <Badge variant="default" className="text-xs bg-primary">
                                            Popular
                                        </Badge>
                                    </div>
                                )}

                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={integration.logo}
                                                    alt={`${integration.name} logo`}
                                                    className="h-8 w-8 object-contain"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-sm">{integration.name}</h3>
                                                    {integration.verified && (
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                    )}
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    {integration.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {integration.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-xs text-muted-foreground">
                                            {integration.verified ? "Verified" : "Community"}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="h-4 w-4 text-primary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {/* Request Integration Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        whileHover={{ y: -5 }}
                    >
                        <Card className="h-full border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 transition-colors group cursor-pointer">
                            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <PlusCircle className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Need something else?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Request a custom integration and we'll build it for you.
                                </p>
                                <Link href="https://forms.gle/v16NjQusTan2PCDW6">
                                    <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        Request Integration
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* No results state */}
                {filteredIntegrations.length === 0 && (
                    <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="max-w-md mx-auto">
                            <PlusCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
                            <p className="text-muted-foreground mb-6">
                                We don't have any integrations in this category yet.
                            </p>
                            <Button variant="outline" onClick={() => setSelectedCategory("All")}>
                                View all integrations
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Automation Showcase */}
                <motion.div
                    className="mt-16 max-w-6xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <Card className="border-2 border-primary/10 bg-gradient-to-r from-primary/5 to-blue-500/5 overflow-hidden">
                        <CardContent className="p-8">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div>
                                        <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white mb-4">
                                            <Workflow className="h-3 w-3 mr-2" />
                                            Automation Showcase
                                        </Badge>
                                        <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                            20,000+ Apps at Your Fingertips
                                        </h3>
                                        <p className="text-muted-foreground text-lg">
                                            Connect Zapllo with virtually any application through Zapier and Pabbly Connect. 
                                            Create powerful automation workflows that eliminate manual tasks.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            {
                                                title: "Lead Automation",
                                                description: "Auto-import leads from Facebook Ads → Qualify in Zapllo → Send to sales team"
                                            },
                                            {
                                                title: "Customer Onboarding", 
                                                description: "New customer in Zapllo → Create project in Asana → Send welcome email"
                                            },
                                            {
                                                title: "Payment Processing",
                                                description: "Payment received in Stripe → Update deal status → Generate invoice"
                                            }
                                        ].map((workflow, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                                                    <Zap className="h-3 w-3 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm mb-1">{workflow.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{workflow.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button className="group">
                                            View API documentation
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        <Button variant="outline">
                                            Talk to integration team
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative">
                                    {/* Integration Flow Visualization */}
                                    <div className="space-y-4">
                                        <div className="flex z-[100] items-center justify-between p-4 bg-background rounded-lg border shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <img src="/brands/zapier.png" alt="Zapier" className="h-8 w-8" />
                                                <div>
                                                    <div className="font-medium text-sm">Zapier</div>
                                                    <div className="text-xs text-muted-foreground">5000+ apps</div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">Connected</Badge>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="h-8 w-px bg-border"></div>
                                        </div>

                                        <div className="flex z-[100] items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <img src="/icons/zapllo.png" alt="Zapllo" className="h-8 w-8" />
                                                <div>
                                                    <div className="font-medium text-sm">Zapllo CRM</div>
                                                    <div className="text-xs text-primary">Your central hub</div>
                                                </div>
                                            </div>
                                            <Badge className="bg-primary text-primary-foreground">Active</Badge>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="h-8 w-px bg-border"></div>
                                        </div>

                                        <div className="flex z-[100] items-center justify-between p-4 bg-background rounded-lg border shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <img src="/brands/pabbly.svg" alt="Pabbly" className="h-8 w-8" />
                                                <div>
                                                    <div className="font-medium text-sm">Pabbly Connect</div>
                                                    <div className="text-xs text-muted-foreground">1000+ apps</div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">Connected</Badge>
                                        </div>
                                    </div>

                                    {/* Flowing connections animation */}
                                    <div className="absolute inset-0 z-[50] pointer-events-none">
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-1 h-1 bg-primary rounded-full"
                                                animate={{
                                                    y: [0, 100, 200, 300],
                                                    opacity: [0, 1, 1, 0]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    delay: i * 1,
                                                    ease: "linear"
                                                }}
                                                style={{
                                                    left: '50%',
                                                    top: '20%'
                                                }}
                                            />
                                        ))}
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