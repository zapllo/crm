"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash, Download, LayoutGrid, List } from "lucide-react";
import AddProduct from "@/components/modals/products/addProduct";
import EditProduct from "@/components/modals/products/editProduct";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Product {
    _id: string;
    productName: string;
    hsnCode: string;
    category: string;
    unit: string;
    rate: number;
    maxDiscount: number;
    imageUrl?: string; // Added image field
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("productName");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"table" | "gallery">("table"); // Toggle state
    const router = useRouter(); // Initialize router

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get<Product[]>("/api/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await axios.delete(`/api/products/${confirmDelete}`);
            fetchProducts(); // Refresh list
        } catch (error) {
            console.error("Error deleting product:", error);
        }
        setConfirmDelete(null);
    };

    const handleExportCSV = () => {
        const csvData = [
            ["Product Name", "HSN Code", "Category", "Unit", "Rate", "Max Discount"],
            ...products.map(({ productName, hsnCode, category, unit, rate, maxDiscount }) => [
                productName,
                hsnCode,
                category,
                unit,
                rate,
                maxDiscount,
            ]),
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvData.map((row) => row.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const sortedFilteredProducts = products
        .filter(({ productName, category }) =>
            [productName, category].some((field) =>
                field.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        .sort((a, b) => (a[sortField as keyof Product] > b[sortField as keyof Product] ? 1 : -1));

    return (
        <div className="p-6">
            <div className="flex gap-4 mt-4 mb-4 justify-center w-full">
                <div className="flex justify-center gap-4">
                    <Input className="w-48" label="Search Products" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button onClick={() => setIsModalOpen(true)} className="text-white flex gap-2">
                        <Plus size={16} /> Add Product
                    </Button>
                    <Button variant={"outline"} onClick={handleExportCSV} className="text-white flex gap-2">
                        <Download size={16} /> Export
                    </Button>
                    <Button variant={"outline"} onClick={() => setViewMode(viewMode === "table" ? "gallery" : "table")} className="hover:bg-gray-700 text-white flex gap-2">
                        {viewMode === "table" ? <LayoutGrid size={16} /> : <List size={16} />}
                        {viewMode === "table" ? "Gallery View" : "Table View"}
                    </Button>
                    <Select onValueChange={setSortField}>
                        <SelectTrigger className="bg-">
                            <SelectValue placeholder="Sort By - Created Sequence" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="productName">Product Name</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="rate">Rate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {viewMode === "table" ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>HSN Code</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedFilteredProducts.map((product) => (
                            <TableRow className="cursor-pointer"
                                onClick={() => router.push(`/CRM/products/${product._id}`)}
                                key={product._id}>
                                <TableCell>{product.productName}</TableCell>
                                <TableCell>{product.hsnCode}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.rate}</TableCell>
                                <TableCell className="flex items-center mt-2 gap-2">
                                    <Pencil className="text-blue-500 h-5 cursor-pointer" onClick={() => {
                                        setSelectedProduct(product);
                                        setIsEditModalOpen(true);
                                    }} />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Trash className="text-red-500 h-5 cursor-pointer" onClick={() => setConfirmDelete(product._id)} />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <h3 className="text-lg font-bold">Delete Product</h3>
                                                <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="grid grid-cols-4 gap-6">
                    {sortedFilteredProducts.map((product) => (
                        <Card
                        className="hover:border-primary cursor-pointer"
                            onClick={() => router.push(`/CRM/products/${product._id}`)}
                            key={product._id}>
                            <CardHeader>
                                <img src={product.imageUrl || "/fallback.png"} alt={product.productName} className="w-full h-36 object-cover rounded-lg" />
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-bold">{product.productName}</h3>
                                <p>{product.category}</p>
                                <p>₹{product.rate}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AddProduct isOpen={isModalOpen} setIsOpen={setIsModalOpen} onProductCreated={fetchProducts} />
            <EditProduct onProductUpdated={fetchProducts} isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} product={selectedProduct} />
        </div>
    );
}
