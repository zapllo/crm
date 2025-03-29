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
import axios from "axios";

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
    }
  }, [company]);

  const handleUpdate = async () => {
    if (!company?._id) return;
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

      onCompanyUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating company:", error);
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
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyCode">Company Code</Label>
                <Input
                  id="companyCode"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  placeholder="Company code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNo">Tax Number</Label>
                <Input
                  id="taxNo"
                  value={taxNo}
                  onChange={(e) => setTaxNo(e.target.value)}
                  placeholder="Tax number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={country}
                  onValueChange={setCountry}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Country" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Input
                  id="shippingAddress"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Shipping address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
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