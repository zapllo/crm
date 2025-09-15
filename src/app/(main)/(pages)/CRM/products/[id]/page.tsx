"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
    Pencil,
    Trash,
    Tag,
    Barcode,
    Layers,
    Search,
    ArrowLeft,
    Loader2,
    Calendar,
    ChevronRight,
    Eye,
    Package,
    ShoppingCart,
    Banknote,
    Info,
    Percent,
    RefreshCw,
    ZoomIn,
    PencilLine,
    Printer,
    QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import EditProduct from "@/components/modals/products/editProduct";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger
} from "@/components/ui/hover-card";
import { usePermissions } from "@/hooks/use-permissions";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import BarcodeDisplay from "@/components/ui/barcode-display";


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

interface IProduct {
    _id: string;
    productName: string;
    description: string;
    hsnCode: string;
    barcode: string;
    category: Category;
    unit: Unit;
    rate: number;
    maxDiscount: number;
    imageUrl?: string;
}

interface ILead {
    _id: string;
    title: string;
    contact: {
        _id: string;
        firstName: string;
        lastName: string;
        email?: string;
        avatar?: string;
    };
    amount: number;
    stage: string;
    createdAt: string;
    updatedAt: string;
    closeDate: string;
}

export default function ProductDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [leads, setLeads] = useState<ILead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<ILead[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [activeTab, setActiveTab] = useState("details");
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    const { isLoading: permissionsLoading, isInitialized } = usePermissions();

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
            setFilteredLeads(response.data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/products/${id}`);
            router.push("/CRM/products");
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    // Filter leads based on search term
    useEffect(() => {
        const results = leads.filter((lead) =>
            lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.contact?.firstName + ' ' + lead.contact?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredLeads(results);
    }, [searchTerm, leads]);

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

    if (!product) {
        return (
            <div className="flex flex-col space-y-6 p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-6">
                        <Skeleton className="h-64 w-full rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <Skeleton className="h-96 w-full rounded-md" />
                    </div>
                </div>
            </div>
        );
    }

    // Determine badge color based on stage
    const getStageBadgeVariant = (stage: string) => {
        switch (stage.toLowerCase()) {
            case 'qualified':
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case 'proposal':
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            case 'won':
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case 'lost':
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case 'negotiation':
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

// ... existing code ...

// Modify the printBarcode function
const printBarcode = () => {
    // Create a new window for printing just the barcode
    const printWindow = window.open('', '_blank');

    if (printWindow) {
        // Create the content with proper styling
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Barcode - ${product.productName}</title>
                    <style>
                        body {
                            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            margin: 0;
                            padding: 20px;
                            text-align: center;
                        }
                        .barcode-container {
                            margin: 0 auto;
                            max-width: 300px;
                            padding: 10px;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                        }
                        .product-name {
                            font-size: 14px;
                            margin-bottom: 15px;
                            font-weight: bold;
                        }
                        .barcode-number {
                            font-size: 12px;
                            margin-top: 10px;
                            color: #4b5563;
                        }
                        @media print {
                            @page {
                                margin: 0;
                                size: auto;
                            }
                            body {
                                margin: 1cm;
                            }
                        }
                    </style>
                    <!-- Import JsBarcode library -->
                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                </head>
                <body>
                    <div class="barcode-container">
                        <div class="product-name">${product.productName}</div>
                        <svg id="barcode"></svg>
                        <div class="barcode-number">${product.barcode}</div>
                    </div>

                    <script>
                        // Render the barcode using JsBarcode
                        JsBarcode("#barcode", "${product.barcode}", {
                            format: "CODE128",
                            width: 2,
                            height: 100,
                            displayValue: false,
                            margin: 10
                        });

                        // Print and close after a short delay to ensure rendering
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
    }
};


    return (
        <div className="p-6 lg:p-8  mx-auto">
            {/* Back button and actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push('/CRM/products')}
                        className="rounded-full h-10 w-10"
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{product.productName}</h1>
                        <p className="text-muted-foreground">Product Details and Related Information</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {canAdd("Products") ? (
                        <Button
                            onClick={() => setIsEditModalOpen(true)}
                            variant='outline'
                            className=""
                        >
                            <PencilLine className="mr-2 h-4 w-4" /> Edit Product
                        </Button>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        className=" cursor-not-allowed"
                                        variant='outline'
                                    >
                                        <PencilLine className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>You don't have permission to add products</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {canDelete("Products") && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="flex items-center gap-2">
                                    <Trash size={16} /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete "{product.productName}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <Tabs defaultValue="details" className="space-y-6" onValueChange={setActiveTab}>
                <TabsList className="bg-accent gap-4 p-1">
                    <TabsTrigger value="details" className="border-none data-[state=active]:bg-background">
                        <Info className="h-4 w-4 mr-2" />
                        Product Details
                    </TabsTrigger>
                    <TabsTrigger value="leads" className="border-none data-[state=active]:bg-background">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Related Leads
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Product Image */}
                        <Card className="lg:col-span-5">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-lg">Product Image</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 flex justify-center">
                                <div
                                    className="relative w-full aspect-square rounded-md overflow-hidden border bg-muted/20 cursor-pointer group"
                                    onClick={() => setIsImageDialogOpen(true)}
                                >
                                    <img
                                        src={product.imageUrl || "/icons/noimage.png"}
                                        alt={product.productName}
                                        className="object-contain h-full w-full transition-all duration-200 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                                        <Button variant="secondary" size="sm" className="gap-2">
                                            <ZoomIn size={16} /> View Image
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Info */}
                        <div className="lg:col-span-7 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Product Information</CardTitle>
                                    <CardDescription>
                                        Basic details about the product
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Product Name</div>
                                            <div className="font-medium">{product.productName}</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Price</div>
                                            <div className="font-medium text-lg">₹{product?.rate?.toLocaleString()}</div>
                                        </div>

                                        {/* Add barcode display */}
                                        <div className="md:col-span-2 space-y-2 border rounded-md p-4">
                                            <div className="text-sm flex items-center gap-1 text-muted-foreground">
                                                <QrCode className="h-3.5 w-3.5" /> Barcode
                                            </div>
                                            <div className="flex justify-center py-2">
                                                {product.barcode ? (
                                                    <BarcodeDisplay
                                                        value={product.barcode}
                                                        productName={product.productName}
                                                    />
                                                ) : (
                                                    <div className="text-center p-4 border border-dashed rounded-md w-full">
                                                        <p className="text-muted-foreground italic">No barcode assigned to this product</p>

                                                    </div>
                                                )}
                                            </div>

                                            {product.barcode && (
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={printBarcode}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" /> Print Barcode
                                                    </Button>
                                                </div>
                                            )}

                                        </div>


                                        <div className="space-y-2">
                                            <div className="text-sm flex items-center gap-1 text-muted-foreground">
                                                <Barcode className="h-3.5 w-3.5" /> HSN Code
                                            </div>
                                            <div className="font-medium">{product.hsnCode}</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm flex items-center gap-1 text-muted-foreground">
                                                <Layers className="h-3.5 w-3.5" /> Unit
                                            </div>
                                            <div className="font-medium">{product.unit?.name || "N/A"}</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm flex items-center gap-1 text-muted-foreground">
                                                <Percent className="h-3.5 w-3.5" /> Max Discount
                                            </div>
                                            <div className="font-medium">{product.maxDiscount}%</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm flex items-center gap-1 text-muted-foreground">
                                                <Tag className="h-3.5 w-3.5" /> Category
                                            </div>
                                            <div>
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                    {product.category?.name || "N/A"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Description</div>
                                        <div className="text-sm leading-relaxed">
                                            {product.description ? (
                                                product.description
                                            ) : (
                                                <span className="text-muted-foreground italic">No description available</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Lead Summary</CardTitle>
                                    <CardDescription>
                                        Quick overview of leads associated with this product
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                        <div className="bg-muted/50 p-4 rounded-lg text-center">
                                            <div className="text-3xl font-bold">{leads.length}</div>
                                            <div className="text-sm text-muted-foreground">Total Leads</div>
                                        </div>

                                        <div className="bg-muted/50 p-4 rounded-lg text-center">
                                            <div className="text-3xl font-bold">{leads.filter(lead => lead.stage === 'won').length}</div>
                                            <div className="text-sm text-muted-foreground">Won Leads</div>
                                        </div>

                                        <div className="bg-muted/50 p-4 rounded-lg text-center">
                                            <div className="text-3xl font-bold">
                                                ₹{leads?.reduce((sum, lead) => sum + lead.amount, 0)?.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total Amount</div>
                                        </div>

                                        <div className="bg-muted/50 p-4 rounded-lg text-center">
                                            <div className="text-3xl font-bold">
                                                {leads.length > 0 ?
                                                    new Date(Math.max(...leads.map(l => new Date(l.updatedAt).getTime())))?.toLocaleDateString() :
                                                    'N/A'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Last Updated</div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setActiveTab("leads")}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />View All Leads
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="leads" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-lg">Related Leads</CardTitle>
                                <CardDescription>
                                    Leads that include this product in their proposals
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search leads..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 w-full md:w-[200px] lg:w-[300px]"
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={fetchLeads}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredLeads.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                                    <p className="text-muted-foreground max-w-md mb-4">
                                        {searchTerm ?
                                            `We couldn't find any leads matching "${searchTerm}". Try adjusting your search.` :
                                            "This product hasn't been added to any leads yet."}
                                    </p>
                                    {searchTerm && (
                                        <Button variant="outline" onClick={() => setSearchTerm("")}>
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Lead</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Stage</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead>Timeline</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredLeads.map((lead) => (
                                                <TableRow key={lead._id} className="cursor-pointer hover:bg-muted/50">
                                                    <TableCell className="font-medium">{lead.title}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <HoverCard>
                                                                <HoverCardTrigger>
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage
                                                                            src={lead.contact.avatar || ''}
                                                                            alt={`${lead.contact.firstName} ${lead.contact.lastName}`}
                                                                        />
                                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                                            {lead.contact.firstName?.[0]}{lead.contact.lastName?.[0]}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                </HoverCardTrigger>
                                                                <HoverCardContent className="w-80">
                                                                    <div className="flex justify-between space-x-4">
                                                                        <Avatar className="h-12 w-12">
                                                                            <AvatarImage
                                                                                src={lead.contact.avatar || ''}
                                                                                alt={`${lead.contact.firstName} ${lead.contact.lastName}`}
                                                                            />
                                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                                {lead.contact.firstName?.[0]}{lead.contact.lastName?.[0]}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="space-y-1">
                                                                            <h4 className="text-sm font-semibold">
                                                                                {lead.contact.firstName} {lead.contact.lastName}
                                                                            </h4>
                                                                            {lead.contact.email && (
                                                                                <p className="text-sm text-muted-foreground">{lead.contact.email}</p>
                                                                            )}
                                                                            <div className="flex items-center pt-2">
                                                                                <Button variant="outline" size="sm" className="h-7">
                                                                                    View Profile
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </HoverCardContent>
                                                            </HoverCard>
                                                            <span>
                                                                {lead.contact.firstName} {lead.contact.lastName}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={getStageBadgeVariant(lead.stage)}>
                                                            {lead.stage}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        ₹{lead?.amount?.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span>Close Date: {new Date(lead.closeDate).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="h-4 w-4"
                                                                    >
                                                                        <circle cx="12" cy="12" r="1" />
                                                                        <circle cx="12" cy="5" r="1" />
                                                                        <circle cx="12" cy="19" r="1" />
                                                                    </svg>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Navigate to lead details
                                                                        router.push(`/CRM/leads/${lead._id}`);
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Lead
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Image View Dialog */}
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden z-[100]">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Product Image: {product.productName}</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 flex items-center justify-center">
                        <img
                            src={product.imageUrl || "/icons/noimage.png"}
                            alt={product.productName}
                            className="max-h-[70vh] max-w-full object-contain rounded-md"
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            {
                isEditModalOpen && (
                    <EditProduct
                        isOpen={isEditModalOpen}
                        onProductUpdated={() => {
                            fetchProductDetails();
                            fetchLeads();
                        }}
                        setIsOpen={setIsEditModalOpen}
                        product={product as any}
                    />
                )
            }
        </div >
    );
}
