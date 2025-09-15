"use client";

import React, { useEffect, useState } from "react";
import { Phone, PhoneCall, BarChart2, History, Headphones, Clock, Clipboard, Shield } from "lucide-react";
import axios from "axios";

import PremiumIntegrationLayout from "@/components/integrations/PremiumIntegrationLayout";
import PurchasedIntegrationLayout from "@/components/integrations/PurchasedIntegrationLayout";

export default function ZaplloCallerIntegrationPage() {
    const [isPurchased, setIsPurchased] = useState(false);

    // Check if this integration has been purchased
    useEffect(() => {
        const checkPurchaseStatus = async () => {
            try {
                const response = await axios.get('/api/integrations');
                const integrations = response.data || [];
                const callerIntegration = integrations.find((i: any) => i.platform === 'zapllo-caller');
                setIsPurchased(!!callerIntegration?.isPurchased);
            } catch (error) {
                console.error('Error checking integration status:', error);
            }
        };

        checkPurchaseStatus();
    }, []);

    // Define the premium integration details
    const integrationDetails = {
        name: "Zapllo Caller",
        description: "Make calls directly from Zapllo CRM with advanced call tracking",
        logo: "/integrations/zapllo-caller.png",
        price: 1000,
        features: [
            "One-click calling directly from contact profiles",
            "Automatic call logging with duration tracking",
            "Call recording for quality assurance and training",
            "Real-time call notes and follow-up task creation",
            "Custom call dispositions for better categorization",
            "Call scripts and templates for consistent messaging",
            "Detailed call analytics and performance reports",
            "Click-to-call from any phone number in the CRM",
            "Call queuing and scheduling for better time management",
            "Integration with existing phone systems (SIP/VoIP)",
            "500 minutes of free calling included with subscription"
        ],
        benefits: [
            {
                title: "Increase Productivity",
                description: "Make calls without switching between applications",
                icon: <Phone className="h-6 w-6 text-green-500" />
            },
            {
                title: "Improve Conversion Rates",
                description: "Faster response times and better follow-up",
                icon: <BarChart2 className="h-6 w-6 text-blue-500" />
            },
            {
                title: "Complete Call History",
                description: "Comprehensive record of all customer interactions",
                icon: <History className="h-6 w-6 text-violet-500" />
            },
            {
                title: "Better Customer Experience",
                description: "Professional call handling with context-aware information",
                icon: <Headphones className="h-6 w-6 text-amber-500" />
            },
        ],
        faqs: [
            {
                question: "How does the calling work technically?",
                answer: "Zapllo Caller uses VoIP technology to connect calls through your internet connection. When you click to call, our system establishes a connection with your contact's phone number while masking your personal number."
            },
            {
                question: "Do I need special hardware to use Zapllo Caller?",
                answer: "No, you only need a computer with a microphone (or headset) and an internet connection. You can also use the mobile app with your smartphone."
            },
            {
                question: "Can I use my existing business phone number?",
                answer: "Yes, we can configure the integration to display your business number as the caller ID. This requires verification during the setup process."
            },
            {
                question: "Are international calls supported?",
                answer: "Yes, Zapllo Caller supports international calling. International calls are charged at standard VoIP rates in addition to the subscription."
            },
            {
                question: "How is call quality ensured?",
                answer: "Our system automatically optimizes call quality based on your internet connection. For best results, we recommend a stable internet connection with at least 1 Mbps upload and download speed."
            }
        ],
        testimonials: [
            {
                quote: "Zapllo Caller has dramatically increased our sales team efficiency. No more switching between systems or manual call logging. Everything is tracked automatically.",
                author: "Vikram Desai",
                company: "TechStar Solutions, Pune"
            },
            {
                quote: "The call recording feature has been invaluable for training our new sales representatives. We can share best practices and improve call scripts based on successful calls.",
                author: "Meera Patel",
                company: "GrowthForce Marketing, Bengaluru"
            }
        ]
    };

    // Define the purchased integration details
    const purchasedDetails = {
        name: "Zapllo Caller",
        description: "Make calls directly from Zapllo CRM with advanced call tracking",
        logo: "/integrations/zapllo-caller.png",
        supportEmail: "caller-support@zapllo.com",
        docs: "https://help.zapllo.com/zapllo-caller",
        features: [
            "One-click calling directly from contact profiles",
            "Automatic call logging with duration tracking",
            "Call recording for quality assurance and training",
            "Real-time call notes and follow-up task creation",
            "Custom call dispositions for better categorization",
            "Detailed call analytics and performance reports",
            "Integration with existing phone systems (SIP/VoIP)",
            "500 minutes of free calling included with your subscription"
        ],
        setupSteps: [
            {
                title: "Payment Received",
                description: "Your payment for the Zapllo Caller has been successfully processed",
                status: "completed"
            },
            {
                title: "Integration Specialist Assigned",
                description: "A dedicated specialist has been assigned to your integration",
                status: "completed"
            },
            {
                title: "Phone Configuration",
                description: "Setting up your business phone numbers and caller ID",
                status: "in-progress"
            },
            {
                title: "User Training",
                description: "Training on how to make and receive calls from the CRM",
                status: "pending"
            },
            {
                title: "Call Templates Setup",
                description: "Setting up call scripts and disposition codes",
                status: "pending"
            },
            {
                title: "Testing & Quality Assurance",
                description: "Testing the calling functionality and call quality",
                status: "pending"
            },
            {
                title: "Go Live",
                description: "Final deployment and activation of the calling functionality",
                status: "pending"
            }
        ]
    };

    return isPurchased ? (
        <PurchasedIntegrationLayout integration={purchasedDetails as any} />
    ) : (
        <PremiumIntegrationLayout integration={integrationDetails} />
    );
}
