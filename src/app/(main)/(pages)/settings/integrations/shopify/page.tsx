"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, BarChart2, Tag, Truck, RefreshCw, Zap } from "lucide-react";
import axios from "axios";

import PremiumIntegrationLayout from "@/components/integrations/PremiumIntegrationLayout";
import PurchasedIntegrationLayout from "@/components/integrations/PurchasedIntegrationLayout";

export default function ShopifyIntegrationPage() {
    const [isPurchased, setIsPurchased] = useState(false);

    useEffect(() => {
        const checkPurchaseStatus = async () => {
            try {
                const response = await axios.get('/api/integrations');
                const integrations = response.data || [];
                const shopifyIntegration = integrations.find((i: any) => i.platform === 'shopify');
                setIsPurchased(!!shopifyIntegration?.isPurchased);
            } catch (error) {
                console.error('Error checking integration status:', error);
            }
        };

        checkPurchaseStatus();
    }, []);

    // Define the premium integration details
    const integrationDetails = {
        name: "Shopify",
        description: "Sync your Shopify store data and orders",
        logo: "/integrations/shopify.png",
        price: 699,
        features: [
            "Bi-directional sync between Shopify and Zapllo CRM",
            "Automatic customer creation in CRM from Shopify orders",
            "Order status sync across platforms",
            "Product catalog synchronization",
            "Inventory level tracking and management",
            "Customer order history integration",
            "Custom field mapping for advanced workflows",
            "Transaction history and financial reporting",
            "Abandoned cart recovery integration",
            "Dedicated integration specialist for setup and support"
        ],
        benefits: [
            {
                title: "Unified Customer View",
                description: "See all customer data including orders in one place",
                icon: <ShoppingCart className="h-6 w-6 text-green-500" />
            },
            {
                title: "Improved Reporting",
                description: "Get comprehensive sales and customer analytics",
                icon: <BarChart2 className="h-6 w-6 text-blue-500" />
            },
            {
                title: "Automated Order Processing",
                description: "Reduce manual data entry and eliminate errors",
                icon: <RefreshCw className="h-6 w-6 text-violet-500" />
            },
            {
                title: "Enhanced Inventory Management",
                description: "Keep track of stock levels across all sales channels",
                icon: <Tag className="h-6 w-6 text-amber-500" />
            },
        ],
        faqs: [
            {
                question: "Do I need a specific Shopify plan?",
                answer: "This integration works with all Shopify plans, from Basic to Advanced."
            },
            {
                question: "Can I sync historical order data?",
                answer: "Yes, during the setup process we can import historical orders from your Shopify store into Zapllo."
            },
            {
                question: "How often does the data sync?",
                answer: "Real-time syncing is set up for orders, while inventory and products sync every 15 minutes by default. This can be customized based on your needs."
            },
            {
                question: "Can I control which products sync to Zapllo?",
                answer: "Yes, we can set up product filtering based on collections, tags, or other criteria during the integration setup."
            },
            {
                question: "What happens if I update customer data in Zapllo?",
                answer: "Changes made in Zapllo can be configured to automatically sync back to your Shopify customer database."
            }
        ],
        testimonials: [
            {
                quote: "The Shopify integration has streamlined our entire order process. We've reduced processing time by 70% and virtually eliminated data entry errors.",
                author: "Avinash Mehta",
                company: "Urban Essentials, Delhi"
            },
            {
                quote: "Having our Shopify store fully integrated with our CRM has given us insights we never had before. Our customer service has improved dramatically.",
                author: "Sunita Patel",
                company: "NatureCraft, Pune"
            }
        ]
    };

    // Define the purchased integration details
    const purchasedDetails = {
        name: "Shopify",
        description: "Sync your Shopify store data and orders",
        logo: "/integrations/shopify.png",
        supportEmail: "integrations@zapllo.com",
        docs: "https://help.zapllo.com/shopify-integration",
        features: [
            "Bi-directional sync between Shopify and Zapllo CRM",
            "Automatic customer creation in CRM from Shopify orders",
            "Order status sync across platforms",
            "Product catalog synchronization",
            "Inventory level tracking and management",
            "Custom field mapping for advanced workflows",
            "Dedicated integration specialist for setup and support"
        ],
        setupSteps: [
            {
                title: "Payment Received",
                description: "Your payment for the Shopify integration has been successfully processed",
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
                title: "Shopify App Installation",
                description: "Installing the Zapllo app in your Shopify store",
                status: "pending"
            },
            {
                title: "Configuration & Setup",
                description: "Setting up the integration according to your specific needs",
                status: "pending"
            },
            {
                title: "Data Mapping & Sync",
                description: "Mapping fields and testing data synchronization",
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
        <PurchasedIntegrationLayout integration={purchasedDetails as any} />
    ) : (
        <PremiumIntegrationLayout integration={integrationDetails} />
    );
}