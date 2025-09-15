"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Wallet, Brain, Plus, History } from "lucide-react";
import WalletOverview from "./wallet-overview";
import WalletTopup from "./wallet-topup";
import WalletHistory from "./wallet-history";
import AiCreditsTab from "./ai-credits-tab";

export default function WalletDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams?.get('tab');

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    balance: 0,
    currency: "INR",
  });

  // Initialize active tab from URL parameter
  useEffect(() => {
    if (tabParam && ['overview', 'topup', 'ai-credits', 'history'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Only update URL if we're in the browser
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (value === 'overview') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', value);
      }
      router.replace(url.pathname + url.search, { scroll: false });
    }
  };

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/wallet/balance");
        setWalletData({
          balance: response.data.balance,
          currency: response.data.currency,
        });
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Function to refresh wallet data (can be called from child components)
  const refreshWalletData = async () => {
    try {
      const response = await axios.get("/api/wallet/balance");
      setWalletData({
        balance: response.data.balance,
        currency: response.data.currency,
      });
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
    }
  };

  return (
    <div className="mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Wallet Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage your calling credits, AI credits, and track usage
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 gap-2 bg-accent">
          <TabsTrigger
            className='border-none flex items-center gap-2'
            value="overview"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            className='border-none flex items-center gap-2'
            value="topup"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Credits</span>
          </TabsTrigger>
          <TabsTrigger
            className='border-none flex items-center gap-2'
            value="ai-credits"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Credits</span>
          </TabsTrigger>
          <TabsTrigger
            className='border-none flex items-center gap-2'
            value="history"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <WalletOverview
            balance={walletData.balance}
            currency={walletData.currency}
            isLoading={isLoading}
            onRefresh={refreshWalletData}
          />
        </TabsContent>
        <TabsContent value="topup" className="mt-6">
          <WalletTopup
            currentBalance={walletData.balance}
            currency={walletData.currency}
            onSuccess={refreshWalletData}
          />
        </TabsContent>

        <TabsContent value="ai-credits" className="mt-6">
          <AiCreditsTab />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <WalletHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}