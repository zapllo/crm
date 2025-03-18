"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// Reuse your existing Integration layout:
import IntegrationAppLayout, {
  IntegrationTab,
} from "@/components/layouts/integrationAppLayout";

// Shadcn UI or your own UI components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 1) This page example mimics how you “connect google” in your ChannelsPage

export default function GoogleIntegrationPage() {
  // Store the connected Gmail info
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [connectedDate, setConnectedDate] = useState<string | null>(null);

  // On mount, check if there’s already a connected Google account
  useEffect(() => {
    fetchConnectedAccount();
  }, []);

  async function fetchConnectedAccount() {
    try {
      // Example: same endpoint you used in your channels page
      const res = await axios.get("/api/channels/connect");
      if (res.data && res.data.emailAddress) {
        setConnectedEmail(res.data.emailAddress);
        setConnectedDate(res.data.createdAt);
      }
    } catch (err) {
      console.log("No connected account found or error:", err);
    }
  }

  function handleConnectGoogle() {
    // Possibly direct to your server route that handles OAuth flow
    window.location.href = "/api/channels/connect/google";
  }

  // -----------------------------------------------
  // Tab: Overview (Connect your Google Account)
  // -----------------------------------------------
  const overviewTab = (
    <Card>
      <CardHeader>
        <CardTitle>Connect Google (Gmail) Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedEmail ? (
          <div>
            <p>
              Connected as: <strong>{connectedEmail}</strong>
            </p>
            <p>
              Connected on:{" "}
              {connectedDate ? new Date(connectedDate).toLocaleString() : ""}
            </p>
            <p className="text-sm text-green-600 mt-2">
              Emails will be sent from this connected account.
            </p>
          </div>
        ) : (
          <Button className="bg-[#017a5b] hover:bg-green-900" onClick={handleConnectGoogle}>Connect Google</Button>
        )}
      </CardContent>
    </Card>
  );

  // -----------------------------------------------
  // Tab: How Will It Work
  // -----------------------------------------------
  const howTab = (
    <Card>
      <CardHeader>
        <CardTitle>How will it work</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Click on <strong>Connect Google</strong> to start the OAuth
            authorization flow.
          </li>
          <li>
            Sign in with your Google account and grant permissions for sending
            email or reading threads (depending on your integration’s scope).
          </li>
          <li>
            Once connected, your Gmail address will appear as “Connected.”
          </li>
          <li>
            Sending emails from the CRM will use this Gmail integration by
            default.
          </li>
        </ul>
        <p>
          You can always revoke access via your Google Account’s security
          settings or by disconnecting in this CRM.
        </p>
      </CardContent>
    </Card>
  );

  // -----------------------------------------------
  // Tab: Permissions
  // -----------------------------------------------
  const permissionsTab = (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          By connecting your Gmail account, you grant this CRM the ability to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Send emails on your behalf.</li>
          <li>
            Potentially read and display your email threads if your scope
            includes Gmail read permissions (optional).
          </li>
        </ul>
        <p>
          You can revoke these permissions at any time in your Google Account
          settings. Contact your admin if you have questions about data usage.
        </p>
      </CardContent>
    </Card>
  );

  // Build the Tabs array for the IntegrationAppLayout
  const tabs: IntegrationTab[] = [
    { id: "overview", label: "Overview", content: overviewTab },
    { id: "how", label: "How will it work", content: howTab },
    { id: "permissions", label: "Permissions", content: permissionsTab },
  ];

  // -----------------------------------------------
  // Render using IntegrationAppLayout
  // -----------------------------------------------
  return (
    <IntegrationAppLayout
      backHref="/settings/integrations"
      logoSrc="/integrations/gmail.png" // Provide your Google/Gmail logo
      name="Gmail"
      vendor="YourVendorName"
      tabs={tabs}
    />
  );
}
