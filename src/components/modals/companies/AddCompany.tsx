"use client";

import React, { useState, ChangeEvent } from "react";
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
import { Loader2 } from "lucide-react";
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

  const countryOptions = Object.entries(countries)
    .map(([code, country]) => ({
      code,
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleChange = (field: keyof CompanyData, value: string) => {
    setCompanyData({ ...companyData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await axios.post("/api/companies", companyData);
      // Add success toast notification
      toast({
        title: "Company created successfully",
        description: `${companyData.companyName} has been added to your companies.`,
      });
      // Clear form
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

      onCompanyCreated(); // Refresh companies list
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding company:", error);
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

        <Tabs defaultValue="basic" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full bg-accent gap-2 grid-cols-2 mb-4">
              <TabsTrigger className="border-none" value="basic">Basic Info</TabsTrigger>
              <TabsTrigger className="border-none" value="additional">Additional Info</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 overflow-y-auto scrollbar-hide max-h-[60vh]">
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Company name"
                />
              </div>

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
                />
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={companyData.country}
                  onValueChange={(val) => handleChange('country', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Country" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={companyData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={companyData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                  />
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
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Input
                  id="shippingAddress"
                  value={companyData.shippingAddress}
                  onChange={(e) => handleChange('shippingAddress', e.target.value)}
                  placeholder="Shipping address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  value={companyData.billingAddress}
                  onChange={(e) => handleChange('billingAddress', e.target.value)}
                  placeholder="Billing address"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 py-4 bg-muted/20">
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