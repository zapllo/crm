"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  Search,
  Star,
  Grid,
  ShoppingCart,
  MessageCircle,
  CreditCard,
  BarChart,
  Users,
  Calculator,
  Truck
} from "lucide-react";

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import IntegrationStatusBadge from "@/components/integrations/IntegrationStatusBadge";

// Add a type for the integration status tracking
type IntegrationStatus = 'free' | 'premium' | 'purchased' | 'connected' | 'pending';

type IntegrationCategory =
  | "Featured"
  | "All"
  | "E-Commerce"
  | "Communication"
  | "Payments"
  | "Marketing"
  | "CRM"
  | "Accounting"
  | "Logistics";

type IntegrationInfo = {
  name: string;
  description: string;
  href: string;
  imageSrc: string;
  category: IntegrationCategory[];
  status: IntegrationStatus;
  popular?: boolean;
};

// Define which integrations are free
const FREE_INTEGRATIONS = [
  "indiamart",
  "tradeindia",
  "gmail",
];

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load integrations data
    const loadIntegrations = () => {
      // Start with default integrations
      const defaultIntegrations: IntegrationInfo[] = [
        {
          name: "Zapllo Caller",
          description: "Cloud calling solution with AI transcription",
          href: "/settings/integrations/zapllo-caller",
          imageSrc: "/integrations/zapllo-caller.png",
          category: ["Communication"],
          status: "premium",
          popular: true,
        },
        {
          name: "IndiaMART",
          description: "Connect your IndiaMART leads directly to your CRM",
          href: "/settings/integrations/indiamart",
          imageSrc: "/integrations/indiamart.png",
          category: ["E-Commerce"],
          status: "free",
          popular: true,
        },
        {
          name: "TradeIndia",
          description: "Sync leads and inquiries from TradeIndia",
          href: "/settings/integrations/tradeindia",
          imageSrc: "/integrations/tradeindia.png",
          category: ["E-Commerce"],
          status: "free",
          popular: true,
        },
        {
          name: "Gmail",
          description: "Automate email workflows and notifications",
          href: "/settings/integrations/google",
          imageSrc: "/integrations/gmail.png",
          category: ["Communication"],
          status: "free",
          popular: true,
        },
        {
          name: "Razorpay",
          description: "Process payments and manage subscriptions",
          href: "/settings/integrations/razorpay",
          imageSrc: "/integrations/razorpay.png",
          category: ["Payments"],
          status: "premium",
          popular: true,
        },
        {
          name: "PayU",
          description: "Secure payment gateway for your business",
          href: "/settings/integrations/payu",
          imageSrc: "/integrations/payu.png",
          category: ["Payments"],
          status: "premium",
        },
        {
          name: "JustDial",
          description: "Import leads and manage listings from JustDial",
          href: "/settings/integrations/justdial",
          imageSrc: "/integrations/justdial.png",
          category: ["Marketing"],
          status: "premium",
        },
        {
          name: "Shopify",
          description: "Sync your Shopify store data and orders",
          href: "/settings/integrations/shopify",
          imageSrc: "/integrations/shopify.png",
          category: ["E-Commerce"],
          status: "premium",
        },
        {
          name: "Twilio",
          description: "Send SMS notifications and alerts",
          href: "/settings/integrations/twilio",
          imageSrc: "/integrations/twilio.jpg",
          category: ["Communication"],
          status: "premium",
        },
        {
          name: "Stripe",
          description: "Process global payments and subscriptions",
          href: "/settings/integrations/stripe",
          imageSrc: "/integrations/stripe.png",
          category: ["Payments"],
          status: "premium",
        },
        {
          name: "Interakt",
          description: "Engage customers through WhatsApp Business",
          href: "/settings/integrations/interakt",
          imageSrc: "/integrations/interakt.jpeg",
          category: ["Communication", "Marketing"],
          status: "premium",
          popular: true
        },
        {
          name: "Zoho Inventory",
          description: "Manage inventory and order fulfillment",
          href: "/settings/integrations/zoho-inventory",
          imageSrc: "/integrations/zoho-inventory.png",
          category: ["E-Commerce", "Accounting"],
          status: "premium",
        },
        {
          name: "Delhivery",
          description: "Streamline logistics and shipping",
          href: "/settings/integrations/delhivery",
          imageSrc: "/integrations/delhivery.png",
          category: ["Logistics"],
          status: "premium",
        },
        {
          name: "Zoho Books",
          description: "Automate accounting and financial reports",
          href: "/settings/integrations/zoho-books",
          imageSrc: "/integrations/zohobooks.png",
          category: ["Accounting"],
          status: "premium",
        },
        {
          name: "Tally",
          description: "Sync accounting data from Tally ERP",
          href: "/settings/integrations/tally",
          imageSrc: "/integrations/tally.webp",
          category: ["Accounting"],
          status: "premium",
        },
        {
          name: "Google Ads",
          description: "Import leads directly from Google Ads campaigns",
          href: "/settings/integrations/google-ads",
          imageSrc: "/integrations/google-ads.png",
          category: ["Marketing"],
          status: "premium",
        },
        {
          name: "Facebook Remarketing",
          description: "Retarget potential customers on Facebook",
          href: "/settings/integrations/facebook",
          imageSrc: "/integrations/facebook.webp",
          category: ["Marketing"],
          status: "premium",
        },
        {
          name: "CallHippo",
          description: "Virtual phone system for your business",
          href: "/settings/integrations/callhippo",
          imageSrc: "/integrations/callhippo.png",
          category: ["Communication"],
          status: "premium",
        },
        {
          name: "Zendesk",
          description: "Customer support and ticketing system",
          href: "/settings/integrations/zendesk",
          imageSrc: "/integrations/zendesk.png",
          category: ["CRM"],
          status: "premium",
        },
      ];

      // Set initial integration data
      setIntegrations(defaultIntegrations);

      // Then fetch active integrations from API
      fetchIntegrationStatus();
    };

    loadIntegrations();
  }, []);

  // Fetch integration status from API
  const fetchIntegrationStatus = async () => {
    try {
      const response = await axios.get('/api/integrations');
      const activeIntegrations = response.data || [];

      // Create a status map for active integrations
      const statusMap: Record<string, string> = {};

      activeIntegrations.forEach((integration: any) => {
        const platform = integration.platform.toLowerCase();

        if (integration.isPurchased) {
          statusMap[platform] = 'purchased';
        } else if (integration.apiKey) {
          statusMap[platform] = 'connected';
        }
      });

      setIntegrationStatus(statusMap);

      // Update integrations with status
      setIntegrations(prevIntegrations =>
        prevIntegrations.map(integration => {
          const platformKey = integration.name.toLowerCase().replace(/\s+/g, '-');
          const status = statusMap[platformKey] as IntegrationStatus || integration.status;
          return { ...integration, status };
        })
      );
    } catch (error) {
      console.error('Error fetching integration status:', error);
    }
  };

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add icon mapping for each category, including "All"
  // Add icon mapping for each category, including "All"
  const categoryIcons = {
    Featured: <Star className="h-4 w-4" />,
    All: <Grid className="h-4 w-4" />,
    "E-Commerce": <ShoppingCart className="h-4 w-4" />,
    Communication: <MessageCircle className="h-4 w-4" />,
    Payments: <CreditCard className="h-4 w-4" />,
    Marketing: <BarChart className="h-4 w-4" />,
    CRM: <Users className="h-4 w-4" />,
    Accounting: <Calculator className="h-4 w-4" />,
    Logistics: <Truck className="h-4 w-4" />
  };

  // Updated categories array with "All" after "Featured"
  const categories: IntegrationCategory[] = [
    "Featured",
    "All",
    "E-Commerce",
    "Communication",
    "Payments",
    "Marketing",
    "CRM",
    "Accounting",
    "Logistics"
  ];

  // Helper function to determine status badge type
  const getStatusBadgeType = (integration: IntegrationInfo): IntegrationStatus => {
    // Check if it's in our status map first (from the API)
    const platformKey = integration.name.toLowerCase().replace(/\s+/g, '-');
    if (integrationStatus[platformKey]) {
      return integrationStatus[platformKey] as IntegrationStatus;
    }

    // Otherwise use the default status
    const isFree = FREE_INTEGRATIONS.includes(platformKey);
    return isFree ? 'free' : 'premium';
  };

  return (
    <div className="p-6 space-y-6  overflow-y-scroll h-screen scrollbar-hide mx-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Zapllo Marketplace</h1>
        <p className="text-muted-foreground">
          Connect your favorite apps and services to enhance your workflow
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search integrations..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="Featured">
        <TabsList className="mb-4 gap-2 flex w-full h-auto flex-wrap">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-sm flex items-center gap-2">
              {categoryIcons[category]}
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {filteredIntegrations
                .filter((integration) => {
                  if (category === "Featured") {
                    return integration.popular;
                  } else if (category === "All") {
                    return true; // Display all integrations
                  } else {
                    return integration.category.includes(category as IntegrationCategory);
                  }
                })
                .map((integration) => (
                  <Link
                    href={integration.href}
                    key={integration.name}
                    className="block"
                  >
                    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                      <CardHeader className="p-4 pb-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="bg-gray-100 rounded-lg p-2">
                            <Image
                              src={integration.imageSrc}
                              alt={integration.name}
                              width={36}
                              height={36}
                              className="object-contain"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Display the status badge */}
                            <IntegrationStatusBadge
                              status={getStatusBadgeType(integration)}
                              className="text-xs"
                            />

                            {integration.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {integration.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-1 mt-2">
                          {integration.category.map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs font-normal">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>

            {
              filteredIntegrations.filter((integration) => {
                if (category === "Featured") {
                  return integration.popular;
                } else if (category === "All") {
                  return true; // Display all integrations
                } else {
                  return integration.category.includes(category as IntegrationCategory);
                }
              }).length === 0 && (
                <div className="text-center p-12">
                  <p className="text-muted-foreground">No integrations found</p>
                </div>
              )
            }
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
