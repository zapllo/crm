"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2, Plus, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import TemplateRenderer from "./TemplateRenderer";
import { Progress } from "@/components/ui/progress";

// Types
interface Lead {
  _id: string;
  title: string;
  leadId: string;
  contact: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    whatsappNumber: string;
  };
}

interface QuotationItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

interface QuotationTerm {
  title: string;
  content: string;
}

interface QuotationTemplate {
  _id: string;
  name: string;
  description: string;
  previewImage: string;
  isDefault?: boolean;
}

const defaultItem: QuotationItem = {
  name: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  tax: 0,
  total: 0,
};

const defaultTerm: QuotationTerm = {
  title: "",
  content: "",
};

interface OrganizationSettings {
  defaultCurrency: string;
  defaultQuotationExpiry: number;
  template?: string;
}


const CreateQuotationForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [completedTabs, setCompletedTabs] = useState<Record<string, boolean>>({
    details: false,
    items: false,
    terms: false
  });

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [leadPopoverOpen, setLeadPopoverOpen] = useState(false);

  const [settings, setSettings] = useState<OrganizationSettings>({
    defaultCurrency: 'USD',
    defaultQuotationExpiry: 30,
  });


  // Form state
  const [quotationData, setQuotationData] = useState({
    quotationNumber: "",
    title: "",
    leadId: "",
    contactId: "",
    items: [{ ...defaultItem }],
    subtotal: 0,
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    discountAmount: 0,
    taxName: "GST",
    taxPercentage: 0,
    taxAmount: 0,
    shipping: 0,
    total: 0,
    currency: "USD",
    issueDate: new Date(),
    validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    terms: [{ ...defaultTerm }],
    notes: "",
    template: "default",
    status: "draft" as "draft" | "sent",
  });

  // Selected lead state for display
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch organization settings
  const fetchOrganizationSettings = async () => {
    try {
      const { data } = await axios.get("/api/organization/settings");
      setSettings(data);

      // Update form with default values from settings
      setQuotationData(prev => ({
        ...prev,
        currency: data.defaultCurrency || 'USD',
        template: data.template || 'default',
        validUntil: new Date(new Date().setDate(new Date().getDate() + (data.defaultQuotationExpiry || 30)))
      }));
    } catch (error) {
      console.error("Error fetching organization settings:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchLeads();
    fetchTemplates();
    fetchOrganizationSettings();
  }, []);



  // Recalculate totals whenever items, discounts, taxes, or shipping changes
  useEffect(() => {
    calculateTotals();
  }, [
    quotationData.items,
    quotationData.discountType,
    quotationData.discountValue,
    quotationData.taxPercentage,
    quotationData.shipping
  ]);

  // Track completion status of each tab
  useEffect(() => {
    updateTabCompletionStatus();
  }, [quotationData]);

  const updateTabCompletionStatus = () => {
    setCompletedTabs({
      details: Boolean(quotationData.title && quotationData.leadId && quotationData.quotationNumber),
      items: quotationData.items.length > 0 && quotationData.items.every(item => item.name && item.quantity > 0),
      terms: quotationData.terms.length > 0 && quotationData.terms.every(term => term.title && term.content)
    });
  };

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/api/leads/all");
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leads data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get("/api/quotations/templates");
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      // Fallback to default template if fetch fails
    }
  };

  const handleLeadSelection = (lead: Lead) => {
    setSelectedLead(lead);
    setQuotationData({
      ...quotationData,
      leadId: lead._id,
      contactId: lead.contact._id,
    });
    setLeadPopoverOpen(false);
    setValidationErrors({ ...validationErrors, leadId: "" });
  };

  // Modified tab change handler with validation
  const handleTabChange = (value: string) => {
    // Validate current tab before proceeding to the next one
    if (activeTab === "details" && value !== "details") {
      const errors: Record<string, string> = {};

      if (!quotationData.quotationNumber.trim()) {
        errors.quotationNumber = "Quotation number is required";
      }

      if (!quotationData.title.trim()) {
        errors.title = "Quotation title is required";
      }

      if (!quotationData.leadId) {
        errors.leadId = "Please select a client";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return; // Don't change tabs if validation fails
      }
    }

    if (activeTab === "items" && value !== "items" && value !== "details") {
      const hasEmptyItems = quotationData.items.some(item =>
        !item.name.trim() || item.quantity <= 0
      );

      if (hasEmptyItems) {
        setValidationErrors({ items: "Please fill in all required item fields" });
        toast({
          title: "Missing information",
          description: "All items must have a name and quantity",
          variant: "destructive",
        });
        return;
      }
    }

    // Always allow going back or to previous tabs
    if ((activeTab === "terms" && value === "preview") ||
      (activeTab === "items" && value === "terms") ||
      (activeTab === "details" && value === "items")) {
      // Going forward - update completion
      setCompletedTabs({
        ...completedTabs,
        [activeTab]: true
      });
    }

    // Clear validation errors when changing tabs
    setValidationErrors({});
    setActiveTab(value);
  };

  // Helper function to move to next tab
  const moveToNextTab = () => {
    const tabOrder = ["details", "items", "terms", "preview"];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      handleTabChange(tabOrder[currentIndex + 1]);
    }
  };

  // Handler for item changes
  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...quotationData.items];
    const item = { ...updatedItems[index], [field]: value };

    // Calculate item total
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'tax') {
      const quantity = item.quantity;
      const unitPrice = item.unitPrice;
      const discount = item.discount || 0;
      const tax = item.tax || 0;

      // Calculate price after discount
      const discountAmount = (unitPrice * quantity) * (discount / 100);
      const priceAfterDiscount = (unitPrice * quantity) - discountAmount;

      // Calculate tax amount
      const taxAmount = priceAfterDiscount * (tax / 100);

      // Calculate total
      item.total = priceAfterDiscount + taxAmount;
    }

    updatedItems[index] = item;
    setQuotationData({ ...quotationData, items: updatedItems });

    // Clear validation error if any
    if (validationErrors.items && item.name && item.quantity > 0) {
      setValidationErrors({ ...validationErrors, items: "" });
    }
  };

  // Add a new item
  const addItem = () => {
    setQuotationData({
      ...quotationData,
      items: [...quotationData.items, { ...defaultItem }],
    });
  };

  // Remove an item
  const removeItem = (index: number) => {
    const updatedItems = [...quotationData.items];
    updatedItems.splice(index, 1);
    if (updatedItems.length === 0) {
      updatedItems.push({ ...defaultItem });
    }
    setQuotationData({ ...quotationData, items: updatedItems });
  };

  // Add a new term
  const addTerm = () => {
    setQuotationData({
      ...quotationData,
      terms: [...quotationData.terms, { ...defaultTerm }],
    });
  };

  // Remove a term
  const removeTerm = (index: number) => {
    const updatedTerms = [...quotationData.terms];
    updatedTerms.splice(index, 1);
    if (updatedTerms.length === 0) {
      updatedTerms.push({ ...defaultTerm });
    }
    setQuotationData({ ...quotationData, terms: updatedTerms });
  };

  // Handle term change
  const handleTermChange = (index: number, field: 'title' | 'content', value: string) => {
    const updatedTerms = [...quotationData.terms];
    updatedTerms[index] = { ...updatedTerms[index], [field]: value };
    setQuotationData({ ...quotationData, terms: updatedTerms });
  };

  // Calculate totals
  const calculateTotals = () => {
    // Calculate subtotal
    const subtotal = quotationData.items.reduce((sum, item) => sum + item.total, 0);

    // Calculate discount
    let discountAmount = 0;
    if (quotationData.discountType === 'percentage') {
      discountAmount = subtotal * (quotationData.discountValue / 100);
    } else {
      discountAmount = quotationData.discountValue;
    }

    // Calculate tax
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (quotationData.taxPercentage / 100);

    // Calculate total
    const total = taxableAmount + taxAmount + (quotationData.shipping || 0);

    setQuotationData({
      ...quotationData,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'sent' = 'sent') => {
    e.preventDefault();

    if (!quotationData.leadId) {
      toast({
        title: "Missing information",
        description: "Please select a client for this quotation",
        variant: "destructive",
      });
      setActiveTab("details");
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.post('/api/quotations', {
        ...quotationData,
        status
      });

      toast({
        title: "Success!",
        description: status === 'draft'
          ? "Quotation has been saved as draft"
          : "Quotation has been created and is ready to send",
      });

      // Redirect to the quotation detail page
      router.push(`/quotations/${response.data._id}`);
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered leads based on search term
  const filteredLeads = leads.filter(
    (lead) =>
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.whatsappNumber.includes(searchTerm)
  );

  // Calculate progress
  const calculateProgress = () => {
    const tabs = ["details", "items", "terms"];
    const completedCount = Object.values(completedTabs).filter(Boolean).length;
    return (completedCount / tabs.length) * 100;
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <form>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Create New Quotation</h1>
          <p className="text-muted-foreground mb-4">
            Create a detailed quotation for your client with itemized pricing, terms, and more.
          </p>

          {/* Progress bar */}
          <div className="mb-4 space-y-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(calculateProgress())}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full gap-2 bg-accent grid-cols-4">
            <TabsTrigger className="flex items-center gap-2 border-none" value="details">
              {completedTabs.details && <CheckCircle2 className={`h-4 ${activeTab =="details" ? "text-green-800":""} w-4 text-green-500`} />}
              Details
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2 border-none" value="items">
              {completedTabs.items && <CheckCircle2 className={`h-4 ${activeTab =="items" ? "text-green-800":""} w-4 text-green-500`} />}
              Items & Pricing
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2 border-none" value="terms">
              {completedTabs.terms && <CheckCircle2 className={`h-4 ${activeTab =="terms" ? "text-green-800":""} w-4 text-green-500`} />}
              Terms & Notes
            </TabsTrigger>
            <TabsTrigger className="border-none" value="preview">
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quotation Details</CardTitle>
                <CardDescription>
                  Enter the basic information for your quotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quotation Number - New field */}
                <div className="grid gap-2">
                  <Label htmlFor="quotationNumber">Quotation Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="quotationNumber"
                    placeholder="E.g., QUO-2023001"
                    value={quotationData.quotationNumber}
                    onChange={(e) => {
                      setQuotationData({ ...quotationData, quotationNumber: e.target.value });
                      if (e.target.value.trim()) {
                        setValidationErrors({ ...validationErrors, quotationNumber: "" });
                      }
                    }}
                    className={validationErrors.quotationNumber ? "border-red-500" : ""}
                  />
                  {validationErrors.quotationNumber && (
                    <p className="text-sm text-red-500">{validationErrors.quotationNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    A unique identifier for this quotation (e.g., QUO-2023001)
                  </p>
                </div>

                {/* Title */}
                <div className="grid gap-2">
                  <Label htmlFor="title">Quotation Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="E.g., Website Development Project"
                    value={quotationData.title}
                    onChange={(e) => {
                      setQuotationData({ ...quotationData, title: e.target.value });
                      if (e.target.value.trim()) {
                        setValidationErrors({ ...validationErrors, title: "" });
                      }
                    }}
                    className={validationErrors.title ? "border-red-500" : ""}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500">{validationErrors.title}</p>
                  )}
                </div>

                {/* Lead/Client Selection */}
                <div className="grid gap-2">
                  <Label>Client <span className="text-red-500">*</span></Label>
                  <Popover open={leadPopoverOpen} onOpenChange={setLeadPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={leadPopoverOpen}
                        className={`w-full justify-between ${validationErrors.leadId ? "border-red-500" : ""}`}
                      >
                        {selectedLead ? (
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">{selectedLead.leadId}</Badge>
                            <span>{selectedLead.title} - {selectedLead.contact.firstName} {selectedLead.contact.lastName}</span>
                          </div>
                        ) : (
                          "Select client..."
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <div className="p-2">
                        <Input
                          placeholder="Search clients..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-2"
                        />
                        <div className="max-h-[300px] overflow-auto">
                          {isLoading ? (
                            <div className="flex justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                              <div
                                key={lead._id}
                                onClick={() => handleLeadSelection(lead)}
                                className="flex items-start p-2 hover:bg-accent rounded-md cursor-pointer"
                              >
                                <div>
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="mr-2">{lead.leadId}</Badge>
                                    <span className="font-medium">{lead.title}</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {lead.contact.firstName} {lead.contact.lastName} • {lead.contact.email} • {lead.contact.whatsappNumber}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-4 text-muted-foreground">
                              No matching clients found
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {validationErrors.leadId && (
                    <p className="text-sm text-red-500">{validationErrors.leadId}</p>
                  )}
                </div>

                {/* Date Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Issue Date <span className="text-red-500">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {quotationData.issueDate
                            ? format(quotationData.issueDate, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={quotationData.issueDate}
                          onSelect={(date) => date && setQuotationData({ ...quotationData, issueDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label>Valid Until <span className="text-red-500">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {quotationData.validUntil
                            ? format(quotationData.validUntil, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={quotationData.validUntil}
                          onSelect={(date) => date && setQuotationData({ ...quotationData, validUntil: date })}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Template & Currency */}
                {/* <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Currency <span className="text-red-500">*</span></Label>
                    <Select
                      value={quotationData.currency}
                      onValueChange={(value) => setQuotationData({ ...quotationData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Template <span className="text-red-500">*</span></Label>
                    <Select
                      value={quotationData.template}
                      onValueChange={(value) => setQuotationData({ ...quotationData, template: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Template</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div> */}
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type='button' onClick={moveToNextTab} className="gap-2">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Items & Pricing Tab */}
          <TabsContent value="items" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Items & Pricing</CardTitle>
                <CardDescription>
                  Add all the products or services included in this quotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items Table */}
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="w-[40%] p-2 text-left">Item <span className="text-red-500">*</span></th>
                        <th className="p-2 text-right">Qty <span className="text-red-500">*</span></th>
                        <th className="p-2 text-right">Unit Price <span className="text-red-500">*</span></th>
                        <th className="p-2 text-right">Discount%</th>
                        <th className="p-2 text-right">Tax%</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="w-10 p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotationData.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <div className="space-y-1">
                              <Input
                                placeholder="Item name"
                                value={item.name}
                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                className={!item.name && validationErrors.items ? "border-red-500" : ""}
                              />
                              <Textarea
                                placeholder="Description (optional)"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                className="text-sm min-h-[60px]"
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                              className={`text-right ${item.quantity <= 0 && validationErrors.items ? "border-red-500" : ""}`}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                              className="text-right"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                              className="text-right"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.tax}
                              onChange={(e) => handleItemChange(index, 'tax', Number(e.target.value))}
                              className="text-right"
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: quotationData.currency,
                            }).format(item.total)}
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              disabled={quotationData.items.length === 1}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {validationErrors.items && (
                  <p className="text-sm text-red-500">{validationErrors.items}</p>
                )}

                {/* Add Item Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>

                {/* Totals & Adjustments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Adjustments */}
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-muted/30">
                      <h3 className="font-medium mb-3">Adjustments</h3>

                      {/* Discount */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <Label>Discount Type</Label>
                        <div className="flex gap-2">
                          <Select
                            value={quotationData.discountType}
                            onValueChange={(value: "percentage" | "fixed") =>
                              setQuotationData({ ...quotationData, discountType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Discount Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            value={quotationData.discountValue}
                            onChange={(e) => setQuotationData({
                              ...quotationData,
                              discountValue: Number(e.target.value)
                            })}
                            placeholder={quotationData.discountType === "percentage" ? "%" : "Amount"}
                          />
                        </div>
                      </div>

                      {/* Tax */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Label>Tax</Label>
                          <Input
                            value={quotationData.taxName}
                            onChange={(e) => setQuotationData({
                              ...quotationData,
                              taxName: e.target.value
                            })}
                            placeholder="Tax name"
                            className="w-24"
                          />
                        </div>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={quotationData.taxPercentage}
                          onChange={(e) => setQuotationData({
                            ...quotationData,
                            taxPercentage: Number(e.target.value)
                          })}
                          placeholder="%"
                        />
                      </div>

                      {/* Shipping */}
                      <div className="grid grid-cols-2 gap-2">
                        <Label>Shipping</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={quotationData.shipping}
                          onChange={(e) => setQuotationData({
                            ...quotationData,
                            shipping: Number(e.target.value)
                          })}
                          placeholder="Amount"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Summary */}
                  <div className="p-4 border rounded-md bg-muted/30">
                    <h3 className="font-medium mb-3">Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: quotationData.currency,
                          }).format(quotationData.subtotal)}
                        </span>
                      </div>

                      {quotationData.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Discount {quotationData.discountType === 'percentage' ?
                              `(${quotationData.discountValue}%)` : ''}:
                          </span>
                          <span className="text-red-500">
                            -{new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: quotationData.currency,
                            }).format(quotationData.discountAmount)}
                          </span>
                        </div>
                      )}

                      {quotationData.taxAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {quotationData.taxName} ({quotationData.taxPercentage}%):
                          </span>
                          <span>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: quotationData.currency,
                            }).format(quotationData.taxAmount)}
                          </span>
                        </div>
                      )}

                      {quotationData.shipping > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping:</span>
                          <span>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: quotationData.currency,
                            }).format(quotationData.shipping)}
                          </span>
                        </div>
                      )}

                      <Separator className="my-2" />

                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span className="text-xl">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: quotationData.currency,
                          }).format(quotationData.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={isSaving}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("details")}
                >
                  Back
                </Button>
                <Button type='button' onClick={moveToNextTab} className="gap-2">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Terms & Notes Tab */}
          <TabsContent value="terms" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Terms & Notes</CardTitle>
                <CardDescription>
                  Add terms, conditions, and additional notes to your quotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Terms & Conditions */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Terms & Conditions <span className="text-red-500">*</span></h3>
                  <div className="space-y-4">
                    {quotationData.terms.map((term, index) => (
                      <div key={index} className="p-4 border rounded-md bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <Input
                            placeholder="Section Title (e.g., Payment Terms)"
                            value={term.title}
                            onChange={(e) => handleTermChange(index, 'title', e.target.value)}
                            className="max-w-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTerm(index)}
                            disabled={quotationData.terms.length === 1}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Enter terms content"
                          value={term.content}
                          onChange={(e) => handleTermChange(index, 'content', e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTerm}
                    className="mt-4 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Term Section
                  </Button>
                </div>

                <Separator />

                {/* Additional Notes */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Additional Notes</h3>
                  <Textarea
                    placeholder="Add any other information that might be useful for the client..."
                    value={quotationData.notes}
                    onChange={(e) => setQuotationData({ ...quotationData, notes: e.target.value })}
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={isSaving}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange("items")}
                >
                  Back
                </Button>
                <Button type='button' onClick={moveToNextTab} className="gap-2">
                  Preview <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview Quotation</CardTitle>
                <CardDescription>
                  Review your quotation before finalizing
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                {activeTab === "preview" ? (
                  <div className="border rounded-lg overflow-hidden">
                    <TemplateRenderer
                      quotation={quotationData}
                      templateId={quotationData.template !== "default" ? quotationData.template : templates.length > 0 ? templates.find(t => t?.isDefault)?._id || templates[0]._id : undefined}
                      className="w-full h-[800px] overflow-auto bg-white"
                    />
                  </div>
                ) : (
                  <div className="h-[600px] flex items-center justify-center">
                    <p className="text-muted-foreground">Switch to this tab to see the preview</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTabChange("terms")}
                  >
                    Back
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => handleSubmit(e, "draft")}
                    disabled={isSaving}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, "sent")}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Create & Send <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};

export default CreateQuotationForm;