"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  MessageSquare,
  BarChart3,
  Calendar,
  Zap,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AIAutomationForm from "./aiautomation";

export default function SalesAgentDemo() {
  const [activeTab, setActiveTab] = useState("demo");

  // Animation variants for motion components
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Intelligent Conversations",
      description: "Our AI engages prospects in natural, contextual conversations that qualify leads effectively."
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Performance Analytics",
      description: "Track conversion rates, engagement metrics, and ROI with real-time dashboards."
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Automated Scheduling",
      description: "Let AI handle meeting coordination and calendar management with prospects."
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "24/7 Availability",
      description: "Never miss a lead with round-the-clock engagement across all time zones."
    }
  ];

  const testimonials = [
    {
      quote: "Zapllo's AI sales agent increased our qualified leads by 64% while reducing our sales team's workload.",
      author: "Sarah Chen",
      position: "VP of Sales, TechCorp Inc."
    },
    {
      quote: "We implemented Zapllo and saw ROI within the first month. Our sales cycle shortened by 40%.",
      author: "Marcus Johnson",
      position: "CMO, GrowthByte Solutions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container px-4 py-20 mx-auto">
        <motion.div
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/50">
            SALES AUTOMATION
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
            Transform Your Sales Process with AI
          </h1>

          <p className="text-xl max-w-3xl text-muted-foreground mb-8">
            Our AI sales agent qualifies leads, books meetings, and nurtures prospects 24/7
            without human intervention, all while improving conversion rates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="gap-2 group"
              onClick={() => setActiveTab("demo")}
            >
              Start Your Demo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.open("https://calendly.com/zapllo/demo", "_blank")}
            >
              Schedule a Call <Calendar className="w-4 h-4" />
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
            <TabsTrigger className='border-none' value="demo">Request Demo</TabsTrigger>
            <TabsTrigger className='border-none' value="features">Features</TabsTrigger>
            <TabsTrigger className='border-none' value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="p-1">
            <Card className="backdrop-blur-sm bg-card/80 border border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Experience Zapllo's AI Sales Agent
                </CardTitle>
                <CardDescription>
                  Fill out the form below to get a personalized demo of our AI sales agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIAutomationForm agentType="sales" />
              </CardContent>
              <CardFooter className="border-t border-border/40 pt-4 text-sm text-muted-foreground">
                You'll receive a demonstration via WhatsApp and email immediately after submitting
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  custom={index}
                >
                  <Card className="h-full hover:shadow-md transition-shadow duration-300 border border-primary/10">
                    <CardHeader>
                      <div className="mb-4">{feature.icon}</div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button
                size="lg"
                onClick={() => setActiveTab("demo")}
                className="gap-2"
              >
                Get Started Now <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
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
                      Proven Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-background rounded-lg">
                      <p className="text-4xl font-bold text-primary">68%</p>
                      <p className="text-sm text-muted-foreground">Increase in Qualified Leads</p>
                    </div>
                    <div className="text-center p-4 bg-background rounded-lg">
                      <p className="text-4xl font-bold text-primary">41%</p>
                      <p className="text-sm text-muted-foreground">Reduction in Sales Cycle</p>
                    </div>
                    <div className="text-center p-4 bg-background rounded-lg">
                      <p className="text-4xl font-bold text-primary">24/7</p>
                      <p className="text-sm text-muted-foreground">Lead Engagement</p>
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
                    <CardTitle className="text-2xl">Client Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg">
                        <p className="mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                        <p className="font-medium">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            <div className="text-center">
              <Button
                size="lg"
                onClick={() => setActiveTab("demo")}
                className="gap-2"
              >
                Experience It Yourself <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
