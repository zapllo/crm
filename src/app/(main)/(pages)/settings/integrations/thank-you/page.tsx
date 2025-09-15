"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, CalendarClock, HelpCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const integration = searchParams.get("integration") || "your";
  const formattedIntegration = integration.charAt(0).toUpperCase() + integration.slice(1);
  
  // If no integration param, redirect to integrations page
  React.useEffect(() => {
    if (!searchParams.get("integration")) {
      router.push("/settings/integrations");
    }
  }, [searchParams, router]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto h-screen overflow-y-scroll flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="border-green-200 dark:border-green-800 shadow-md">
          <CardHeader className="pb-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Thank You for Your Purchase!</CardTitle>
            <CardDescription className="text-base">
              Your {formattedIntegration} integration setup is now underway
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-6">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-md p-4">
              <div className="flex items-start gap-3">
                <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">What Happens Next?</h3>
                  <p className="text-blue-700 dark:text-blue-400 mt-1">
                    Our integration team will contact you within 24 hours to gather information and begin the setup process. 
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg"
              >
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-900 p-1.5 rounded-full">
                    <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </span>
                  Need Help?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If you have any questions about your integration, our support team is here to help.
                </p>
                <Button variant="outline" asChild size="sm">
                  <Link href="/support">Contact Support</Link>
                </Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg"
              >
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded-full">
                    <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  Track Progress
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You can track the status of your integration setup at any time from your integration page.
                </p>
                <Button variant="outline" asChild size="sm">
                  <Link href={`/settings/integrations/${integration}`}>View Status</Link>
                </Button>
              </motion.div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/settings/integrations">
                Return to Marketplace
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

// Loading fallback component
function LoadingCard() {
  return (
    <div className="w-full">
      <Card className="border shadow-md animate-pulse">
        <CardHeader className="pb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full p-3 bg-gray-200 dark:bg-gray-700 h-14 w-14"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main component that wraps the content with Suspense
export default function IntegrationThankYouPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto h-screen overflow-y-scroll flex items-center justify-center">
      <Suspense fallback={<LoadingCard />}>
        <ThankYouContent />
      </Suspense>
    </div>
  );
}