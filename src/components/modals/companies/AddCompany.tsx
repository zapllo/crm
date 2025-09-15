"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Info, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ReactCountryFlag from "react-country-flag";
import { countries } from "countries-list";
import { toast } from "@/hooks/use-toast";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompanyData {
  companyName: string;
  taxNo: string;
  companyCode: string;
  country: string;
  shippingAddress: string;
  billingAddress: string;
  state: string;
  city: string;
  website: string;
  pincode: string;
}

interface AddCompanyProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCompanyCreated: () => void;
}

const AddCompany: React.FC<AddCompanyProps> = ({
  isOpen,
  setIsOpen,
  onCompanyCreated,
}) => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: "",
    taxNo: "",
    companyCode: "",
    country: "India",
    shippingAddress: "",
    billingAddress: "",
    state: "",
    city: "",
    website: "",
    pincode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentTab, setCurrentTab] = useState("basic");
  const [hasAdditionalInfo, setHasAdditionalInfo] = useState(false);

  const countryOptions = Object.entries(countries)
    .map(([code, country]) => ({
      code,
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCompanyData({
        companyName: "",
        taxNo: "",
        companyCode: "",
        country: "India",
        shippingAddress: "",
        billingAddress: "",
        state: "",
        city: "",
        website: "",
        pincode: "",
      });
      setErrors({});
      setCurrentTab("basic");
      setHasAdditionalInfo(false);
    }
  }, [isOpen]);

  // Track if user has entered additional info
  useEffect(() => {
    if (
      companyData.shippingAddress ||
      companyData.billingAddress ||
      companyData.state ||
      companyData.city ||
      companyData.pincode
    ) {
      setHasAdditionalInfo(true);
    } else {
      setHasAdditionalInfo(false);
    }
  }, [companyData]);

  const handleChange = (field: keyof CompanyData, value: string) => {
    setCompanyData({ ...companyData, [field]: value });

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Based on the companyModel.ts, these fields are required
    if (!companyData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!companyData.country.trim()) newErrors.country = "Country is required";
    if (!companyData.shippingAddress.trim()) newErrors.shippingAddress = "Shipping address is required";
    if (!companyData.billingAddress.trim()) newErrors.billingAddress = "Billing address is required";
    if (!companyData.state.trim()) newErrors.state = "State is required";
    if (!companyData.city.trim()) newErrors.city = "City is required";

    // Website validation (if provided)
    if (companyData.website && !companyData.website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/)) {
      newErrors.website = "Please enter a valid website URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // If there are address-related errors, switch to additional tab
      if (
        errors.shippingAddress ||
        errors.billingAddress ||
        errors.state ||
        errors.city ||
        errors.country
      ) {
        setCurrentTab("additional");
      } else {
        setCurrentTab("basic");
      }

      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post("/api/companies", companyData);

      toast({
        title: "Company created successfully",
        description: `${companyData.companyName} has been added to your companies.`,
      });

      onCompanyCreated();
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding company:", error);
      toast({
        title: "Error creating company",
        description: "There was an error adding the company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden z-[100]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Add New Company</DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full bg-accent gap-2 grid-cols-2 mb-4">
              <TabsTrigger className="border-none" value="basic">
                Basic Info
              </TabsTrigger>
              <TabsTrigger className="border-none relative" value="additional">
                Additional Info
                {hasAdditionalInfo && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 overflow-y-auto scrollbar-hide max-h-[60vh]">
            <TabsContent value="basic" className="space-y-4 mt-0">
              <Alert>
                <div className='flex items-center gap-1'>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Fields marked with <span className="text-destructive">*</span> are required
                  </AlertDescription>
                </div>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center">
                  Company Name <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={companyData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Company name"
                  className={errors.companyName ? "border-destructive" : ""}
                />
                {errors.companyName && (
                  <p className="text-destructive text-xs mt-1">{errors.companyName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center">
                  Country <span className="text-destructive ml-1">*</span>
                </Label>
                <Select
                  value={companyData.country}
                  onValueChange={(val) => handleChange('country', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Country">
                      {companyData.country && (
                        <div className="flex items-center">
                          <ReactCountryFlag
                            countryCode={countryOptions.find(c => c.name === companyData.country)?.code || ""}
                            svg
                            style={{
                              width: '1.2em',
                              height: '1.2em',
                              marginRight: '0.7em',
                            }}
                          />
                          {companyData.country}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-[100]">
                    {countryOptions.map((country) => (
                      <SelectItem className="hover:bg-accent" key={country.code} value={country.name}>
                        <div className="flex items-center">
                          <ReactCountryFlag
                            countryCode={country.code}
                            svg
                            style={{
                              width: '1.2em',
                              height: '1.2em',
                              marginRight: '0.7em',
                            }}
                          />
                          {country.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-destructive text-xs mt-1">{errors.country}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center">
                    State <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="state"
                    value={companyData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="State"
                    className={errors.state ? "border-destructive" : ""}
                  />
                  {errors.state && (
                    <p className="text-destructive text-xs mt-1">{errors.state}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center">
                    City <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={companyData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && (
                    <p className="text-destructive text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={companyData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddress" className="flex items-center">
                  Shipping Address <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="shippingAddress"
                  value={companyData.shippingAddress}
                  onChange={(e) => handleChange('shippingAddress', e.target.value)}
                  placeholder="Shipping address"
                  className={errors.shippingAddress ? "border-destructive" : ""}
                />
                {errors.shippingAddress && (
                  <p className="text-destructive text-xs mt-1">{errors.shippingAddress}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress" className="flex items-center">
                  Billing Address <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="billingAddress"
                  value={companyData.billingAddress}
                  onChange={(e) => handleChange('billingAddress', e.target.value)}
                  placeholder="Billing address"
                  className={errors.billingAddress ? "border-destructive" : ""}
                />
                {errors.billingAddress && (
                  <p className="text-destructive text-xs mt-1">{errors.billingAddress}</p>
                )}
              </div>



            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-0">

              <div className="space-y-2">
                <Label htmlFor="companyCode">Company Code</Label>
                <Input
                  id="companyCode"
                  value={companyData.companyCode}
                  onChange={(e) => handleChange('companyCode', e.target.value)}
                  placeholder="Company code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNo">Tax Number</Label>
                <Input
                  id="taxNo"
                  value={companyData.taxNo}
                  onChange={(e) => handleChange('taxNo', e.target.value)}
                  placeholder="Tax number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={companyData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://example.com"
                  className={errors.website ? "border-destructive" : ""}
                />
                {errors.website && (
                  <p className="text-destructive text-xs mt-1">{errors.website}</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 py-4 bg-muted/20">
          {currentTab === "basic" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("additional")}
                    className="mr-auto gap-1"
                  >
                    Next <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Continue to additional info
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {currentTab === "additional" && (
            <Button
              variant="outline"
              onClick={() => setCurrentTab("basic")}
              className="mr-auto"
            >
              Back
            </Button>
          )}

          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-1"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompany;