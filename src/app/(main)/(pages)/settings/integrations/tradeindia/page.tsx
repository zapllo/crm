"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// Reusable layout you created
import IntegrationAppLayout, {
  IntegrationTab,
} from "@/components/layouts/integrationAppLayout";

// Shadcn UI & your own UI components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";   // Shadcn’s utility for classnames
import { format } from "date-fns";

export default function TradeIndiaIntegrationPage() {
  // -- TradeIndia credentials state --
  const [tradeIndiaUserId, setTradeIndiaUserId] = useState("");
  const [tradeIndiaProfileId, setTradeIndiaProfileId] = useState("");
  const [tradeIndiaKey, setTradeIndiaKey] = useState("");
  const [existingSettings, setExistingSettings] = useState<any>(null);

  // -- Pipeline selection --
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>("");

  // -- Date pickers for inquiry range --
  // Store as Date | undefined (instead of null) to match the Shadcn Calendar types
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
    <Card>
      <CardHeader>
        <CardTitle>Connect your TradeIndia Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        <Label>User ID</Label>
        <Input
          placeholder="e.g. 24050870"
          value={tradeIndiaUserId}
          onChange={(e) => setTradeIndiaUserId(e.target.value)}
        />

        <Label>Profile ID</Label>
        <Input
          placeholder="e.g. 119994132"
          value={tradeIndiaProfileId}
          onChange={(e) => setTradeIndiaProfileId(e.target.value)}
        />

        <Label>API Key</Label>
        <Input
          placeholder="Enter your TradeIndia Key"
          value={tradeIndiaKey}
          onChange={(e) => setTradeIndiaKey(e.target.value)}
        />

        <Label>Select Pipeline</Label>
        <Select value={selectedPipeline} onValueChange={(val) => setSelectedPipeline(val)}>
          <SelectTrigger className="w-[200px]">
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

        <Button onClick={handleSave}>Save</Button>

        {/* Show existing saved data */}
        {existingSettings && (
          <p className="text-sm text-muted-foreground">
            Current user ID: <strong>{existingSettings.tradeIndiaUserId}</strong>
          </p>
        )}

        <hr className="my-4" />

        {/* Shadcn date pickers for range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
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
                  {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(day) => setFromDate(day)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
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
                  {toDate ? format(toDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(day) => setToDate(day)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button variant="outline" onClick={handleFetchLeads}>
          Pull Leads from TradeIndia
        </Button>
        {fetchResponse && (
          <pre className="bg-gray-100 p-2 mt-2 text-sm">{fetchResponse}</pre>
        )}
      </CardContent>
    </Card>
  );

  // 2) How will it work
  const howTab = (
    <Card>
      <CardHeader>
        <CardTitle>How will it work</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <ul className="list-disc pl-5 space-y-2">
          <li>Find your TradeIndia <strong>User ID</strong>, <strong>Profile ID</strong>, and <strong>Key</strong> under “My Inquiry API.”</li>
          <li>Enter those details here and select a <em>Pipeline</em> for new leads.</li>
          <li>Click <strong>Save</strong> to store your settings.</li>
          <li>Choose a date range with <strong>From Date</strong> and <strong>To Date</strong>.</li>
          <li>Click <strong>Pull Leads</strong> to retrieve inquiries and create new leads automatically.</li>
        </ul>
        <p className="text-sm mt-2">
          Once leads are fetched, they appear in the pipeline you selected. You can manage them
          just like any other leads in your CRM.
        </p>
      </CardContent>
    </Card>
  );

  // 3) Permissions
  const permissionsTab = (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This integration reads inquiries from your TradeIndia account so they can be
          created as leads in your CRM. Make sure your TradeIndia subscription level
          and user role permit accessing these inquiries via the API.
        </p>
      </CardContent>
    </Card>
  );

  // Define the three tabs
  const tabs: IntegrationTab[] = [
    { id: "overview", label: "Overview", content: overviewTab },
    { id: "how", label: "How will it work", content: howTab },
    { id: "permissions", label: "Permissions", content: permissionsTab },
  ];

  return (
    <IntegrationAppLayout
      backHref="/settings/integrations"
      logoSrc="/integrations/tradeindia.png"
      name="TradeIndia"
      vendor="YourVendor" 
      tabs={tabs}
    />
  );
}
