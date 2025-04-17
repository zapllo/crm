"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Mail, Phone, Code, Check, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import QRCode from 'react-qr-code';

interface FormIntegrationPanelProps {
  formId: string;
}

export default function FormIntegrationPanel({ formId }: FormIntegrationPanelProps) {
  const formUrl = `${window.location.origin}/forms/${formId}`;
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;
  const { toast } = useToast();
  const [activeCopyButton, setActiveCopyButton] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setActiveCopyButton(type);

    toast({
      title: "Copied to clipboard",
      description: "You can now paste it anywhere you need",
    });

    setTimeout(() => {
      setActiveCopyButton(null);
    }, 2000);
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">Share Your Form</CardTitle>
        <CardDescription>Choose how you want to share this form with others</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pt-3">
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="link" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe className="h-4 w-4 mr-2" />
              Direct Link
            </TabsTrigger>
            <TabsTrigger value="embed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Code className="h-4 w-4 mr-2" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="qr" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <QrCodeIcon className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-6 pt-2">
            <div className="relative">
              <Input
                type="text"
                value={formUrl}
                readOnly
                className="pr-24 bg-muted/50 font-mono text-sm"
              />
              <Button
                className="absolute right-1 top-1"
                size="sm"
                onClick={() => copyToClipboard(formUrl, 'link')}

              >
                {activeCopyButton === 'link' ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Copied
                  </>
                ) : (
                  "Copy Link"
                )}
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Share via</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 h-9">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9">
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-6 pt-2">
            <div>
              <h3 className="text-sm font-medium mb-2">Website Embed Code</h3>
              <div className="relative">
                <Textarea
                  value={embedCode}
                  readOnly
                  rows={3}
                  className="font-mono text-sm resize-none bg-muted/50 pr-24"
                />
                <Button
                  className="absolute right-1 top-1"
                  size="sm"
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                
                >
                  {activeCopyButton === 'embed' ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Copied
                    </>
                  ) : (
                    "Copy Code"
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-md border">
              <h3 className="text-sm font-medium mb-3">Preview</h3>
              <div className="border rounded-md h-40 flex items-center justify-center bg-card">
                <div className="text-center text-muted-foreground">
                  <Code className="h-8 w-8 mb-2 mx-auto" />
                  <p className="text-sm">Form embed preview</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="pt-2">
            <div className="flex flex-col items-center space-y-6">
              <div className="border rounded-md p-6 bg-white w-48 h-48 flex items-center justify-center">
                <QRCode value={formUrl} size={150} />
              </div>
              <Button size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Scan this QR code with a mobile device to open the form.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function QrCodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}
