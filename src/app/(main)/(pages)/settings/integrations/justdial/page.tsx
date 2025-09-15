"use client";

import React, { useEffect, useState } from "react";
import { BarChart2, MessageSquareText, FileCheck, Zap, RefreshCw, Users } from "lucide-react";
import axios from "axios";

import PremiumIntegrationLayout from "@/components/integrations/PremiumIntegrationLayout";
import PurchasedIntegrationLayout from "@/components/integrations/PurchasedIntegrationLayout";

export default function JustDialIntegrationPage() {
    const [isPurchased, setIsPurchased] = useState(false);

    // Check if this integration has been purchased
    useEffect(() => {
        const checkPurchaseStatus = async () => {
            try {
                const response = await axios.get('/api/integrations');
                const integrations = response.data || [];
                const justdialIntegration = integrations.find((i: any) => i.platform === 'justdial');
                setIsPurchased(!!justdialIntegration?.isPurchased);
            } catch (error) {
                console.error('Error checking integration status:', error);
            }
        };

        checkPurchaseStatus();
    }, []);

    // Define the premium integration details
    const integrationDetails = {
        name: "JustDial",
        description: "Import leads and manage listings from JustDial",
        logo: "/integrations/justdial.png",
        price: 4999,
        features: [
            "Automated lead import from JustDial to your CRM",
            "Real-time lead notifications for immediate follow-up",
            "Sync customer reviews and ratings",
            "Update your JustDial listing details from Zapllo",
            "Detailed analytics on lead performance",
            "Prioritize leads based on intent and category",
            "Custom mapping of JustDial fields to your CRM",
            "Scheduled report exports to your email",
            "Access historical lead data and trends",
            "Dedicated integration specialist for setup and support"
        ],
        benefits: [
            {
                title: "Never Miss a Lead",
                description: "Automatically capture all leads from JustDial in real-time",
                icon: <MessageSquareText className="h-6 w-6 text-blue-500" />
            },
            {
                title: "Improved Conversion",
                description: "Faster response times lead to higher conversion rates",
                icon: <BarChart2 className="h-6 w-6 text-green-500" />
            },
            {
                title: "Streamlined Workflow",
                description: "Eliminate manual data entry and reduce administrative tasks",
                icon: <FileCheck className="h-6 w-6 text-violet-500" />
            },
            {
                title: "Enhanced Customer Data",
                description: "Enrich your CRM with detailed customer information from JustDial",
                icon: <Users className="h-6 w-6 text-amber-500" />
            },
        ],
        faqs: [
            {
                question: "How long does the integration setup take?",
                answer: "The integration setup typically takes 1-3 business days, depending on your specific requirements and the complexity of your workflow."
            },
            {
                question: "Do I need a specific JustDial subscription?",
                answer: "Yes, you need a JustDial Business Listing with API access. Our team can guide you through the requirements during the setup process."
            },
            {
                question: "Can I customize which leads are imported?",
                answer: "Yes, we can configure filters based on your requirements to import only the leads that match your criteria."
            },
            {
                question: "Is there any ongoing maintenance required?",
                answer: "No, once set up, the integration runs automatically. Our team handles all maintenance and updates."
            },
            {
                question: "What happens if JustDial changes their API?",
                answer: "As part of our service, we monitor and update the integration if JustDial makes changes to their API, ensuring continuous functionality."
            }
        ],
        testimonials: [
            {
                quote: "The JustDial integration has completely transformed how we handle leads. Our response time has decreased by 70%, and conversion rates have improved significantly.",
                author: "Rajesh Kumar",
                company: "Sparkle Interiors, Mumbai"
            },
            {
                quote: "Setting up the integration was seamless. The Zapllo team took care of everything, and we started seeing results immediately.",
                author: "Priya Sharma",
                company: "TechSolution Services, Bangalore"
            }
        ]
    };

    // Define the purchased integration details
    const purchasedDetails = {
        name: "JustDial",
        description: "Import leads and manage listings from JustDial",
        logo: "/integrations/justdial.png",
        supportEmail: "integrations@zapllo.com",
        docs: "https://help.zapllo.com/justdial-integration",
        features: [
            "Automated lead import from JustDial to your CRM",
            "Real-time lead notifications for immediate follow-up",
            "Sync customer reviews and ratings",
            "Update your JustDial listing details from Zapllo",
            "Detailed analytics on lead performance",
            "Custom mapping of JustDial fields to your CRM",
            "Dedicated integration specialist for setup and support"
        ],
        setupSteps: [
            {
                title: "Payment Received",
                description: "Your payment for the JustDial integration has been successfully processed",
                status: "completed"
            },
            {
                title: "Integration Specialist Assigned",
                description: "A dedicated specialist has been assigned to your integration",
                status: "completed"
            },
            {
                title: "Initial Consultation",
                description: "Discussing your requirements and gathering necessary information",
                status: "in-progress"
            },
            {
                title: "Configuration & Setup",
                description: "Setting up the integration according to your specific needs",
                status: "pending"
            },
            {
                title: "Testing & Quality Assurance",
                description: "Testing the integration to ensure everything works correctly",
                status: "pending"
            },
            {
                title: "Integration Deployment",
                description: "Deploying the integration to your production environment",
                status: "pending"
            },
            {
                title: "Training & Handover",
                description: "Training your team on how to use the integration effectively",
                status: "pending"
            }
        ]
    };

    return isPurchased ? (
        <PurchasedIntegrationLayout
            integration={purchasedDetails as any} // Type assertion to bypass strict type checking 
        />
    ) : (
        <PremiumIntegrationLayout integration={integrationDetails} />
    );
}