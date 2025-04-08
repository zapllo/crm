"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  // Technology
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
    quote: "The AI-powered insights have completely changed how we approach our sales strategy. We're now able to identify opportunities we would have missed before.",
    author: "Alex Thompson",
    title: "CTO",
    company: "Innovate Tech",
    avatar: "/avatars/alex.jpg",
    initials: "AT",
    rating: 5,
    industry: "Technology"
  },
  {
    quote: "As a fast-growing tech company, we needed a CRM that could scale with us. This platform has exceeded our expectations in every way.",
    author: "Rajiv Patel",
    title: "VP of Sales",
    company: "NextGen Solutions",
    avatar: "/avatars/rajiv.jpg",
    initials: "RP",
    rating: 4,
    industry: "Technology"
  },

  // SaaS
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
    quote: "This CRM has the best user experience we've seen. Our team adoption was nearly 100% within the first week, which is unheard of for new software.",
    author: "Lisa Nguyen",
    title: "Head of Operations",
    company: "CloudStack",
    avatar: "/avatars/lisa.jpg",
    initials: "LN",
    rating: 5,
    industry: "SaaS"
  },
  {
    quote: "The API integrations are fantastic. We've been able to connect all our existing tools and create a seamless workflow that has dramatically improved our efficiency.",
    author: "Daniel Smith",
    title: "Product Manager",
    company: "SaaSify",
    avatar: "/avatars/daniel.jpg",
    initials: "DS",
    rating: 4,
    industry: "SaaS"
  },

  // Consulting
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
    quote: "Our consultants are able to access client information from anywhere, which has made our team much more responsive and effective during client meetings.",
    author: "Robert Martinez",
    title: "Managing Partner",
    company: "Elite Consulting Group",
    avatar: "/avatars/robert.jpg",
    initials: "RM",
    rating: 5,
    industry: "Consulting"
  },
  {
    quote: "The reporting capabilities have been a game-changer for our quarterly client reviews. We can now showcase our impact with beautiful, data-driven presentations.",
    author: "Sophia Lee",
    title: "Senior Consultant",
    company: "Strategic Advisors",
    avatar: "/avatars/sophia.jpg",
    initials: "SL",
    rating: 4,
    industry: "Consulting"
  },

  // Financial Services
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
    quote: "Compliance is critical in our industry, and this CRM's audit trails and security features give us the confidence we need to manage sensitive client information.",
    author: "Jennifer Morgan",
    title: "Compliance Officer",
    company: "Secure Investments",
    avatar: "/avatars/jennifer.jpg",
    initials: "JM",
    rating: 5,
    industry: "Financial Services"
  },
  {
    quote: "The pipeline forecasting has dramatically improved how we project quarterly performance. We're now able to make much more accurate predictions.",
    author: "Thomas Wilson",
    title: "Investment Advisor",
    company: "Wealth Partners",
    avatar: "/avatars/thomas.jpg",
    initials: "TW",
    rating: 5,
    industry: "Financial Services"
  },

  // Marketing
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
    quote: "Being able to track campaign performance directly within our CRM has eliminated the data silos between our marketing and sales teams.",
    author: "Mark Johnson",
    title: "Growth Marketing Manager",
    company: "Influence Media",
    avatar: "/avatars/mark.jpg",
    initials: "MJ",
    rating: 5,
    industry: "Marketing"
  },
  {
    quote: "The email marketing integration has supercharged our nurture campaigns. We're getting higher engagement rates and better conversion to sales opportunities.",
    author: "Olivia Taylor",
    title: "Digital Marketing Lead",
    company: "Elevate Agency",
    avatar: "/avatars/olivia.jpg",
    initials: "OT",
    rating: 4,
    industry: "Marketing"
  },

  // Manufacturing
  {
    quote: "The mobile app is incredible. Our field sales team can update deals and contact info on the go, which has made us much more responsive to client needs.",
    author: "James Wilson",
    title: "Field Sales Manager",
    company: "Global Distribution Co.",
    avatar: "/avatars/james.jpg",
    initials: "JW",
    rating: 5,
    industry: "Manufacturing"
  },
  {
    quote: "We've integrated our inventory management system with the CRM, giving our sales team real-time visibility into product availability when talking to customers.",
    author: "Patricia Garcia",
    title: "Operations Director",
    company: "Industrial Supplies Inc.",
    avatar: "/avatars/patricia.jpg",
    initials: "PG",
    rating: 5,
    industry: "Manufacturing"
  },
  {
    quote: "The order management workflow has reduced our processing time by 60%. Our customers are amazed at how quickly we can now fulfill their orders.",
    author: "Richard Thompson",
    title: "Supply Chain Manager",
    company: "Precision Manufacturing",
    avatar: "/avatars/richard.jpg",
    initials: "RT",
    rating: 4,
    industry: "Manufacturing"
  },

  // Healthcare
  {
    quote: "Patient communications have improved dramatically with the automated follow-up sequences. Our satisfaction scores have increased by 28% since implementation.",
    author: "Dr. Sarah Miller",
    title: "Medical Director",
    company: "Wellness Medical Group",
    avatar: "/avatars/sarah-m.jpg",
    initials: "SM",
    rating: 5,
    industry: "Healthcare"
  },
  {
    quote: "The HIPAA-compliant features give us peace of mind when managing patient information. The security protocols are robust while maintaining ease of use.",
    author: "Michael Brown",
    title: "Healthcare Administrator",
    company: "Modern Health Services",
    avatar: "/avatars/michael-b.jpg",
    initials: "MB",
    rating: 5,
    industry: "Healthcare"
  },
  {
    quote: "Scheduling and appointment management have never been easier. We've reduced no-shows by 45% with the automated reminder system.",
    author: "Dr. Elizabeth Chen",
    title: "Practice Owner",
    company: "Family Care Clinic",
    avatar: "/avatars/elizabeth.jpg",
    initials: "EC",
    rating: 4,
    industry: "Healthcare"
  },

  // Retail
  {
    quote: "The customer loyalty tracking has helped us identify and reward our VIP shoppers, resulting in a 32% increase in repeat purchases.",
    author: "Carlos Mendez",
    title: "Retail Operations Manager",
    company: "Urban Fashion",
    avatar: "/avatars/carlos.jpg",
    initials: "CM",
    rating: 5,
    industry: "Retail"
  },
  {
    quote: "Integrating our e-commerce platform with this CRM has given us a true omnichannel view of our customers, whether they shop online or in-store.",
    author: "Natalie Wong",
    title: "Digital Retail Director",
    company: "StyleHouse",
    avatar: "/avatars/natalie.jpg",
    initials: "NW",
    rating: 4,
    industry: "Retail"
  },
  {
    quote: "Inventory management tied to customer preferences has transformed our buying process. We're now stocking more of what our customers actually want.",
    author: "Brandon Lewis",
    title: "Merchandise Manager",
    company: "Trend Setters",
    avatar: "/avatars/brandon.jpg",
    initials: "BL",
    rating: 5,
    industry: "Retail"
  },

  // Education
  {
    quote: "Managing student inquiries and applications has become so much more efficient. We've increased our enrollment conversion rate by 25%.",
    author: "Dr. Alan Roberts",
    title: "Admissions Director",
    company: "Innovative Learning Academy",
    avatar: "/avatars/alan.jpg",
    initials: "AR",
    rating: 5,
    industry: "Education"
  },
  {
    quote: "The parent communication features have dramatically improved our engagement with families. Feedback has been overwhelmingly positive.",
    author: "Maria Gonzalez",
    title: "School Principal",
    company: "Excellence Education",
    avatar: "/avatars/maria.jpg",
    initials: "MG",
    rating: 4,
    industry: "Education"
  },
  {
    quote: "Tracking student progress and intervention points has helped us provide more personalized support. Our student success rates have improved significantly.",
    author: "William Turner",
    title: "Student Success Director",
    company: "Future Leaders College",
    avatar: "/avatars/william.jpg",
    initials: "WT",
    rating: 5,
    industry: "Education"
  }
]

// Get unique industries and add "All Industries" at beginning
const industries = ["All Industries", ...Array.from(new Set(testimonials.map(t => t.industry)))];

export default function TestimonialsSection({ id }: { id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries")
  const [filteredTestimonials, setFilteredTestimonials] = useState(testimonials)

  // Update filtered testimonials when industry changes
  useEffect(() => {
    if (selectedIndustry === "All Industries") {
      setFilteredTestimonials(testimonials);
    } else {
      setFilteredTestimonials(testimonials.filter(t => t.industry === selectedIndustry));
    }
    // Reset active index when filter changes
    setActiveIndex(0);
  }, [selectedIndustry]);

  // Handle responsive visible count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextTestimonial = () => {
    setActiveIndex((prev) =>
      prev + visibleCount >= filteredTestimonials.length ? 0 : prev + 1
    )
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) =>
      prev === 0 ? Math.max(0, filteredTestimonials.length - visibleCount) : prev - 1
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
            {industries.map((industry) => (
              <Badge
                key={industry}
                variant={selectedIndustry === industry ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedIndustry === industry
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10 hover:text-primary"
                }`}
                onClick={() => setSelectedIndustry(industry)}
              >
                {industry}
              </Badge>
            ))}
          </div>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {filteredTestimonials.length > visibleCount && (
            <>
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
            </>
          )}

          {filteredTestimonials.length > 0 ? (
            <div className={`grid grid-cols-1 ${
              visibleCount === 1 ? '' : visibleCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
            } gap-6 md:gap-8`}>
              <AnimatePresence mode="wait">
                {filteredTestimonials
                  .slice(activeIndex, Math.min(activeIndex + visibleCount, filteredTestimonials.length))
                  .map((testimonial, index) => (
                  <motion.div
                    key={`${testimonial.author}-${activeIndex + index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="h-full"
                    layout
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
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="mx-auto max-w-md">
                <Quote className="h-12 w-12 mx-auto mb-4 text-primary/20" />
                <h3 className="text-lg font-medium mb-2">No testimonials found</h3>
                <p className="text-muted-foreground mb-6">
                  We don't have any testimonials from this industry yet.
                </p>
                <Button variant="outline" onClick={() => setSelectedIndustry("All Industries")}>
                  View all testimonials
                </Button>
              </div>
            </motion.div>
          )}

          {filteredTestimonials.length > visibleCount && (
            <div className="flex justify-center mt-8 md:hidden space-x-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevTestimonial}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextTestimonial}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
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
      </div>
    </section>
  )
}
