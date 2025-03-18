'use client';

import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductData {
    productName: string;
    hsnCode: string;
    category: string;
    unit: string;
    rate: string;
    maxDiscount?: string;
    description?: string;
}

interface AddProductProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onProductCreated: () => void;
}

const AddProduct: React.FC<AddProductProps> = ({ isOpen, setIsOpen, onProductCreated }) => {
    const [productData, setProductData] = useState<ProductData>({
        productName: '',
        hsnCode: '',
        category: '',
        unit: '',
        rate: '',
        maxDiscount: '',
        description: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await axios.post('/api/products', productData);
            setIsOpen(false);
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className='p-6 h-screen overscroll-y-scroll m-auto'>

                <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                </DialogHeader>
                <Input label="Product Name" name="productName" onChange={handleChange} />
                <Input label="HSN Code" name="hsnCode" onChange={handleChange} />
                <Input label="Category" name="category" onChange={handleChange} />
                <Input label="Unit" name="unit" onChange={handleChange} />
                <Input label="Rate" name="rate" type="number" onChange={handleChange} />
                <Input label="Max Discount" name="maxDiscount" type="number" onChange={handleChange} />
                <textarea
                    name="description"
                    placeholder="Description"
                    className="w-full p-2 rounded bg-transparent text-white border border-gray-600 focus:ring-2 focus:ring-[#815bf5]"
                    onChange={handleChange}
                />
                <Button onClick={handleSubmit}>Add Product</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddProduct;
