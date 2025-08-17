"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CircleDollarSign, 
  PhoneCall, 
  Clock, 
  ArrowUpRight, 
  BarChart3,
  Wallet,
  RefreshCw,
  Brain
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface WalletOverviewProps {
  balance: number;
  currency: string;
  isLoading: boolean;
}

export default function WalletOverview({ balance, currency, isLoading }: WalletOverviewProps) {
  const { toast } = useToast();
  const [statsLoading, setStatsLoading] = useState(true);
  const [aiCreditsLoading, setAiCreditsLoading] = useState(true);
  const [aiCredits, setAiCredits] = useState(0);
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    totalDuration: 0,
    callsThisMonth: 0,
    avgDuration: "0:00"
  });

  // Fetch AI credits
  useEffect(() => {
    const fetchAiCredits = async () => {
      try {
        setAiCreditsLoading(true);
        const response = await axios.get("/api/organization/ai-credits");
        setAiCredits(response.data.aiCredits || 0);
      } catch (error) {
        console.error("Error fetching AI credits:", error);
      } finally {
        setAiCreditsLoading(false);
      }
    };

    fetchAiCredits();
  }, []);

  // Fetch actual call stats from API
  useEffect(() => {
    const fetchCallStats = async () => {
      try {
        setStatsLoading(true);
        
        // Get call stats from the existing API
        const response = await axios.get("/api/calls/stats");
        
        if (response.data) {
          // Calculate average call duration
          const avgDurationSecs = response.data.totalCalls > 0 
            ? Math.round(response.data.totalDuration / response.data.totalCalls) 
            : 0;
          
          const minutes = Math.floor(avgDurationSecs / 60);
          const seconds = avgDurationSecs % 60;
          const formattedAvgDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          setCallStats({
            totalCalls: response.data.totalCalls || 0,
            totalDuration: response.data.totalDuration || 0,
            callsThisMonth: response.data.callsThisMonth || 0,
            avgDuration: formattedAvgDuration
          });
        }
      } catch (error) {
        console.error("Error fetching call stats:", error);
        toast({
          title: "Error",
          description: "Failed to load call statistics",
          variant: "destructive",
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchCallStats();
  }, [toast]);

  // Use a standard cost per minute for calculations
  const costPerMinute = 5.00; // ₹1 per minute
  
  // Calculate estimated minutes based on balance
  const estimatedMinutes = Math.floor(balance / 100 / costPerMinute);
  
  // Calculate usage percentage based on this month's calls vs total capacity
  // This is an estimation - in a real app you would have more precise usage metrics
  const monthlyCapacity = 500; // Example target
  const usagePercent = Math.min(Math.round((callStats.callsThisMonth / monthlyCapacity) * 100), 100);

  const refreshBalance = async () => {
    try {
      const response = await axios.get("/api/wallet/balance");
      toast({
        title: "Balance Updated",
        description: `Current balance: ₹${(response.data.balance / 100).toFixed(2)}`,
      });
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast({
        title: "Error",
        description: "Failed to refresh balance",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Balance Card */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <Button variant="ghost" size="icon" onClick={refreshBalance} className="h-8 w-8">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-12 w-28" />
          ) : (
            <div className="text-3xl font-bold">
              ₹{(balance / 100).toFixed(2)}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date().toLocaleString('en-US', { 
              hour: 'numeric', 
              minute: 'numeric',
              hour12: true 
            })}
          </p>
        </CardContent>
        {/* <CardFooter>
          <Link href="/settings/wallet?tab=topup" className="w-full">
            <Button className="w-full" size="sm">
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Add Credits
            </Button>
          </Link>
        </CardFooter> */}
      </Card>
  {/* AI Credits Card */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Brain className="mr-2 h-4 w-4 text-primary" />
            AI Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiCreditsLoading ? (
            <Skeleton className="h-12 w-28" />
          ) : (
            <div className="text-3xl font-bold text-primary">
              {aiCredits}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            For AI features
          </p>
        </CardContent>
      </Card>

      {/* Call Time Estimate Card */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estimated Talk Time</CardTitle>
          <CardDescription>At current rate of ₹{costPerMinute.toFixed(2)}/min</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-12 w-28" />
          ) : (
            <div className="flex items-baseline">
              <div className="text-3xl font-bold mr-2">
                {estimatedMinutes}
              </div>
              <div className="text-sm text-muted-foreground">minutes</div>
            </div>
          )}
          {!statsLoading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Used this month</span>
                <span className="font-medium">{callStats.callsThisMonth} calls</span>
              </div>
              <Progress value={usagePercent} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Call Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statsLoading ? (
            <>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 bg-primary/10 p-2 rounded-full">
                    <PhoneCall className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Calls</p>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </div>
                </div>
                <div className="font-medium">{callStats.totalCalls}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 bg-primary/10 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avg. Duration</p>
                    <p className="text-xs text-muted-foreground">Per call</p>
                  </div>
                </div>
                <div className="font-medium">{callStats.avgDuration}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 bg-primary/10 p-2 rounded-full">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cost Per Minute</p>
                    <p className="text-xs text-muted-foreground">Current rate</p>
                  </div>
                </div>
                <div className="font-medium">₹{costPerMinute.toFixed(2)}</div>
              </div>
            </>
          )}
        </CardContent>
        {/* <CardFooter>
          <Link href="/settings/wallet?tab=analytics">
            <Button variant="outline" size="sm" className="w-full">
              View Detailed Analytics
              <ArrowUpRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </CardFooter> */}
      </Card>
    </div>
  );
}