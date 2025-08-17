import React, { Suspense } from "react";
import { Metadata } from "next";
import WalletDashboard from "@/components/wallet/wallet-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Wallet | Zapllocrm",
  description: "Manage your calling credits, AI credits, and wallet balance",
};

// Loading component for the suspense boundary
function WalletDashboardSkeleton() {
  return (
    <div className="mx-auto py-6 space-y-8">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-12 w-full max-w-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletDashboardSkeleton />}>
      <WalletDashboard />
    </Suspense>
  );
}