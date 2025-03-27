"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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

// Updated type to include "All" category
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
  popular?: boolean;
};

const integrations: IntegrationInfo[] = [
  {
    name: "Zapllo Caller",
    description: "Cloud calling solution with AI transcription",
    href: "/settings/integrations/zapllo-caller",
    imageSrc: "/integrations/zapllo-caller.png",
    category: ["Communication"],
    popular: true,
  },
  {
    name: "IndiaMART",
    description: "Connect your IndiaMART leads directly to your CRM",
    href: "/settings/integrations/indiamart",
    imageSrc: "/integrations/indiamart.png",
    category: ["E-Commerce"],
    popular: true,
  },
  {
    name: "TradeIndia",
    description: "Sync leads and inquiries from TradeIndia",
    href: "/settings/integrations/tradeindia",
    imageSrc: "/integrations/tradeindia.png",
    category: ["E-Commerce"],
    popular: true,
  },
  {
    name: "Gmail",
    description: "Automate email workflows and notifications",
    href: "/settings/integrations/google",
    imageSrc: "/integrations/gmail.png",
    category: ["Communication"],
    popular: true,
  },
  {
    name: "Razorpay",
    description: "Process payments and manage subscriptions",
    href: "/settings/integrations/razorpay",
    imageSrc: "/integrations/razorpay.png",
    category: ["Payments"],
    popular: true,
  },
  {
    name: "PayU",
    description: "Secure payment gateway for your business",
    href: "/settings/integrations/payu",
    imageSrc: "/integrations/payu.png",
    category: ["Payments"],
  },
  {
    name: "JustDial",
    description: "Import leads and manage listings from JustDial",
    href: "/settings/integrations/justdial",
    imageSrc: "/integrations/justdial.png",
    category: ["Marketing"],
  },
  {
    name: "Shopify",
    description: "Sync your Shopify store data and orders",
    href: "/settings/integrations/shopify",
    imageSrc: "/integrations/shopify.png",
    category: ["E-Commerce"],
  },
  {
    name: "Twilio",
    description: "Send SMS notifications and alerts",
    href: "/settings/integrations/twilio",
    imageSrc: "/integrations/twilio.png",
    category: ["Communication"],
  },
  {
    name: "Stripe",
    description: "Process global payments and subscriptions",
    href: "/settings/integrations/stripe",
    imageSrc: "/integrations/stripe.png",
    category: ["Payments"],
  
  },
  {
    name: "Interakt",
    description: "Engage customers through WhatsApp Business",
    href: "/settings/integrations/interakt",
    imageSrc: "/integrations/interakt.jpeg",
    category: ["Communication", "Marketing"],
    popular:true
  },
  {
    name: "Zoho Inventory",
    description: "Manage inventory and order fulfillment",
    href: "/settings/integrations/zoho-inventory",
    imageSrc: "/integrations/zoho-inventory.png",
    category: ["E-Commerce", "Accounting"],
  },
  {
    name: "Delhivery",
    description: "Streamline logistics and shipping",
    href: "/settings/integrations/delhivery",
    imageSrc: "/integrations/delhivery.png",
    category: ["Logistics"],
  },
  {
    name: "Zoho Books",
    description: "Automate accounting and financial reports",
    href: "/settings/integrations/zoho-books",
    imageSrc: "/integrations/zoho-books.png",
    category: ["Accounting"],
  },
  {
    name: "Tally",
    description: "Sync accounting data from Tally ERP",
    href: "/settings/integrations/tally",
    imageSrc: "/integrations/tally.png",
    category: ["Accounting"],
  },
  {
    name: "Google Ads",
    description: "Import leads directly from Google Ads campaigns",
    href: "/settings/integrations/google-ads",
    imageSrc: "/integrations/google-ads.png",
    category: ["Marketing"],
  },
  {
    name: "Facebook Remarketing",
    description: "Retarget potential customers on Facebook",
    href: "/settings/integrations/facebook",
    imageSrc: "/integrations/facebook.png",
    category: ["Marketing"],
  },
  {
    name: "CallHippo",
    description: "Virtual phone system for your business",
    href: "/settings/integrations/callhippo",
    imageSrc: "/integrations/callhippo.png",
    category: ["Communication"],
  },
  {
    name: "Zendesk",
    description: "Customer support and ticketing system",
    href: "/settings/integrations/zendesk",
    imageSrc: "/integrations/zendesk.png",
    category: ["CRM"],
  },
];

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="p-6 space-y-6 max-w-7xl overflow-y-scroll h-screen scrollbar-hide mx-auto">
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
                          {integration.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
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
    </div >
  );
}