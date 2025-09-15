"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { 
  CalendarIcon, 
  Loader2, 
  Plus, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Package,
  Save,
  Send,
  ArrowLeft,
  Clock,
  Eye,
  AlertCircle
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import TemplateRenderer from "./TemplateRenderer";

// Simplified Currency list (most common ones)
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

// Types (simplified)
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
    company?: string;
  };
}

interface Product {
  _id: string;
  productName: string;
  hsnCode: string;
  category: { _id: string; name: string; };
  unit: { _id: string; name: string; };
  rate: number;
  maxDiscount?: number;
  description?: string;
}

interface QuotationItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  productId?: string;
  maxDiscount?: number;
}

interface QuotationTerm {
  title: string;
  content: string;
}

interface QuotationTemplate {
  _id: string;
  name: string;
  isDefault?: boolean;
}

interface OrganizationSettings {
  defaultCurrency: string;
  defaultExpiry: number;
  quotationPrefix: string;
  clientSalutation: string;
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    taxId?: string;
    registrationNumber?: string;
  };
  defaultTermsAndConditions: string;
  template?: string;
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

const CreateQuotationForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [leadPopoverOpen, setLeadPopoverOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productPopoverStates, setProductPopoverStates] = useState<Record<number, boolean>>({});

  const [settings, setSettings] = useState<OrganizationSettings>({
    defaultCurrency: 'USD',
    defaultExpiry: 30,
    quotationPrefix: 'QUO',
    clientSalutation: 'Dear',
    companyDetails: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxId: '',
      registrationNumber: '',
    },
    defaultTermsAndConditions: '',
  });

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
    companyDetails: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxId: '',
      registrationNumber: '',
    },
    clientSalutation: 'Dear',
    digitalSignature: null as string | null,
    organizationLogo: null as string | null,
    additionalLogos: [] as string[],
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Generate quotation number
  const generateQuotationNumber = (prefix: string) => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${year}-${timestamp}`;
  };

  // Auto-save functionality
  const autoSaveQuotation = useCallback(async () => {
    if (!autoSave || !quotationData.title || !quotationData.leadId) return;
    try {
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [autoSave, quotationData]);

  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(autoSaveQuotation, 30000);
      return () => clearInterval(interval);
    }
  }, [autoSaveQuotation, autoSave]);

  // Fetch data
  useEffect(() => {
    fetchLeads();
    fetchProducts();
    fetchTemplates();
    fetchOrganizationSettings();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [
    quotationData.items,
    quotationData.discountType,
    quotationData.discountValue,
    quotationData.taxPercentage,
    quotationData.shipping
  ]);

  const fetchOrganizationSettings = async () => {
    try {
      const { data } = await axios.get("/api/organization/quotation-settings");
      setSettings(data);
      setQuotationData(prev => ({
        ...prev,
        currency: data.defaultCurrency || 'USD',
        template: data.template || 'default',
        validUntil: new Date(new Date().setDate(new Date().getDate() + (data.defaultExpiry || 30))),
        quotationNumber: prev.quotationNumber || generateQuotationNumber(data.quotationPrefix || 'QUO'),
        companyDetails: data.companyDetails || prev.companyDetails,
        clientSalutation: data.clientSalutation || 'Dear',
      }));

      if (data.defaultTermsAndConditions && !quotationData.terms[0].content) {
        setQuotationData(prev => ({
          ...prev,
          terms: [{ title: 'Terms & Conditions', content: data.defaultTermsAndConditions }]
        }));
      }
    } catch (error) {
      console.error("Error fetching organization settings:", error);
      setQuotationData(prev => ({
        ...prev,
        quotationNumber: prev.quotationNumber || generateQuotationNumber('QUO')
      }));
    }
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

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get("/api/quotations/templates");
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleLeadSelection = (lead: Lead) => {
    setSelectedLead(lead);
    setQuotationData(prev => ({
      ...prev,
      leadId: lead._id,
      contactId: lead.contact._id,
    }));
    setLeadPopoverOpen(false);
    setValidationErrors(prev => ({ ...prev, leadId: "" }));
  };

  const handleProductSelection = (product: Product, index: number) => {
    const updatedItems = [...quotationData.items];
    const item = {
      ...updatedItems[index],
      name: product.productName,
      description: product.description || "",
      unitPrice: product.rate,
      productId: product._id,
      maxDiscount: product.maxDiscount,
    };

    const quantity = item.quantity;
    const unitPrice = item.unitPrice;
    const discount = item.discount || 0;
    const tax = item.tax || 0;

    const discountAmount = (unitPrice * quantity) * (discount / 100);
    const priceAfterDiscount = (unitPrice * quantity) - discountAmount;
    const taxAmount = priceAfterDiscount * (tax / 100);
    item.total = priceAfterDiscount + taxAmount;

    updatedItems[index] = item;
    setQuotationData({ ...quotationData, items: updatedItems });
    setProductPopoverStates({ ...productPopoverStates, [index]: false });
    setProductSearchTerm("");
  };

  const handleTabChange = (value: string) => {
    if (activeTab === "details" && value !== "details") {
      const errors: Record<string, string> = {};
      if (!quotationData.quotationNumber.trim()) errors.quotationNumber = "Required";
      if (!quotationData.title.trim()) errors.title = "Required";
      if (!quotationData.leadId) errors.leadId = "Required";
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }

    if (activeTab === "items" && value === "terms") {
      const hasValidItems = quotationData.items.some(item =>
        item.name.trim() && item.quantity > 0 && item.unitPrice > 0
      );
      
      if (!hasValidItems) {
        toast({
          title: "Items Required",
          description: "Please add at least one valid item",
          variant: "destructive",
        });
        return;
      }
    }

    setValidationErrors({});
    setActiveTab(value);
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...quotationData.items];
    const item = { ...updatedItems[index], [field]: value };

    if (field === 'discount' && item.maxDiscount !== undefined && value > item.maxDiscount) {
      toast({
        title: "Discount Limit Exceeded",
        description: `Maximum discount for this product is ${item.maxDiscount}%`,
        variant: "destructive",
      });
      value = item.maxDiscount;
      item.discount = value;
    }

    if (['quantity', 'unitPrice', 'discount', 'tax'].includes(field)) {
      const quantity = item.quantity;
      const unitPrice = item.unitPrice;
      const discount = item.discount || 0;
      const tax = item.tax || 0;

      const discountAmount = (unitPrice * quantity) * (discount / 100);
      const priceAfterDiscount = (unitPrice * quantity) - discountAmount;
      const taxAmount = priceAfterDiscount * (tax / 100);
      item.total = priceAfterDiscount + taxAmount;
    }

    if (field === 'name' && item.productId) {
      item.productId = undefined;
      item.maxDiscount = undefined;
    }

    updatedItems[index] = item;
    setQuotationData({ ...quotationData, items: updatedItems });
  };

  const addItem = () => {
    setQuotationData({
      ...quotationData,
      items: [...quotationData.items, { ...defaultItem }],
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = [...quotationData.items];
    updatedItems.splice(index, 1);
    if (updatedItems.length === 0) {
      updatedItems.push({ ...defaultItem });
    }
    setQuotationData({ ...quotationData, items: updatedItems });
  };

  const addTerm = () => {
    setQuotationData({
      ...quotationData,
      terms: [...quotationData.terms, { ...defaultTerm }],
    });
  };

  const removeTerm = (index: number) => {
    const updatedTerms = [...quotationData.terms];
    updatedTerms.splice(index, 1);
    if (updatedTerms.length === 0) {
      updatedTerms.push({ ...defaultTerm });
    }
    setQuotationData({ ...quotationData, terms: updatedTerms });
  };

  const handleTermChange = (index: number, field: 'title' | 'content', value: string) => {
    const updatedTerms = [...quotationData.terms];
    updatedTerms[index] = { ...updatedTerms[index], [field]: value };
    setQuotationData({ ...quotationData, terms: updatedTerms });
  };

  const calculateTotals = () => {
    const subtotal = quotationData.items.reduce((sum, item) => sum + item.total, 0);

    let discountAmount = 0;
    if (quotationData.discountType === 'percentage') {
      discountAmount = subtotal * (quotationData.discountValue / 100);
    } else {
      discountAmount = quotationData.discountValue;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (quotationData.taxPercentage / 100);
    const total = taxableAmount + taxAmount + (quotationData.shipping || 0);

    setQuotationData(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'sent' = 'sent') => {
    e.preventDefault();

    if (!quotationData.leadId) {
      toast({
        title: "Missing Information",
        description: "Please select a client for this quotation",
        variant: "destructive",
      });
      setActiveTab("details");
      return;
    }

    try {
      setIsSaving(true);

      const submissionData = {
        ...quotationData,
        status,
        notes: quotationData.notes ? [{
          content: quotationData.notes,
          createdBy: 'user',
          timestamp: new Date(),
        }] : [],
      };

      const response = await axios.post('/api/quotations', submissionData);

      toast({
        title: "Success!",
        description: status === 'draft'
          ? "Quotation has been saved as draft"
          : "Quotation has been created and is ready to send",
      });

      router.push(`/quotations/${response.data._id}`);
    } catch (error: any) {
      console.error('Error creating quotation:', error);
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create quotation. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.whatsappNumber.includes(searchTerm) ||
      (lead.contact.company && lead.contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.hsnCode.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const calculateProgress = () => {
    let progress = 0;
    if (quotationData.title && quotationData.leadId && quotationData.quotationNumber) progress += 25;
    if (quotationData.items.some(item => item.name && item.quantity > 0)) progress += 50;
    if (quotationData.terms.some(term => term.title && term.content)) progress += 25;
    return progress;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quotationData.currency,
    }).format(amount);
  };

  const isTabComplete = (tab: string) => {
    switch (tab) {
      case 'details':
        return quotationData.title && quotationData.leadId && quotationData.quotationNumber;
      case 'items':
        return quotationData.items.some(item => item.name && item.quantity > 0 && item.unitPrice > 0);
      case 'terms':
        return quotationData.terms.some(term => term.title && term.content);
      default:
        return false;
    }
  };

  return (
    <div className="mx-auto p-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Quotation</h1>
          <p className="text-gray-600 text-sm mt-1">Build a professional quotation for your client</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* <div className="flex items-center gap-2 text-xs">
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            <span>Auto-save</span>
            {lastSaved && (
              <span className="text-gray-500">
                <Clock className="h-3 w-3 inline mr-1" />
                {format(lastSaved, 'HH:mm')}
              </span>
            )}
          </div> */}
          
          <Button variant="outline" onClick={() => router.back()} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{calculateProgress()}% Complete</span>
        </div>
        <Progress value={calculateProgress()} className="h-1" />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid bg-secondary w-full grid-cols-4 mb-8">
          <TabsTrigger value="details" className="flex items-center border-none gap-2">
            {isTabComplete('details') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            Details
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center border-none gap-2">
            {isTabComplete('items') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            Items
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center border-none gap-2">
            {isTabComplete('terms') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            Terms
          </TabsTrigger>
          <TabsTrigger className="border-none" value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quotation Details</CardTitle>
              <CardDescription>Basic information for your quotation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quotation Number <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    {/* <Input value={settings.quotationPrefix} disabled className="w-20" /> */}
                    <Input
                      value={quotationData.quotationNumber}
                      onChange={(e) => {
                        setQuotationData({ ...quotationData, quotationNumber: e.target.value });
                        if (e.target.value.trim()) {
                          setValidationErrors({ ...validationErrors, quotationNumber: "" });
                        }
                      }}
                      className={validationErrors.quotationNumber ? "border-red-300" : ""}
                    />
                  </div>
                  {validationErrors.quotationNumber && (
                    <p className="text-sm text-red-600">{validationErrors.quotationNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="E.g., Website Development Project"
                    value={quotationData.title}
                    onChange={(e) => {
                      setQuotationData({ ...quotationData, title: e.target.value });
                      if (e.target.value.trim()) {
                        setValidationErrors({ ...validationErrors, title: "" });
                      }
                    }}
                    className={validationErrors.title ? "border-red-300" : ""}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-600">{validationErrors.title}</p>
                  )}
                </div>
              </div>

              {/* Client Selection */}
              <div className="space-y-2">
                <Label>Client <span className="text-red-500">*</span></Label>
                {selectedLead ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedLead.title}</p>
                      <p className="text-sm text-gray-600">
                        {selectedLead.contact.firstName} {selectedLead.contact.lastName} • {selectedLead.contact.email}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLead(null);
                        setQuotationData(prev => ({ ...prev, leadId: '', contactId: '' }));
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Popover open={leadPopoverOpen} onOpenChange={setLeadPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start ${validationErrors.leadId ? "border-red-300" : ""}`}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Select client...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-0">
                      <div className="p-3">
                        <Input
                          placeholder="Search clients..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-3"
                        />
                        <div className="max-h-64 overflow-auto space-y-1">
                          {isLoading ? (
                            <div className="flex justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                              <div
                                key={lead._id}
                                onClick={() => handleLeadSelection(lead)}
                                className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{lead.leadId}</Badge>
                                  <span className="font-medium">{lead.title}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {lead.contact.firstName} {lead.contact.lastName} • {lead.contact.email}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 p-4">No clients found</p>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                {validationErrors.leadId && (
                  <p className="text-sm text-red-600">{validationErrors.leadId}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(quotationData.issueDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quotationData.issueDate}
                        onSelect={(date) => date && setQuotationData({ ...quotationData, issueDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(quotationData.validUntil, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quotationData.validUntil}
                        onSelect={(date) => date && setQuotationData({ ...quotationData, validUntil: date })}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={quotationData.currency}
                    onValueChange={(value) => setQuotationData({ ...quotationData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => handleTabChange("items")}
               disabled={!quotationData.title || !quotationData.leadId || !quotationData.quotationNumber}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Items & Pricing</CardTitle>
                <CardDescription>Add products and services</CardDescription>
              </div>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotationData.items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
                    <div className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-5">
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <Popover
                            open={productPopoverStates[index] || false}
                            onOpenChange={(open) =>
                              setProductPopoverStates({ ...productPopoverStates, [index]: open })
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Package className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0">
                              <div className="p-3">
                                <Input
                                  placeholder="Search products..."
                                  value={productSearchTerm}
                                  onChange={(e) => setProductSearchTerm(e.target.value)}
                                  className="mb-3"
                                />
                                <div className="max-h-60 overflow-auto space-y-1">
                                  {filteredProducts.map((product) => (
                                    <div
                                      key={product._id}
                                      onClick={() => handleProductSelection(product, index)}
                                      className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium text-sm">{product.productName}</p>
                                          <p className="text-xs text-gray-500">HSN: {product.hsnCode}</p>
                                        </div>
                                        <Badge variant="secondary">{formatCurrency(product.rate)}</Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Textarea
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="h-16 text-sm resize-none"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="text-center"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Disc%</Label>
                        <Input
                          type="number"
                          max={item.maxDiscount || 100}
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                          className="text-center"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Tax%</Label>
                        <Input
                          type="number"
                          max="100"
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, 'tax', Number(e.target.value))}
                          className="text-center"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Total</Label>
                        <div className="h-9 flex items-center justify-end font-medium text-sm">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                      
                      <div className="col-span-1 flex items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={quotationData.items.length === 1}
                          className="h-9"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Summary */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Adjustments</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Discount Type</Label>
                      <Select
                        value={quotationData.discountType}
                        onValueChange={(value: "percentage" | "fixed") =>
                          setQuotationData({ ...quotationData, discountType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Value</Label>
                      <Input
                        type="number"
                        value={quotationData.discountValue}
                        onChange={(e) => setQuotationData({
                          ...quotationData,
                          discountValue: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Tax Name</Label>
                      <Input
                        value={quotationData.taxName}
                        onChange={(e) => setQuotationData({
                          ...quotationData,
                          taxName: e.target.value
                        })}
                        placeholder="GST"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Tax %</Label>
                      <Input
                        type="number"
                        max="100"
                        value={quotationData.taxPercentage}
                        onChange={(e) => setQuotationData({
                          ...quotationData,
                          taxPercentage: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Shipping</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quotationData.shipping}
                      onChange={(e) => setQuotationData({
                        ...quotationData,
                        shipping: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(quotationData.subtotal)}</span>
                    </div>
                    {quotationData.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(quotationData.discountAmount)}</span>
                      </div>
                    )}
                    {quotationData.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>{quotationData.taxName} ({quotationData.taxPercentage}%):</span>
                        <span>{formatCurrency(quotationData.taxAmount)}</span>
                      </div>
                    )}
                    {quotationData.shipping > 0 && (
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{formatCurrency(quotationData.shipping)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(quotationData.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("details")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={() => handleTabChange("terms")}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Terms & Notes</CardTitle>
                <CardDescription>Add terms, conditions and notes</CardDescription>
              </div>
              <Button onClick={addTerm} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Term
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {quotationData.terms.map((term, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <Input
                        placeholder="Term title (e.g., Payment Terms)"
                        value={term.title}
                        onChange={(e) => handleTermChange(index, 'title', e.target.value)}
                        className="max-w-xs"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTerm(index)}
                        disabled={quotationData.terms.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Enter term content..."
                      value={term.content}
                      onChange={(e) => handleTermChange(index, 'content', e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-2 block">Additional Notes</Label>
                <Textarea
                  placeholder="Add any additional information for your client..."
                  value={quotationData.notes}
                  onChange={(e) => setQuotationData({ ...quotationData, notes: e.target.value })}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("items")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={() => handleTabChange("preview")}>
                  Preview <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Preview Quotation</CardTitle>
                  <CardDescription>Review before sending</CardDescription>
                </div>
                {/* <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Full Screen
                  </Button>
                  <Button variant="outline" size="sm">
                    Download PDF
                  </Button>
                </div> */}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-hidden bg-white">
                {activeTab === "preview" ? (
                  <TemplateRenderer
                    quotation={quotationData}
                    templateId={quotationData.template !== "default" ? quotationData.template : templates.length > 0 ? templates.find(t => t?.isDefault)?._id || templates[0]._id : undefined}
                    className="w-full h-[700px] overflow-auto"
                  />
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Switch to this tab to see preview</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleTabChange("terms")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={(e) => handleSubmit(e, "sent")}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Create & Send
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateQuotationForm;