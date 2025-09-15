"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import axios from "axios";
import { AlertDialog as Alert, AlertDialogDescription as AlertDescription } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface EditCompanyProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  company: any | null;
  onCompanyUpdated: () => void;
}

export default function EditCompany({ isOpen, setIsOpen, company, onCompanyUpdated }: EditCompanyProps) {
  const [companyName, setCompanyName] = useState(company?.companyName || "");
  const [taxNo, setTaxNo] = useState(company?.taxNo || "");
  const [companyCode, setCompanyCode] = useState(company?.companyCode || "");
  const [country, setCountry] = useState(company?.country || "India");
  const [state, setState] = useState(company?.state || "");
  const [city, setCity] = useState(company?.city || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [pincode, setPincode] = useState(company?.pincode || "");
  const [shippingAddress, setShippingAddress] = useState(company?.shippingAddress || "");
  const [billingAddress, setBillingAddress] = useState(company?.billingAddress || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentTab, setCurrentTab] = useState("basic");
  const [hasAdditionalInfo, setHasAdditionalInfo] = useState(false);

  const countryOptions = Object.entries(countries)
    .map(([code, country]) => ({
      code,
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || "");
      setTaxNo(company.taxNo || "");
      setCompanyCode(company.companyCode || "");
      setCountry(company.country || "India");
      setState(company.state || "");
      setCity(company.city || "");
      setWebsite(company.website || "");
      setPincode(company.pincode || "");
      setShippingAddress(company.shippingAddress || "");
      setBillingAddress(company.billingAddress || "");
      setErrors({});
      setCurrentTab("basic");
    }
  }, [company, isOpen]);

  // Track if user has entered additional info
  useEffect(() => {
    if (
      shippingAddress ||
      billingAddress ||
      state ||
      city ||
      pincode
    ) {
      setHasAdditionalInfo(true);
    } else {
      setHasAdditionalInfo(false);
    }
  }, [shippingAddress, billingAddress, state, city, pincode]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string, value: string) => {
    setter(value);
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Based on the companyModel.ts, these fields are required
    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!country.trim()) newErrors.country = "Country is required";
    if (!shippingAddress.trim()) newErrors.shippingAddress = "Shipping address is required";
    if (!billingAddress.trim()) newErrors.billingAddress = "Billing address is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!city.trim()) newErrors.city = "City is required";
    
    // Website validation (if provided)
    if (website && !website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/)) {
      newErrors.website = "Please enter a valid website URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!company?._id) return;
    
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
    
    setIsLoading(true);

    try {
      await axios.patch(`/api/companies/${company._id}`, {
        companyName,
        taxNo,
        companyCode,
        country,
        state,
        city,
        website,
        pincode,
        shippingAddress,
        billingAddress,
      });

      toast({
        title: "Company updated",
        description: "The company has been successfully updated.",
      });

      onCompanyUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the company.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden z-[100]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Edit Company</DialogTitle>
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
              <Alert >
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
                  value={companyName}
                  onChange={(e) => handleInputChange(setCompanyName, 'companyName', e.target.value)}
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
                  value={country}
                  onValueChange={(val) => handleInputChange(setCountry, 'country', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Country">
                      {country && (
                        <div className="flex items-center">
                          <ReactCountryFlag
                            countryCode={countryOptions.find(c => c.name === country)?.code || ""}
                            svg
                            style={{
                              width: '1.2em',
                              height: '1.2em',
                              marginRight: '0.7em',
                            }}
                          />
                          {country}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] z-[100]">
                    {countryOptions.map((countryOption) => (
                      <SelectItem className="hover:bg-accent" key={countryOption.code} value={countryOption.name}>
                        <div className="flex items-center">
                          <ReactCountryFlag
                            countryCode={countryOption.code}
                            svg
                            style={{
                              width: '1.2em',
                              height: '1.2em',
                              marginRight: '0.7em',
                            }}
                          />
                          {countryOption.name}
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
                    value={state}
                    onChange={(e) => handleInputChange(setState, 'state', e.target.value)}
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
                    value={city}
                    onChange={(e) => handleInputChange(setCity, 'city', e.target.value)}
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
                  value={pincode}
                  onChange={(e) => handleInputChange(setPincode, 'pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>

              <div className="space-y-2">
              <Label htmlFor="shippingAddress" className="flex items-center">
                  Shipping Address <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="shippingAddress"
                  value={shippingAddress}
                  onChange={(e) => handleInputChange(setShippingAddress, 'shippingAddress', e.target.value)}
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
                  value={billingAddress}
                  onChange={(e) => handleInputChange(setBillingAddress, 'billingAddress', e.target.value)}
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
                  value={companyCode}
                  onChange={(e) => handleInputChange(setCompanyCode, 'companyCode', e.target.value)}
                  placeholder="Company code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNo">Tax Number</Label>
                <Input
                  id="taxNo"
                  value={taxNo}
                  onChange={(e) => handleInputChange(setTaxNo, 'taxNo', e.target.value)}
                  placeholder="Tax number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => handleInputChange(setWebsite, 'website', e.target.value)}
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
            onClick={handleUpdate}
            disabled={isLoading}
            className="gap-1"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Updating...' : 'Update Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}