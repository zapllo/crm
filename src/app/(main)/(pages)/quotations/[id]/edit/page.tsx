'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
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
import TemplateRenderer from "@/components/quotations/TemplateRenderer";

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

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params?.id as string;
  
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [leadPopoverOpen, setLeadPopoverOpen] = useState(false);

  // Form state
  const [quotationData, setQuotationData] = useState({
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
    template: "",
    status: "draft" as "draft" | "sent" | "approved" | "rejected" | "expired",
  });
  
  // Original quotation data for reference
  const [originalQuotation, setOriginalQuotation] = useState<any>(null);

  // Selected lead state for display
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Load data on component mount
  useEffect(() => {
    fetchQuotation();
    fetchLeads();
    fetchTemplates();
  }, [id]);

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

  const fetchQuotation = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/quotations/${id}`);
      setOriginalQuotation(data);
      
      // Map API data to form data
      setQuotationData({
        title: data.title || '',
        leadId: data.lead?._id || '',
        contactId: data.contact?._id || '',
        items: data.items?.map((item: any) => ({
          name: item.name || '',
          description: item.description || '',
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || 0,
        })) || [{ ...defaultItem }],
        subtotal: data.subtotal || 0,
        discountType: data.discount?.type || 'percentage',
        discountValue: data.discount?.value || 0,
        discountAmount: data.discount?.amount || 0,
        taxName: data.tax?.name || 'GST',
        taxPercentage: data.tax?.percentage || 0,
        taxAmount: data.tax?.amount || 0,
        shipping: data.shipping || 0,
        total: data.total || 0,
        currency: data.currency || 'USD',
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: data.status || 'draft',
        terms: data.terms?.map((term: any) => ({
          title: term.title || '',
          content: term.content || '',
        })) || [{ ...defaultTerm }],
        notes: '',
        template: data.template || '',
      });
      
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotation data',
        variant: 'destructive',
      });
      router.push('/quotations/all');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data } = await axios.get("/api/leads/all");
      setLeads(data);
      
      // If we have quotation data loaded, find and set the selected lead
      if (quotationData.leadId) {
        const lead = data.find((l: Lead) => l._id === quotationData.leadId);
        if (lead) {
          setSelectedLead(lead);
        }
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leads data",
        variant: "destructive",
      });
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
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quotationData.leadId) {
      toast({
        title: "Missing information",
        description: "Please select a client for this quotation",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await axios.put(`/api/quotations/${id}`, quotationData);

      toast({
        title: "Success!",
        description: "Quotation has been updated successfully",
      });

      // Redirect to the quotation detail page
      router.push(`/quotations/${id}`);
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to update quotation. Please try again.",
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading quotation data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Edit Quotation</h1>
          <p className="text-muted-foreground">
            Update the details of this quotation.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full gap-2 bg-accent grid-cols-4">
            <TabsTrigger className='border-none'  value="details">Details</TabsTrigger>
            <TabsTrigger className='border-none' value="items">Items & Pricing</TabsTrigger>
            <TabsTrigger className='border-none' value="terms">Terms & Notes</TabsTrigger>
            <TabsTrigger className='border-none' value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quotation Details</CardTitle>
                <CardDescription>
                  Edit the basic information for your quotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="grid gap-2">
                  <Label htmlFor="title">Quotation Title</Label>
                  <Input
                    id="title"
                    placeholder="E.g., Website Development Project"
                    value={quotationData.title}onChange={(e) => setQuotationData({ ...quotationData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={quotationData.status}
                    onValueChange={(value) => setQuotationData({ ...quotationData, status: value as any })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lead/Client Selection */}
                <div className="grid gap-2">
                  <Label>Client</Label>
                  <Popover open={leadPopoverOpen} onOpenChange={setLeadPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={leadPopoverOpen}
                        className="w-full justify-between"
                      >
                        {selectedLead ? (
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">{selectedLead.leadId}</Badge>
                            <span>{selectedLead.title} - {selectedLead.contact.firstName} {selectedLead.contact.lastName}</span>
                          </div>
                        ) : originalQuotation?.lead ? (
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">{originalQuotation.lead.leadId}</Badge>
                            <span>{originalQuotation.lead.title} - {originalQuotation.contact?.firstName} {originalQuotation.contact?.lastName}</span>
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
                </div>

                {/* Quotation Number (Read-only) */}
                <div className="grid gap-2">
                  <Label htmlFor="quotationNumber">Quotation Number</Label>
                  <Input
                    id="quotationNumber"
                    value={originalQuotation?.quotationNumber || 'Auto-generated'}
                    disabled
                    readOnly
                  />
                </div>

                {/* Date Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Issue Date</Label>
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
                    <Label>Valid Until</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Currency</Label>
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
                    <Label>Template</Label>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Items & Pricing Tab */}
          <TabsContent value="items" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Items & Pricing</CardTitle>
                <CardDescription>
                  Edit the products or services included in this quotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items Table */}
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="w-[40%] p-2 text-left">Item</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
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
                                required
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
                              className="text-right"
                              required
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
                              required
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
            </Card>
          </TabsContent>

          {/* Terms & Notes Tab */}
          <TabsContent value="terms" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Terms & Notes</CardTitle>
                <CardDescription>
                  Edit terms, conditions, and additional notes for your quotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Terms & Conditions */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Terms & Conditions</h3>
                  <div className="space-y-4">
                    {quotationData.terms.map((term, index) => (
                      <div key={index} className="p-4 border rounded-md bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <Input
                            placeholder="Section Title (e.g., Payment Terms)"
                            value={term.title}
                            onChange={(e) => handleTermChange(index, 'title', e.target.value)}
                            className="max-w-xs"
                            required
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
                          required
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
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview Updated Quotation</CardTitle>
                <CardDescription>
                  Review your quotation before saving changes
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
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {quotationData.status === 'draft' && (
              <Button
                type="submit"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  setQuotationData({ ...quotationData, status: "sent" });
                  handleSubmit(e);
                }}
                disabled={isSaving}
              >
                Save & Send
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}