"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, CheckCircle, ChevronRight } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function CTASection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: any) => {
        e.preventDefault()
        if (email) {
            setSubmitted(true)
            // Here you would typically send the email to your API
        }
    }

    const benefits = [
        "Full access to all features",
        "Personalized onboarding",
        "24/7 customer support",
        "Free data migration"
    ]

    return (
        <section ref={ref} className="w-full py-12 md:py-24 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />

            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        initial={{
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 + "%",
                            width: Math.random() * 300 + 50,
                            height: Math.random() * 300 + 50,
                            opacity: 0.05 + Math.random() * 0.1
                        }}
                        animate={{
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 + "%",
                        }}
                        transition={{
                            duration: 20 + Math.random() * 30,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                ))}
            </div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid gap-6  lg:gap-12 items-center">
                    <motion.div
                        className="flex flex-col justify-center space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="w-fit bg-white/20 text-white hover:bg-white/30 mb-2">
                            Limited Time Offer
                        </Badge>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
                                Ready to transform your customer relationships?
                            </h2>
                            <p className="text-white/90 md:text-xl max-w-[600px]">
                                Start your free 14-day trial today and see why thousands of businesses choose our CRM platform.
                            </p>
                        </div>

                        <div className="space-y-4 mt-2">
                            <motion.form
                                className="flex flex-col sm:flex-row gap-2 max-w-md"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                {!submitted ? (
                                    <>
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="bg-white/90 text-foreground border-0"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <Button type="submit" variant="secondary" className="bg-white text-primary hover:bg-white/90 transition-colors group relative overflow-hidden">
                                            <span className="relative z-10 flex items-center">
                                                Get Started
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                            <span className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle,_white_10%,_transparent_70%)] group-hover:animate-shine" />
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-md py-3 px-4 text-white">
                                        <CheckCircle className="h-5 w-5 text-green-300" />
                                        <span>Thanks! Check your email for next steps.</span>
                                    </div>
                                )}
                            </motion.form>

                            <p className="text-xs text-white/70">
                                By signing up, you agree to our <a href="/terms" className="underline hover:text-white">Terms of Service</a> and <a href="/privacy" className="underline hover:text-white">Privacy Policy</a>.
                            </p>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
                                {benefits.map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                        transition={{ delay: 0.4 + (i * 0.1), duration: 0.3 }}
                                    >
                                        <Check className="h-4 w-4 text-green-300" />
                                        <span className="text-sm text-white/90">{benefit}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>


                </div>

                <motion.div
                    className="mt-20 grid md:grid-cols-3 gap-8 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <div className="text-center md:text-left">
                        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto md:mx-0 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">100% Risk-Free</h3>
                        <p className="text-white/80 text-sm">
                            Try our platform with full access for 14 days. No credit card required.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                        <p className="text-white/80 text-sm">
                            Our customer success team is available around the clock to help you succeed.
                        </p>
                    </div>

                    <div className="text-center md:text-right">
                        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto md:ml-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">10,000+ Users</h3>
                        <p className="text-white/80 text-sm">
                            Join thousands of successful businesses already using our platform.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="mt-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <a
                        href="/testimonials"
                        className="inline-flex items-center gap-1 text-white hover:underline"
                    >
                        See more success stories
                        <ChevronRight className="h-4 w-4" />
                    </a>
                </motion.div>
            </div>
        </section>
    )
}