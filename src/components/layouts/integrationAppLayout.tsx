"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// You can adapt any UI components you're already using
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// A tab definition: each tab has an ID, label, and the content to display
export interface IntegrationTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface IntegrationAppLayoutProps {
  backHref: string; // link for "Back to marketplace"
  logoSrc: string;  // path to the integration's logo
  name: string;     // e.g. "IndiaMART"
  vendor?: string;  // e.g. "Kylas" (optional)
  tabs: IntegrationTab[];
}

export default function IntegrationAppLayout({
  backHref,
  logoSrc,
  name,
  vendor,
  tabs,
}: IntegrationAppLayoutProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Find the currently selected tab object
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="p-6 space-y-4 h-screen overflow-y-scroll scrollbar-hide">
      {/* Top Navigation: "Back to marketplace" */}
      <Link href={backHref} className="text-sm flex items-center gap-1 text-blue-600">
       <ArrowLeft className="h-4" /> Back to All Apps
      </Link>

      {/* Integration Header */}
      <div className="flex items-center space-x-3">
        <Image src={logoSrc} alt={`${name} logo`} width={40} height={40} />
        <div>
          <h1 className="text-xl font-bold">{name}</h1>
          {vendor && <p className="text-gray-500 text-sm">{vendor}</p>}
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="border-b border-muted mt-2 flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-1 text-sm ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {currentTab && currentTab.content}
      </div>
    </div>
  );
}
