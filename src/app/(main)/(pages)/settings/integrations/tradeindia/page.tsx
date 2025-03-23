"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, HelpCircle, LockKeyhole, User, Calendar } from "lucide-react";

// Reusable layout
import IntegrationAppLayout, {
  IntegrationTab,
} from "@/components/layouts/integrationAppLayout";

// Shadcn UI components
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertDialog, AlertDialogDescription } from "@/components/ui/alert-dialog";

export default function TradeIndiaIntegrationPage() {
  // -- TradeIndia credentials state --
  const [tradeIndiaUserId, setTradeIndiaUserId] = useState("");
  const [tradeIndiaProfileId, setTradeIndiaProfileId] = useState("");
  const [tradeIndiaKey, setTradeIndiaKey] = useState("");
  const [existingSettings, setExistingSettings] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // -- Pipeline selection --
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>("");

  // -- Date pickers for inquiry range --
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  // -- Display server response for debugging --
  const [fetchResponse, setFetchResponse] = useState("");

  // Fetch existing settings & pipelines on mount
  useEffect(() => {
    loadSettings();
    loadPipelines();
  }, []);

  async function loadSettings() {
    try {
      // If you store all integration docs in `/api/integrations`, filter by platform:
      const res = await axios.get("/api/integrations");
      const data = res.data;
      const rec = data.find((r: any) => r.platform === "tradeindia");
      if (rec) {
        setTradeIndiaUserId(rec.tradeIndiaUserId || "");
        setTradeIndiaProfileId(rec.tradeIndiaProfileId || "");
        setTradeIndiaKey(rec.tradeIndiaKey || "");
        setSelectedPipeline(rec.pipelineId || "");
        setExistingSettings(rec);
        setIsConnected(!!rec.tradeIndiaKey && !!rec.tradeIndiaUserId);
      }
    } catch (err) {
      console.error("Error loading TradeIndia settings:", err);
    }
  }

  async function loadPipelines() {
    try {
      const res = await axios.get("/api/pipelines");
      setPipelines(res.data || []);
    } catch (err) {
      console.error("Error loading pipelines:", err);
    }
  }

  // -- Save user credentials & pipeline --
  async function handleSave() {
    try {
      await axios.post("/api/integrations/tradeindia/connect", {
        tradeIndiaUserId,
        tradeIndiaProfileId,
        tradeIndiaKey,
        pipelineId: selectedPipeline,
      });
      alert("TradeIndia settings saved!");
      loadSettings();
      setIsConnected(true);
    } catch (err) {
      console.error("Error saving TradeIndia credentials:", err);
      alert("Failed to save TradeIndia settings.");
    }
  }

  // -- Pull leads by calling your server endpoint with fromDate/toDate --
  async function handleFetchLeads() {
    try {
      // Convert selected dates to YYYY-MM-DD (or as needed by the API)
      const fromString = fromDate ? format(fromDate, "yyyy-MM-dd") : "";
      const toString = toDate ? format(toDate, "yyyy-MM-dd") : "";

      // Example optional parameters
      const limit = 5;
      const page_no = 1;

      const res = await axios.get(
        `/api/integrations/tradeindia/fetchLeads?fromDate=${encodeURIComponent(
          fromString
        )}&toDate=${encodeURIComponent(toString)}&limit=${limit}&page_no=${page_no}`
      );

      setFetchResponse(JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error("Error fetching TradeIndia leads:", err);
      setFetchResponse("Error fetching leads.");
    }
  }

  // -- TABS CONTENT --

  // 1) Overview tab: credentials, pipeline, date pickers, etc.
  const overviewTab = (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">Connect your TradeIndia Account</CardTitle>
        <CardDescription>
          Link your TradeIndia seller account to import inquiries as leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                placeholder="e.g. 24050870"
                value={tradeIndiaUserId}
                onChange={(e) => setTradeIndiaUserId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your TradeIndia seller account User ID
              </p>
            </div>

            <div className="space-y-2">
              <Label>Profile ID</Label>
              <Input
                placeholder="e.g. 119994132"
                value={tradeIndiaProfileId}
                onChange={(e) => setTradeIndiaProfileId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Found in your TradeIndia business profile settings
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                placeholder="Enter your TradeIndia Key"
                value={tradeIndiaKey}
                onChange={(e) => setTradeIndiaKey(e.target.value)}
                type="password"
              />
            </div>

            <div className="space-y-2">
              <Label>Select Pipeline</Label>
              <Select value={selectedPipeline} onValueChange={(val) => setSelectedPipeline(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose pipeline" />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((pl) => (
                    <SelectItem key={pl._id} value={pl._id}>
                      {pl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                New leads will be added to this pipeline
              </p>
            </div>
            <Button onClick={handleSave}>
              {isConnected ? "Update Connection" : "Connect Account"}
            </Button>

            {isConnected && (
              <AlertDialog >
                <AlertDialogDescription className="text-green-700 flex flex-col gap-1">
                  <span className="font-medium">Connection Active</span>
                  <span className="text-xs">TradeIndia is connected to Zapllo</span>
                </AlertDialogDescription>
              </AlertDialog>
            )}
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-medium mb-3">Pull Leads Manually</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fromDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, "PPP") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={fromDate}
                          onSelect={(day) => setFromDate(day)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !toDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, "PPP") : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={toDate}
                          onSelect={(day) => setToDate(day)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleFetchLeads}
                  disabled={!isConnected}
                  className="w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Pull Leads from TradeIndia
                </Button>
              </div>
            </div>

            {fetchResponse && (
              <div className="space-y-2">
                <Label>Response</Label>
                <div className="bg-slate-50 p-3 rounded-md border overflow-x-auto text-xs max-h-64 overflow-y-auto">
                  <pre>{fetchResponse}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium block mb-1">For automatic lead import:</span>
            Configure your TradeIndia account to forward inquiries to our webhook at:
            <code className="block mt-1 bg-amber-100 p-2 rounded">
              https://zapllo.com/api/integrations/tradeindia/webhook
            </code>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // 2) How will it work
  const howTab = (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">How It Works</CardTitle>
        <CardDescription>
          Learn how to set up and use the TradeIndia integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-base font-medium mb-3">Setting Up</h3>
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li>
                <span className="font-medium">Find Your Credentials</span>
                <p className="text-muted-foreground mt-1">
                  Find your TradeIndia <strong>User ID</strong>, <strong>Profile ID</strong>,
                  and <strong>Key</strong> under "My Inquiry API" in your TradeIndia seller panel
                </p>
              </li>
              <li>
                <span className="font-medium">Connect Your Account</span>
                <p className="text-muted-foreground mt-1">
                  Enter your credentials in the Overview tab and select which pipeline to add leads to
                </p>
              </li>
              <li>
                <span className="font-medium">Configure Webhook (Optional)</span>
                <p className="text-muted-foreground mt-1">
                  For automatic lead import, configure TradeIndia to send data to our webhook URL
                </p>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-base font-medium mb-3">Using the Integration</h3>
            <ul className="list-disc pl-5 space-y-3 text-sm">
              <li>
                <span className="font-medium">Automatic Lead Import</span>
                <p className="text-muted-foreground mt-1">
                  If configured, new leads from TradeIndia are automatically created in your selected pipeline
                </p>
              </li>
              <li>
                <span className="font-medium">Manual Lead Import</span>
                <p className="text-muted-foreground mt-1">
                  Use the date range selectors and "Pull Leads" button to manually import leads from a specific period
                </p>
              </li>
              <li>
                <span className="font-medium">Lead Management</span>
                <p className="text-muted-foreground mt-1">
                  Once imported, leads appear in your CRM with contact information and inquiry details
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Pro Tips</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm text-blue-700">
            <li>Create an automation to assign leads to specific team members based on product category</li>
            <li>Set up email templates for quick responses to TradeIndia inquiries</li>
            <li>Use tags to identify and filter leads that came from TradeIndia</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  // 3) Permissions
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
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <span className="font-medium text-sm">Inquiry Information</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Contact details and messages from potential customers who inquired through TradeIndia
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-green-100 p-1 rounded mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-sm">Product Information</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Details about products that customers have shown interest in
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
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-sm">Lead Creation</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We create leads in your CRM based on TradeIndia inquiries
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-blue-100 p-1 rounded mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-sm">Data Synchronization</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We keep your CRM leads in sync with TradeIndia inquiries
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="text-base font-medium mb-2">Security & Privacy</h3>
              <p className="text-sm text-muted-foreground">
                All data is transmitted securely using industry-standard encryption.
                You can revoke access at any time by removing your API credentials.
              </p>
            </div>
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
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "how",
      label: "How will it work",
      content: howTab,
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      id: "permissions",
      label: "Permissions",
      content: permissionsTab,
      icon: <LockKeyhole className="h-4 w-4" />,
    },
  ];

  return (
    <IntegrationAppLayout
      backHref="/settings/integrations"
      logoSrc="/integrations/tradeindia.png"
      name="TradeIndia"
      vendor="TradeIndia.com"
      description="Connect your TradeIndia account to automatically import leads and inquiries into your CRM"
      docsUrl="https://help.zapllo.com/tradeindia-integration"
      status={isConnected ? "connected" : "not_connected"}
      tabs={tabs}
    />
  );
}