"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Clock,
  BarChart3,
  Layers,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ThumbsUp,
  Languages,
  BrainCircuit,
  Share2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AIAutomationForm from "./aiautomation";

export default function SupportAgentDemo() {
  const [activeTab, setActiveTab] = useState("demo");
  const [typedText, setTypedText] = useState("");
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Sample chat dialog for demonstration
  const supportDialog = [
    {
      customer: "Hi, I'm having trouble with my subscription renewal.",
      agent: "Hello! I'd be happy to help with your subscription renewal issue. Could you please provide your account email so I can look up your subscription details?"
    },
    {
      customer: "It's sarah@example.com. I was charged twice last month.",
      agent: "Thank you, Sarah. I can see that there was indeed a duplicate charge on October 15th. I've initiated a refund for the extra charge of $29.99, which should appear in your account within 3-5 business days. Is there anything else I can help with today?"
    },
    {
      customer: "That was quick! When will my current subscription expire?",
      agent: "Your current subscription is active until December 18, 2023. Would you like me to set up a reminder email a week before renewal, so you can decide if you want to continue?"
    }
  ];

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

  // Typing effect for chat demo
  useEffect(() => {
    if (currentDialogIndex >= supportDialog.length) return;

    const dialog = supportDialog[currentDialogIndex];
    const text = `Customer: ${dialog.customer}\n\nZapllo AI: ${dialog.agent}`;
    let index = 0;
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      setTypedText(text.substring(0, index));
      index++;

      if (index > text.length) {
        clearInterval(typingInterval);
        setIsTyping(false);

        // Move to next dialog after delay
        if (currentDialogIndex < supportDialog.length - 1) {
          setTimeout(() => {
            setCurrentDialogIndex(prev => prev + 1);
          }, 2000);
        }
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [currentDialogIndex]);

  // Reset demo when tab changes
  useEffect(() => {
    if (activeTab === "demo") {
      setTypedText("");
      setCurrentDialogIndex(0);
    }
  }, [activeTab]);

  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "24/7 Instant Responses",
      description: "Never keep customers waiting with immediate, accurate support at any time of day or night."
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: "Contextual Understanding",
      description: "Our AI comprehends complex queries and maintains conversation context for natural interactions."
    },
    {
      icon: <Layers className="h-10 w-10 text-primary" />,
      title: "Smart Escalation",
      description: "Automatically routes complex issues to human agents with full conversation context."
    },
    {
      icon: <Languages className="h-10 w-10 text-primary" />,
      title: "Multilingual Support",
      description: "Communicate with customers in over 30 languages to provide truly global support."
    }
  ];

  const metrics = [
    { label: "First Response Time", before: "3.2 hours", after: "< 5 seconds", improvement: "99%" },
    { label: "Issue Resolution Rate", before: "67%", after: "92%", improvement: "37%" },
    { label: "Customer Satisfaction", before: "72%", after: "94%", improvement: "31%" },
    { label: "Support Team Capacity", before: "100%", after: "325%", improvement: "225%" }
  ];

  // Chat message component
  const ChatMessage = ({ sender, message }: { sender: string; message: string }) => (
    <div className={`mb-4 ${sender === 'agent' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}>
      <div className={`rounded-lg p-3 ${sender === 'agent' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        {message}
      </div>
      <div className={`text-xs mt-1 text-muted-foreground ${sender === 'agent' ? 'text-right' : ''}`}>
        {sender === 'agent' ? 'Zapllo AI' : 'Customer'}
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
            SUPPORT AUTOMATION
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-500">
            AI-Powered Customer Support
          </h1>

          <p className="text-xl max-w-3xl text-muted-foreground mb-8">
            Our AI support agent resolves customer issues instantly, 24/7,
            across all channels while maintaining your brand voice and escalating when necessary.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="gap-2 group"
              onClick={() => setActiveTab("demo")}
            >
              Experience the Demo <MessageSquare className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.open("https://calendly.com/zapllo/support-demo", "_blank")}
            >
              Schedule Consultation <Clock className="w-4 h-4" />
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
          <TabsList className="grid w-full grid-cols-3 bg-accent mb-12">
            <TabsTrigger className='border-none' value="demo">Try It Now</TabsTrigger>
            <TabsTrigger className='border-none' value="features">Capabilities</TabsTrigger>
            <TabsTrigger className='border-none' value="results">Business Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="demo">
            <div className="grid md:grid-cols-5 gap-8">
              <Card className="col-span-2 backdrop-blur-sm bg-card/90 border border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Live Support Demo
                  </CardTitle>
                  <CardDescription>
                    Watch our AI handle a typical customer issue in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[380px] overflow-y-auto font-mono text-sm p-4 bg-muted/50 rounded-md">
                  <pre className="whitespace-pre-wrap">{typedText}</pre>
                  {isTyping && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>}
                </CardContent>
                <CardFooter className="border-t border-border/40 pt-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sample conversation</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTypedText("");
                      setCurrentDialogIndex(0);
                    }}
                    disabled={currentDialogIndex === 0 && typedText === ""}
                  >
                    Restart Demo
                  </Button>
                </CardFooter>
              </Card>

              <Card className="col-span-3 backdrop-blur-sm bg-card/90 border border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Request Your Personalized Demo
                  </CardTitle>
                  <CardDescription>
                    Get a customized demo for your specific support needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIAutomationForm agentType="support" />
                </CardContent>
                <CardFooter className="border-t border-border/40 pt-4 text-sm text-muted-foreground">
                  We'll respond with your personalized demo within 10 minutes
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <motion.div
              className="grid md:grid-cols-2 gap-6 mb-12"
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
              className="grid md:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl">Channels We Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: "Website Chat", icon: <MessageSquare className="h-4 w-4" /> },
                        { name: "WhatsApp", icon: <Share2 className="h-4 w-4" /> },
                        { name: "Email", icon: <MessageSquare className="h-4 w-4" /> },
                        { name: "SMS", icon: <MessageSquare className="h-4 w-4" /> },
                        { name: "Facebook Messenger", icon: <MessageSquare className="h-4 w-4" /> },
                        { name: "Instagram DM", icon: <MessageSquare className="h-4 w-4" /> },
                        { name: "Slack", icon: <MessageSquare className="h-4 w-4" /> },
                        { name: "Telegram", icon: <Share2 className="h-4 w-4" /> }
                      ].map((channel, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-border bg-background">
                          {channel.icon}
                          <span className="text-sm">{channel.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full border-primary/10 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-xl">Knowledge Integration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Our AI agent seamlessly connects with your existing knowledge sources:</p>

                    <div className="space-y-3">
                      {[
                        { name: "Help Center Articles", check: true },
                        { name: "Product Documentation", check: true },
                        { name: "Internal Wikis", check: true },
                        { name: "FAQ Databases", check: true },
                        { name: "Training Materials", check: true },
                        { name: "Previous Support Tickets", check: true }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                      <Lightbulb className="h-8 w-8 text-amber-500" />
                      <div>
                        <p className="font-medium">Self-improving System</p>
                        <p className="text-sm text-muted-foreground">Our AI learns from each interaction to continuously improve its responses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="text-center mt-10">
              <Button
                size="lg"
                onClick={() => setActiveTab("demo")}
                className="gap-2"
              >
                See It In Action <ArrowRight className="w-4 h-4" />
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
                      <BarChart3 className="h-6 w-6 text-primary" />
                      Before & After Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {metrics.map((metric, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between font-medium">
                            <span>{metric.label}</span>
                            <span className="text-primary">+{metric.improvement}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-md bg-muted p-2 text-center">
                              <div className="text-xs text-muted-foreground mb-1">Before</div>
                              <div className="font-semibold">{metric.before}</div>
                            </div>
                            <div className="rounded-md bg-primary/10 p-2 text-center">
                              <div className="text-xs text-primary/70 mb-1">With Zapllo</div>
                              <div className="font-semibold text-primary">{metric.after}</div>
                            </div>
                          </div>
                        </div>
                      ))}
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
                    <CardTitle className="text-2xl">Customer Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        rating: 5,
                        comment: "I couldn't believe I was talking to an AI. It solved my billing issue in less than 2 minutes!",
                        name: "Michael T.",
                        date: "2 weeks ago"
                      },
                      {
                        rating: 5,
                        comment: "Got help at 3 AM when I urgently needed to change my flight. The support agent was incredibly helpful.",
                        name: "Priya S.",
                        date: "1 month ago"
                      },
                      {
                        rating: 4,
                        comment: "Very quick responses. The agent answered all my questions about the product before I made my purchase.",
                        name: "David L.",
                        date: "3 weeks ago"
                      }
                    ].map((review, i) => (
                      <div key={i} className="p-4 bg-muted rounded-lg">
                        <div className="flex mb-2">
                          {Array(5).fill(0).map((_, starIndex) => (
                            <ThumbsUp
                              key={starIndex}
                              className={`h-4 w-4 ${starIndex < review.rating ? 'text-primary' : 'text-muted-foreground/30'}`}
                              fill={starIndex < review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <p className="mb-2 italic">&ldquo;{review.comment}&rdquo;</p>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{review.name}</span>
                          <span className="text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="border-primary/10 mb-8">
              <CardHeader>
                <CardTitle className="text-xl">ROI Calculator</CardTitle>
                <CardDescription>See how much you could save with Zapllo AI Support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Current Support Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center mb-2">10</div>
                      <p className="text-sm text-center text-muted-foreground">Support agents</p>
                      <Separator className="my-4" />
                      <div className="text-center">
                        <div className="text-2xl font-bold">$480,000</div>
                        <p className="text-sm text-muted-foreground">Annual cost</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">With Zapllo AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center mb-2">3</div>
                      <p className="text-sm text-center text-muted-foreground">Support agents needed</p>
                      <Separator className="my-4" />
                      <div className="text-center">
                        <div className="text-2xl font-bold">$168,000</div>
                        <p className="text-sm text-muted-foreground">Annual cost</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-green-600 dark:text-green-400">Your Savings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center mb-2 text-green-600 dark:text-green-400">70%</div>
                      <p className="text-sm text-center text-muted-foreground">Cost reduction</p>
                      <Separator className="my-4" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">$312,000</div>
                        <p className="text-sm text-muted-foreground">Annual savings</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <Button variant="outline" onClick={() => window.open("https://zapllo.com/roi-calculator", "_blank")}>
                  Calculate Your Custom ROI
                </Button>
              </CardFooter>
            </Card>

            <div className="text-center mt-6">
              <Button
                size="lg"
                onClick={() => setActiveTab("demo")}
                className="gap-2"
              >
                Start Your Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
