"use client";

import { useState } from "react";
import axios from "axios";
import { Bot, Loader2, Sparkles, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AICreditsInfo {
    aiCredits: number;
    organizationName: string;
}

interface AIPipelineModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const INDUSTRY_OPTIONS = [
    "Retail/E-Commerce",
    "Technology",
    "Service Provider",
    "Healthcare",
    "Logistics",
    "Financial Services",
    "Trading",
    "Education",
    "Manufacturing",
    "Real Estate",
    "Other"
];

const BUSINESS_TYPE_OPTIONS = [
    "B2B Sales",
    "B2C Sales",
    "SaaS/Software",
    "Consulting",
    "E-commerce",
    "Real Estate",
    "Insurance",
    "Healthcare Services",
    "Financial Services",
    "Manufacturing",
    "Other"
];

export default function AIPipelineModal({ onClose, onSuccess }: AIPipelineModalProps) {
    const [prompt, setPrompt] = useState("");
    const [industry, setIndustry] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiCredits, setAiCredits] = useState<AICreditsInfo | null>(null);
    const { toast } = useToast();


    const fetchAICredits = async () => {
        try {
            const response = await axios.get("/api/organization/ai-credits");
            setAiCredits(response.data);
        } catch (error) {
            console.error("Failed to fetch AI credits:", error);
        }
    };

    // Fetch AI credits on component mount
    useState(() => {
        fetchAICredits();
    });
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({
                title: "Prompt required",
                description: "Please describe what kind of pipeline you want to create",
                variant: "destructive",
            });
            return;
        }

        if (aiCredits && aiCredits.aiCredits < 5) {
            toast({
                title: "Insufficient AI Credits",
                description: "You need at least 5 AI credits to generate a pipeline",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsGenerating(true);

            const response = await axios.post("/api/pipelines/generate-ai", {
                prompt: prompt.trim(),
                industry,
                businessType,
            });

            toast({
                title: "Pipeline generated successfully!",
                description: `Used ${response.data.creditsUsed} AI credits. ${response.data.remainingCredits} credits remaining.`,
            });

            onSuccess();
            onClose();

        } catch (error: any) {
            console.error("Failed to generate pipeline:", error);

            if (error.response?.status === 402) {
                toast({
                    title: "Insufficient AI Credits",
                    description: `You need ${error.response.data.required} credits but only have ${error.response.data.available}`,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Generation failed",
                    description: error.response?.data?.error || "Failed to generate pipeline with AI",
                    variant: "destructive",
                });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 h-fit w-full max-h-screen overflow-y-scroll flex scrollbar-hide">
            <div>
                {/* AI Credits Display */}
                {aiCredits && (
                    <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 p-0 dark:to-purple-950/30">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">AI Credits</CardTitle>
                                </div>
                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                    {aiCredits.aiCredits} credits
                                </Badge>
                            </div>
                            <CardDescription>
                                Each AI pipeline generation costs 5 credits
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {/* Credit Warning */}
                {aiCredits && aiCredits.aiCredits < 5 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            You don't have enough AI credits to generate a pipeline. You need 5 credits but only have {aiCredits.aiCredits}.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form Fields */}
                <div className="space-y-4 p-0">
                    <div className="space-y-2">
                        <Label htmlFor="prompt">Describe Your Sales Process *</Label>
                        <Textarea
                            id="prompt"
                            placeholder="E.g., 'Create a pipeline for a B2B SaaS company that sells project management software to mid-size businesses. Include stages for lead qualification, demo scheduling, proposal review, and contract signing.'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Be specific about your industry, target customers, and sales process for better results
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry (Optional)</Label>
                            <Select value={industry} onValueChange={setIndustry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent className="z-[100]">
                                    {INDUSTRY_OPTIONS.map((option) => (
                                        <SelectItem className='z-[100]' key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="businessType">Business Type (Optional)</Label>
                            <Select value={businessType} onValueChange={setBusinessType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select business type" />
                                </SelectTrigger>
                                <SelectContent className="z-[100]">
                                    {BUSINESS_TYPE_OPTIONS.map((option) => (
                                        <SelectItem className="z-[100]" key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* AI Generation Preview */}
                <Card className="border-dashed mt-2">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-3">
                            <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <Bot className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-medium">AI Pipeline Generation</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our AI will create a customized sales pipeline with stages, fields, and best practices
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim() || (aiCredits && aiCredits.aiCredits < 5)}
                        className="min-w-[140px]"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Pipeline
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}