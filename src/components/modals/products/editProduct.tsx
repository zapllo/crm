"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Weight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  _id: string;
  productName: string;
  hsnCode: string;
  category: string;      // storing category _id
  unit: string;          // storing unit _id
  rate: number;
  maxDiscount?: number;
  description?: string;
  // Add other fields if needed (e.g., imageUrl, etc.)
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
      });
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
      <DialogContent className="p-6 z-[100] h-fit overflow-y-auto m-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <Input
            name="productName"
            placeholder="Product Name"
            value={productData.productName}
            onChange={handleChange}
          />

          <Input
            name="hsnCode"
            placeholder="HSN Code"
            value={productData.hsnCode}
            onChange={handleChange}
          />

          {/* ------------- CATEGORY SELECTION ------------- */}
          <div>
            <button
              type="button"
              className="p-2 text-sm flex border items-center bg-transparent justify-between w-full text-start rounded"
              onClick={handleCategoryOpen}
            >
              {popoverCategoryLabel ? (
                popoverCategoryLabel
              ) : (
                <span className="flex items-center text-muted-foreground gap-2">
                  <Tag className="h-4" />
                  Select Category
                </span>
              )}
            </button>
          </div>
          <div className="relative text-sm">
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

          {/* ------------- UNIT SELECTION ------------- */}
          <div>
            <button
              type="button"
              className="p-2 text-sm flex border items-center bg-transparent justify-between w-full text-start rounded"
              onClick={handleUnitOpen}
            >
              {popoverUnitLabel ? (
                popoverUnitLabel
              ) : (
                <span className="flex items-center text-muted-foreground gap-2">
                  <Weight className="h-4" />
                  Select Unit
                </span>
              )}
            </button>
          </div>
          <div className="relative text-sm">
            {unitOpen && (
              <UnitSelectPopup
                units={units}
                unit={productData.unit}
                setUnit={(val) =>
                  setProductData((prev) => ({ ...prev, unit: val }))
                }
                newUnit={newUnit}
                setNewUnit={setNewUnit}
                setUnits={setUnits as any} // type cast just to reuse
                searchUnitQuery={searchUnitQuery}
                setSearchUnitQuery={setSearchUnitQuery}
                onClose={handleCloseUnitPopup}
                closeOnSelect={handleUnitSelect}
              />
            )}
          </div>

          <Input
            name="rate"
            type="number"
            placeholder="Rate"
            value={String(productData.rate)}
            onChange={handleChange}
          />

          <Input
            name="maxDiscount"
            type="number"
            placeholder="Max Discount"
            value={String(productData.maxDiscount ?? "")}
            onChange={handleChange}
          />

          <Textarea
            name="description"
            placeholder="Description"
            className="w-full p-2 rounded bg-transparent text-sm dark:text-white"
            value={productData.description}
            onChange={handleChange}
          />
        </div>

        <Button onClick={handleSubmit} className="mt-4">
          Update Product
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditProduct;

/* ------------------------------------------------------------------
   CategorySelectPopup 
   (Same approach as in AddProduct)
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
      className="absolute dark:bg-[#020713] bg-white border -mt-3  rounded shadow-md p-4 w-full z-50"
    >
      {/* Search Input */}
      <input
        placeholder="Search Categories"
        className="h-8 text-xs px-4 mb-2 w-full border dark:border-border dark:bg-[#282D32]
                   focus:border-[#815bf5] outline-none rounded"
        value={searchCategoryQuery}
        onChange={(e) => setSearchCategoryQuery(e.target.value)}
      />

      {/* Category List */}
      {filteredCats.length === 0 ? (
        <div className="dark:text-white p-2 text-sm">No categories found</div>
      ) : (
        <div className="w-full text-sm text-white max-h-40 overflow-y-scroll scrollbar-hide">
          {filteredCats.map((cat) => (
            <div
              key={cat._id}
              className="cursor-pointer p-2 hover:bg-accent flex items-center mb-1"
              onClick={() => handleSelect(cat._id)}
            >
              <span className="px-2 dark:text-white text-black text-xs">
                {cat.name}
              </span>
              {category === cat._id && (
                <input
                  type="radio"
                  checked={category === cat._id}
                  onChange={() => handleSelect(cat._id)}
                  className="ml-auto"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <div className="flex">
          <input
            placeholder="Create new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-3 py-2 border outline-none bg-transparent rounded w-full
                       text-black dark:text-white focus:border-[#815bf5] text-sm"
          />
          <button
            onClick={handleCreateCategory}
            className="ml-2 bg-[#007A5A] hover:bg-[#15624f] p-2 text-white rounded-full"
          >
            <Plus />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   UnitSelectPopup
   (Same approach as in AddProduct)
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
      className="absolute dark:bg-[#020713] bg-white border -mt-3 rounded shadow-md p-4 w-full z-50"
    >
      {/* Search Input */}
      <input
        placeholder="Search Units"
        className="h-8 text-xs px-4 mb-2 w-full border dark:border-border dark:bg-[#282D32]
                   focus:border-[#815bf5] outline-none rounded"
        value={searchUnitQuery}
        onChange={(e) => setSearchUnitQuery(e.target.value)}
      />

      {/* Unit List */}
      {filteredUnits.length === 0 ? (
        <div className="dark:text-white p-2 text-sm">No units found</div>
      ) : (
        <div className="w-full text-sm text-white max-h-40 overflow-y-scroll scrollbar-hide">
          {filteredUnits.map((u) => (
            <div
              key={u._id}
              className="cursor-pointer p-2 hover:bg-accent flex items-center mb-1"
              onClick={() => handleSelect(u._id)}
            >
              <span className="px-2 dark:text-white text-black text-xs">
                {u.name}
              </span>
              {unit === u._id && (
                <input
                  type="radio"
                  checked={unit === u._id}
                  onChange={() => handleSelect(u._id)}
                  className="ml-auto"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <div className="flex">
          <input
            placeholder="Create new unit"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="px-3 py-2 border outline-none bg-transparent rounded w-full
                       text-black dark:text-white focus:border-[#815bf5] text-sm"
          />
          <button
            onClick={handleCreateUnit}
            className="ml-2 bg-[#007A5A] hover:bg-[#15624f] p-2 text-white rounded-full"
          >
            <Plus />
          </button>
        </div>
      </div>
    </div>
  );
};
