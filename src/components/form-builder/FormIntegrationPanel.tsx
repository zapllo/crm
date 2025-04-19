"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Mail, Phone, Code, Check, Download, ExternalLink, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

interface FormIntegrationPanelProps {
  formId: string;
  formName?: string;
}

export default function FormIntegrationPanel({ formId, formName = "Form" }: FormIntegrationPanelProps) {
  const formUrl = `${window.location.origin}/live-form/${formId}`;
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;
  const { toast } = useToast();
  const [activeCopyButton, setActiveCopyButton] = useState<string | null>(null);
  const router = useRouter();

  // Dialog state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [emailData, setEmailData] = useState({
    to: '',
    subject: `Form shared with you: ${formName}`,
    recipientName: '',
    message: '',
  });

  const [whatsAppData, setWhatsAppData] = useState({
    phoneNumber: '',
    recipientName: '',
    message: '',
  });

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWhatsAppData(prev => ({ ...prev, [name]: value }));
  };

  const sendEmailShare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forms/share/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          formName,
          to: emailData.to,
          subject: emailData.subject,
          recipientName: emailData.recipientName,
          message: emailData.message,
          formUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast({
        title: 'Email sent successfully',
        description: `Form shared with ${emailData.to}`,
      });

      setIsEmailDialogOpen(false);
      // Reset form
      setEmailData({
        to: '',
        subject: `Form shared with you: ${formName}`,
        recipientName: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Failed to send email',
        description: 'Please try again later or use a different sharing method.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendWhatsAppShare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forms/share/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          formName,
          phoneNumber: whatsAppData.phoneNumber,
          recipientName: whatsAppData.recipientName,
          message: whatsAppData.message,
          formUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      toast({
        title: 'WhatsApp message sent',
        description: `Form shared via WhatsApp`,
      });

      setIsWhatsAppDialogOpen(false);
      // Reset form
      setWhatsAppData({
        phoneNumber: '',
        recipientName: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: 'Failed to send WhatsApp message',
        description: 'Please try again later or use a different sharing method.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl">Share Your Form</CardTitle>
          <CardDescription>Choose how you want to share this form with others</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-3">
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid gap-2 bg-accent grid-cols-3 mb-6">
              <TabsTrigger value="link" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none">
                <Globe className="h-4 w-4 mr-2" />
                Direct Link
              </TabsTrigger>
              <TabsTrigger value="embed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none">
                <Code className="h-4 w-4 mr-2" />
                Embed
              </TabsTrigger>
              <TabsTrigger value="qr" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => setIsEmailDialogOpen(true)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => setIsWhatsAppDialogOpen(true)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => window.open(formUrl, '_blank')}
                  >
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
            </TabsContent>

            <TabsContent value="qr" className="pt-2">
              <div className="flex flex-col items-center space-y-6">
                <div className="border rounded-md p-6 bg-white w-48 h-48 flex items-center justify-center">
                  <QRCode value={formUrl} size={150} />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Scan this QR code with a mobile device to open the form.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Email Sharing Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="z-[100]">
          <DialogHeader>
            <DialogTitle>Share Form via Email</DialogTitle>
            <DialogDescription>
              Send a form link to someone via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className=" items-center gap-4">
              <Label htmlFor="recipientEmail" className="text-right">
                To
              </Label>
              <Input
                id="recipientEmail"
                name="to"
                type="email"
                value={emailData.to}
                onChange={handleEmailChange}
                placeholder="recipient@example.com"
                className="col-span-3"
                required
              />
            </div>
            <div className=" items-center gap-4">
              <Label htmlFor="recipientName" className="text-right">
                Name
              </Label>
              <Input
                id="recipientName"
                name="recipientName"
                type="text"
                value={emailData.recipientName}
                onChange={handleEmailChange}
                placeholder="Recipient's name"
                className="col-span-3"
              />
            </div>
            <div className=" items-center gap-4">
              <Label htmlFor="emailSubject" className="text-right">
                Subject
              </Label>
              <Input
                id="emailSubject"
                name="subject"
                type="text"
                value={emailData.subject}
                onChange={handleEmailChange}
                className="col-span-3"
              />
            </div>
            <div className=" items-center gap-4">
              <Label htmlFor="emailMessage" className="text-right">
                Message
              </Label>
              <Textarea
                id="emailMessage"
                name="message"
                value={emailData.message}
                onChange={handleEmailChange}
                placeholder="Optional message"
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={sendEmailShare}
              disabled={!emailData.to || isLoading}
            >
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Sharing Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent className="z-[100]">
          <DialogHeader>
            <DialogTitle>Share Form via WhatsApp</DialogTitle>
            <DialogDescription>
              Send a form link to someone via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className=" g w-full items-center gap-4">
              <Label htmlFor="whatsappNumber" className="text-right">
                Number
              </Label>
              <Input
                id="whatsappNumber"
                name="phoneNumber"
                type="tel"
                value={whatsAppData.phoneNumber}
                onChange={handleWhatsAppChange}
                placeholder="e.g. 9876543210"
                className="col-span-3 w-full"
                required
              />
            </div>
            <div className=" w-full items-center gap-4">
              <Label htmlFor="whatsappRecipientName" className="text-right">
                Name
              </Label>
              <Input
                id="whatsappRecipientName"
                name="recipientName"
                type="text"
                value={whatsAppData.recipientName}
                onChange={handleWhatsAppChange}
                placeholder="Recipient's name"
                className="col-span-3"
              />
            </div>
            <div className=" items-center gap-4">
              <Label htmlFor="whatsappMessage" className="text-right">
                Message
              </Label>
              <Textarea
                id="whatsappMessage"
                name="message"
                value={whatsAppData.message}
                onChange={handleWhatsAppChange}
                placeholder="Optional message"
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsWhatsAppDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={sendWhatsAppShare}
              disabled={!whatsAppData.phoneNumber || isLoading}
            >
              {isLoading ? "Sending..." : "Send WhatsApp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
