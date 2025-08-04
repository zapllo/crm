import React from "react";
import { Metadata } from "next";
import WalletDashboard from "@/components/wallet/wallet-dashboard";

export const metadata: Metadata = {
  title: "Wallet | Zapllocrm",
  description: "Manage your calling credits and wallet balance",
};

export default function WalletPage() {
  return <WalletDashboard />;
}