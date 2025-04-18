"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Bell, Mail, MessageSquare, AlertCircle, CheckCircle2, Settings2 } from 'lucide-react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationSettings {
  newLeadEmail: boolean;
  newLeadWhatsapp: boolean;
  dailyReportTime: string;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    newLeadEmail: true,
    newLeadWhatsapp: false,
    dailyReportTime: '09:00'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch notification settings
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) throw new Error('Failed to fetch settings');

        const data = await res.json();
        if (data.notifications) {
          setSettings({
            newLeadEmail: data.notifications.newLeadEmail ?? true,
            newLeadWhatsapp: data.notifications.newLeadWhatsapp ?? false,
            dailyReportTime: data.notifications.dailyReportTime ?? '09:00'
          });
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notification settings"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
        action: <CheckCircle2 className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save notification settings"
      });
    } finally {
      setSaving(false);
    }
  };

  // Convert 24 hour time to 12 hour time with AM/PM for display
  const formatTimeForDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Time options for select dropdown
  const timeOptions = Array.from({ length: 24 }, (_, hour) => {
    return [`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`];
  }).flat();

  if (loading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse"></div>
          <Bell className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary animate-bounce" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">Loading your preferences...</h3>
      </div>
    );
  }

  return (
    <div className=" mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
          <p className="text-muted-foreground mt-1">Manage how and when you receive updates and alerts</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-primary/10">
          <Settings2 className="h-3.5 w-3.5 mr-1.5" />
          Preferences
        </Badge>
      </div>

      <Tabs defaultValue="channels" className="mb-8">
        <TabsList className="grid w-full bg-accent grid-cols-2 mb-8">
          <TabsTrigger value="channels" className="text-sm border-none">
            <Bell className="h-4 w-4 mr-2" />
            Notification Channels
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-sm border-none">
            <Clock className="h-4 w-4 mr-2" />
            Reporting Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
              <CardTitle className="flex items-center text-xl">
                <Bell className="h-5 w-5 mr-2 text-primary" />
                Lead Notifications
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified when new leads are created
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Email Notification */}
                <div className="flex items-start space-x-4 p-4 rounded-lg transition-colors hover:bg-accent/50">
                  <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={settings.newLeadEmail}
                        onCheckedChange={(checked) => setSettings({ ...settings, newLeadEmail: checked })}
                        className=""
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts when new leads are added to your pipeline
                    </p>
                  </div>
                </div>

                <Separator />

                {/* WhatsApp Notification */}
                <div className="flex items-start space-x-4 p-4 rounded-lg transition-colors hover:bg-accent/50">
                  <div className="mt-0.5 bg-green-500/10 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="whatsapp-notifications" className="text-base font-medium">WhatsApp Notifications</Label>
                      <Switch
                        id="whatsapp-notifications"
                        checked={settings.newLeadWhatsapp}
                        onCheckedChange={(checked) => setSettings({ ...settings, newLeadWhatsapp: checked })}
                        className=""
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get instant WhatsApp messages for new lead alerts
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 pb-4">
              <CardTitle className="flex items-center text-xl">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Daily Reports
              </CardTitle>
              <CardDescription>
                Configure when you want to receive your daily activity summary
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-accent/30 p-5 rounded-lg">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="report-time" className="text-base font-medium">Report Delivery Time</Label>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        {formatTimeForDisplay(settings.dailyReportTime)}
                      </Badge>
                    </div>

                    <Select
                      value={settings.dailyReportTime}
                      onValueChange={(value) => setSettings({ ...settings, dailyReportTime: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {formatTimeForDisplay(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <p className="text-sm text-muted-foreground">
                      A comprehensive summary of all activities and new leads will be sent at this time every day
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <p>Make sure your email address is correct in your profile settings to receive reports.</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "px-8 py-6 relative overflow-hidden transition-all",
            saveSuccess ? "bg-green-600 hover:bg-green-700" : ""
          )}
          size="lg"
        >
          {saving ? (
            <>
              <span className="animate-pulse">Saving changes...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved Successfully
            </>
          ) : (
            "Save Preferences"
          )}

          {saving && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
