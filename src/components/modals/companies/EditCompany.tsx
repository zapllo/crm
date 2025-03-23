"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";

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
  const [country, setCountry] = useState(company?.country || "");
  const [state, setState] = useState(company?.state || "");
  const [city, setCity] = useState(company?.city || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [pincode, setPincode] = useState(company?.pincode || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || "");
      setTaxNo(company.taxNo || "");
      setCompanyCode(company.companyCode || "");
      setCountry(company.country || "");
      setState(company.state || "");
      setCity(company.city || "");
      setWebsite(company.website || "");
      setPincode(company.pincode || "");
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
      <DialogContent className="max-w-lg p-6 z-[100] ">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>

        <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <Input label="Tax No" value={taxNo} onChange={(e) => setTaxNo(e.target.value)} />
        <Input label="Company Code" value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} />
        <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />

        <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />

        <Button className="bg-primary w-full mt-4" onClick={handleUpdate} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Update Company"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
