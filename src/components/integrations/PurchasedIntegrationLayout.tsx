"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft, CheckCircle2, Settings, MessageSquare, HelpCircle,
    CalendarClock, Clock, FileText, ExternalLink
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription, AlertDialogTitle as AlertTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export interface PurchasedIntegrationProps {
    integration: {
        name: string;
        description: string;
        logo: string;
        supportEmail?: string;
        docs?: string;
        features: string[];
        setupSteps: {
            title: string;
            description: string;
            status: "completed" | "in-progress" | "pending";
        }[];
    };
}

export default function PurchasedIntegrationLayout({
    integration,
}: PurchasedIntegrationProps) {
    return (
        <div className="p-6 space-y-8 h-screen overflow-y-scroll max-w-6xl mx-auto">
            <Link
                href="/settings/integrations"
                className="flex items-center text-sm text-primary mb-4 hover:underline transition-colors duration-200"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Marketplace
            </Link>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900"
                >
                    <Image
                        src={integration.logo}
                        alt={`${integration.name} logo`}
                        width={80}
                        height={80}
                        className="object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/integrations/placeholder.png";
                        }}
                    />
                </motion.div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold">{integration.name}</h1>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
                            Purchased
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        {integration.description}
                    </p>
                </div>
            </div>

            <Alert>
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle>Integration in Progress</AlertTitle>
                <AlertDescription>
                    Our team is setting up your integration. You'll receive updates via email.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="status" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="status">Status</TabsTrigger>
                    <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>

                <TabsContent value="status" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integration Status</CardTitle>
                            <CardDescription>
                                Track the progress of your {integration.name} integration setup
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {integration.setupSteps.map((step, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="relative">
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 relative
                        ${step.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                                                    step.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900' :
                                                        'bg-gray-100 dark:bg-gray-800'}`}>
                                                {step.status === 'completed' ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <div className={`h-2 w-2 rounded-full 
                            ${step.status === 'in-progress' ? 'bg-blue-600 dark:bg-blue-400' :
                                                            'bg-gray-400 dark:bg-gray-600'}`}></div>
                                                )}
                                            </div>
                                            {index < integration.setupSteps.length - 1 && (
                                                <div className={`absolute top-6 left-3 h-full w-0.5 
                          ${step.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                                                        step.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900' :
                                                            'bg-gray-100 dark:bg-gray-800'} -z-0`}></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className={`font-medium ${step.status === 'pending' ? 'text-muted-foreground' : ''
                                                }`}>{step.title}</h4>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex items-start gap-3">
                                    <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium">Estimated Completion</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Our team typically completes integrations within 2-3 business days
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">What's Included</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {integration.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm">
                                            Our integration specialist will contact you within 24 hours to gather
                                            necessary information and begin the setup process.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm">
                                            Please have your {integration.name} credentials ready to expedite the setup process.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="setup" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Setup Guide</CardTitle>
                            <CardDescription>
                                Information to help you prepare for the integration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <h3 className="font-medium mb-2">Before We Begin</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        To streamline the integration process, please gather the following information:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                            <span>Your {integration.name} account credentials</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                            <span>List of specific features you need from this integration</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                            <span>Your current workflow that will incorporate this integration</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                            <span>Any specific team members who will be using this integration</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <h3 className="font-medium mb-2">Integration Process</h3>
                                    <ol className="space-y-3 text-sm ps-5 list-decimal">
                                        <li>
                                            <span className="font-medium">Initial Consultation</span>
                                            <p className="text-muted-foreground mt-1">
                                                We'll schedule a call to understand your specific requirements
                                            </p>
                                        </li>
                                        <li>
                                            <span className="font-medium">Configuration</span>
                                            <p className="text-muted-foreground mt-1">
                                                Our team will configure the integration based on your needs
                                            </p>
                                        </li>
                                        <li>
                                            <span className="font-medium">Testing</span>
                                            <p className="text-muted-foreground mt-1">
                                                We'll test the integration thoroughly before deploying
                                            </p>
                                        </li>
                                        <li>
                                            <span className="font-medium">Deployment</span>
                                            <p className="text-muted-foreground mt-1">
                                                The integration will be deployed to your production environment
                                            </p>
                                        </li>
                                        <li>
                                            <span className="font-medium">Training & Handover</span>
                                            <p className="text-muted-foreground mt-1">
                                                We'll train your team on how to use the integration effectively
                                            </p>
                                        </li>
                                    </ol>
                                </div>
                            </div>

                            {integration.docs && (
                                <div className="flex justify-center">
                                    <Button variant="outline" asChild>
                                        <Link href={integration.docs} target="_blank" className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4" />
                                            View Documentation
                                            <ExternalLink className="ml-2 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="support" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Support Options</CardTitle>
                            <CardDescription>
                                Get help with your {integration.name} integration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium">Contact Your Integration Specialist</h3>
                                            <p className="text-sm text-muted-foreground my-2">
                                                Reach out directly to the specialist assigned to your integration
                                            </p>
                                            {integration.supportEmail ? (
                                                <Button variant="outline" asChild className="mt-2">
                                                    <Link href={`mailto:${integration.supportEmail}`}>
                                                        Send Email
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button variant="outline" asChild className="mt-2">
                                                    <Link href="/support">
                                                        Contact Support
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-start gap-3">
                                        <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium">FAQs & Resources</h3>
                                            <p className="text-sm text-muted-foreground my-2">
                                                Find answers to common questions and helpful resources
                                            </p>
                                            <Button variant="outline" asChild className="mt-2">
                                                <Link href="/help-center">
                                                    Visit Help Center
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Alert >
                                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertTitle>Priority Support</AlertTitle>
                                <AlertDescription>
                                    As a premium integration customer, you receive priority support with guaranteed response times within 4 hours during business hours.
                                </AlertDescription>
                            </Alert>

                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                <h3 className="font-medium mb-2">Support Hours</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Our integration specialists are available:
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span>9:00 AM - 6:00 PM IST</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span>10:00 AM - 2:00 PM IST</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span>Closed</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}