"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Company {
  _id: string;
  companyName: string;
}

interface CustomFieldDef {
  _id: string;
  name: string;
  fieldType: "Text" | "Number" | "Date" | "Dropdown";
  mandatory: boolean;
  options?: string[];
}

interface IContact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
  company?: {
    _id: string;
    companyName: string;
  };
  country: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  dateOfBirth?: string;
  dateOfAnniversary?: string;
  tags?: Array<{
    _id: string;
    name: string;
    color: string;
  }>;
  customFieldValues?: Array<{
    definition: {
      _id: string;
      name: string;
      fieldType: string;
      // ...
    };
    value: any;
  }>;
}

interface EditContactProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  contact: IContact | null;
  onContactUpdated?: () => void;
}

export default function EditContact({
  isOpen,
  setIsOpen,
  contact,
  onContactUpdated,
}: EditContactProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);

  // Basic contact fields
  const [companyId, setCompanyId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [state, setStateValue] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfAnniversary, setDateOfAnniversary] = useState("");

  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);

  // On opening the modal, fetch companies + customFields
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      fetchCustomFields();
      if (contact) {
        setCompanyId(contact.company?._id || "");
        setFirstName(contact.firstName || "");
        setLastName(contact.lastName || "");
        setEmail(contact.email || "");
        setCountry(contact.country || "India");
        setWhatsappNumber(contact.whatsappNumber || "");
        setStateValue(contact.state || "");
        setCity(contact.city || "");
        setPincode(contact.pincode || "");
        setAddress(contact.address || "");
        setDateOfBirth(contact.dateOfBirth || "");
        setDateOfAnniversary(contact.dateOfAnniversary || "");

        const initialFieldValues: { [key: string]: any } = {};
        contact.customFieldValues?.forEach((cf) => {
          initialFieldValues[cf.definition._id] = cf.value;
        });
        setFieldValues(initialFieldValues);
      }
    }
  }, [isOpen, contact]);

  async function fetchCompanies() {
    try {
      const response = await axios.get<Company[]>("/api/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }

  async function fetchCustomFields() {
    try {
      const response = await axios.get<CustomFieldDef[]>("/api/contact-custom-fields");
      setCustomFields(response.data);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    }
  }

  const handleFieldChange = (defId: string, val: any) => {
    setFieldValues((prev) => ({ ...prev, [defId]: val }));
  };

  async function handleUpdate() {
    if (!contact?._id) return;
    setIsLoading(true);

    try {
      const customFieldValues = Object.entries(fieldValues).map(([definitionId, value]) => ({
        definition: definitionId,
        value,
      }));

      const updates = {
        company: companyId,
        firstName,
        lastName,
        email,
        country,
        whatsappNumber,
        state,
        city,
        pincode,
        address,
        dateOfBirth: dateOfBirth || null,
        dateOfAnniversary: dateOfAnniversary || null,
        customFieldValues,
      };

      await axios.patch(`/api/contacts/${contact._id}`, { updates });

      if (onContactUpdated) onContactUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-6 z-[100] scrollbar-hide h-screen overflow-y-scroll">
        <DialogHeader className="mb-4">
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>

        {/* Company Select using ShadCN UI */}
        <div className="">
          <label className="text-sm text-gray-400">Company</label>
          <Select value={companyId} onValueChange={(val) => setCompanyId(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {companies.length > 0 ? (
                companies.map((cmp) => (
                  <SelectItem key={cmp._id} value={cmp._id}>
                    {cmp.companyName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-companies" disabled>
                  No Companies Found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Basic Fields */}
        <Input className="text-sm" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input className="text-sm" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input className="text-sm" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input className="text-sm" label="WhatsApp Number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
        <Input className="text-sm" label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <Input className="text-sm" label="State" value={state} onChange={(e) => setStateValue(e.target.value)} />
        <Input className="text-sm" label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <Input className="text-sm" label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        <Input className="text-sm" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        {/* <Input label="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        <Input label="Date of Anniversary" type="date" value={dateOfAnniversary} onChange={(e) => setDateOfAnniversary(e.target.value)} /> */}

        {/* Dynamic Fields using ShadCN UI */}
        <div className="space-y-2">
          {/* <h3 className="text-sm font-semibold">Custom Fields</h3> */}
          {customFields.map((def) => {
            const inputValue = fieldValues[def._id] || "";
            return (
              <div key={def._id} className="mb-2">
                {/* <label className="block text-sm text-gray-400 mb-1">
                  {def.name} {def.mandatory ? "*" : ""}
                </label> */}

                {def.fieldType === "Text" && (
                  <input
                    type="text"
                    className="w-full p-2 rounded bg-[#] dark:text-white outline-none border"
                    required={def.mandatory}
                    value={inputValue}
                    onChange={(e) => handleFieldChange(def._id, e.target.value)}
                  />
                )}
                {def.fieldType === "Number" && (
                  <input
                    type="number"
                    className="w-full p-2 rounded bg-[#0b0d29] dark:text-white outline-none border"
                    required={def.mandatory}
                    value={inputValue}
                    onChange={(e) => handleFieldChange(def._id, e.target.value)}
                  />
                )}
                {def.fieldType === "Date" && (
                  <input
                    type="date"
                    className="w-full p-2 rounded bg-[#] dark:text-white outline-none border"
                    required={def.mandatory}
                    value={inputValue}
                    onChange={(e) => handleFieldChange(def._id, e.target.value)}
                  />
                )}
                {def.fieldType === "Dropdown" && def.options && (
                  <Select value={inputValue} onValueChange={(val) => handleFieldChange(def._id, val)}>
                    <SelectTrigger className="w-full p-2 rounded bg-[#] dark:text-white outline-none border">
                      <SelectValue placeholder={`${def.name} ${def.mandatory ? "*" : ""}`} />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="Select">Select {`${def.name} ${def.mandatory ? "*" : ""}`} </SelectItem>
                      {def.options.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <Button
          className="bg-primary w-full mt-4"
          onClick={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
          ) : (
            "Update Contact"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
