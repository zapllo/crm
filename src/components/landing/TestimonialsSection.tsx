"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    quote: "Our sales team has increased productivity by 40% since implementing this CRM. The automation features alone have saved us 15+ hours per week on administrative tasks.",
    author: "Sarah Johnson",
    title: "Sales Director",
    company: "TechCorp Inc.",
    avatar: "/avatars/sarah.jpg",
    initials: "SJ",
    rating: 5,
    industry: "Technology"
  },
  {
    quote: "The customer management features have transformed how we build relationships. We're seeing higher retention rates and more referrals than ever before.",
    author: "Michael Chen",
    title: "Customer Success Manager",
    company: "GrowthBox",
    avatar: "/avatars/michael.jpg",
    initials: "MC",
    rating: 5,
    industry: "SaaS"
  },
  {
    quote: "I was skeptical about switching CRMs, but the onboarding process was seamless and our team adopted it quickly. The ROI has been tremendous.",
    author: "Jessica Williams",
    title: "VP of Operations",
    company: "Innovate Solutions",
    avatar: "/avatars/jessica.jpg",
    initials: "JW",
    rating: 5,
    industry: "Consulting"
  },
  {
    quote: "This platform has completely transformed our sales process. We've closed 27% more deals in the first quarter after implementation.",
    author: "David Rodriguez",
    title: "CRO",
    company: "Scale Ventures",
    avatar: "/avatars/david.jpg",
    initials: "DR",
    rating: 5,
    industry: "Financial Services"
  },
  {
    quote: "The reporting features give us insights we never had before. Now we can make data-driven decisions that have improved our conversion rates by 35%.",
    author: "Emily Chang",
    title: "Marketing Director",
    company: "Bright Marketing",
    avatar: "/avatars/emily.jpg",
    initials: "EC",
    rating: 4,
    industry: "Marketing"
  },
  {
    quote: "The mobile app is incredible. Our field sales team can update deals and contact info on the go, which has made us much more responsive to client needs.",
    author: "James Wilson",
    title: "Field Sales Manager",
    company: "Global Distribution Co.",
    avatar: "/avatars/james.jpg",
    initials: "JW",
    rating: 5,
    industry: "Manufacturing"
  }
]

export default function TestimonialsSection({ id }: { id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => 
      prev + visibleCount >= testimonials.length ? 0 : prev + 1
    )
  }
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => 
      prev === 0 ? testimonials.length - visibleCount : prev - 1
    )
  }
  
  return (
    <section id={id} ref={ref} className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center text-center space-y-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
            <span className="animate-pulse mr-1">❤️</span> Testimonials
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
            Loved by businesses worldwide
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
            Don't just take our word for it. See what our customers have to say about their experience with our CRM platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {["All Industries", "Technology", "SaaS", "Consulting", "Marketing", "Financial Services"].map((industry, i) => (
              <Badge 
                key={industry} 
                variant={i === 0 ? "default" : "outline"} 
                className="cursor-pointer"
              >
                {industry}
              </Badge>
            ))}
          </div>
        </motion.div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="hidden md:flex absolute -left-12 top-1/2 transform -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-10 w-10 bg-background shadow-sm"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous testimonials</span>
            </Button>
          </div>
          
          <div className="hidden md:flex absolute -right-12 top-1/2 transform -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-10 w-10 bg-background shadow-sm"
              onClick={nextTestimonial}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next testimonials</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="wait">
              {testimonials.slice(activeIndex, activeIndex + visibleCount).map((testimonial, index) => (
                <motion.div
                  key={`${testimonial.author}-${activeIndex + index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="h-full shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-primary/40" />
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <Quote className="h-8 w-8 text-primary/20 group-hover:text-primary/40 transition-colors" />
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-base italic mb-6 text-foreground/90 min-h-[100px]">"{testimonial.quote}"</p>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex flex-col items-start">
                      <div className="flex items-center space-x-4 w-full">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                          <AvatarFallback className="bg-primary/10 text-primary">{testimonial.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{testimonial.author}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {testimonial.title}, {testimonial.company}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {testimonial.industry}
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center mt-8 md:hidden space-x-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevTestimonial}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextTestimonial}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <motion.div 
          className="mt-16 flex flex-wrap justify-center items-center gap-x-8 gap-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="text-center md:text-left md:mr-auto">
            <p className="text-lg font-medium">Trusted by leading companies worldwide</p>
          </div>
          
          {["amazon", "netflix", "spotify", "slack", "meta"].map((company, i) => (
            <motion.div 
              key={company} 
              className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 0.7 } : { opacity: 0 }}
              transition={{ delay: 0.8 + (i * 0.1) }}
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={`/brands/${company}.png`} 
                alt={`${company} logo`} 
                className="h-8 w-auto md:h-10"
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* <motion.div 
          className="mt-20 max-w-3xl mx-auto bg-card rounded-xl overflow-hidden shadow-lg border"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-3 p-8">
              <div className="text-sm text-primary font-medium mb-2">SUCCESS STORY</div>
              <h3 className="text-2xl font-bold mb-4">How TechCorp increased sales by 40% in 3 months</h3>
              <p className="text-muted-foreground mb-6">
                Learn how TechCorp streamlined their sales process, improved team collaboration, and 
                accelerated their growth with our CRM platform.
              </p>
              <Button>
                Read case study
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="md:col-span-2 bg-slate-100 dark:bg-slate-800 hidden md:block">
              <img
                src="/images/case-study.jpg"
                alt="Case study"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div> */}
      </div>
    </section>
  )
}