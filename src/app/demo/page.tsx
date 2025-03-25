"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    ArrowRight, CheckCircle, Clock, Calendar, Headphones,
    Users, BarChart2, ShieldCheck, Settings, Zap
} from "lucide-react"
import Header from "@/components/landing/Header"
import Footer from "@/components/landing/Footer"
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription, AlertDialogTitle as AlertTitle } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

export default function DemoPage() {
    const [activeUsers, setActiveUsers] = useState(173)
    const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 23, minutes: 59, seconds: 59 })
    const [progress, setProgress] = useState(78)
    const [email, setEmail] = useState("")
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    // Simulate active users changing
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveUsers(prev => Math.floor(prev + Math.random() * 5 - 2))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 }
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
                }
                return prev
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const features = [
        {
            name: "Live Dashboard",
            icon: <BarChart2 className="h-5 w-5 text-primary" />,
            description: "Real-time insights into your business performance"
        },
        {
            name: "Contact Management",
            icon: <Users className="h-5 w-5 text-primary" />,
            description: "Organize and manage customer relationships effectively"
        },
        {
            name: "Task Automation",
            icon: <Zap className="h-5 w-5 text-primary" />,
            description: "Automate repetitive tasks and focus on growth"
        },
        {
            name: "Advanced Security",
            icon: <ShieldCheck className="h-5 w-5 text-primary" />,
            description: "Enterprise-grade security to protect your data"
        },
    ]

    const testimonials = [
        {
            quote: "Since implementing ZaplloCRM, we've seen a 40% increase in sales conversions. The automated follow-ups alone have generated an additional $125,000 in revenue.",
            author: "Michael Chen",
            title: "Sales Director",
            company: "TechVision Inc.",
            image: "/avatars/man1.jpg"
        },
        {
            quote: "I was skeptical at first, but within 2 weeks our team was closing deals 30% faster. The pipeline visibility has transformed how we prioritize leads.",
            author: "Jessica Williams",
            title: "CEO",
            company: "GrowthEdge Partners",
            image: "/avatars/sarah.jpg"
        },
        {
            quote: "The customer support alone is worth the investment. They helped us customize the CRM exactly to our workflow, and we've seen productivity go up by 52%.",
            author: "David Rodriguez",
            title: "Operations Manager",
            company: "Innovate Solutions",
            image: "/avatars/man2.jpg"
        }
    ]

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow">
                {/* Hero section with animated elements and limited-time offer */}
                <section className="relative pt-24 lg:pt-32 overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-background/20" />
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-primary/5"
                                initial={{
                                    x: Math.random() * 100 - 50 + "%",
                                    y: Math.random() * 100 + "%",
                                    width: Math.random() * 300 + 100,
                                    height: Math.random() * 300 + 100,
                                    opacity: 0.1 + Math.random() * 0.1
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
                        {/* Live user counter */}
                        <motion.div
                            className="mx-auto mb-6 flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm text-primary max-w-fit"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span><strong>{activeUsers}</strong> people currently viewing this demo</span>
                        </motion.div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                className="flex flex-col max-w-[600px] mx-auto lg:mx-0 text-center lg:text-left"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Badge className="mb-4 w-fit mx-auto lg:mx-0 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Limited Time Special Offer
                                </Badge>

                                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                                    Experience the <span className="text-primary">Future</span> of CRM Before It's Too Late
                                </h1>

                                <p className="text-lg text-muted-foreground mb-6">
                                    Join the thousands of businesses revolutionizing their sales process with our AI-powered CRM platform. Don't miss out on our exclusive 50% discount - ending soon!
                                </p>

                                <div className="bg-card border rounded-lg p-4 mb-6">
                                    <p className="font-medium text-base mb-2">Special offer ends in:</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(timeLeft).map(([unit, value]) => (
                                            <div key={unit} className="flex flex-col items-center">
                                                <div className="bg-primary/10 text-primary rounded-md px-3 py-2 font-mono font-bold text-lg w-full">
                                                    {value.toString().padStart(2, '0')}
                                                </div>
                                                <span className="text-xs text-muted-foreground mt-1">{unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span>Offer completion</span>
                                        <span className="font-medium">{progress}% claimed</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button className="relative group overflow-hidden">
                                        <span className="relative z-10 flex items-center">
                                            Start your free trial now
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                        <span className="absolute inset-0 bg-primary z-0 group-hover:bg-opacity-0 transition-all duration-300" />
                                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-primary to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle,_white_10%,_transparent_70%)] group-hover:animate-shine" />
                                    </Button>
                                    <Button variant="outline" className="group">
                                        Watch video demo
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center lg:justify-start mt-6 text-sm text-muted-foreground gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>No credit card required</span>
                                    <span className="mx-2">•</span>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>7-day free trial</span>
                                    <span className="mx-2">•</span>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Cancel anytime</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="relative rounded-lg overflow-hidden shadow-xl"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                <div className="bg-card rounded-lg border overflow-hidden">
                                    <div className="flex items-center justify-between border-b p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">Dashboard Demo</div>
                                    </div>
                                    <div className="p-4">
                                        <img
                                            src="/demo/dashboard.png"
                                            alt="ZaplloCRM Dashboard"
                                            className="w-full rounded-md shadow-sm border"
                                        />
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <Input
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="col-span-2 sm:col-span-1"
                                            />
                                            <Button className="col-span-2 sm:col-span-1 relative group overflow-hidden">
                                                <span className="relative z-10 flex items-center">
                                                    Try it now
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </span>
                                                <span className="absolute inset-0 bg-primary z-0 group-hover:bg-opacity-0 transition-all duration-300" />
                                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle,_white_10%,_transparent_70%)] group-hover:animate-shine" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating badge */}
                                <Badge className="absolute top-4 right-4 bg-green-500 text-white">50% OFF</Badge>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Social proof section */}
                <section className="py-16 bg-slate-50 dark:bg-slate-900/50 mt-16">
                    <div className="container px-4 md:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Join Industry Leaders Using ZaplloCRM</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Thousands of businesses have already transformed their sales process with our platform
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
                            {["amazon", "netflix", "spotify", "slack", "meta"].map((company, i) => (
                                <motion.div
                                    key={company}
                                    className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.7 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={`/brands/${company}.png`}
                                        alt={`${company} logo`}
                                        className="h-10 w-auto md:h-12"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features highlight section */}
                <section className="py-16">
                    <div ref={ref} className="container px-4 md:px-6">
                        <motion.div
                            className="text-center max-w-3xl mx-auto mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Badge className="mb-4 bg-primary/10 text-primary">Exclusive Features</Badge>
                            <h2 className="text-3xl font-bold mb-4">Why You'll Love ZaplloCRM</h2>
                            <p className="text-muted-foreground">
                                Our platform is packed with innovative features designed to transform your sales process and boost your revenue
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group"
                                >
                                    <Card className="h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                                {feature.icon}
                                            </div>
                                            <CardTitle>{feature.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>{feature.description}</CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonial Carousel */}
                <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
                    <div className="container px-4 md:px-6">
                        <div className="text-center mb-12">
                            <Badge className="mb-4 bg-primary/10 text-primary">Success Stories</Badge>
                            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Don't just take our word for it - see how ZaplloCRM has transformed businesses like yours
                            </p>
                        </div>

                        <Carousel className="w-full max-w-4xl mx-auto">
                            <CarouselContent>
                                {testimonials.map((testimonial, index) => (
                                    <CarouselItem key={index}>
                                        <Card className="border-none shadow-lg bg-card">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={testimonial.image}
                                                            alt={testimonial.author}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg italic mb-4">"{testimonial.quote}"</p>
                                                        <p className="font-semibold">{testimonial.author}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {testimonial.title}, {testimonial.company}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </section>

                {/* Final Call to Action */}
                <section className="py-16 relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-white/10"
                                initial={{
                                    x: Math.random() * 100 - 50 + "%",
                                    y: Math.random() * 100 + "%",
                                    width: Math.random() * 300 + 100,
                                    height: Math.random() * 300 + 100,
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
                        <div className="max-w-3xl mx-auto text-center text-white">
                            <Badge className="mb-4 bg-white/20 text-white">Don't Miss Out</Badge>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Limited Time: Get 50% OFF Your First 3 Months
                            </h2>
                            <p className="text-white/90 text-lg mb-8">
                                Join over 10,000 businesses that have transformed their sales process with ZaplloCRM.
                                Our special offer ends soon - don't wait until it's too late!
                            </p>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    {Object.entries(timeLeft).map(([unit, value]) => (
                                        <div key={unit} className="flex flex-col items-center">
                                            <div className="bg-white/20 text-white rounded-md px-3 py-4 font-mono font-bold text-2xl w-full">
                                                {value.toString().padStart(2, '0')}
                                            </div>
                                            <span className="text-sm text-white/80 mt-2 capitalize">{unit}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 relative group overflow-hidden">
                                        <span className="relative z-10 flex items-center">
                                            Claim your 50% discount
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                        <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle,_#7c3aed_10%,_transparent_70%)] group-hover:animate-shine" />
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                        Schedule a demo
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-center gap-8 text-white/90 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-300" />
                                    <span>7-day free trial</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-300" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-300" />
                                    <span>Cancel anytime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16">
                    <div className="container px-4 md:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground">Everything you need to know about ZaplloCRM</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {[
                                {
                                    question: "How long is the free trial?",
                                    answer: "Our free trial lasts for 14 days, giving you ample time to explore all features. No credit card required to start."
                                },
                                {
                                    question: "Can I export my data if I decide to cancel?",
                                    answer: "Absolutely! We provide easy export options for all your data, ensuring you maintain ownership of your information."
                                },
                                {
                                    question: "Is there a limit to the number of contacts?",
                                    answer: "Our plans are designed to scale with your business. The free trial includes up to 500 contacts, with paid plans supporting unlimited contacts."
                                },
                                {
                                    question: "What kind of support do you offer?",
                                    answer: "We provide 24/7 support through chat, email, and phone. Our dedicated customer success team ensures you get the most out of ZaplloCRM."
                                },
                                {
                                    question: "Can I customize the CRM to fit my business?",
                                    answer: "Yes! ZaplloCRM is highly customizable with custom fields, automation rules, and workflow settings tailored to your specific needs."
                                },
                                {
                                    question: "Do you offer onboarding assistance?",
                                    answer: "All plans include personalized onboarding to help you get set up quickly. Our team will help import your data and configure the system."
                                }
                            ].map((faq, index) => (
                                <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{faq.answer}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-muted-foreground">
                                Still have questions? <Link href="/contact" className="text-primary hover:underline">Contact our team</Link>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Final sticky CTA */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-40 md:hidden">
                    <Button className="w-full relative group overflow-hidden">
                        <span className="relative z-10 flex items-center">
                            Start your free trial now
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <span className="absolute inset-0 bg-primary z-0 group-hover:bg-opacity-0 transition-all duration-300" />
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-primary to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Button>
                </div>
            </main>

            <Footer />
        </div>
    )
}