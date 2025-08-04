"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Plus, PlusCircle } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Link from "next/link"

const integrations = [
    {
        name: "Zapllo Caller",
        logo: "/integrations/zapllo-caller.png",
        description: "Cloud calling solution with AI transcription",
        category: "Communication",
        featured: true,
    },
    {
        name: "IndiaMART",
        logo: "/integrations/indiamart.png",
        description: "Connect your IndiaMART leads directly to your CRM",
        category: "E-Commerce",
        featured: true,
    },
    {
        name: "TradeIndia",
        logo: "/integrations/tradeindia.png",
        description: "Sync leads and inquiries from TradeIndia",
        category: "E-Commerce",
        featured: true,
    },
    {
        name: "Gmail",
        logo: "/integrations/gmail.png",
        description: "Automate email workflows and notifications",
        category: "Communication",
        featured: true,
    },
    {
        name: "Razorpay",
        logo: "/integrations/razorpay.png",
        description: "Process payments and manage subscriptions",
        category: "Payments",
        featured: true,
    },
    {
        name: "PayU",
        logo: "/integrations/payu.png",
        description: "Secure payment gateway for your business",
        category: "Payments",
    },
    {
        name: "JustDial",
        logo: "/integrations/justdial.png",
        description: "Import leads and manage listings from JustDial",
        category: "Marketing",
    },
    {
        name: "Shopify",
        logo: "/integrations/shopify.png",
        description: "Sync your Shopify store data and orders",
        category: "E-Commerce",
        featured: true,
    },
    {
        name: "Twilio",
        logo: "/integrations/twilio.jpg",
        description: "Send SMS notifications and alerts",
        category: "Communication",
    },
    {
        name: "Stripe",
        logo: "/integrations/stripe.png",
        description: "Process global payments and subscriptions",
        category: "Payments",
        featured: true,
    },
    {
        name: "Interakt",
        logo: "/integrations/interakt.jpeg",
        description: "Engage customers through WhatsApp Business",
        category: "Communication",
    },
    {
        name: "Zoho Inventory",
        logo: "/integrations/zoho-inventory.png",
        description: "Manage inventory and order fulfillment",
        category: "E-Commerce",
    },
    {
        name: "Delhivery",
        logo: "/integrations/delhivery.png",
        description: "Streamline logistics and shipping",
        category: "Logistics",
    },
    {
        name: "Zoho Books",
        logo: "/integrations/zohobooks.png",
        description: "Automate accounting and financial reports",
        category: "Accounting",
    },
    {
        name: "Tally",
        logo: "/integrations/tally.webp",
        description: "Sync accounting data from Tally ERP",
        category: "Accounting",
    },
    {
        name: "Google Ads",
        logo: "/integrations/google-ads.png",
        description: "Import leads directly from Google Ads campaigns",
        category: "Marketing",
        featured: true,
    },
    {
        name: "Facebook Remarketing",
        logo: "/integrations/facebook.webp",
        description: "Retarget potential customers on Facebook",
        category: "Marketing",
    },
    {
        name: "CallHippo",
        logo: "/integrations/callhippo.png",
        description: "Virtual phone system for your business",
        category: "Communication",
    },
    {
        name: "Zendesk",
        logo: "/integrations/zendesk.jpeg",
        description: "Customer support and ticketing system",
        category: "CRM",
    },
];

// Get unique categories from integrations and add "All" at the beginning
const categories = ["All", ...Array.from(new Set(integrations.map(item => item.category)))];

export default function IntegrationSection({ id }: { id?: string }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })
    const [selectedCategory, setSelectedCategory] = useState("All")

    // Filter integrations based on selected category
    const filteredIntegrations = selectedCategory === "All"
        ? integrations
        : integrations.filter(integration => integration.category === selectedCategory)

    // Handle category selection
    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category)
    }

    return (
        <section id={id} ref={ref} className="w-full py-12 md:py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
            <div className="container px-4 md:px-6">
                <motion.div
                    className="flex flex-col items-center text-center space-y-4 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                        <span className="animate-pulse mr-1">⚡</span> Integrations
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Connect with your favorite tools
                    </h2>
                    <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                        Our CRM integrates with the apps you already use, creating a seamless workflow and eliminating data silos.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8"
                >
                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <div className="flex justify-center space-x-2 pl-3">
                            {categories.map((category) => (
                                <Badge
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    className={`cursor-pointer py-1.5 px-3 transition-all ${
                                        selectedCategory === category
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-primary/10 hover:text-primary"
                                    }`}
                                    onClick={() => handleCategorySelect(category)}
                                >
                                    {category}
                                </Badge>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="h-2" />
                    </ScrollArea>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredIntegrations.length > 0 ? (
                        <>
                            {filteredIntegrations.map((integration, index) => (
                                <motion.div
                                    key={integration.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.4, delay: 0.1 + (index % 8) * 0.05 }}
                                    whileHover={{ y: -5 }}
                                    className="h-full"
                                    layout
                                >
                                    <Card className="h-full relative overflow-hidden group cursor-pointer">
                                        {integration.featured && (
                                            <div className="absolute top-0 right-0 z-10">
                                                <Badge variant="default" className="rounded-tl-none rounded-br-none bg-primary">
                                                    Popular
                                                </Badge>
                                            </div>
                                        )}
                                        <CardContent className="p-6 flex flex-col h-full">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={integration.logo}
                                                        alt={`${integration.name} logo`}
                                                        className="h-8 w-8 object-contain"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{integration.name}</h3>
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {integration.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                                            <div className="mt-auto pt-4 flex justify-between items-center">
                                                {/* <Button variant="ghost" size="sm" className="text-primary group-hover:text-primary/80">
                                                    <span>Powered by ZaplloCRM</span>
                                                    <ArrowRight className="ml-1 h-3.5 w-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                                                </Button> */}
                                                {/* <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <Plus className="h-4 w-4" />
                                                </div> */}
                                            </div>
                                        </CardContent>
                                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg pointer-events-none transition-colors duration-300" />
                                    </Card>
                                </motion.div>
                            ))}
                        </>
                    ) : (
                        <motion.div
                            className="col-span-full text-center py-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="mx-auto flex flex-col items-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <PlusCircle className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">No integrations found</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    We don't have any integrations in this category yet.
                                </p>
                                <Button variant="outline" size="sm" onClick={() => setSelectedCategory("All")}>
                                    View all integrations
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        whileHover={{ y: -5 }}
                        layout
                    >
                        <Card className="h-full border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <PlusCircle className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">Request Integration</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Don't see the tool you use? Let us know and we'll build it!
                            </p>
                            <Link href='https://forms.gle/v16NjQusTan2PCDW6'>
                            <Button  variant="outline" size="sm">
                                Request integration
                            </Button>
                            </Link>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    className="mt-16 text-center bg-card rounded-lg border shadow-sm p-8 max-w-4xl mx-auto"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <h3 className="text-2xl font-bold mb-2">Need a custom integration?</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Our flexible API allows you to build custom integrations with any system. Our developer-friendly
                        documentation makes it easy to connect to your existing tools.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button>
                            View API documentation
                        </Button>
                        <Button variant="outline">
                            Talk to our integration team
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
