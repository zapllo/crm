"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash, Download, LayoutGrid, List, Loader2, Tag, Barcode, Weight, Search, SlidersHorizontal, QrCode } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import BarcodeDisplay from "@/components/ui/barcode-display";

// Interface definitions remain the same
interface Category {
    _id: string;
    name: string;
    organization: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface Unit {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface Product {
    _id: string;
    productName: string;
    hsnCode: string;
    barcode?: string;
    category: Category;
    unit: Unit;
    rate: number;
    maxDiscount: number;
    imageUrl?: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("productName");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"table" | "gallery">("gallery");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>("all");

    const router = useRouter();


    const { isLoading: permissionsLoading, isInitialized } = usePermissions();


    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get<Product[]>("/api/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
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
                category?.name || "N/A",
                unit?.name || "N/A",
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

    // Get all unique categories for filtering
    const categories = [...new Set(products.map(product => product.category?.name))].filter(Boolean);

    const filteredProducts = products.filter(product => {
        // Filter by search term
        const matchesSearch =
            product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.hsnCode.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by category tab
        const matchesCategory =
            activeTab === "all" ||
            product.category?.name === activeTab;

        return matchesSearch && matchesCategory;
    });

    // Sort products
    const sortedFilteredProducts = [...filteredProducts].sort((a, b) => {
        if (sortField === "productName") {
            return a.productName.localeCompare(b.productName);
        } else if (sortField === "category") {
            return (a.category?.name || "").localeCompare(b.category?.name || "");
        } else if (sortField === "rate") {
            return a.rate - b.rate;
        }
        return 0;
    });
    // Check permissions before rendering content
    if (permissionsLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <h3 className="text-lg font-medium">Loading permissions...</h3>
                    <p className="text-muted-foreground">Please wait while we verify your access</p>
                </div>
            </div>
        );
    }

    // Check for view permission after permissions are loaded
    if (isInitialized && !canView("Products")) {
        return (
            <NoPermissionFallback
                title="No Access to Products"
                description="You don't have permission to view the products page."
            />
        );
    }

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <Skeleton className="h-10 w-60" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <Skeleton key={item} className="h-[300px] w-full rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6  mt-4 mx-auto">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">Manage your product catalog, edit details and track inventory.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-10 w-full"
                        placeholder="Search products, categories or HSN codes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {canAdd("Products") ? (
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        className="bg-primary/50 hover:bg-primary/20 cursor-not-allowed"

                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add Product
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>You don't have permission to add products</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex gap-2">
                                <SlidersHorizontal size={16} /> Options
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleExportCSV} className="flex gap-2 cursor-pointer">
                                <Download size={16} /> Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setViewMode(viewMode === "table" ? "gallery" : "table")} className="flex gap-2 cursor-pointer">
                                {viewMode === "table" ? <LayoutGrid size={16} /> : <List size={16} />}
                                {viewMode === "table" ? "Gallery View" : "Table View"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSortField("productName")} className="cursor-pointer">
                                Product Name {sortField === "productName" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortField("category")} className="cursor-pointer">
                                Category {sortField === "category" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortField("rate")} className="cursor-pointer">
                                Price {sortField === "rate" && "✓"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                <TabsList className="mb-2 flex flex-wrap gap-4 bg-accent h-auto">
                    <TabsTrigger className="border-none" value="all">All Products</TabsTrigger>
                    {categories.map(category => (
                        <TabsTrigger className="border-none" key={category} value={category as string}>
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeTab}>
                    {sortedFilteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <Tag className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No products found</h3>
                            <p className="text-muted-foreground max-w-md mb-4">
                                We couldn't find any products matching your criteria. Try adjusting your search or filters.
                            </p>
                            <Button onClick={() => { setSearchTerm(""); setActiveTab("all"); }}>
                                Clear filters
                            </Button>
                        </div>
                    ) : viewMode === "table" ? (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>HSN Code</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Barcode</TableHead> {/* New column */}
                                        <TableHead>Rate</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedFilteredProducts.map((product) => (
                                        <TableRow
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.push(`/CRM/products/${product._id}`)}
                                            key={product._id}
                                        >
                                            <TableCell className="font-medium">{product.productName}</TableCell>
                                            <TableCell>{product.hsnCode}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                    {product.category?.name || "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {product.barcode ? (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex items-center gap-1 h-8"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <QrCode className="h-3.5 w-3.5" />
                                                                <span className="truncate max-w-[100px]">
                                                                    {product.barcode}
                                                                </span>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-3" onClick={(e) => e.stopPropagation()}>
                                                            <div className="text-center mb-2">
                                                                <h4 className="font-semibold">{product.productName}</h4>
                                                                <p className="text-sm text-muted-foreground">{product.barcode}</p>
                                                            </div>
                                                            <BarcodeDisplay
                                                                value={product.barcode}
                                                                productName={product.productName}
                                                                height={70}
                                                            />
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="mt-2 w-full"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Copy barcode to clipboard
                                                                    navigator.clipboard.writeText(product.barcode || '');
                                                                    // You could add a toast notification here
                                                                }}
                                                            >
                                                                Copy Barcode
                                                            </Button>
                                                        </PopoverContent>
                                                    </Popover>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm italic">Not assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">₹{product.rate.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProduct(product);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setConfirmDelete(product._id);
                                                                }}
                                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <h3 className="text-lg font-bold">Delete Product</h3>
                                                                <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {sortedFilteredProducts.map((product) => (
                                <Card
                                    key={product._id}
                                    className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px] border-muted/50"
                                >
                                    <div className="relative aspect-square">
                                        <img
                                            src={product.imageUrl || "/fallback.png"}
                                            alt={product.productName}
                                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500 ease-in-out"
                                            onClick={() => router.push(`/CRM/products/${product._id}`)}
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProduct(product);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="h-8 w-8 bg-white/90 hover:bg-white text-blue-500 backdrop-blur-sm rounded-full shadow-sm"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmDelete(product._id);
                                                        }}
                                                        className="h-8 w-8 bg-white/90 hover:bg-white text-red-500 backdrop-blur-sm rounded-full shadow-sm"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <h3 className="text-lg font-bold">Delete Product</h3>
                                                        <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>

                                        <Badge className="absolute bottom-2 left-2 bg-primary/90 hover:bg-primary backdrop-blur-sm">
                                            ₹{product.rate.toLocaleString()}
                                        </Badge>
                                    </div>

                                    <CardContent className="p-4 cursor-pointer" onClick={() => router.push(`/CRM/products/${product._id}`)}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary">
                                                {product.productName}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                {product.category?.name || "No Category"}
                                            </Badge>

                                            {product.maxDiscount > 0 && (
                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                    {product.maxDiscount}% Max Discount
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Barcode className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                <span>HSN: {product.hsnCode}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Weight className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                <span>Unit: {product.unit?.name || "N/A"}</span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-4 pt-0 gap-2">
                                        <Button
                                            variant="default"
                                            className="w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/CRM/products/${product._id}`);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <AddProduct isOpen={isModalOpen} setIsOpen={setIsModalOpen} onProductCreated={fetchProducts} />
            <EditProduct onProductUpdated={fetchProducts} isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} product={selectedProduct as any} />

            {/* Pagination placeholder - can be implemented if needed */}
            {sortedFilteredProducts.length > 0 && (
                <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                        <Button variant="outline" size="sm">2</Button>
                        <Button variant="outline" size="sm">3</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
