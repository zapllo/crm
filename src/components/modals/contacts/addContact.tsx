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

const AddContact: React.FC<AddContactProps> = ({ isOpen, setIsOpen }) => {
  // Companies fetched from the DB
  const [companies, setCompanies] = useState<Company[]>([]);

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

  // Fetch companies only when the modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
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
      // POST to /api/contacts with the form data
      await axios.post("/api/contacts", contactData);
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
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 h-screen overflow-y-scroll m-auto">
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>

        {/* Select Company */}
        <div className="my-2">
          <label className="block text-sm font-medium mb-1">Company</label>
          <select
            name="companyId"
            className="border px-3 py-2 outline-none rounded w-full"
            value={contactData.companyId}
            onChange={handleSelectChange}
            required
          >
            <option value="">-- Select a Company --</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* First Name */}
        <Input
          label="First Name"
          name="firstName"
          onChange={handleChange}
          value={contactData.firstName}
        />
        {/* Last Name */}
        <Input
          label="Last Name"
          name="lastName"
          onChange={handleChange}
          value={contactData.lastName}
        />
        {/* Email */}
        <Input
          label="Email"
          name="email"
          type="email"
          onChange={handleChange}
          value={contactData.email}
        />
        {/* WhatsApp Number */}
        <Input
          label="WhatsApp Number"
          name="whatsappNumber"
          onChange={handleChange}
          value={contactData.whatsappNumber}
        />
        {/* State */}
        <Input
          label="State"
          name="state"
          onChange={handleChange}
          value={contactData.state}
        />
        {/* City */}
        <Input
          label="City"
          name="city"
          onChange={handleChange}
          value={contactData.city}
        />
        {/* Pincode */}
        <Input
          label="Pincode"
          name="pincode"
          onChange={handleChange}
          value={contactData.pincode}
        />
        {/* Address */}
        <Input
          label="Address"
          name="address"
          onChange={handleChange}
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

        <button
          onClick={handleSubmit}
          className="mt-4 bg-primary text-sm text-white px-4 py-2 rounded"
        >
          + Add Contact
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default AddContact;
