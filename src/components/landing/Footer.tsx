"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function Footer() {
    return (
        <footer className="bg-card border-t">
            <div className="container px-4 md:px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <img src='/icons/zapllo.png' />
                            <span className="font-bold text-lg">Zapllo<span className="text-primary">CRM</span></span>
                        </Link>
                        <p className="text-muted-foreground mb-4 max-w-sm">
                            Transform your customer relationships and grow your business with our powerful,
                            intuitive CRM platform.
                        </p>
                        <div className="flex flex-col space-y-2">
                            <div className="flex space-x-4">
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    <span className="sr-only">Twitter</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                                </Link>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                </Link>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    <span className="sr-only">Facebook</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-lg mb-3">Product</h3>
                        <ul className="space-y-2">
                            <li><Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                            <li><Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link></li>
                            <li><Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">Changelog</Link></li>
                            <li><Link href="/documentation" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium text-lg mb-3">Company</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                            <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                            <li><Link href="/partners" className="text-muted-foreground hover:text-foreground transition-colors">Partners</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="font-medium text-lg mb-3">Subscribe to our newsletter</h3>
                            <p className="text-muted-foreground mb-4">
                                Stay updated with the latest features, tips, and customer success stories.
                            </p>
                            <div className="flex max-w-md gap-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="max-w-lg flex-1"
                                />
                                <Button type="submit" className="shrink-0">
                                    Subscribe
                                </Button>
                            </div>
                        </div>

                        <div className="md:text-right">
                            <div className="flex flex-wrap gap-4 md:justify-end">
                                <Link href="https://zapllo.com/privacypolicy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href="https://zapllo.com/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                                <Link href="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Legal
                                </Link>
                                <Link href="/sitemap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Sitemap
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                            © {new Date().getFullYear()} ZaplloCRM. All rights reserved.
                        </p>

                        <div className="flex items-center">
                            <motion.div
                                whileHover={{ y: -3 }}
                                className="text-xs bg-primary/10 text-primary rounded-md px-2 py-1 flex items-center"
                            >
                                <span className="mr-1">Made with</span>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                                >
                                    ❤️ in India
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}