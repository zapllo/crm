"use client";

import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
    onCompanyCreated
}) => {
    const [companyData, setCompanyData] = useState<CompanyData>({
        companyName: "",
        taxNo: "",
        companyCode: "",
        country: "",
        shippingAddress: "",
        billingAddress: "",
        state: "",
        city: "",
        website: "",
        pincode: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCompanyData({ ...companyData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await axios.post("/api/companies", companyData);
            setIsOpen(false);
            // Clear form
            setCompanyData({
                companyName: "",
                taxNo: "",
                companyCode: "",
                country: "",
                shippingAddress: "",
                billingAddress: "",
                state: "",
                city: "",
                website: "",
                pincode: "",
            });
            onCompanyCreated(); // Refresh companies list
        } catch (error) {
            console.error("Error adding company:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="p-6 h-screen overflow-y-scroll m-auto">
                <DialogHeader>
                    <DialogTitle>Add Company</DialogTitle>
                </DialogHeader>

                <Input
                    label="Company Name"
                    name="companyName"
                    onChange={handleChange}
                    value={companyData.companyName}
                />
                <Input
                    label="Tax No"
                    name="taxNo"
                    onChange={handleChange}
                    value={companyData.taxNo}
                />
                <Input
                    label="Company Code"
                    name="companyCode"
                    onChange={handleChange}
                    value={companyData.companyCode}
                />
                <Input
                    label="Country"
                    name="country"
                    onChange={handleChange}
                    value={companyData.country}
                />
                <Input
                    label="Shipping Address"
                    name="shippingAddress"
                    onChange={handleChange}
                    value={companyData.shippingAddress}
                />
                <Input
                    label="Billing Address"
                    name="billingAddress"
                    onChange={handleChange}
                    value={companyData.billingAddress}
                />
                <Input
                    label="State"
                    name="state"
                    onChange={handleChange}
                    value={companyData.state}
                />
                <Input
                    label="City"
                    name="city"
                    onChange={handleChange}
                    value={companyData.city}
                />
                <Input
                    label="Website"
                    name="website"
                    onChange={handleChange}
                    value={companyData.website}
                />
                <Input
                    label="Pincode"
                    name="pincode"
                    onChange={handleChange}
                    value={companyData.pincode}
                />

                <button
                    className="mt-4 bg-primary text-sm text-white px-4 py-2 rounded"
                    onClick={handleSubmit}
                >
                    + Add Company
                </button>
            </DialogContent>
        </Dialog>
    );
};

export default AddCompany;
