"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useState } from "react"
import { CheckCircle, Loader2, Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Footer() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleSubscribe = async (e: any) => {
        e.preventDefault()
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError("Please enter a valid email address")
            return
        }

        setError("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setIsSubscribed(true)
                setSuccess("Thank you for subscribing! Welcome to the Zapllo community.")
                setEmail("")
            } else {
                throw new Error("Failed to subscribe")
            }
        } catch (error) {
            setError("Failed to subscribe. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    const footerSections = [
        {
            title: "Product",
            links: [
                { name: "Features", href: "#features" },
                { name: "Integrations", href: "#integrations" },
                { name: "API Documentation", href: "/docs" },
                { name: "Mobile Apps", href: "/mobile" },
                { name: "Security", href: "/security" }
            ]
        },
        {
            title: "Solutions", 
            links: [
                { name: "Sales Teams", href: "/solutions/sales" },
                { name: "Marketing Teams", href: "/solutions/marketing" },
                { name: "Customer Support", href: "/solutions/support" },
                { name: "Small Business", href: "/solutions/small-business" },
                { name: "Enterprise", href: "/solutions/enterprise" }
            ]
        },
        {
            title: "Resources",
            links: [
                { name: "Help Center", href: "/help" },
                { name: "Blog", href: "https://zapllo.com/blog" },
                { name: "Webinars", href: "/webinars" },
                { name: "Case Studies", href: "/case-studies" },
                { name: "Templates", href: "/templates" }
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About Us", href: "/about" },
                { name: "Careers", href: "https://zapllo.notion.site/Work-at-Zapllo-9c970622e3d142919bdca4c42ee38aab" },
                { name: "Contact", href: "https://zapllo.com/contact" },
                { name: "Partner Program", href: "/partners" },
                { name: "Refer & Win", href: "https://zapllo.notion.site/EXT-Referral-Programme-a18f7fe8ee634bffa917ca0c6f24ad0d" }
            ]
        }
    ]

    return (
        <footer className="bg-background border-t">
            {/* Newsletter Section */}
            <div className="border-b">
                <div className="container px-4 md:px-6 py-16">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="space-y-4">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                <Mail className="h-3 w-3 mr-2" />
                                Stay Updated
                            </Badge>
                            <h2 className="text-3xl font-bold">
                                Get the latest from{" "}
                                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    Zapllo
                                </span>
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Subscribe to our newsletter for product updates, industry insights, 
                                and exclusive tips to maximize your CRM success.
                            </p>
                        </div>

                        <Card className="max-w-md mx-auto">
                            <CardContent className="p-6">
                                <form onSubmit={handleSubscribe} className="space-y-4">
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            placeholder="Enter your email address"
                                            className="pr-12"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading || isSubscribed}
                                        />
                                        {isSubscribed && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                                            >
                                                <CheckCircle size={18} />
                                            </motion.div>
                                        )}
                                    </div>
                                    
                                    <Button
                                        type="submit"
                                        className="w-full group"
                                        disabled={isLoading || isSubscribed}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Subscribing...
                                            </>
                                        ) : isSubscribed ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Subscribed!
                                            </>
                                        ) : (
                                            <>
                                                Subscribe to Newsletter
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-sm text-center"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                    {success && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-green-500 text-sm text-center"
                                        >
                                            {success}
                                        </motion.p>
                                    )}
                                </form>

                                <p className="text-xs text-muted-foreground text-center mt-4">
                                    Join 15,000+ professionals. Unsubscribe anytime.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container px-4 md:px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Company Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <motion.img 
                                src="/icons/zapllo.png" 
                                alt="Zapllo Logo"
                                className="h-10 w-auto"
                                whileHover={{ scale: 1.05 }}
                            />
                            <div>
                                <span className="font-bold text-2xl">
                                    Zapllo<span className="text-primary">CRM</span>
                                </span>
                                <div className="text-xs text-muted-foreground">
                                    Never miss a lead
                                </div>
                            </div>
                        </Link>

                        <p className="text-muted-foreground max-w-md leading-relaxed">
                            The AI-powered CRM platform that transforms how businesses manage 
                            customer relationships, automate workflows, and drive growth. 
                            Trusted by 15,000+ companies worldwide.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 text-primary" />
                                <a href="mailto:support@zapllo.com" className="hover:text-foreground transition-colors">
                                    support@zapllo.com
                                </a>
                            </div>
                         
                            <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                <span>Kolkata, West Bengal, India</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4">
                            {[
                                { name: "Twitter", href: "https://twitter.com/zapllohq", icon: "twitter" },
                                { name: "LinkedIn", href: "https://www.linkedin.com/company/zapllo", icon: "linkedin" },
                                { name: "Facebook", href: "https://www.facebook.com/zapllohq", icon: "facebook" }
                            ].map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center group"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="sr-only">{social.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                                        {social.icon === "twitter" && <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />}
                                        {social.icon === "linkedin" && <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></>}
                                        {social.icon === "facebook" && <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />}
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Footer Sections */}
                    {footerSections.map((section, sectionIndex) => (
                        <div key={section.title} className="space-y-4">
                            <h3 className="font-semibold text-lg">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link, linkIndex) => (
                                    <motion.li 
                                        key={link.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                                        viewport={{ once: true }}
                                    >
                                        <Link 
                                            href={link.href} 
                                            className="text-muted-foreground hover:text-foreground transition-colors text-sm group flex items-center"
                                            target={link.href.startsWith('http') ? '_blank' : undefined}
                                            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        >
                                            {link.name}
                                            <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t">
                <div className="container px-4 md:px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <span>© {new Date().getFullYear()} Zapllo Technologies. All rights reserved.</span>
                            <div className="flex gap-4">
                                <Link href="https://zapllo.com/privacypolicy" className="hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href="https://zapllo.com/terms" className="hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                                <Link href="/cookies" className="hover:text-foreground transition-colors">
                                    Cookie Policy
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Certifications */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>SOC2 Compliant</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>GDPR Ready</span>
                            </div>

                            {/* Made in India */}
                            <motion.div
                                whileHover={{ y: -2 }}
                                className="text-xs bg-gradient-to-r from-orange-500 via-white/20 to-green-500 bg-clip-text text-transparent font-medium rounded-md px-3 py-1 bg-muted flex items-center gap-2 border"
                            >
                                <span className="text-muted-foreground">Made with</span>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
                                >
                                    ❤️
                                </motion.div>
                                <span className="bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent">
                                    in India
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}