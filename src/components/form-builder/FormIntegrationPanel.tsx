"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Mail, Phone, ArrowRight, Code } from 'lucide-react';

interface FormIntegrationPanelProps {
  formId: string;
}

export default function FormIntegrationPanel({ formId }: FormIntegrationPanelProps) {
  const formUrl = `${window.location.origin}/forms/${formId}`;
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="link">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="link">Direct Link</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={formUrl}
                readOnly
                className="w-full p-2 pr-24 border rounded-md bg-muted"
              />
              <Button
                className="absolute right-1 top-1"
                size="sm"
                onClick={() => copyToClipboard(formUrl)}
              >
                Copy
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Globe className="h-4 w-4 mr-2" />
                More
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <div className="relative">
              <textarea
                value={embedCode}
                readOnly
                rows={4}
                className="w-full p-2 pr-24 border rounded-md bg-muted font-mono text-sm resize-none"
              />
              <Button
                className="absolute right-1 top-1"
                size="sm"
                onClick={() => copyToClipboard(embedCode)}
              >
                Copy
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="border rounded-md h-40 flex items-center justify-center bg-card">
                <div className="text-center text-muted-foreground">
                  <Code className="h-8 w-8 mb-2 mx-auto" />
                  <p>Form embed preview</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="border rounded-md p-4 bg-white">
                {/* We would use a QR code library in real implementation */}
                <div className="w-32 h-32 bg-muted flex items-center justify-center">
                  QR Code for form
                </div>
              </div>
              <Button size="sm">
                Download QR Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
