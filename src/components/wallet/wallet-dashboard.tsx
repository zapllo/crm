"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import WalletOverview from "./wallet-overview";
import WalletTopup from "./wallet-topup";
import WalletHistory from "./wallet-history";
// import WalletAnalytics from "./wallet-analytics";

export default function WalletDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    balance: 0,
    currency: "INR",
  });

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

  return (
    <div className="container max-w-screen-xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Wallet Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage your calling credits and track usage
        </p>
      </div>

      <Tabs defaultValue="overview" className="">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 gap-2 bg-accent">
          <TabsTrigger className='border-none' value="overview">Overview</TabsTrigger>
          <TabsTrigger className='border-none' value="topup">Add Credits</TabsTrigger>
          <TabsTrigger className='border-none' value="history">History</TabsTrigger>
          {/* <TabsTrigger className='border-none' value="analytics">Analytics</TabsTrigger> */}
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <WalletOverview 
            balance={walletData.balance} 
            currency={walletData.currency}
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="topup" className="mt-6">
          <WalletTopup 
            currentBalance={walletData.balance}
            currency={walletData.currency}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <WalletHistory />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          {/* <WalletAnalytics /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}