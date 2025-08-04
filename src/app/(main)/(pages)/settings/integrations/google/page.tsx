"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, HelpCircle, LockKeyhole, Mail, Shield } from "lucide-react";

// Reuse your existing Integration layout:
import IntegrationAppLayout, {
  IntegrationTab,
} from "@/components/layouts/integrationAppLayout";

// Shadcn UI components
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertDialog, AlertDialogDescription } from "@/components/ui/alert-dialog";

export default function GoogleIntegrationPage() {
  // Store the connected Gmail info
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [connectedDate, setConnectedDate] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // On mount, check if there's already a connected Google account
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
        setIsConnected(true);
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
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">Connect Google (Gmail) Account</CardTitle>
        <CardDescription>
          Send emails directly from Zapllo using your Gmail account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {connectedEmail ? (
          <div className="space-y-4">
            <AlertDialog >
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDialogDescription className="text-green-700 flex flex-col gap-1">
                <span className="font-medium">Account Connected</span>
                <span className="text-sm">Emails will be sent from your Gmail account</span>
              </AlertDialogDescription>
            </AlertDialog>

            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
              <div>
                <h3 className="text-sm font-medium">Connected Account</h3>
                <p className="text-sm">{connectedEmail}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Connected On</h3>
                <p className="text-sm">
                  {connectedDate ? new Date(connectedDate).toLocaleString() : "Unknown"}
                </p>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Disconnect Account
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-medium">Email Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 border rounded-lg">
                  <div className="bg-blue-100 p-1 rounded mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Send Emails</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Send personalized emails to leads and contacts
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 border rounded-lg">
                  <div className="bg-blue-100 p-1 rounded mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Email Sequences</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Schedule follow-up emails automatically
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="text-base font-medium mb-3">Connect your Gmail account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connecting your Gmail account allows you to send emails directly from Zapllo
                without switching between applications.
              </p>
              <Button
                className="bg-[#DB4437] hover:bg-[#DB4437]/90 flex items-center gap-2"
                onClick={handleConnectGoogle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Connect Gmail
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-medium">Benefits of Connecting Gmail</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 border rounded-lg">
                  <div className="bg-green-100 p-1 rounded mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Seamless Integration</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Send emails without leaving Zapllo
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 border rounded-lg">
                  <div className="bg-green-100 p-1 rounded mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Email Templates</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Use templates to send consistent messages
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 border rounded-lg">
                  <div className="bg-green-100 p-1 rounded mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Scheduled Sending</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Schedule emails to be sent at optimal times
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 border rounded-lg">
                  <div className="bg-green-100 p-1 rounded mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                      <line x1="4" y1="22" x2="4" y2="15"></line>
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Email Tracking</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Track opens, clicks, and replies
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // -----------------------------------------------
  // Tab: How Will It Work
  // -----------------------------------------------
  const howTab = (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">How It Works</CardTitle>
        <CardDescription>
          Learn how to set up and use the Gmail integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-base font-medium mb-3">Setting Up</h3>
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li>
                <span className="font-medium">Connect Your Account</span>
                <p className="text-muted-foreground mt-1">
                  Click the "Connect Gmail" button to start the OAuth authorization flow
                </p>
              </li>
              <li>
                <span className="font-medium">Grant Permissions</span>
                <p className="text-muted-foreground mt-1">
                  Sign in with your Google account and grant permission to send emails
                </p>
              </li>
              <li>
                <span className="font-medium">Verify Connection</span>
                <p className="text-muted-foreground mt-1">
                  Once connected, your Gmail address will appear as "Connected"
                </p>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-base font-medium mb-3">Using the Integration</h3>
            <ul className="list-disc pl-5 space-y-3 text-sm">
              <li>
                <span className="font-medium">Compose Emails</span>
                <p className="text-muted-foreground mt-1">
                  Use the email composer in Zapllo to create and send emails via Gmail
                </p>
              </li>
              <li>
                <span className="font-medium">Email Templates</span>
                <p className="text-muted-foreground mt-1">
                  Create and save templates for frequently used messages
                </p>
              </li>
              <li>
                <span className="font-medium">Automated Sequences</span>
                <p className="text-muted-foreground mt-1">
                  Set up automated email sequences for lead nurturing
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Pro Tips</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm text-blue-700">
            <li>Create personalized email templates with dynamic fields like {'{first_name}'}</li>
            <li>Schedule emails to send during business hours for better response rates</li>
            <li>Use the email tracking feature to follow up with leads who opened your emails</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  // -----------------------------------------------
  // Tab: Permissions
  // -----------------------------------------------
  const permissionsTab = (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">Data & Permissions</CardTitle>
        <CardDescription>
          Information about what data is accessed and how it's used
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-base font-medium mb-3">Data We Access</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded mt-0.5">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <span className="font-medium text-sm">Basic Profile Information</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your name and email address from your Google Account
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded mt-0.5">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <span className="font-medium text-sm">Email Sending Capability</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permission to send emails on your behalf when you use Zapllo
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-medium mb-3">How We Use This Data</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="bg-blue-100 p-1 rounded mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-sm">Email Sending</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We use your Gmail account to send emails you compose in Zapllo
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-blue-100 p-1 rounded mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-sm">Email Scheduling</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sending scheduled emails at your specified times
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="text-base font-medium mb-2">Security & Privacy</h3>
              <p className="text-sm text-muted-foreground">
                We never read your Gmail inbox or access your personal emails. Only emails you explicitly
                compose and send through Zapllo will use your Gmail account.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              You can revoke access at any time by disconnecting your account here
              or through your Google Account settings.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
                Manage in Google
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Define the tabs with icons
  const tabs: IntegrationTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: overviewTab,
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: "how",
      label: "How It Works",
      content: howTab,
      icon: <HelpCircle className="h-4 w-4" />
    },
    {
      id: "permissions",
      label: "Data & Permissions",
      content: permissionsTab,
      icon: <LockKeyhole className="h-4 w-4" />
    },
  ];

  // -----------------------------------------------
  // Render using IntegrationAppLayout
  // -----------------------------------------------
  return (
    <IntegrationAppLayout
      backHref="/settings/integrations"
      logoSrc="/integrations/gmail.png"
      name="Gmail"
      vendor="Google"
      description="Send emails directly from Zapllo using your Gmail account with tracking and automation"
      docsUrl="https://help.zapllo.com/gmail-integration"
      status={isConnected ? "connected" : "not_connected"}
      tabs={tabs}
    />
  );
}