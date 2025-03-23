"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Company {
  _id: string;
  companyName: string;
}

interface ContactData {
  companyId: string;       // reference to Company
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  whatsappNumber: string;
  state: string;
  city: string;
  pincode: string;
  address: string;
  dateOfBirth?: string;
  dateOfAnniversary?: string;
}

interface AddContactProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface CustomFieldDef {
  _id: string;
  name: string;
  fieldType: "Text" | "Number" | "Date" | "Dropdown";
  mandatory: boolean;
  options?: string[];
}

const AddContact: React.FC<AddContactProps> = ({ isOpen, setIsOpen }) => {
  // Companies fetched from the DB
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  // Contact form data
  const [contactData, setContactData] = useState<ContactData>({
    companyId: "",
    firstName: "",
    lastName: "",
    email: "",
    country: "India",
    whatsappNumber: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    // dateOfBirth: "",
    // dateOfAnniversary: "",
  });

  // We store the user’s dynamic answers as a dictionary: { [definitionId]: string }
  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>({});

  // Fetch companies only when the modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      fetchCustomFields();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get<Company[]>("/api/companies");
      setCompanies(res.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchCustomFields = async () => {
    try {
      const res = await axios.get<CustomFieldDef[]>("/api/contact-custom-fields");
      setCustomFields(res.data);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    }
  };

  // Handler for dynamic field inputs
  const handleFieldChange = (defId: string, val: any) => {
    setFieldValues((prev) => ({ ...prev, [defId]: val }));
  };


  // Generic input handler
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  // Company select handler
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setContactData({ ...contactData, companyId: e.target.value });
  };

  // Submit to create contact
  const handleSubmit = async () => {
    try {
      // Build the customFieldValues array from fieldValues
      const customFieldValues = Object.entries(fieldValues).map(([definitionId, value]) => ({
        definition: definitionId,
        value,
      }));

      // Merge into our main payload
      const dataToSend = {
        ...contactData,
        customFieldValues, // <— attach dynamic values here!
      };

      // POST to /api/contacts with the form data
      await axios.post("/api/contacts", dataToSend);

      setIsOpen(false);

      // Optionally, reset form fields
      setContactData({
        companyId: "",
        firstName: "",
        lastName: "",
        email: "",
        country: "India",
        whatsappNumber: "",
        state: "",
        city: "",
        pincode: "",
        address: "",
      });
      setFieldValues({});
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 h-screen z-[100] overflow-y-scroll scrollbar-hide m-auto">
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>

        {/* Select Company */}
        <div className="my-2">
          {/* <label className="block text-sm font-medium mb-1">Company</label> */}
          <Select value={contactData.companyId} onValueChange={(val) => setContactData({ ...contactData, companyId: val })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Company" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {companies.map((company) => (

                <SelectItem key={company._id} value={company._id}>
                  {company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* First Name */}
        <Input
          label="First Name"
          name="firstName"
          onChange={handleChange}
          className='text-sm'
          value={contactData.firstName}
        />
        {/* Last Name */}
        <Input
          label="Last Name"
          name="lastName"
          onChange={handleChange}
          className='text-sm'
          value={contactData.lastName}
        />
        {/* Email */}
        <Input
          label="Email"
          name="email"
          type="email"
          onChange={handleChange}
          className='text-sm'
          value={contactData.email}
        />
        {/* WhatsApp Number */}
        <Input
          label="WhatsApp Number"
          name="whatsappNumber"
          onChange={handleChange}
          className='text-sm'
          value={contactData.whatsappNumber}
        />
        {/* State */}
        <Input
          label="State"
          name="state"
          onChange={handleChange}
          className='text-sm'
          value={contactData.state}
        />
        {/* City */}
        <Input
          label="City"
          name="city"
          onChange={handleChange}
          className='text-sm'
          value={contactData.city}
        />
        {/* Pincode */}
        <Input
          label="Pincode"
          name="pincode"
          onChange={handleChange}
          className='text-sm'
          value={contactData.pincode}
        />
        {/* Address */}
        <Input
          label="Address"
          name="address"
          onChange={handleChange}
          className='text-sm'
          value={contactData.address}
        />

        {/* If you want dateOfBirth, dateOfAnniversary, add them similarly:
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            onChange={handleChange}
            value={contactData.dateOfBirth}
          /> 
        */}

        {/* ---------- DYNAMIC FIELDS ------------- */}
        <div className=" ">
          {/* <h3 className="text-sm font-semibold mb-2">Custom Fields</h3> */}
          {customFields.map((def) => {
            const inputValue = fieldValues[def._id] || "";
            return (
              <div key={def._id} className="mb-2">
                {def.fieldType === "Text" && (
                  <input
                    type="text"
                    placeholder={`${def.name} ${def.mandatory ? "*" : ""}`}
                    className="w-full p-2 rounded bg-[#] dark:text-white outline-none border"
                    required={def.mandatory}
                    value={inputValue}
                    onChange={(e) => handleFieldChange(def._id, e.target.value)}
                  />
                )}
                {def.fieldType === "Number" && (
                  <input
                    type="number"
                    placeholder={`${def.name} ${def.mandatory ? "*" : ""}`}
                    className="w-full p-2 rounded bg-[#] text-white outline-none border"
                    required={def.mandatory}
                    value={inputValue}
                    onChange={(e) => handleFieldChange(def._id, e.target.value)}
                  />
                )}
                {def.fieldType === "Date" && (
                  <input
                    type="date"
                    placeholder={`${def.name} ${def.mandatory ? "*" : ""}`}
                    className="w-full p-2 rounded bg-[#] text-white outline-none border"
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
                      <SelectItem value="Select">Select {def.name}</SelectItem>
                      {def.options.map((op) => (
                        <SelectItem className="hover:bg-accent" key={op} value={op}>
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

        <button
          onClick={handleSubmit}
          className="mt-4 bg-primary text-sm text-white px-4 py-2 rounded"
        >
          Add Contact
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default AddContact;
