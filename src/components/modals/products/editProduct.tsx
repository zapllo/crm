"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";

interface Product {
    _id: string;
    productName: string;
    hsnCode: string;
    category: string;
    unit: string;
    rate: number;
    maxDiscount: number;
}

interface EditProductProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    product: Product | null;
    onProductUpdated: () => void;
}

export default function EditProduct({ isOpen, setIsOpen, product, onProductUpdated }: EditProductProps) {
    const [formData, setFormData] = useState<Product>({
        _id: "",
        productName: "",
        hsnCode: "",
        category: "",
        unit: "",
        rate: 0,
        maxDiscount: 0,
    });

    useEffect(() => {
        if (product) {
            setFormData(product);
        }
    }, [product]);

    const handleInputChange = (field: keyof Product, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdateProduct = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!formData.productName || !formData.hsnCode || !formData.category || !formData.unit || formData.rate <= 0) {
            alert("Please fill in all required fields.");
            return;
        }
        try {
            await axios.patch(`/api/products/${formData._id}`, formData);
            onProductUpdated();
            setIsOpen(false);
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg p-6">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateProduct} className="space-y-4">
                    <Input
                        label="Product Name"
                        value={formData.productName}
                        onChange={(e) => handleInputChange("productName", e.target.value)}
                        required
                    />
                    <Input
                        label="HSN Code"
                        value={formData.hsnCode}
                        onChange={(e) => handleInputChange("hsnCode", e.target.value)}
                        required
                    />
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Piece">Piece</SelectItem>
                            <SelectItem value="Kg">Kg</SelectItem>
                            <SelectItem value="Meter">Meter</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        type="number"
                        label="Rate"
                        value={formData.rate}
                        onChange={(e) => handleInputChange("rate", parseFloat(e.target.value))}
                        required
                    />
                    <Input
                        type="number"
                        label="Max Discount (%)"
                        value={formData.maxDiscount}
                        onChange={(e) => handleInputChange("maxDiscount", parseFloat(e.target.value))}
                    />
                    <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button type="button" className="bg-gray-500">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="bg-blue-500">Update Product</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
