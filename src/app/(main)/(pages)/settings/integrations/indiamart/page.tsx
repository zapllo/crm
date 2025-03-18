"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

import IntegrationAppLayout, {
    IntegrationTab,
} from "@/components/layouts/integrationAppLayout";

// Import your existing UI components:
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function IndiaMartIntegrationPage() {
    const [apiKey, setApiKey] = useState("");
    const [existingKey, setExistingKey] = useState("");
    const [fetchResponse, setFetchResponse] = useState("");
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [selectedPipeline, setSelectedPipeline] = useState<string>("");


    // Instead of `Date | null`, use `Date | undefined`
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);


    useEffect(() => {
        loadKey();
        loadPipelines();
    }, []);

    async function loadKey() {
        try {
            const res = await axios.get("/api/integrations");
            const data = res.data;
            const rec = data.find((r: any) => r.platform === "indiamart");
            if (rec) {
                setExistingKey(rec.apiKey || "");
                setSelectedPipeline(rec.pipelineId || "");
            }
        } catch (err) {
            console.error("Error loading IndiaMART key:", err);
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

    async function handleSave() {
        try {
            await axios.post("/api/integrations/indiamart/connect", {
                apiKey,
                pipelineId: selectedPipeline,
            });
            alert("IndiaMART settings saved!");
            loadKey();
        } catch (err) {
            console.error("Error saving IndiaMART key:", err);
            alert("Failed to save key/pipeline.");
        }
    }

    async function handleFetchLeads() {
        try {
            // If we only want to send YYYY-MM-DD (no time), we can do something like:
            const dateString = startDate
                ? format(startDate, "yyyy-MM-dd") // or any needed format
                : "";

            const res = await axios.get(
                `/api/integrations/indiamart/fetchLeads?start=0&rows=3&fromDate=${encodeURIComponent(
                    dateString
                )}`
            );
            console.log("Fetch leads response:", res.data);
            setFetchResponse(JSON.stringify(res.data, null, 2));
        } catch (err) {
            console.error("Error fetching leads:", err);
            setFetchResponse("Error fetching leads.");
        }
    }

    // -- Tab Content --
    const overviewContent = (
        <Card>
            <CardHeader>
                <CardTitle>Connect your IndiaMART Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* API Key */}
                <Label>Your IndiaMART glusr_crm_key</Label>
                <Input
                    placeholder="Enter your glusr_crm_key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />

                {/* Pipeline selection */}
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

                {/* Shadcn Date Picker */}
                <Label>Select Start Date</Label>
                <Popover >
                    <PopoverTrigger className="ml-4 " asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "justify-start text-left font-normal w-[220px]",
                                !startDate && "text-muted-foreground"
                            )}
                        >
                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Button className="ml-4" onClick={handleSave}>Save</Button>

                {existingKey && (
                    <p className="text-sm text-muted-foreground">
                        Existing Key: <strong>{existingKey}</strong> <br />
                        Pipeline: <strong>{selectedPipeline || "None"}</strong>
                    </p>
                )}

                <hr className="my-4" />

                <Button variant="outline" onClick={handleFetchLeads}>
                    Pull Leads from IndiaMART
                </Button>
                {fetchResponse && (
                    <pre className="bg-gray-100 p-2 mt-2 text-sm">{fetchResponse}</pre>
                )}

                <p className="text-sm text-gray-500 mt-4">
                    If you want leads to come automatically, set your Webhook/POST buy lead URL to:
                    <code className="block mt-1">
                        https://zapllo.com/api/integrations/indiamart/webhook
                    </code>
                    in your IndiaMART seller panel.
                </p>
            </CardContent>
        </Card>
    );

    // How will it work tab
    const howContent = (
        <Card>
            <CardHeader>
                <CardTitle>How will it work</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Click on the Install app button</li>
                    <li>Click on ‘Allow and Install’</li>
                    <li>After installation, sign up on the app</li>
                    <li>Verify your email and login</li>
                    <li>Navigate to ‘Installed apps’ under Marketplace</li>
                    <li>Click on ‘View Details’ of the Indiamart Lead Integration app</li>
                </ul>
                <p className="text-sm mt-4">
                    On the details screen of the Indiamart application, follow the steps:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                    <li>
                        Go to <strong>API keys</strong> section of the Indiamart
                        application and enter your CRM’s API key
                    </li>
                    <li>Click on the <strong>Save</strong> button</li>
                    <li>
                        Go to Indiamart <strong>Settings</strong> section and enter:
                        <ul className="list-disc pl-8 mt-2 space-y-1">
                            <li>
                                Mobile number (used to login to Indiamart’s Seller portal)
                            </li>
                            <li>Your Indiamart API key</li>
                            <li>Choose vendor as <strong>Indiamart</strong></li>
                            <li>
                                Choose the <strong>Campaign</strong> and <strong>Source</strong> to map
                            </li>
                            <li>Click <strong>Save</strong></li>
                        </ul>
                    </li>
                </ul>
                <p className="text-sm mt-4">
                    Once your account is connected, you will start getting leads from
                    Indiamart within 15 minutes. You can find those Leads in your Lead
                    listing page and Lead logs section of the Indiamart Lead integration.
                </p>
            </CardContent>
        </Card>
    );

    // Permissions tab
    const permissionsContent = (
        <Card>
            <CardHeader>
                <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm">
                    This integration will have read/write access to your Leads data from
                    Indiamart, as well as basic account information. Contact your admin
                    for further details.
                </p>
            </CardContent>
        </Card>
    );

    // -------------------------
    // Define our tabs
    // -------------------------
    const tabs: IntegrationTab[] = [
        {
            id: "overview",
            label: "Overview",
            content: overviewContent,
        },
        {
            id: "how",
            label: "How will it work",
            content: howContent,
        },
        {
            id: "permissions",
            label: "Permissions",
            content: permissionsContent,
        },
    ];

    // -------------------------
    // Use the reusable layout
    // -------------------------
    return (
        <IntegrationAppLayout
            backHref="/settings/integrations"
            logoSrc="/integrations/indiamart.png"
            name="Indiamart"
            vendor="Kylas"
            tabs={tabs}
        />
    );
}
