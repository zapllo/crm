"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Bot, Loader2, Sparkles, Zap, AlertCircle, Wand2 } from "lucide-react";
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

interface AIEmailTemplateModalProps {
  onTemplateGenerated: (template: {
    name: string;
    subject: string;
    body: string;
  }) => void;
  onClose: () => void;
}

const TEMPLATE_TYPES = [
  "Welcome Email",
  "Follow-up Email", 
  "Newsletter",
  "Sales Pitch",
  "Thank You Email",
  "Appointment Reminder",
  "Product Announcement",
  "Feedback Request",
  "Promotional Email",
  "Event Invitation"
];

const TONE_OPTIONS = [
  "Professional and formal",
  "Professional and friendly",
  "Casual and friendly",
  "Enthusiastic and energetic",
  "Warm and personal",
  "Direct and concise"
];

const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "E-commerce",
  "Consulting",
  "Manufacturing",
  "Marketing",
  "Other"
];

export default function AIEmailTemplateModal({ 
  onTemplateGenerated, 
  onClose 
}: AIEmailTemplateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiCredits, setAiCredits] = useState<AICreditsInfo | null>(null);
  const { toast } = useToast();

  // Fetch AI credits on component mount
  useEffect(() => {
    fetchAICredits();
  }, []);

  const fetchAICredits = async () => {
    try {
      const response = await axios.get("/api/organization/ai-credits");
      setAiCredits(response.data);
    } catch (error) {
      console.error("Failed to fetch AI credits:", error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what kind of email template you want to create",
        variant: "destructive",
      });
      return;
    }

    if (aiCredits && aiCredits.aiCredits < 5) {
      toast({
        title: "Insufficient AI Credits",
        description: "You need at least 5 AI credits to generate an email template",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const response = await axios.post("/api/channels/templates/generate-ai", {
        prompt: prompt.trim(),
        templateType,
        industry,
        tone,
        purpose,
      });

      const { template, creditsUsed, remainingCredits } = response.data;

      toast({
        title: "Email template generated successfully!",
        description: `Used ${creditsUsed} AI credits. ${remainingCredits} credits remaining.`,
      });

      // Pass the generated template to the parent
      onTemplateGenerated(template);
      onClose();

    } catch (error: any) {
      console.error("Failed to generate email template:", error);
      
      if (error.response?.status === 402) {
        toast({
          title: "Insufficient AI Credits",
          description: `You need ${error.response.data.required} credits but only have ${error.response.data.available}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation failed",
          description: error.response?.data?.error || "Failed to generate email template with AI",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Credits Display */}
      {aiCredits && (
        <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
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
              Each AI email template generation costs 2 credits
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Credit Warning */}
      {aiCredits && aiCredits.aiCredits < 2 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have enough AI credits to generate an email template. You need 2 credits but only have {aiCredits.aiCredits}.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe Your Email Template *</Label>
          <Textarea
            id="prompt"
            placeholder="E.g., 'Create a welcome email for new subscribers to our software service. Include a personal greeting, explain our key features, and provide next steps for getting started.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Be specific about the purpose, target audience, and key message for better results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="templateType">Template Type</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {TEMPLATE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Writing Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {TONE_OPTIONS.map((toneOption) => (
                  <SelectItem key={toneOption} value={toneOption}>
                    {toneOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {INDUSTRY_OPTIONS.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Email Purpose</Label>
            <Input
              id="purpose"
              placeholder="e.g., Convert leads to customers"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* AI Generation Preview */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium">AI Email Template Generation</h3>
              <p className="text-sm text-muted-foreground">
                Our AI will create a professional email template with proper HTML formatting and placeholders
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
          disabled={isGenerating || !prompt.trim() || (aiCredits && aiCredits.aiCredits < 3)}
          className="min-w-[140px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
}