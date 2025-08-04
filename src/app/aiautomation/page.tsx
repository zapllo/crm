"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription, AlertDialogTitle as AlertTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Smartphone, Mail, PhoneCall, Send, ArrowRight, MessageSquare,
  CheckCircle2, Clock, Loader2, Sparkles, BellRing
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  whatsappNumber: z.string()
    .min(10, { message: "Number must be at least 10 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" }),
  description: z.string().min(10, { message: "Please tell us more about your needs (min 10 characters)" })
});

type FormValues = z.infer<typeof formSchema>;

export default function AIAutomationDemo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("demo");
  const [automationStatus, setAutomationStatus] = useState<{
    whatsapp: 'pending' | 'sending' | 'sent' | null,
    email: 'pending' | 'sending' | 'sent' | null,
    call: 'pending' | 'sending' | 'sent' | null
  }>({
    whatsapp: null,
    email: null,
    call: null
  });
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsappNumber: "",
      description: ""
    }
  });

  // Simulate automation sequence after submission
  useEffect(() => {
    if (automationStatus.whatsapp === 'pending') {
      const sequence = async () => {
        // WhatsApp simulation
        setAutomationStatus(prev => ({ ...prev, whatsapp: 'sending' }));
        await new Promise(r => setTimeout(r, 2000));
        setAutomationStatus(prev => ({ ...prev, whatsapp: 'sent', email: 'pending' }));

        // Email simulation
        await new Promise(r => setTimeout(r, 1000));
        setAutomationStatus(prev => ({ ...prev, email: 'sending' }));
        await new Promise(r => setTimeout(r, 2500));
        setAutomationStatus(prev => ({ ...prev, email: 'sent', call: 'pending' }));

        // Phone call simulation - now with 2 minute (120000ms) delay
        await new Promise(r => setTimeout(r, 3000)); // Short delay before showing "scheduled"
        setAutomationStatus(prev => ({ ...prev, call: 'pending' }));

        // Display a countdown for the call
        let countdown = 120; // 120 seconds = 2 minutes
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            setAutomationStatus(prev => ({ ...prev, call: 'sending' }));

            // After call starts, simulate call duration
            setTimeout(() => {
              setAutomationStatus(prev => ({ ...prev, call: 'sent' }));
            }, 3000);
          }
        }, 1000);
      };

      sequence();
    }
  }, [automationStatus.whatsapp]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to submit the form');
      }

      await response.json();

      toast({
        title: "Automation sequence initiated!",
        description: "Watch as your message travels through our omnichannel system.",
        variant: "default",
      });

      // Initiate the automation sequence
      setActiveTab("results");
      setAutomationStatus({
        whatsapp: 'pending',
        email: null,
        call: null
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Something went wrong",
        description: "Your automation sequence couldn't be started. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="container max-w-6xl px-4 py-12 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
          <Sparkles className="h-4 w-4 mr-1 text-primary" />
          <span>AI-Powered Automation</span>
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Experience Omnichannel Automation
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          See how our AI instantly engages with your customers through WhatsApp, Email, and Phone Calls — all from a single interaction.
        </p>
      </motion.div>

      <Tabs defaultValue="demo" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-2 bg-accent w-full max-w-md ">
            <TabsTrigger value="demo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  border-none">
              Demo Form
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none">
              Live Results
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="demo" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="order-2 md:order-1"
            >
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Why Choose Zapllo Automation?</h2>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Instant Engagement</h3>
                      <p className="text-sm text-muted-foreground">Respond to customer inquiries within seconds, not hours.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Omnichannel Reach</h3>
                      <p className="text-sm text-muted-foreground">Connect via WhatsApp, Email, and Phone Calls simultaneously.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <BellRing className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">24/7 Availability</h3>
                      <p className="text-sm text-muted-foreground">Never miss a lead with around-the-clock automated responses.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Alert >
                  <div className='flex items-center gap-2'>
                    <Sparkles className="h-4 w-4 text-primary" />
                    <AlertTitle>Try it yourself!</AlertTitle>
                  </div>
                  <AlertDescription>
                    Fill out the form and watch as our system automatically sends you messages across multiple channels.
                  </AlertDescription>
                </Alert>
              </motion.div>
            </motion.div>

            <div className="order-1 md:order-2">
              <Card className="shadow-lg border-primary/10">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-t-lg pb-4">
                  <CardTitle className="flex justify-between items-center">
                    <span>AI Automation Demo</span>
                    <Badge variant="outline" className="bg-white/10 text-xs">
                      Live Demo
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder=""
                                {...field}
                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsappNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder=""
                                {...field}
                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Submit Your Query<span className='text-red-500'>*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about your issues"
                                className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Start Automation Demo
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="bg-muted/20 px-6 py-4 text-xs text-muted-foreground flex justify-between">
                  <span>Powered by Zapllo</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Response time: &lt;5 minutes
                  </span>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-purple-500/10">
              <CardTitle className="text-center">
                Omnichannel Automation in Action
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              <div className="max-w-3xl mx-auto">
                <AnimatePresence>
                  {automationStatus.whatsapp === null ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-8"
                    >
                      <h3 className="text-xl font-medium mb-4">Submit the form to see automation in action</h3>
                      <p className="text-muted-foreground mb-6">
                        Fill out the demo form to experience how Zapllo's automation system works across multiple channels simultaneously.
                      </p>
                      <Button
                        onClick={() => setActiveTab("demo")}
                        variant="outline"
                        className="border-primary/20 text-primary"
                      >
                        Go to Demo Form
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="space-y-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-4"
                      >
                        <h3 className="text-xl font-medium mb-2">Your Automation Sequence</h3>
                        <p className="text-muted-foreground">
                          Watch as your information flows through our omnichannel communication system
                        </p>
                      </motion.div>

                      <div className="grid gap-8 relative">
                        {/* Timeline connector */}
                        <div className="absolute left-[27px] top-[60px] bottom-[60px] w-[2px] bg-gradient-to-b from-primary via-blue-400 to-purple-500"></div>

                        {/* WhatsApp Channel */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                          className="flex gap-4 relative"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10
                                  ${automationStatus.whatsapp === 'sent' ? 'bg-green-100 text-green-600' :
                                    automationStatus.whatsapp === 'sending' ? 'bg-amber-100 text-amber-600' :
                                      'bg-primary/10 text-primary'}`}>
                                  {automationStatus.whatsapp === 'sent' ?
                                    <CheckCircle2 className="h-6 w-6" /> :
                                    automationStatus.whatsapp === 'sending' ?
                                      <Loader2 className="h-6 w-6 animate-spin" /> :
                                      <Smartphone className="h-6 w-6" />}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>WhatsApp Message</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <div className="flex-1">
                            <Card className="border-l-4 border-l-green-500 shadow-sm">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium flex items-center">
                                    <Smartphone className="h-4 w-4 mr-2 text-green-600" />
                                    WhatsApp Message
                                  </h4>
                                  <Badge className={
                                    automationStatus.whatsapp === 'sent' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                      automationStatus.whatsapp === 'sending' ? "animate-pulse" : ""
                                  }>
                                    {automationStatus.whatsapp === 'sent' ? "Delivered" :
                                      automationStatus.whatsapp === 'sending' ? "Sending..." : "Pending"}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                <div className="bg-green-50 p-3 rounded-lg text-sm border border-green-100">
                                  <p className="font-medium">Hello {form.getValues("fullName")},</p>
                                  <p className="mt-2">Thanks for contacting Zapllo! We've received your request about:</p>
                                  <p className="italic mt-1 text-green-700 bg-green-100 p-2 rounded border border-green-200 text-xs">
                                    "{form.getValues("description").substring(0, 100)}{form.getValues("description").length > 100 ? '...' : ''}"
                                  </p>
                                  <p className="mt-2">Our team is reviewing your inquiry and will get back to you shortly!</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>

                        {/* Email Channel */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: automationStatus.email ? 1 : 0,
                            x: automationStatus.email ? 0 : -20
                          }}
                          transition={{ duration: 0.5 }}
                          className="flex gap-4 relative"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10
                                  ${automationStatus.email === 'sent' ? 'bg-blue-100 text-blue-600' :
                                    automationStatus.email === 'sending' ? 'bg-amber-100 text-amber-600' :
                                      'bg-primary/10 text-primary'}`}>
                                  {automationStatus.email === 'sent' ?
                                    <CheckCircle2 className="h-6 w-6" /> :
                                    automationStatus.email === 'sending' ?
                                      <Loader2 className="h-6 w-6 animate-spin" /> :
                                      <Mail className="h-6 w-6" />}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>Email Notification</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <div className="flex-1">
                            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                                    Email Notification
                                  </h4>
                                  <Badge className={
                                    automationStatus.email === 'sent' ? "bg-blue-100 text-blue-700 hover:bg-blue-100" :
                                      automationStatus.email === 'sending' ? "animate-pulse" : ""
                                  }>
                                    {automationStatus.email === 'sent' ? "Delivered" :
                                      automationStatus.email === 'sending' ? "Sending..." : "Pending"}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                <div className="bg-blue-50 p-3 rounded-lg text-sm border border-blue-100">
                                  <div className="flex justify-between border-b border-blue-200 pb-2 mb-3">
                                    <div>
                                      <p className="font-medium">From: Zapllo Support</p>
                                      <p>To: {form.getValues("email")}</p>
                                    </div>
                                    <p className="text-muted-foreground text-xs">Just now</p>
                                  </div>
                                  <p className="font-medium">Subject: Your Zapllo Support Request</p>
                                  <div className="mt-3 bg-white p-2 rounded border border-blue-200">
                                    <p>Dear {form.getValues("fullName")},</p>
                                    <p className="mt-2">Thank you for reaching out to Zapllo. This email confirms we've received your inquiry and our team is working on it.</p>
                                    <p className="mt-2">We'll be calling you shortly to discuss your requirements in more detail.</p>
                                    <Separator className="my-3" />
                                    <p className="text-xs text-muted-foreground">This is an automated message. Please do not reply to this email.</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>

                        {/* Phone Call Channel */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: automationStatus.call ? 1 : 0,
                            x: automationStatus.call ? 0 : -20
                          }}
                          transition={{ duration: 0.5 }}
                          className="flex gap-4 relative"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10
                                  ${automationStatus.call === 'sent' ? 'bg-purple-100 text-purple-600' :
                                    automationStatus.call === 'sending' ? 'bg-amber-100 text-amber-600' :
                                      'bg-primary text-white'}`}>
                                  {automationStatus.call === 'sent' ?
                                    <CheckCircle2 className="h-6 w-6" /> :
                                    automationStatus.call === 'sending' ?
                                      <Loader2 className="h-6 w-6 animate-spin" /> :
                                      <PhoneCall className="h-6 w-6" />}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>Automated Phone Call</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <div className="flex-1">
                            <Card className="border-l-4 border-l-purple-500 shadow-sm">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium flex items-center">
                                    <PhoneCall className="h-4 w-4 mr-2 text-purple-600" />
                                    Automated Phone Call
                                  </h4>
                                  <Badge className={
                                    automationStatus.call === 'sent' ? "bg-purple-100 text-purple-700 hover:bg-purple-100" :
                                      automationStatus.call === 'sending' ? "animate-pulse" : ""
                                  }>
                                    {automationStatus.call === 'sent' ? "Completed" :
                                      automationStatus.call === 'sending' ? "Calling..." : "Scheduled"}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                <div className="bg-purple-50 p-3 rounded-lg text-sm border border-purple-100">
                                  <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                                      <PhoneCall className="h-5 w-5 text-purple-700" />
                                    </div>
                                    <div>
                                      <p className="font-medium">Outbound Call</p>
                                      <p className="text-xs text-muted-foreground">To: {form.getValues("whatsappNumber")}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                      <p className="text-xs text-muted-foreground">
                                        {automationStatus.call === 'sent' ? "Duration: 2:38" : "Scheduled call"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white p-3 rounded border border-purple-200">
                                    <p className="font-medium mb-2">Call Script:</p>
                                    <p>"Hello {form.getValues("fullName")}, this is Zapllo's automated assistant. We received your inquiry and wanted to confirm our team will contact you shortly with a personalized solution for your needs."</p>
                                    {automationStatus.call === 'sent' && (
                                      <div className="mt-3 p-2 bg-purple-100 rounded text-xs">
                                        <p className="font-medium">Call completed successfully</p>
                                        <p>Your request has been prioritized and assigned to a specialist</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>
                      </div>

                      {automationStatus.call === 'sent' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="mt-8 text-center"
                        >
                          <h3 className="text-xl font-medium mb-3">Automation Complete!</h3>
                          <p className="mb-6 text-muted-foreground">
                            Your information has been processed through all communication channels.
                            In a real scenario, our team would now be fully prepared to assist you.
                          </p>
                          <div className="flex gap-4 justify-center">
                            <Button
                              onClick={() => {
                                form.reset();
                                setActiveTab("demo");
                                setAutomationStatus({
                                  whatsapp: null,
                                  email: null,
                                  call: null
                                });
                              }}
                              variant="outline"
                            >
                              Try Again
                            </Button>
                            {/* <Button
                           className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500"
                           >
                             <Send className="h-4 w-4 mr-2" />
                             Request Live Demo
                           </Button> */}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="bg-muted/30 rounded-lg p-6 border border-border">
              <h3 className="text-xl font-medium mb-4">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                  <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-medium mb-2">Instant Capture</h4>
                  <p className="text-sm text-muted-foreground">
                    Our system captures and processes your inquiry data in real-time using advanced AI algorithms.
                  </p>
                </div>

                <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                  <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    <span className="text-lg font-bold text-primary">2</span>
                  </div>
                  <h4 className="font-medium mb-2">Omnichannel Dispatch</h4>
                  <p className="text-sm text-muted-foreground">
                    The system simultaneously prepares and dispatches personalized messages across all communication channels.
                  </p>
                </div>

                <div className="bg-background rounded-lg p-4 shadow-sm border border-border">
                  <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    <span className="text-lg font-bold text-primary">3</span>
                  </div>
                  <h4 className="font-medium mb-2">Intelligent Follow-up</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on engagement analytics, our AI determines the optimal follow-up strategy for maximum conversion.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-20 text-center max-w-3xl mx-auto"
      >
        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
          <Sparkles className="h-4 w-4 mr-1 text-primary" />
          <span>Business Impact</span>
        </Badge>
        <h2 className="text-3xl font-bold mb-6">Transform Your Customer Engagement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <Card className="bg-gradient-to-b from-background to-muted/20 border-primary/10">

            <CardHeader className="pb-2 flex">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">+67%</h1>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Increase in lead response rate with automated multi-channel engagement</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-background to-muted/20 border-primary/10">
            <CardHeader className="pb-2">
              <div className='flex items-center gap-4'>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                {/* <CardTitle className="text-xl">93%</CardTitle> */}
                <h1 className="text-2xl font-bold">93%</h1>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reduction in response time from hours to seconds with AI automation</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-background to-muted/20 border-primary/10">
            <CardHeader className="pb-2">
              <div className='flex items-center gap-4'>


                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                    <path d="M12 2v4"></path>
                    <path d="M12 18v4"></path>
                    <path d="M4.93 4.93l2.83 2.83"></path>
                    <path d="M16.24 16.24l2.83 2.83"></path>
                    <path d="M2 12h4"></path>
                    <path d="M18 12h4"></path>
                    <path d="M4.93 19.07l2.83-2.83"></path>
                    <path d="M16.24 7.76l2.83-2.83"></path>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">24/7</h1>

              </div>

              {/* <CardTitle className="text-xl">24/7</CardTitle> */}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Continuous availability for customer inquiries, even outside business hours</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 px-8">
            Get Started with Zapllo
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
