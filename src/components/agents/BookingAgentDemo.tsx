"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Bell,
  RefreshCw,
  Users,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Globe
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AIAutomationForm from "./aiautomation";

export default function BookingAgentDemo() {
  const [activeTab, setActiveTab] = useState("demo");

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const features = [
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Smart Scheduling",
      description: "AI automatically finds the optimal time slots based on availability and customer preferences."
    },
    {
      icon: <Bell className="h-10 w-10 text-primary" />,
      title: "Automated Reminders",
      description: "Reduce no-shows with timely, personalized reminders via email, SMS, or WhatsApp."
    },
    {
      icon: <RefreshCw className="h-10 w-10 text-primary" />,
      title: "Seamless Rescheduling",
      description: "Allow customers to reschedule with zero friction, maintaining your calendar efficiency."
    },
    {
      icon: <Globe className="h-10 w-10 text-primary" />,
      title: "Multi-timezone Support",
      description: "Automatically adjust for timezone differences to prevent scheduling conflicts."
    }
  ];

  const testimonials = [
    {
      quote: "Our appointment no-shows decreased by 78% after implementing Zapllo's AI booking agent.",
      author: "Dr. Michelle Rodriguez",
      position: "Medical Director, HealthFirst Clinic"
    },
    {
      quote: "We saved 35 hours per week that our staff previously spent on scheduling and reminders.",
      author: "Alex Thompson",
      position: "Operations Manager, Stellar Consulting"
    }
  ];

  // Sample calendar visualization (simplified)
  const CalendarPreview = () => (
    <div className="relative border rounded-xl p-3 bg-background shadow-sm">
      <div className="text-center pb-2 border-b mb-2 font-medium">October 2023</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div key={i} className="text-muted-foreground">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
          <div
            key={date}
            className={`
              p-1 rounded-full text-xs flex items-center justify-center aspect-square
              ${date === 5 || date === 12 || date === 19 ? 'bg-primary text-primary-foreground' : ''}
              ${date === 8 || date === 15 || date === 22 ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' : ''}
            `}
          >
            {date}
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>Booked Appointments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"></div>
          <span>Available Slots</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* Hero Section */}
      <section className="container px-4 py-20 mx-auto">
        <motion.div
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/50">
            BOOKING AUTOMATION
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            Revolutionize Your Appointment Scheduling
          </h1>

          <p className="text-xl max-w-3xl text-muted-foreground mb-8">
            Our AI booking agent handles scheduling, confirmations, and reminders 24/7,
            ensuring your calendar stays optimized and your clients stay engaged.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="gap-2 group"
              onClick={() => setActiveTab("demo")}
            >
              Experience the Demo <Calendar className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.open("https://calendly.com/zapllo/booking-demo", "_blank")}
            >
              Talk to an Expert <Users className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Interactive Tabs */}
        <Tabs
          defaultValue="demo"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-5xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-3 mb-12 bg-accent ">
            <TabsTrigger className='border-none'  value="demo">Request Demo</TabsTrigger>
            <TabsTrigger className='border-none'  value="features">How It Works</TabsTrigger>
            <TabsTrigger  className='border-none' value="results">Success Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="demo">
            <div className="grid md:grid-cols-5 gap-8">
              <Card className="col-span-3 backdrop-blur-sm bg-card/90 border border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Experience Our AI Booking Agent
                  </CardTitle>
                  <CardDescription>
                    Submit your information to receive a personalized demo of our booking agent in action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIAutomationForm agentType="booking" />
                </CardContent>
                <CardFooter className="border-t border-border/40 pt-4 text-sm text-muted-foreground">
                  Within minutes, our AI agent will contact you to arrange a personalized demonstration
                </CardFooter>
              </Card>

              <div className="col-span-2">
                <motion.div
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  className="space-y-6"
                >
                  <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Preview: AI Booking Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CalendarPreview />

                      <div className="mt-4 space-y-2 border-t pt-4">
                        <div className="flex items-start gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Instant Booking</p>
                            <p className="text-muted-foreground text-xs">Clients book 24/7 without wait times</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Zero Double-bookings</p>
                            <p className="text-muted-foreground text-xs">Calendar syncs across all platforms</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="group"
                >
                  <Card className="h-full hover:shadow-md transition-all duration-300 border border-primary/10 group-hover:border-primary/30">
                    <CardHeader>
                      <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-12 p-6 border rounded-lg bg-primary/5 border-primary/20"
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-4">How The Booking Process Works</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">1</div>
                  <div>
                    <p className="font-medium">Client Requests Appointment</p>
                    <p className="text-muted-foreground">Through your website, WhatsApp, or other channels</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">2</div>
                  <div>
                    <p className="font-medium">AI Agent Engages in Conversation</p>
                    <p className="text-muted-foreground">Asks qualifying questions and determines appointment needs</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">3</div>
                  <div>
                    <p className="font-medium">Optimal Time Slots Offered</p>
                    <p className="text-muted-foreground">Based on your availability and booking policies</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">4</div>
                  <div>
                    <p className="font-medium">Confirmation & Reminders</p>
                    <p className="text-muted-foreground">Automated messages sent at strategic intervals</p>
                  </div>
                </li>
              </ol>
            </motion.div>

            <div className="text-center mt-10">
              <Button
                size="lg"
                onClick={() => setActiveTab("demo")}
                className="gap-2"
              >
                Try It For Your Business <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Card className="h-full bg-primary/5 border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      Measurable Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Reduction in No-shows</span>
                          <span className="text-primary">82%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "82%" }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Time Saved per Week</span>
                          <span className="text-primary">35hrs</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "76%" }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Increase in Booking Volume</span>
                          <span className="text-primary">47%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "47%" }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Client Satisfaction</span>
                          <span className="text-primary">94%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "94%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">Success Stories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="p-5 bg-muted rounded-lg">
                        <p className="mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                        <p className="font-medium">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                      </div>
                    ))}

                    <div className="p-5 border border-dashed border-primary/30 rounded-lg text-center">
                      <p className="font-medium text-primary mb-1">Want to be our next success story?</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setActiveTab("demo")}
                      >
                        Get started today →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl">Industries Using Our Booking Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Healthcare", "Legal Services", "Consulting", "Beauty & Wellness",
                    "Fitness", "Real Estate", "Financial Services", "Education",
                    "IT Services", "Hospitality"
                  ].map((industry, i) => (
                    <Badge key={i} variant="secondary" className="py-1.5 px-3">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button
                  onClick={() => setActiveTab("demo")}
                  className="gap-2"
                >
                  See If It Works For Your Industry <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
