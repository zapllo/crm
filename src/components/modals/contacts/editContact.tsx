"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface EditContactProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  contact: any | null;
  onContactUpdated?: () => void;
}

export default function EditContact({ isOpen, setIsOpen, contact, onContactUpdated }: EditContactProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companies, setCompanies] = useState<{ _id: string; companyName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("/api/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName || "");
      setLastName(contact.lastName || "");
      setEmail(contact.email || "");
      setWhatsappNumber(contact.whatsappNumber || "");
      setSelectedCompany(contact.company?._id || "");
    }
  }, [contact]);

  const handleUpdate = async () => {
    if (!contact?._id) return;

    setIsLoading(true);
    try {
      await axios.patch("/api/contacts", {
        id: contact._id,
        updates: { firstName, lastName, email, whatsappNumber, company: selectedCompany },
      });

      if (onContactUpdated) onContactUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="mb-4">
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>

        {/* First Name */}
        <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />

        {/* Last Name */}
        <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />

        {/* Email */}
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        {/* WhatsApp Number */}
        <Input label="WhatsApp No" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />

        {/* Company Selection Dropdown */}
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger>
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.length > 0 ? (
              companies.map((company) => (
                <SelectItem key={company._id} value={company._id}>
                  {company.companyName}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-companies" disabled>
                No Companies Found
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Submit Button */}
        <Button className="bg-primary w-full mt-4" onClick={handleUpdate} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Update Contact"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
