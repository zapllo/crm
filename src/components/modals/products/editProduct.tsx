"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Plus, Tag, Weight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Product {
  _id: string;
  productName: string;
  hsnCode: string;
  category: string;      // storing category _id
  unit: string;          // storing unit _id
  rate: number;
  maxDiscount?: number;
  description?: string;
  imageUrl?: string;
}

interface EditProductProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  product: Product | null;
  onProductUpdated: () => void;
}

/** Category and Unit interfaces */
interface ICategory {
  _id: string;
  name: string;
}
interface IUnit {
  _id: string;
  name: string;
}

const EditProduct: React.FC<EditProductProps> = ({
  isOpen,
  setIsOpen,
  product,
  onProductUpdated,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Main form data for text fields
  const [productData, setProductData] = useState<Omit<Product, "_id">>({
    productName: "",
    hsnCode: "",
    category: "",
    unit: "",
    rate: 0,
    maxDiscount: 0,
    description: "",
  });

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Categories popup state
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");
  const [popoverCategoryLabel, setPopoverCategoryLabel] = useState(""); // Shown in the button

  // Units popup state
  const [units, setUnits] = useState<IUnit[]>([]);
  const [unitOpen, setUnitOpen] = useState(false);
  const [newUnit, setNewUnit] = useState("");
  const [searchUnitQuery, setSearchUnitQuery] = useState("");
  const [popoverUnitLabel, setPopoverUnitLabel] = useState(""); // Shown in the button

  // --- Load categories & units on mount ---
  useEffect(() => {
    (async () => {
      try {
        const [catRes, unitRes] = await Promise.all([
          axios.get("/api/categories"),
          axios.get("/api/units"),
        ]);
        setCategories(catRes.data);
        setUnits(unitRes.data);
      } catch (error) {
        console.error("Error fetching categories/units:", error);
      }
    })();
  }, []);

  // --- Whenever the `product` changes or categories/units load, populate fields ---
  useEffect(() => {
    if (product) {
      setProductData({
        productName: product.productName ?? "",
        hsnCode: product.hsnCode ?? "",
        category: product.category ?? "",
        unit: product.unit ?? "",
        rate: product.rate ?? 0,
        maxDiscount: product.maxDiscount ?? 0,
        description: product.description ?? "",
        imageUrl: product.imageUrl,
      });

      if (product.imageUrl) {
        setImageUrl(product.imageUrl);
      }
    }
  }, [product]);

  // --- Sync the displayed category label when categories load or product changes ---
  useEffect(() => {
    if (product && categories.length > 0) {
      const cat = categories.find((c) => c._id === product.category);
      if (cat) {
        setPopoverCategoryLabel(cat.name);
      } else {
        setPopoverCategoryLabel("");
      }
    }
  }, [product, categories]);

  // --- Sync the displayed unit label when units load or product changes ---
  useEffect(() => {
    if (product && units.length > 0) {
      const u = units.find((u) => u._id === product.unit);
      if (u) {
        setPopoverUnitLabel(u.name);
      } else {
        setPopoverUnitLabel("");
      }
    }
  }, [product, units]);

  // --- Generic input handler for text fields ---
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('files', files[0]);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setUploadProgress(100);

      if (data.fileUrls && data.fileUrls.length > 0) {
        setImageUrl(data.fileUrls[0]);
        toast({
          title: "Image uploaded successfully",
        });
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImageUrl(null);
  };

  // --- Submit the updated product data ---
  const handleSubmit = async () => {
    if (!product?._id) {
      return;
    }
    try {
      // The final payload, ensuring `rate` & `maxDiscount` are numbers
      const payload = {
        ...productData,
        rate: Number(productData.rate),
        maxDiscount: Number(productData.maxDiscount),
        imageUrl: imageUrl,
      };
      await axios.patch(`/api/products/${product._id}`, payload);
      toast({ title: "Product updated successfully" });
      onProductUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error updating product",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // --- Category popup toggles ---
  const handleCategoryOpen = () => setCategoryOpen(true);
  const handleCloseCategoryPopup = () => setCategoryOpen(false);

  // When an item is actually chosen from the popup
  const handleCategorySelect = (categoryName: string) => {
    setPopoverCategoryLabel(categoryName);
    setCategoryOpen(false);
  };

  // --- Unit popup toggles ---
  const handleUnitOpen = () => setUnitOpen(true);
  const handleCloseUnitPopup = () => setUnitOpen(false);

  // When an item is chosen from the popup
  const handleUnitSelect = (unitName: string) => {
    setPopoverUnitLabel(unitName);
    setUnitOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl z-[100]">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="text-xl font-semibold">Edit Product</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Update product details, price, and other information
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="Enter product name"
                  value={productData.productName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  name="hsnCode"
                  placeholder="Enter HSN code"
                  value={productData.hsnCode}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-3 py-2 border rounded-md text-sm bg-background hover:bg-accent/40 transition-colors"
                  onClick={handleCategoryOpen}
                >
                  {popoverCategoryLabel ? (
                    <span>{popoverCategoryLabel}</span>
                  ) : (
                    <span className="flex items-center text-muted-foreground gap-2">
                      <Tag className="h-4 w-4" />
                      Select Category
                    </span>
                  )}
                </button>
                <div className="relative">
                  {categoryOpen && (
                    <CategorySelectPopup
                      categories={categories}
                      category={productData.category}
                      setCategory={(val) =>
                        setProductData((prev) => ({ ...prev, category: val }))
                      }
                      newCategory={newCategory}
                      setNewCategory={setNewCategory}
                      setCategories={setCategories}
                      searchCategoryQuery={searchCategoryQuery}
                      setSearchCategoryQuery={setSearchCategoryQuery}
                      onClose={handleCloseCategoryPopup}
                      closeOnSelect={handleCategorySelect}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-3 py-2 border rounded-md text-sm bg-background hover:bg-accent/40 transition-colors"
                  onClick={handleUnitOpen}
                >
                  {popoverUnitLabel ? (
                    <span>{popoverUnitLabel}</span>
                  ) : (
                    <span className="flex items-center text-muted-foreground gap-2">
                      <Weight className="h-4 w-4" />
                      Select Unit
                    </span>
                  )}
                </button>
                <div className="relative">
                  {unitOpen && (
                    <UnitSelectPopup
                      units={units}
                      unit={productData.unit}
                      setUnit={(val) =>
                        setProductData((prev) => ({ ...prev, unit: val }))
                      }
                      newUnit={newUnit}
                      setNewUnit={setNewUnit}
                      setUnits={setUnits as any}
                      searchUnitQuery={searchUnitQuery}
                      setSearchUnitQuery={setSearchUnitQuery}
                      onClose={handleCloseUnitPopup}
                      closeOnSelect={handleUnitSelect}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  placeholder="Enter rate"
                  value={String(productData.rate)}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Maximum Discount (%)</Label>
                <Input
                  id="maxDiscount"
                  name="maxDiscount"
                  type="number"
                  placeholder="Enter maximum discount"
                  value={String(productData.maxDiscount ?? "")}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter product description"
                  className="min-h-[100px] resize-y"
                  value={productData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="product-image">Product Image</Label>
            {imageUrl ? (
              <div className="relative">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-video w-full">
                      <img
                        src={imageUrl}
                        alt="Product"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="product-image"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  className="border-2 border-dashed rounded-md p-6 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload a product image
                    </p>
                  </div>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-center mt-1">
                      {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Update Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProduct;

/* ------------------------------------------------------------------
   CategorySelectPopup
-------------------------------------------------------------------- */
interface CategorySelectPopupProps {
  categories: ICategory[];
  category: string; // currently selected category _id
  setCategory: (val: string) => void;

  newCategory: string;
  setNewCategory: React.Dispatch<React.SetStateAction<string>>;
  setCategories: React.Dispatch<React.SetStateAction<ICategory[]>>;

  searchCategoryQuery: string;
  setSearchCategoryQuery: React.Dispatch<React.SetStateAction<string>>;

  onClose: () => void;
  closeOnSelect: (categoryName: string) => void;
}

const CategorySelectPopup: React.FC<CategorySelectPopupProps> = ({
  categories,
  category,
  setCategory,
  newCategory,
  setNewCategory,
  setCategories,
  searchCategoryQuery,
  setSearchCategoryQuery,
  onClose,
  closeOnSelect,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Filter the categories by the search query
  const filteredCats = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategoryQuery.toLowerCase())
  );

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // When user selects a category from the list
  const handleSelect = (selectedId: string) => {
    const selected = categories.find((cat) => cat._id === selectedId);
    if (selected) {
      setCategory(selected._id); // store the chosen category's _id
      closeOnSelect(selected.name);
    }
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const response = await axios.post("/api/categories", {
        name: newCategory,
      });
      if (response.status === 201) {
        // Add the new category to the local list
        setCategories((prev) => [...prev, response.data]);
        setNewCategory("");
      } else {
        console.error("Error creating category:", response.data.error);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute z-50 w-full bg-popover border shadow-lg rounded-md mt-1 py-2 animate-in fade-in-0 zoom-in-95"
    >
      <div className="px-3 pb-2">
        <div className="relative">
          <input
            placeholder="Search Category"
            className="h-9 w-full px-4 rounded-md border bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchCategoryQuery}
            onChange={(e) => setSearchCategoryQuery(e.target.value)}
          />
          <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Category List */}
      <div className="max-h-[200px] overflow-y-auto py-1">
        {filteredCats.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No categories found
          </div>
        ) : (
          filteredCats.map((cat) => (
            <div
              key={cat._id}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center ${
                category === cat._id ? "bg-accent" : "hover:bg-accent"
              }`}
              onClick={() => handleSelect(cat._id)}
            >
              <span>{cat.name}</span>
              {category === cat._id && (
                <div className="ml-auto flex h-4 w-4 items-center justify-center">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Separator className="my-2" />

      <div className="px-3 pt-1">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Create new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="h-8 text-sm"
          />
          <Button
            onClick={handleCreateCategory}
            size="sm"
            className="h-8 px-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   UnitSelectPopup
-------------------------------------------------------------------- */
interface UnitSelectPopupProps {
  units: IUnit[];
  unit: string; // currently selected unit _id
  setUnit: (val: string) => void;

  newUnit: string;
  setNewUnit: React.Dispatch<React.SetStateAction<string>>;
  setUnits: React.Dispatch<React.SetStateAction<IUnit[]>>;

  searchUnitQuery: string;
  setSearchUnitQuery: React.Dispatch<React.SetStateAction<string>>;

  onClose: () => void;
  closeOnSelect: (unitName: string) => void;
}

const UnitSelectPopup: React.FC<UnitSelectPopupProps> = ({
  units,
  unit,
  setUnit,
  newUnit,
  setNewUnit,
  setUnits,
  searchUnitQuery,
  setSearchUnitQuery,
  onClose,
  closeOnSelect,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Filter the units by the search query
  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(searchUnitQuery.toLowerCase())
  );

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // When user selects a unit from the list
  const handleSelect = (selectedId: string) => {
    const selected = units.find((u) => u._id === selectedId);
    if (selected) {
      setUnit(selected._id);
      closeOnSelect(selected.name);
    }
  };

  // Create new unit
  const handleCreateUnit = async () => {
    if (!newUnit.trim()) return;
    try {
      const response = await axios.post("/api/units", {
        name: newUnit,
      });
      if (response.status === 201) {
        setUnits((prev) => [...prev, response.data]);
        setNewUnit("");
      } else {
        console.error("Error creating unit:", response.data.error);
      }
    } catch (error) {
      console.error("Error creating unit:", error);
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute z-50 w-full bg-popover border shadow-lg rounded-md mt-1 py-2 animate-in fade-in-0 zoom-in-95"
    >
      <div className="px-3 pb-2">
        <div className="relative">
          <input
            placeholder="Search Unit"
            className="h-9 w-full px-4 rounded-md border bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchUnitQuery}
            onChange={(e) => setSearchUnitQuery(e.target.value)}
          />
          <Weight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Unit List */}
      <div className="max-h-[200px] overflow-y-auto py-1">
        {filteredUnits.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No units found
          </div>
        ) : (
          filteredUnits.map((u) => (
            <div
              key={u._id}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center ${
                unit === u._id ? "bg-accent" : "hover:bg-accent"
              }`}
              onClick={() => handleSelect(u._id)}
            >
              <span>{u.name}</span>
              {unit === u._id && (
                <div className="ml-auto flex h-4 w-4 items-center justify-center">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Separator className="my-2" />

      <div className="px-3 pt-1">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Create new unit"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="h-8 text-sm"
          />
          <Button
            onClick={handleCreateUnit}
            size="sm"
            className="h-8 px-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
