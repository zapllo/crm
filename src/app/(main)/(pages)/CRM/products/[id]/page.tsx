"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash, DollarSign, Tag, List, Barcode, Layers, AlignLeft, Search, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import EditProduct from "@/components/modals/products/editProduct";
import { FaRupeeSign } from "react-icons/fa";
import { IconCategory, IconCategory2, IconTrashFilled } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { DotsVerticalIcon } from "@radix-ui/react-icons";

export default function ProductDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProductDetails();
            fetchLeads();
        }
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`/api/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error("Error fetching product:", error);
        }
    };

    const fetchLeads = async () => {
        try {
            const response = await axios.get(`/api/leads/products?productId=${id}`);
            setLeads(response.data);
            setFilteredLeads(response.data); // Initialize search data
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/products/${id}`);
            router.push("/products"); // Redirect after delete
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    // Filter leads based on search term
    useEffect(() => {
        const results = leads.filter((lead) =>
            lead.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredLeads(results);
    }, [searchTerm, leads]);

    if (!product) return (
        <div className="flex items-center  justify-center h-full">
            <Loader2 className="w-6 text-primary h-6 animate-spin" />
        </div>);

    return (
        <div className="p-6 overflow-y-scroll h-screen">
            <div className="flex justify-between">
                {/* <h2 className="text-2xl font-bold">Product Details</h2> */}
                <div onClick={() => router.push('/CRM/products')} className="flex items-center cursor-pointer gap-2">
                    <div className='rounded-full h-8 w-8 items-center flex  justify-center border cursor-pointer hover:bg-white hover:text-black'>
                        <ArrowLeft />
                    </div>
                    Back to Products
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative 4 items-center flex">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            className="pl-10 p-2 text-sm focus:border-primary rounded-lg outline-none bg-transparent border flex items-center"
                            placeholder="Search Leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button className="gap-2" variant="outline" onClick={() => setIsEditModalOpen(true)}>
                        <Pencil className="text-blue-400" size={16} /> Edit Product
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="gap-2" variant="outline">
                                <IconTrashFilled className="text-red-500" size={16} /> Delete Product
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <h3 className="text-lg font-bold">Delete Product</h3>
                                <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="flex  mb-12 gap-6 mt-6">
                {/* Product Details */}
                <Card className=" ">
                    <div className="flex justify-center">
                        <CardHeader className="h-48  items-center  w-48 flex justify-center">
                            <img src={product.imageUrl || "/icons/noimage.png"} alt={product.productName} className=" invert-[100] object-contain h-12  rounded-lg" />
                        </CardHeader>
                    </div>
                    <CardContent className="space-y-3 text-sm">
                        <h3 className="text-sm font-bold">{product.productName}</h3>
                        <p className="flex items-center gap-2"><FaRupeeSign className="text-primary" size={18} /> <strong>Price:</strong> ₹{product.rate}</p>
                        <p className="flex items-center gap-2"><Barcode className="text-primary" size={18} /> <strong>HSN Code:</strong> {product.hsnCode}</p>
                        <p className="flex items-center gap-2"><Layers className="text-primary" size={18} /> <strong>Unit:</strong> {product.unit}</p>
                        <p className="flex items-center gap-2"><AlignLeft className="text-primary" size={18} /> <strong>Description:</strong> {product.description}</p>
                        <p className="flex items-center gap-2"><Tag className="text-primary" size={18} /> <strong>Max Discount:</strong> {product.maxDiscount}</p>
                        <p className="flex items-center gap-2"><IconCategory2 className="text-primary" size={18} /> <strong>Category:</strong> {product.category}</p>
                    </CardContent>
                </Card>

                <div className="border p-6 w-full rounded-lg shadow-md">
                    {/* Header with Total Leads Count */}
                    <div className="flex flex-col items-center justify-center mb-4">
                        <h3 className="text-lg font-bold text-gray-200">Leads Related to this Product</h3>
                        <p className="text-gray-400 italic text-sm">Total leads - {filteredLeads.length}</p>
                    </div>

                    {filteredLeads.length === 0 ? (
                        <p className="text-gray-400 text-center">No leads found for this product.</p>
                    ) : (
                        <div className="  rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="">
                                    <TableRow className="w-full">
                                        <TableHead className="text-gray-300">Title</TableHead>
                                        <TableHead className="text-gray-300">Contact</TableHead>
                                        <TableHead className="text-gray-300">Amount</TableHead>
                                        <TableHead className="text-gray-300">Details</TableHead>
                                        <TableHead className="text-gray-300">Stage</TableHead>
                                        {/* <TableHead className="text-gray-300">Actions</TableHead> */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.map((lead) => (
                                        <TableRow key={lead._id} className="border-b border-gray-700 hover:bg-gray-800">
                                            <TableCell className="font-semibold text-white">{lead.title}</TableCell>
                                            <TableCell className="text-gray-300">{lead.contact.firstName}</TableCell>
                                            <TableCell className="text-gray-300">₹{lead.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-gray-300 text-xs">
                                                <p>Created At: {new Date(lead.createdAt).toLocaleDateString()}</p>
                                                <p>Updated At: {new Date(lead.updatedAt).toLocaleDateString()}</p>
                                                <p>Close Date: {new Date(lead.closeDate).toLocaleDateString()}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge

                                                >
                                                    {lead.stage}
                                                </Badge>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Product Dialog */}
            {isEditModalOpen && <EditProduct isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} product={product} />}
        </div>
    );
}
