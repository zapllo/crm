"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, HelpCircle, LockKeyhole } from "lucide-react";

import IntegrationAppLayout, {
    IntegrationTab,
} from "@/components/layouts/integrationAppLayout";

// Import your existing UI components:
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";

export default function IndiaMartIntegrationPage() {
    const [apiKey, setApiKey] = useState("");
    const [existingKey, setExistingKey] = useState("");
    const [fetchResponse, setFetchResponse] = useState("");
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [selectedPipeline, setSelectedPipeline] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);

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
                setIsConnected(!!rec.apiKey); // Set connection status
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
            setIsConnected(true);
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
        <Card className="border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-xl">Connect your IndiaMART Account</CardTitle>
                <CardDescription>
                    Connect your IndiaMART seller account to import leads automatically
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {/* API Key */}
                        <div className="space-y-2">
                            <Label>Your IndiaMART glusr_crm_key</Label>
                            <Input
                                placeholder="Enter your glusr_crm_key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                You can find this key in your IndiaMART seller panel
                            </p>
                        </div>

                        {/* Pipeline selection */}
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
                        </div>

                        <Button
                            onClick={handleSave}
                            className="mt-2"
                        >
                            {isConnected ? "Update Connection" : "Connect Account"}
                        </Button>

                        {existingKey && (
                            <AlertDialog >
                                <AlertDialogDescription className="text-green-700 flex flex-col gap-1">
                                    <span className="font-medium">Connection Active</span>
                                    <span className="text-xs">IndiaMART is connected to Zapllo</span>
                                </AlertDialogDescription>
                            </AlertDialog>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Pull Leads Manually</Label>
                            <div className="flex flex-col gap-3">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            {startDate ? format(startDate, "PPP") : "Select start date"}
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

                                <Button
                                    variant="outline"
                                    onClick={handleFetchLeads}
                                    disabled={!existingKey}
                                >
                                    Pull Leads from IndiaMART
                                </Button>
                            </div>
                        </div>

                        {fetchResponse && (
                            <div className="mt-4">
                                <Label className="mb-2 block">Response</Label>
                                <div className="bg-slate-50 p-3 rounded-md border overflow-x-auto text-xs">
                                    <pre>{fetchResponse}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
                    <p className="text-sm text-amber-800">
                        <span className="font-medium block mb-1">For automatic lead import:</span>
                        Set your Webhook/POST buy lead URL to:
                        <code className="block mt-1 bg-amber-100 p-2 rounded">
                            https://zapllo.com/api/integrations/indiamart/webhook
                        </code>
                        in your IndiaMART seller panel.
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    // How will it work tab
    const howContent = (
        <Card className="border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-xl">How It Works</CardTitle>
                <CardDescription>
                    Learn how to set up and use the IndiaMART integration
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-base font-medium mb-3">Setting Up</h3>
                        <ol className="list-decimal pl-5 space-y-3 text-sm">
                            <li>
                                <span className="font-medium">Find your API Key</span>
                                <p className="text-muted-foreground mt-1">
                                    Log into your IndiaMART Seller Panel, navigate to Settings → API keys
                                </p>
                            </li>
                            <li>
                                <span className="font-medium">Connect your account</span>
                                <p className="text-muted-foreground mt-1">
                                    Enter your API key on the Overview tab and select which pipeline to add leads to
                                </p>
                            </li>
                            <li>
                                <span className="font-medium">Configure webhook (optional)</span>
                                <p className="text-muted-foreground mt-1">
                                    For automatic lead import, add the webhook URL to your IndiaMART settings
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
                                    New leads from IndiaMART are automatically created in your selected pipeline
                                </p>
                            </li>
                            <li>
                                <span className="font-medium">Manual Lead Import</span>
                                <p className="text-muted-foreground mt-1">
                                    Use the date selector and "Pull Leads" button to manually import leads
                                </p>
                            </li>
                            <li>
                                <span className="font-medium">Lead Management</span>
                                <p className="text-muted-foreground mt-1">
                                    Imported leads appear in your CRM with all details from IndiaMART preserved
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Pro Tips</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-blue-700">
                        <li>Set up automations to assign leads to team members based on product categories</li>
                        <li>Create custom fields to track IndiaMART-specific information</li>
                        <li>Use tags to identify leads sourced from IndiaMART</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );

    // Permissions tab
    const permissionsContent = (
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-medium text-sm">Lead Information</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Contact details, inquiry messages, and product interests from IndiaMART
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="bg-green-100 p-1 rounded mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <path d="M12 2H2v10h10V2z"></path>
                                        <path d="M12 12H2v10h10V12z"></path>
                                        <path d="M22 2h-10v10h10V2z"></path>
                                        <path d="M22 12h-10v10h10V12z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-medium text-sm">Product Information</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Details about products that potential customers have inquired about
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
                                        We create leads in your CRM from IndiaMART inquiries
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="bg-blue-100 p-1 rounded mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-medium text-sm">Data Enrichment</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        We enhance lead records with additional data from the inquiry
                                    </p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6">
                            <h3 className="text-base font-medium mb-2">Security & Privacy</h3>
                            <p className="text-sm text-muted-foreground">
                                All data is transmitted securely and stored according to our privacy policy.
                                You can revoke access at any time by removing your API key.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // -------------------------
    // Define our tabs with icons
    // -------------------------
    const tabs: IntegrationTab[] = [
        {
            id: "overview",
            label: "Overview",
            content: overviewContent,
            icon: <Settings className="h-4 w-4" />,
        },
        {
            id: "how",
            label: "How It Works",
            content: howContent,
            icon: <HelpCircle className="h-4 w-4" />,
        },
        {
            id: "permissions",
            label: "Data & Permissions",
            content: permissionsContent,
            icon: <LockKeyhole className="h-4 w-4" />,
        },
    ];

    // -------------------------
    // Use the reusable layout
    // -------------------------
    return (
        <IntegrationAppLayout
            backHref="/settings/integrations"
            logoSrc="/integrations/indiamart.png"
            name="IndiaMART"
            vendor="Zapllo"
            description="Connect your IndiaMART account to automatically import leads and inquiries into your CRM"
            docsUrl="https://help.zapllo.com/indiamart-integration"
            status={isConnected ? "connected" : "not_connected"}
            tabs={tabs}
        />
    );
}