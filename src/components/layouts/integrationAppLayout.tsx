"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Check, HelpCircle } from "lucide-react";

// UI components
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// A tab definition: each tab has an ID, label, and the content to display
export interface IntegrationTab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface IntegrationAppLayoutProps {
  backHref: string; // link for "Back to marketplace"
  logoSrc: string;  // path to the integration's logo
  name: string;     // e.g. "IndiaMART"
  vendor?: string;  // e.g. "Kylas" (optional)
  description?: string; // Short description
  docsUrl?: string; // External documentation URL
  status?: "connected" | "not_connected";
  tabs: IntegrationTab[];
}

export default function IntegrationAppLayout({
  backHref,
  logoSrc,
  name,
  vendor,
  description,
  docsUrl,
  status = "not_connected",
  tabs,
}: IntegrationAppLayoutProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Find the currently selected tab object
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-scroll scrollbar-hide  mx-auto">
      {/* Top Navigation: "Back to marketplace" */}
      <Link href={backHref} className="text-sm flex items-center gap-1 text-blue-600 hover:underline">
        <ArrowLeft className="h-4" /> Back to Marketplace
      </Link>

      {/* Integration Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-lg">
            <Image 
              src={logoSrc} 
              alt={`${name} logo`} 
              width={48} 
              height={48} 
              className="object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              {status === "connected" && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <Check className="h-3 w-3 mr-1" /> Connected
                </Badge>
              )}
            </div>
            {vendor && <p className="text-muted-foreground text-sm">By {vendor}</p>}
            {description && <p className="text-sm mt-1 max-w-xl">{description}</p>}
          </div>
        </div>

        {docsUrl && (
          <Button variant="outline" size="sm" asChild className="h-9">
            <Link href={docsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              Documentation
            </Link>
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 gap-4 mb-6 bg-accent">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex border-none items-center gap-1.5"
            >
              {tab.icon}
              {tab.label}
              {tab.id === "permissions" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {/* <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /> */}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-72">
                        Review the data and permissions this integration requires
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}