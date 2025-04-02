'use client'

import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Code, 
  PlusCircle, 
  Key, 
  ExternalLink, 
  Webhook, 
  Trash2, 
  Copy, 
  RefreshCw, 
  ShieldAlert, 
  AlertCircle, 
  RotateCw,
  Globe,
  ChevronRight,
  Info,
  Loader2,
  LinkIcon,
  Check
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Avatar } from '@/components/ui/avatar'
import { NotionLogoIcon } from '@radix-ui/react-icons'
import { FaGoogleDrive, FaInstagram, FaShopify, FaSlack, FaWhatsapp } from 'react-icons/fa'
import { IconBrandZapier } from '@tabler/icons-react'

// Define the webhook form schema
const webhookFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  events: z.array(z.string()).min(1, {
    message: "Select at least one event to trigger this webhook.",
  }),
  status: z.enum(["active", "inactive"]),
});

// Define the API key form schema
const apiKeyFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  permissions: z.array(z.string()).min(1, {
    message: "Select at least one permission.",
  }),
});

export default function ApiPage() {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [activeWebhook, setActiveWebhook] = useState<any>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Webhook form
  const webhookForm = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      url: "",
      events: [],
      status: "active",
    },
  });

  // API key form
  const apiKeyForm = useForm<z.infer<typeof apiKeyFormSchema>>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      permissions: ["read"],
    },
  });

  // Fetch webhooks and API keys on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch webhooks
        const webhooksResponse = await fetch('/api/webhooks');
        if (!webhooksResponse.ok) {
          throw new Error('Failed to fetch webhooks');
        }
        const webhooksData = await webhooksResponse.json();
        setWebhooks(webhooksData.webhooks || []);

        // Fetch API keys
        const apiKeysResponse = await fetch('/api/apikeys');
        if (!apiKeysResponse.ok) {
          throw new Error('Failed to fetch API keys');
        }
        const apiKeysData = await apiKeysResponse.json();
        setApiKeys(apiKeysData.apiKeys || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast({
          variant: "destructive",
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to load data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    if (activeWebhook) {
      webhookForm.reset({
        name: activeWebhook.name,
        url: activeWebhook.url,
        events: activeWebhook.events,
        status: activeWebhook.status,
      });
    }
  }, [activeWebhook, webhookForm]);

  const onWebhookSubmit = async (values: z.infer<typeof webhookFormSchema>) => {
    try {
      if (activeWebhook) {
        // Update existing webhook
        const response = await fetch(`/api/webhooks/${activeWebhook._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Failed to update webhook');
        }

        const data = await response.json();
        
        // Update the webhooks list
        setWebhooks(webhooks.map(webhook => 
          webhook._id === activeWebhook._id ? data.webhook : webhook
        ));

        toast({
          title: "Webhook updated",
          description: "Your webhook has been updated successfully",
        });
      } else {
        // Create new webhook
        const response = await fetch('/api/webhooks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Failed to create webhook');
        }

        const data = await response.json();
        
        // Add the new webhook to the list
        setWebhooks([...webhooks, data.webhook]);

        toast({
          title: "Webhook created",
          description: "Your new webhook has been created successfully",
        });
      }
      setWebhookDialogOpen(false);
      setActiveWebhook(null);
      webhookForm.reset();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  };

  const onApiKeySubmit = async (values: z.infer<typeof apiKeyFormSchema>) => {
    try {
      const response = await fetch('/api/apikeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      
      // Add the new API key to the list and show the key to the user
      setApiKeys([...apiKeys, data.apiKey]);
      setNewApiKey(data.plainTextKey);
      
      apiKeyForm.reset();
      
      toast({
        title: "API key created",
        description: "Your new API key has been created successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete webhook');
      }

      // Remove the webhook from the list
      setWebhooks(webhooks.filter(webhook => webhook._id !== id));
      
      toast({
        title: "Webhook deleted",
        description: "The webhook has been deleted successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/apikeys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      // Remove the API key from the list
      setApiKeys(apiKeys.filter(key => key._id !== id));
      
      toast({
        title: "API key revoked",
        description: "The API key has been revoked successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard",
    });
  };

  const testWebhook = async (id: string) => {
    setTestingWebhook(id);
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to test webhook');
      }

      const data = await response.json();
      
      toast({
        title: "Webhook tested",
        description: data.message || "Test payload sent successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to test webhook',
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const toggleWebhookStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const webhook = webhooks.find(wh => wh._id === id);
      if (!webhook) return;
      
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...webhook,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update webhook status');
      }

      // Update the webhook status in the list
      setWebhooks(webhooks.map(webhook => 
        webhook._id === id ? { ...webhook, status: newStatus } : webhook
      ));
      
      toast({
        title: `Webhook ${newStatus}`,
        description: `The webhook has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  };

  const formatLastTriggered = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const calculateSuccessRate = (webhook: any) => {
    const total = webhook.successCount + webhook.failureCount;
    if (total === 0) return 100; // No attempts yet, show 100%
    return Math.round((webhook.successCount / total) * 100);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading API configuration...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load data</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API & Integrations</h2>
        <p className="text-muted-foreground">
          Manage webhooks and API keys to integrate your CRM with other services.
        </p>
      </div>
      <IntegrationSection />
      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList className="grid w-full bg-accent gap-2 max-w-md grid-cols-2">
          <TabsTrigger value="webhooks" className="flex border-none items-center gap-2">
            <Webhook className="h-4 w-4" />
            <span>Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex border-none items-center gap-2">
            <Key className="h-4 w-4" />
            <span>API Keys</span>
          </TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Outgoing Webhooks</CardTitle>
                  <CardDescription>
                    Send data from your CRM to third-party services when events occur.
                  </CardDescription>
                </div>
                <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setActiveWebhook(null);
                        webhookForm.reset({
                          name: "",
                          url: "",
                          events: [],
                          status: "active",
                        });
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px] overflow-y-scroll h-full max-h-screen z-[100]">
                    <DialogHeader>
                      <DialogTitle>{activeWebhook ? "Edit" : "Create"} Webhook</DialogTitle>
                      <DialogDescription>
                        Configure how your CRM sends data to external services.
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...webhookForm}>
                      <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-6 py-2">
                        <FormField
                          control={webhookForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook Name</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Lead Notification Service" {...field} />
                              </FormControl>
                              <FormDescription>
                                A descriptive name to identify this webhook.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={webhookForm.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destination URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/webhook" {...field} />
                              </FormControl>
                              <FormDescription>
                                The URL where data will be sent when events are triggered.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={webhookForm.control}
                          name="events"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Trigger Events</FormLabel>
                                <FormDescription>
                                  Select which events should trigger this webhook.
                                </FormDescription>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { id: "lead.created", label: "Lead Created" },
                                  { id: "lead.updated", label: "Lead Updated" },
                                  { id: "contact.created", label: "Contact Created" },
                                  { id: "contact.updated", label: "Contact Updated" },
                                  { id: "company.created", label: "Company Created" },
                                  { id: "company.updated", label: "Company Updated" },
                                  { id: "deal.won", label: "Deal Won" },
                                  { id: "deal.lost", label: "Deal Lost" },
                                ].map((event) => (
                                  <FormField
                                    key={event.id}
                                    control={webhookForm.control}
                                    name="events"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={event.id}
                                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(event.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, event.id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== event.id
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {event.label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={webhookForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>Status</FormLabel>
                            <FormDescription>
                              Enable or disable this webhook
                            </FormDescription>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value === "active"}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked ? "active" : "inactive");
                                  }}
                                />
                              </FormControl>
                              <span>{field.value === "active" ? "Active" : "Inactive"}</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setWebhookDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {activeWebhook ? "Update" : "Create"} Webhook
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {webhooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Webhook className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No webhooks configured</h3>
                  <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                    Create your first webhook to send data from your CRM to third-party services when events occur.
                  </p>
                  <Button 
                    onClick={() => {
                      setActiveWebhook(null);
                      setWebhookDialogOpen(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Webhook
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {webhooks.map((webhook) => (
                    <div key={webhook._id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{webhook.name}</h3>
                            <Badge variant={webhook.status === "active" ? "default" : "outline"}>
                              {webhook.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center">
                            <Globe className="h-3 w-3 mr-1 inline-block" />
                            {webhook.url}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(webhook.url)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => testWebhook(webhook._id)}
                            disabled={testingWebhook === webhook._id || webhook.status === "inactive"}
                          >
                            {testingWebhook === webhook._id ? (
                              <>
                                <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Test
                              </>
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md z-[100]">
                              <DialogHeader>
                                <DialogTitle>Delete Webhook</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this webhook? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {}}>Cancel</Button>
                                <Button variant="destructive" onClick={() => deleteWebhook(webhook._id)}>Delete</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-muted-foreground">Events</h4>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event: string) => (
                              <Badge key={event} variant="secondary" className="font-normal">
                                {event.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-muted-foreground">Last Triggered</h4>
                          <p className="text-sm">{formatLastTriggered(webhook.lastTriggered)}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-muted-foreground">Success Rate</h4>
                          <div className="flex items-center">
                            <p className="text-sm font-medium mr-2">
                              {calculateSuccessRate(webhook)}%
                            </p>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  calculateSuccessRate(webhook) > 90 
                                    ? 'bg-green-500' 
                                    : calculateSuccessRate(webhook) > 70 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${calculateSuccessRate(webhook)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-6">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setActiveWebhook(webhook);
                            setWebhookDialogOpen(true);
                          }}
                        >
                          Edit Configuration
                        </Button>
                        <Button 
                          variant={webhook.status === "active" ? "outline" : "default"} 
                          size="sm"
                          onClick={() => toggleWebhookStatus(webhook._id, webhook.status)}
                        >
                          {webhook.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incoming Webhook Endpoints</CardTitle>
            <CardDescription>
              Receive data into your CRM from external services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Generic Webhook URL</h3>
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <code className="text-sm font-mono">
                    https://crm.zapllo.com/api/webhooks/incoming
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard("https://crm.zapllo.com/api/webhooks/incoming")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This is your generic webhook URL. Configure external services to send data to this endpoint.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Contact Webhook URL</h3>
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <code className="text-sm font-mono">
                    https://crm.zapllo.com/api/webhooks/contacts
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard("https://crm.zapllo.com/api/webhooks/contacts")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Use this endpoint to create or update contacts from external services.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Lead Webhook URL</h3>
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <code className="text-sm font-mono">
                    https://crm.zapllo.com/api/webhooks/leads
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard("https://crm.zapllo.com/api/webhooks/leads")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Use this endpoint to create or update leads from external services.
              </p>
            </div>
            
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium">Security Recommendations</h3>
              <div className="grid gap-2">
                <div className="flex">
                  <ShieldAlert className="h-5 w-5 mr-2 text-amber-500" />
                  <div className="text-sm">
                    <p className="font-medium">Always use HTTPS</p>
                    <p className="text-muted-foreground">Ensure secure data transmission</p>
                  </div>
                </div>
                <div className="flex">
                  <ShieldAlert className="h-5 w-5 mr-2 text-amber-500" />
                  <div className="text-sm">
                    <p className="font-medium">Verify webhook signatures</p>
                    <p className="text-muted-foreground">Validate incoming webhooks using the webhook secret</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-900 mt-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-sm text-blue-800 dark:text-blue-300">JSON Payload Format</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    When sending data to these endpoints, use the following format:
                  </p>
                  <div className="mt-2 bg-white dark:bg-black rounded-md p-3 overflow-x-auto">
                    <pre className="text-xs text-blue-900 dark:text-blue-300 font-mono">
{`{
"data": {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  // other fields...
},
"source": "website_form",  // optional source identifier
"timestamp": "2023-09-15T14:30:00Z"
}`}
                    </pre>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 px-0 h-6 text-blue-700 dark:text-blue-400"
                    onClick={() => window.open('/docs/webhook-format', '_blank')}
                  >
                    View Documentation
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* API Keys Tab */}
      <TabsContent value="api-keys" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage API keys for secure access to your CRM data.
                </CardDescription>
              </div>
              <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => apiKeyForm.reset()}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Generate API Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px] z-[100]">
                  <DialogHeader>
                    <DialogTitle>Generate New API Key</DialogTitle>
                    <DialogDescription>
                      Create a new API key to authorize access to your CRM data.
                    </DialogDescription>
                    </DialogHeader>
                    <Form {...apiKeyForm}>
                      <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-6 py-2">
                        <FormField
                          control={apiKeyForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key Name</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Mobile App Integration" {...field} />
                              </FormControl>
                              <FormDescription>
                                A descriptive name to identify this API key.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={apiKeyForm.control}
                          name="permissions"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Permissions</FormLabel>
                                <FormDescription>
                                  Select which permissions this API key should have.
                                </FormDescription>
                              </div>
                              
                              <div className="space-y-2">
                                <FormField
                                  control={apiKeyForm.control}
                                  name="permissions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes("read")}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, "read"])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== "read"
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="font-normal cursor-pointer">Read</FormLabel>
                                          <FormDescription>
                                            Can view data but cannot make changes
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    )
                                  }}
                                />
                                
                                <FormField
                                  control={apiKeyForm.control}
                                  name="permissions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes("write")}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, "write"])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== "write"
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="font-normal cursor-pointer">Write</FormLabel>
                                          <FormDescription>
                                            Can create, update and delete records
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    )
                                  }}
                                />
                                
                                <FormField
                                  control={apiKeyForm.control}
                                  name="permissions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes("admin")}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, "admin"])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== "admin"
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="font-normal cursor-pointer">Admin</FormLabel>
                                          <FormDescription>
                                            Full access to all resources including user management
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    )
                                  }}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setApiKeyDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            Generate API Key
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Show newly created API key */}
              {newApiKey && (
                <div className="mx-6 mb-6 mt-2 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-amber-800 dark:text-amber-400">New API Key Created</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        This is the only time you'll see this API key. Copy it now and store it securely.
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <code className="bg-white dark:bg-black p-2 rounded border text-sm flex-1 font-mono overflow-x-auto">
                          {newApiKey}
                        </code>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(newApiKey)}
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="pt-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setNewApiKey(null)}
                          className="text-amber-800 dark:text-amber-300 h-7"
                        >
                          I've copied my key
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[400px]">
                {apiKeys.length === 0 && !newApiKey ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Key className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No API keys yet</h3>
                    <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                      Generate an API key to allow secure access to your CRM data from external applications.
                    </p>
                    <Button 
                      onClick={() => setApiKeyDialogOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Generate Your First API Key
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey._id} className="p-6 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{apiKey.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <p>Created {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                              {apiKey.lastUsed && (
                                <>
                                  <span className="mx-2">•</span>
                                  <p>Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:border-red-800 dark:hover:bg-red-950 dark:hover:text-red-400">
                                  Revoke
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. Applications using this API key will no longer have access to your CRM data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteApiKey(apiKey._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Revoke Key
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center space-x-4">
                          <div className="flex items-center">
                            <div className={cn(
                              "w-2 h-2 rounded-full mr-2",
                              apiKey.isActive ? "bg-green-500" : "bg-red-500"
                            )}></div>
                            <span className="text-sm">
                              {apiKey.key.substring(0, 12)}•••••••••••••••••{apiKey.key.substring(apiKey.key.length - 4)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {apiKey.permissions.includes('read') && (
                              <Badge variant="outline" className="text-xs">Read</Badge>
                            )}
                            {apiKey.permissions.includes('write') && (
                              <Badge variant="outline" className="text-xs">Write</Badge>
                            )}
                            {apiKey.permissions.includes('admin') && (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">Admin</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Learn how to use our API endpoints to interact with your CRM data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border overflow-hidden">
                <div className="bg-muted px-4 py-2 font-mono font-medium text-sm border-b flex justify-between items-center">
                  <span>Example Request</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(`curl -X GET "https://crm.zapllo.com/api/contacts" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="p-4 bg-black text-white dark:bg-zinc-950 overflow-x-auto">
                  <pre className="text-sm font-mono">
{`curl -X GET "https://crm.zapllo.com/api/contacts" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Available Endpoints</h3>
                <Button variant="link" className="h-8 p-0">
                  View Full API Documentation
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>

              <div className="space-y-3">
                {[
                  { method: "GET", path: "/api/contacts", description: "List all contacts" },
                  { method: "POST", path: "/api/contacts", description: "Create a new contact" },
                  { method: "GET", path: "/api/leads", description: "List all leads" },
                  { method: "POST", path: "/api/leads", description: "Create a new lead" },
                  { method: "GET", path: "/api/companies", description: "List all companies" },
                  { method: "GET", path: "/api/webhooks", description: "List configured webhooks" },
                ].map((endpoint, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {}}
                  >
                    <Badge 
                      variant="outline" 
                      className={`mr-3 font-mono ${
                        endpoint.method === "GET" ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-900 dark:bg-green-950/30" :
                        endpoint.method === "POST" ? "text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:bg-blue-950/30" :
                        endpoint.method === "PUT" ? "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900 dark:bg-amber-950/30" :
                        "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-900 dark:bg-red-950/30"
                      }`}
                      >
                      {endpoint.method}
                    </Badge>
                    <code className="font-mono text-sm">{endpoint.path}</code>
                    <span className="text-sm text-muted-foreground ml-4">{endpoint.description}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-900">
                <div className="flex">
                  <LinkIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">Webhook Payloads</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Learn how to interpret webhook payloads for different events and implement proper signature verification.
                    </p>
                    <div className="flex space-x-4 mt-3">
                      <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50">
                        Webhook Guide
                      </Button>
                      <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50">
                        Event Reference
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 flex-col md:flex-row mt-6">
                <div className="flex-1 rounded-md border p-4">
                  <div className="flex items-center mb-3">
                    <Code className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-medium">SDKs & Libraries</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use our official client libraries to integrate with your CRM
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded border p-2 bg-muted/50">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">JavaScript</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded border p-2 bg-muted/50">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">PHP</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded border p-2 bg-muted/50">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Python</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 rounded-md border p-4">
                  <div className="flex items-center mb-3">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-medium">Resources</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Helpful resources for working with the API
                  </p>
                  <div className="space-y-2">
                    <Button variant="link" className="h-auto p-0 justify-start text-sm" onClick={() => window.open('#')}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      API Authentication Guide
                    </Button>
                    <Button variant="link" className="h-auto p-0 justify-start text-sm" onClick={() => window.open('#')}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Pagination & Filtering
                    </Button>
                    <Button variant="link" className="h-auto p-0 justify-start text-sm" onClick={() => window.open('#')}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Rate Limiting
                    </Button>
                    <Button variant="link" className="h-auto p-0 justify-start text-sm" onClick={() => window.open('#')}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Error Handling
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
const IntegrationSection = () => {
  const [isGeneratingZapierKey, setIsGeneratingZapierKey] = useState(false);
  const [isGeneratingPabblyKey, setIsGeneratingPabblyKey] = useState(false);
  const [zapierApiKey, setZapierApiKey] = useState<string | null>(null);
  const [pabblyApiKey, setPabblyApiKey] = useState<string | null>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const { toast } = useToast();

    // Fetch existing integration keys when component mounts
    useEffect(() => {
      const fetchIntegrationKeys = async () => {
        try {
          setLoadingIntegrations(true);
          
          // Check if Zapier integration exists
          const zapierResponse = await fetch('/api/integrations/zapier/key/check');
          if (zapierResponse.ok) {
            const data = await zapierResponse.json();
            if (data.connected) {
              setZapierApiKey('connected'); // We just need to know it exists, not the actual key
            }
          }
          
          // Check if Pabbly integration exists
          const pabblyResponse = await fetch('/api/integrations/pabbly/key/check');
          if (pabblyResponse.ok) {
            const data = await pabblyResponse.json();
            if (data.connected) {
              setPabblyApiKey('connected');
            }
          }
        } catch (error) {
          console.error('Error fetching integration status:', error);
        } finally {
          setLoadingIntegrations(false);
        }
      };
      
      fetchIntegrationKeys();
    }, []);
  
    const generateZapierApiKey = async () => {
      try {
        setIsGeneratingZapierKey(true);
        const response = await fetch('/api/integrations/zapier/key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to generate Zapier API key');
        }
  
        const data = await response.json();
        setZapierApiKey(data.apiKey);
        
        toast({
          title: "API key generated",
          description: "Your Zapier integration API key has been created successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
        });
      } finally {
        setIsGeneratingZapierKey(false);
      }
    };
    const generatePabblyApiKey = async () => {
      try {
        setIsGeneratingPabblyKey(true);
        const response = await fetch('/api/integrations/pabbly/key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to generate Pabbly API key');
        }
  
        const data = await response.json();
        setPabblyApiKey(data.apiKey);
        
        toast({
          title: "API key generated",
          description: "Your Pabbly integration API key has been created successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
        });
      } finally {
        setIsGeneratingPabblyKey(false);
      }
    };
  
    if (loadingIntegrations) {
      return (
        <Card className="mt-6">
          <CardContent className="py-6">
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            Connect with Third-Party Apps
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              <div className="flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Pro Feature
              </div>
            </Badge>
          </CardTitle>
          <CardDescription>
            Integrate your CRM with other applications to automate your workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zapier Integration */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg border border-violet-200 dark:border-violet-800 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-md bg-white object-cover shadow-sm mr-4 flex items-center justify-center">
                  <img src='/brands/zapier.png' className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Connect with Zapier</h3>
                  <p className="text-muted-foreground mt-1">
                    Integrate with 10,000+ apps including Notion, Slack, Gmail, and more
                  </p>
                  
                  <div className="flex gap-2 mt-4">
                    <Avatar className="h-8 w-8">
                      <NotionLogoIcon className="h-5 w-5" />
                    </Avatar>
                    <Avatar className="h-8 w-8">
                      <FaSlack className="h-5 w-5" />
                    </Avatar>
                    <Avatar className="h-8 w-8">
                      <FaGoogleDrive className="h-5 w-5 text-blue-600" />
                    </Avatar>
                    <Avatar className="h-8 w-8">
                      <FaShopify className="h-5 w-5 text-red-600" />
                    </Avatar>
                    <Avatar className="h-8 w-8">
                      <FaWhatsapp className="h-5 w-5 text-green-600" />
                    </Avatar>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      +10,000
                    </div>
                  </div>
                </div>
  
                {zapierApiKey ? (
                  <div className="ml-4 flex flex-col items-end">
                    <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">
                      <div className="flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </div>
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-violet-600 border-violet-200"
                      onClick={() => window.open('https://zapier.com/apps', '_blank')}
                    >
                      Open Zapier
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="ml-4 bg-violet-600 hover:bg-violet-700 text-white" 
                    onClick={generateZapierApiKey}
                    disabled={isGeneratingZapierKey}
                  >
                    {isGeneratingZapierKey ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>Connect</>
                    )}
                  </Button>
                )}
              </div>
  
              {zapierApiKey === 'connected' && zapierApiKey && (
                <div className="mt-4 bg-violet-100/50 dark:bg-violet-900/20 p-4 rounded-md border border-violet-200 dark:border-violet-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-sm">Your Zapier API Key</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use this API key to connect Zapier with your CRM
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white dark:bg-black py-1.5 px-3 rounded border text-xs font-mono">
                        {zapierApiKey.substring(0, 10)}•••••••••{zapierApiKey.substring(zapierApiKey.length - 5)}
                      </code>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          navigator.clipboard.writeText(zapierApiKey);
                          toast({
                            title: "API key copied",
                            description: "Your Zapier API key has been copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setZapierApiKey(null);
                          toast({
                            title: "API key reset",
                            description: "Your Zapier API key has been reset",
                          });
                        }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
  
                  <Separator className="my-4" />
  
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <div className="p-3 bg-white dark:bg-black rounded border">
                      <div className="flex items-start">
                        <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-violet-700 dark:text-violet-300 text-xs font-bold">1</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">Create a Zap</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sign in to Zapier and start creating a new Zap
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-black rounded border">
                      <div className="flex items-start">
                        <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-violet-700 dark:text-violet-300 text-xs font-bold">2</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">Add Zapllo CRM</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Search for "Zapllo CRM" in the app selection
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-black rounded border">
                      <div className="flex items-start">
                        <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-violet-700 dark:text-violet-300 text-xs font-bold">3</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">Use your API key</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            Connect using the API key shown above
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Example integrations you can build</h4>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      <div className="flex items-center p-2 rounded border bg-white/50 dark:bg-black/20">
                        <NotionLogoIcon className="h-5 w-5 mr-2" />
                        <span className="text-xs">Import contacts from Notion</span>
                      </div>
                      <div className="flex items-center p-2 rounded border bg-white/50 dark:bg-black/20">
                        <FaSlack className="h-5 w-5 mr-2" />
                        <span className="text-xs">Get lead notifications in Slack</span>
                      </div>
                      <div className="flex items-center p-2 rounded border bg-white/50 dark:bg-black/20">
                        <FaShopify className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-xs">Create leads from Shopify</span>
                      </div>
                      <div className="flex items-center p-2 rounded border bg-white/50 dark:bg-black/20">
                        <FaWhatsapp className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-xs">Get lead notifications on WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
{/* Pabbly Integration */}
<div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-md bg-white object-cover  shadow-sm mr-4 flex items-center justify-center">
                  <img 
                    src="/brands/pabbly.svg" 
                    alt="Pabbly" 
                    className="h-8 w-8" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Integrate with Pabbly Connect</h3>
                  <p className="text-muted-foreground mt-1">
                    Build workflows with Pabbly's simple and powerful automation platform
                  </p>
                  
                  <div className="flex gap-2 mt-4">
                    <Avatar className="h-8 w-8">
                    <NotionLogoIcon className="h-5 w-5 mr-2" />
                    </Avatar>
                    <Avatar className="h-8 w-8">
                    <FaSlack className="h-5 w-5 mr-2" />

                    </Avatar>
                    <Avatar className="h-8 w-8">
                    <FaShopify className="h-4 w-4 mr-2 text-blue-600" />
                    </Avatar>
                    <Avatar className="h-8 w-8">
                    <FaWhatsapp className="h-4 w-4 mr-2 text-green-600" />
                    </Avatar>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      +500
                    </div>
                  </div>
                </div>
  
                {pabblyApiKey ? (
                  <div className="ml-4 flex flex-col items-end">
                    <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">
                      <div className="flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </div>
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-emerald-600 border-emerald-200"
                      onClick={() => window.open('https://connect.pabbly.com/workflow/', '_blank')}
                    >
                      Open Pabbly
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={generatePabblyApiKey}
                    disabled={isGeneratingPabblyKey}
                  >
                    {isGeneratingPabblyKey ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>Connect</>
                    )}
                  </Button>
                )}
              </div>
  
              {pabblyApiKey && pabblyApiKey !== 'connected' && (
                <div className="mt-4 bg-emerald-100/50 dark:bg-emerald-900/20 p-4 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-sm">Your Pabbly API Key</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use this API key to connect Pabbly with your CRM
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white dark:bg-black py-1.5 px-3 rounded border text-xs font-mono">
                        {pabblyApiKey.substring(0, 10)}•••••••••{pabblyApiKey.substring(pabblyApiKey.length - 5)}
                      </code>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          navigator.clipboard.writeText(pabblyApiKey);
                          toast({
                            title: "API key copied",
                            description: "Your Pabbly API key has been copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setPabblyApiKey(null);
                              toast({
                                title: "API key reset",
                                description: "Your Pabbly API key has been reset",
                              });
                            }}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
  
                      <Separator className="my-4" />
  
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div className="p-3 bg-white dark:bg-black rounded border">
                          <div className="flex items-start">
                            <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold">1</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">Create a workflow</h5>
                              <p className="text-xs text-muted-foreground mt-1">
                                Sign in to Pabbly and start creating a new workflow
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-black rounded border">
                          <div className="flex items-start">
                            <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold">2</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">Add Zapllo CRM</h5>
                              <p className="text-xs text-muted-foreground mt-1">
                                Search for "Zapllo CRM" in the app selection
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-black rounded border">
                          <div className="flex items-start">
                            <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold">3</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">Use your API key</h5>
                              <p className="text-xs text-muted-foreground mt-1">
                                Connect using the API key shown above
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
  
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-sm mb-2">Example workflows you can build</h4>
                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                          <div className="flex items-center p-2 rounded border bg-white/50 dark:bg-black/20">
                            <img src="/integrations/gmail.png" alt="Gmail" className="h-4 w-4 mr-2" />
                            <span className="text-xs">Send email notifications for new leads</span>
                          </div>
                          <div className="flex items-center p-2 rounded border bg-white/50 dark:bg-black/20">
                            <img src="/brands/sheets.png" alt="Sheets" className="h-4 w-4 mr-2" />
                            <span className="text-xs">Sync contacts to Google Sheets</span>
                          </div>
                          <div className="flex items-center p-2 rounded border bg-white/50 dark:bg-black/20">
                            <FaInstagram className='h-4 w-4 mr-2' />
                            <span className="text-xs">Track Instagram leads in your CRM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {pabblyApiKey === 'connected' && (
                    <div className="mt-4 bg-emerald-100/50 dark:bg-emerald-900/20 p-4 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <p className="text-sm">
                        Your Pabbly Connect integration is ready. Build powerful automation workflows with Zapllo CRM.
                      </p>
                      <Button 
                        variant="link" 
                        className="h-8 p-0 mt-2 text-emerald-700"
                        onClick={() => window.open('https://connect.pabbly.com/workflow/', '_blank')}
                      >
                        Create workflows with Zapllo CRM
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
  
          {/* Text explaining other ways to integrate */}
          <div className="px-4 py-3 bg-muted rounded-md border text-center">
            <p className="text-sm text-muted-foreground">
              Need a custom integration? Use the API keys and webhooks below to build your own integrations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
