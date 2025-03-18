"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// Example UI components (use your own or adapt as needed)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type IntegrationInfo = {
  name: string;
  href: string; // route link to the integration
  imageSrc: string; // path under /public
};

const integrations: IntegrationInfo[] = [
  {
    name: "IndiaMART",
    href: "/settings/integrations/indiamart",
    imageSrc: "/integrations/indiamart.png",
  },
  {
    name: "TradeIndia",
    href: "/settings/integrations/tradeindia",
    imageSrc: "/integrations/tradeindia.png",
  },
  {
    name: "Gmail",
    href: "/settings/integrations/google",
    imageSrc: "/integrations/gmail.png",
  },
  // Add more integrations as needed...
];

export default function IntegrationsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Integrations</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select an Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Link href={integration.href} key={integration.name}>
                <div className="rounded-lg h-32 border p-4 hover:shadow cursor-pointer flex flex-col items-center">
                  <Image
                    src={integration.imageSrc}
                    alt={integration.name}
                    width={60}
                    height={60}
                  />
                  <p className="mt-2 font-medium">{integration.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
