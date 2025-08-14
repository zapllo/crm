"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Quote, ChevronLeft, ChevronRight, Star, Play, CheckCircle } from "lucide-react"

const testimonials = [
    // Technology
    {
        quote: "Zapllo's AI features have revolutionized our lead qualification process. We're now converting 67% more prospects with half the manual effort.",
        author: "Sarah Johnson",
        title: "Sales Director",
        company: "TechCorp Inc.",
        avatar: "/avatars/sarah.jpg",
        initials: "SJ",
        rating: 5,
        industry: "Technology",
        results: "+67% conversion rate",
        featured: true
    },
    {
        quote: "The predictive analytics have completely changed our sales strategy. We can now identify high-value opportunities weeks in advance.",
        author: "Alex Thompson",
        title: "CTO",
        company: "Innovate Tech",
        avatar: "/avatars/alex.jpg",
        initials: "AT",
        rating: 5,
        industry: "Technology",
        results: "3x faster deal closure"
    },
    {
        quote: "As a fast-growing tech company, we needed a CRM that could scale with AI capabilities. Zapllo delivered beyond expectations.",
        author: "Rajiv Patel",
        title: "VP of Sales",
        company: "NextGen Solutions",
        avatar: "/avatars/rajiv.jpg",
        initials: "RP",
        rating: 5,
        industry: "Technology",
        results: "500% team scaling"
    },

    // SaaS
    {
        quote: "The intelligent contact management and automated follow-ups have increased our customer retention by 45%. It's like having an AI sales assistant.",
        author: "Michael Chen",
        title: "Customer Success Manager",
        company: "GrowthBox",
        avatar: "/avatars/michael.jpg",
        initials: "MC",
        rating: 5,
        industry: "SaaS",
        results: "+45% retention rate",
        featured: true
    },
    {
        quote: "Implementation was seamless, and our team adopted Zapllo within days. The AI-powered insights have transformed our decision-making process.",
        author: "Lisa Nguyen",
        title: "Head of Operations",
        company: "CloudStack",
        avatar: "/avatars/lisa.jpg",
        initials: "LN",
        rating: 5,
        industry: "SaaS",
        results: "2-day implementation"
    },

    // Financial Services
    {
        quote: "Zapllo's compliance features and AI-driven analytics have helped us increase our deal closing rate by 34% while maintaining full regulatory compliance.",
        author: "David Rodriguez",
        title: "CRO",
        company: "Scale Ventures",
        avatar: "/avatars/david.jpg",
        initials: "DR",
        rating: 5,
        industry: "Financial Services",
        videoUrl: "/testimonials/david-rodriguez.mp4",
        results: "+34% deal closure",
        featured: true
    },

    // More testimonials...
    {
        quote: "The integration with our existing tools was flawless. Zapllo connected with our entire tech stack through Zapier in under an hour.",
        author: "Emily Chang",
        title: "Marketing Director", 
        company: "Bright Marketing",
        avatar: "/avatars/emily.jpg",
        initials: "EC",
        rating: 5,
        industry: "Marketing",
        results: "1-hour integration"
    }
]

const industries = ["All Industries", ...Array.from(new Set(testimonials.map(t => t.industry)))]

export default function TestimonialsSection({ id }: { id?: string }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.2 })
    const [activeIndex, setActiveIndex] = useState(0)
    const [selectedIndustry, setSelectedIndustry] = useState("All Industries")
    const [filteredTestimonials, setFilteredTestimonials] = useState(testimonials)
    const [isPlaying, setIsPlaying] = useState<string | null>(null)

    // Update filtered testimonials when industry changes
    useEffect(() => {
        if (selectedIndustry === "All Industries") {
            setFilteredTestimonials(testimonials)
        } else {
            setFilteredTestimonials(testimonials.filter(t => t.industry === selectedIndustry))
        }
        setActiveIndex(0)
    }, [selectedIndustry])

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            if (filteredTestimonials.length > 1) {
                setActiveIndex((prev) => (prev + 1) % filteredTestimonials.length)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [filteredTestimonials.length])

    const nextTestimonial = () => {
        setActiveIndex((prev) => (prev + 1) % filteredTestimonials.length)
    }

    const prevTestimonial = () => {
        setActiveIndex((prev) => 
            prev === 0 ? filteredTestimonials.length - 1 : prev - 1
        )
    }

    const currentTestimonial = filteredTestimonials[activeIndex]

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
                        <Star className="h-3 w-3 mr-2 fill-current" />
                        Customer Success Stories
                    </Badge>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                        Loved by businesses{" "}
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            worldwide
                        </span>
                    </h2>
                    
                    <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                        See how companies are transforming their sales processes and achieving 
                        remarkable growth with our AI-powered CRM platform.
                    </p>

                    {/* Industry Filter */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {industries.map((industry) => (
                            <Button
                                key={industry}
                                variant={selectedIndustry === industry ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedIndustry(industry)}
                                className="transition-all"
                            >
                                {industry}
                            </Button>
                        ))}
                    </div>
                </motion.div>

                {filteredTestimonials.length > 0 ? (
                    <>
                        {/* Main Testimonial */}
                        <motion.div
                            className="max-w-5xl mx-auto mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <AnimatePresence mode="wait">
                                {currentTestimonial && (
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Card className="border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5 shadow-xl">
                                            <CardContent className="p-8 md:p-12">
                                                <div className="grid md:grid-cols-3 gap-8 items-center">
                                                    {/* Quote */}
                                                    <div className="md:col-span-2 space-y-6">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <Quote className="h-8 w-8 text-primary/40" />
                                                            <div className="flex">
                                                                {[...Array(currentTestimonial.rating)].map((_, i) => (
                                                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        
                                                        <blockquote className="text-lg md:text-xl leading-relaxed text-foreground">
                                                            "{currentTestimonial.quote}"
                                                        </blockquote>

                                                        {currentTestimonial.results && (
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    {currentTestimonial.results}
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        {/* Author */}
                                                        <div className="flex items-center gap-4 pt-4 border-t">
                                                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                                                <AvatarImage src={currentTestimonial.avatar} alt={currentTestimonial.author} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                                    {currentTestimonial.initials}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-semibold">{currentTestimonial.author}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {currentTestimonial.title}, {currentTestimonial.company}
                                                                </div>
                                                            </div>
                                                            <div className="ml-auto">
                                                                <Badge variant="outline">{currentTestimonial.industry}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Video/Visual */}
                                                    <div className="md:col-span-1">
                                                       
                                                            <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border-2 border-primary/20 flex items-center justify-center">
                                                                <div className="text-center space-y-4">
                                                                    <div className="text-4xl font-bold text-primary">
                                                                        {currentTestimonial.results?.match(/\d+/)?.[0] || "★"}
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        Results achieved with Zapllo
                                                                    </div>
                                                                </div>
                                                            </div>
                                                  
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation */}
                            {filteredTestimonials.length > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={prevTestimonial}
                                        className="rounded-full"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex gap-2">
                                        {filteredTestimonials.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`w-2 h-2 rounded-full transition-colors ${
                                                    index === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                                                }`}
                                                onClick={() => setActiveIndex(index)}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={nextTestimonial}
                                        className="rounded-full"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </motion.div>

                        {/* Featured Grid */}
                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            {filteredTestimonials
                                .filter(t => t.featured && t !== currentTestimonial)
                                .slice(0, 3)
                                .map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.author}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card className="h-full border hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                                    ))}
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {testimonial.industry}
                                                </Badge>
                                            </div>
                                            
                                            <blockquote className="text-sm italic mb-4 line-clamp-4 group-hover:line-clamp-none transition-all">
                                                "{testimonial.quote}"
                                            </blockquote>

                                            {testimonial.results && (
                                                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-4">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    {testimonial.results}
                                                </Badge>
                                            )}
                                        </CardContent>
                                        
                                        <CardFooter className="border-t p-4">
                                            <div className="flex items-center gap-3 w-full">
                                                <Avatar className="h-8 w-8 border border-primary/20">
                                                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {testimonial.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm">{testimonial.author}</div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {testimonial.title}, {testimonial.company}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="mx-auto max-w-md">
                            <Quote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No testimonials found</h3>
                            <p className="text-muted-foreground mb-6">
                                We don't have testimonials from this industry yet.
                            </p>
                            <Button variant="outline" onClick={() => setSelectedIndustry("All Industries")}>
                                View all testimonials
                                </Button>
                        </div>
                    </motion.div>
                )}

                {/* Trust Indicators */}
                <motion.div
                    className="mt-16 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 0.6, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <div className="text-center">
                        <p className="text-lg font-semibold">Trusted by industry leaders</p>
                    </div>

                    {["amazon", "netflix", "spotify", "slack", "meta"].map((company, i) => (
                        <motion.div
                            key={company}
                            className="grayscale hover:grayscale-0 transition-all duration-300"
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
                            transition={{ delay: 0.9 + (i * 0.1) }}
                            whileHover={{ scale: 1.05, opacity: 1 }}
                        >
                            <img
                                src={`/brands/${company}.png`}
                                alt={`${company} logo`}
                                className="h-8 w-auto md:h-10 filter dark:invert"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}