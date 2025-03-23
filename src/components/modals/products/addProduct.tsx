'use client';

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Weight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

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
    const [category, setCategory] = useState("");                // selected source's ID
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [sourceOpen, setSourceOpen] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [searchCategoryQuery, setSearchCategoryQuery] = useState("");

    // For display, if you want to show the name of the selected source:
    const [popoverSourceInputValue, setPopoverSourceInputValue] = useState("");
    const [unit, setUnit] = useState("");                // selected source's ID
    const [units, setUnits] = useState<IUnit[]>([]);
    const [unitOpen, setUnitOpen] = useState(false);
    const [newUnit, setNewUnit] = useState("");
    const [searchUnitQuery, setSearchUnitQuery] = useState("");

    // For display, if you want to show the name of the selected source:
    const [popoverUnitInputValue, setPopoverUnitInputValue] = useState("");


    function handleSourceOpen() {
        setSourceOpen(true);
    }
    function handleCloseSourcePopup() {
        setSourceOpen(false);
    }
    function handleSourceClose(selectedName: string) {
        setPopoverSourceInputValue(selectedName); // e.g. "Website", "Referral"
        setSourceOpen(false);
    }


    function handleUnitOpen() {
        setUnitOpen(true);
    }
    function handleCloseUnitPopup() {
        setUnitOpen(false);
    }
    function handleUnitClose(selectedName: string) {
        setPopoverUnitInputValue(selectedName); // e.g. "Website", "Referral"
        setUnitOpen(false);
    }


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...productData,
                category: category || undefined,
                unit: unit || undefined,
            };

            await axios.post('/api/products', payload);
            setIsOpen(false);
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    async function fetchAllDropdownData() {
        const categoriesRes = await axios.get("/api/categories");
        const unitRes = await axios.get("/api/units");
        setCategories(categoriesRes.data);
        setUnits(unitRes.data);
    }
    useEffect(() => {
        fetchAllDropdownData(); // fetch contacts, products, and also sources
    }, []);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className='p-6 z-[100] h-fit  overflow-y-scroll scrollbar-hide m-auto'>

                <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                </DialogHeader>
                <div className='space-y-4 text-sm'>
                    <Input label="Product Name" name="productName" onChange={handleChange} />
                    <Input label="HSN Code" name="hsnCode" onChange={handleChange} />
                    <div>
                        <button
                            type="button"
                            className="p-2 text-sm flex border items-center bg-transparent justify-between w-full text-start rounded"
                            onClick={handleSourceOpen}
                        >
                            {popoverSourceInputValue ? (
                                popoverSourceInputValue
                            ) : (
                                <span className="flex  items-center text-muted-foreground gap-2">
                                    {/* your icon, e.g. <Tag className="h-4" /> or similar */}
                                    <Tag className="h-4" />  Select Category
                                </span>
                            )}
                            {/* The down caret icon: <CaretDownIcon /> or anything you like */}
                        </button>
                    </div>
                    <div className='relative text-sm'>
                        {/* Conditionally render the popup */}
                        {sourceOpen && (
                            <CategorySelectPopup
                                categories={categories}
                                category={category}
                                setCategory={setCategory}
                                newCategory={newCategory}
                                setCategories={setCategories}
                                setNewCategory={setNewCategory}
                                searchCategoryQuery={searchCategoryQuery}
                                setSearchCategoryQuery={setSearchCategoryQuery}
                                onClose={handleCloseSourcePopup}
                                closeOnSelect={handleSourceClose}
                            // role={user?.role}
                            />
                        )}
                    </div>
                    <div>
                        <button
                            type="button"
                            className="p-2 text-sm flex border items-center bg-transparent justify-between w-full text-start rounded"
                            onClick={handleUnitOpen}
                        >
                            {popoverUnitInputValue ? (
                                popoverUnitInputValue
                            ) : (
                                <span className="flex  items-center text-muted-foreground gap-2">
                                    {/* your icon, e.g. <Tag className="h-4" /> or similar */}
                                    <Weight className="h-4" />  Select Unit
                                </span>
                            )}
                            {/* The down caret icon: <CaretDownIcon /> or anything you like */}
                        </button>
                    </div>
                    <div className='relative text-sm'>
                        {/* Conditionally render the popup */}
                        {unitOpen && (
                            <UnitSelectPopup
                                units={units}
                                unit={unit}
                                setUnit={setUnit}
                                newUnit={newUnit}
                                setUnits={setUnits}
                                setNewUnit={setNewUnit}
                                searchUnitQuery={searchUnitQuery}
                                setSearchUnitQuery={setSearchUnitQuery}
                                onClose={handleCloseUnitPopup}
                                closeOnSelect={handleUnitClose}
                            // role={user?.role}
                            />
                        )}
                    </div>
                    <Input label="Rate" name="rate" type="number" onChange={handleChange} />
                    <Input label="Max Discount" name="maxDiscount" type="number" onChange={handleChange} />
                    <Textarea
                        name="description"
                        label="Description"
                        className="w-full p-2 rounded bg-transparent text-sm dark:text-white "
                        onChange={handleChange}
                    />
                </div>
                <Button onClick={handleSubmit}>Add Product</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddProduct;
interface ICategory {
    _id: string;
    name: string;
}

interface IUnit {
    _id: string;
    name: string;
}

interface SourceSelectPopupProps {
    categories: ICategory[];
    category: string;                // the currently selected source _id (or name)
    setCategory: (val: string) => void;

    newCategory: string;
    setNewCategory: React.Dispatch<React.SetStateAction<string>>;
    setCategories: React.Dispatch<React.SetStateAction<ICategory[]>>;

    searchCategoryQuery: string;
    setSearchCategoryQuery: React.Dispatch<React.SetStateAction<string>>;

    onClose: () => void;
    closeOnSelect: (sourceName: string) => void;
}

const CategorySelectPopup: React.FC<SourceSelectPopupProps> = ({
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
    const { toast } = useToast();

    // Filter the sources by the search query
    const filteredSources = categories.filter((src) =>
        src.name.toLowerCase().includes(searchCategoryQuery.toLowerCase())
    );

    // When user selects a source from the list
    const handleSelectSource = (selectedSourceId: string) => {
        const selected = categories.find((src) => src._id === selectedSourceId);
        if (selected) {
            setCategory(selected._id);          // store the chosen source's _id
            closeOnSelect(selected.name);     // to show in the button label, e.g.
        }
    };

    // Create new source
    const handleCreateSource = async () => {
        if (!newCategory.trim()) return;
        try {
            // your API endpoint for new category creation. e.g. /api/categories
            const response = await axios.post("/api/categories", {
                name: newCategory,
                // orgId: ...
            });
            if (response.status === 201) {
                // Add the new source to the local list
                setCategories((prev) => [...prev, response.data]);
                setNewCategory("");
                // toast.success("Source Created Successfully!");
            } else {
                console.error("Error creating source:", response.data.error);
            }
        } catch (error) {
            console.error("Error creating source:", error);
        }
    };

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


    return (
        <div
            ref={popupRef}
            className="absolute dark:bg-[#020713] bg-white border -mt-3  rounded shadow-md p-4 w-[100%]  z-50"
        >
            {/* Search Input */}
            <input
                placeholder="Search Sources"
                className="h-8 text-xs px-4 mb-2 w-full
                     border dark:border-border dark:bg-[#282D32]
                     focus:border-[#815bf5] outline-none rounded"
                value={searchCategoryQuery}
                onChange={(e) => setSearchCategoryQuery(e.target.value)}
            />

            {/* Source List */}
            {filteredSources?.length === 0 ? (
                <div className="dark:text-white p-2 text-sm">No categories found</div>
            ) : (
                <div className="w-full text-sm text-white max-h-40 overflow-y-scroll scrollbar-hide">
                    {filteredSources?.map((src) => (
                        <div
                            key={src._id}
                            className="cursor-pointer p-2 hover:bg-accent flex items-center mb-1"
                            onClick={() => handleSelectSource(src._id)}
                        >
                            <span className="px-2 dark:text-white text-black text-xs">
                                {src.name}
                            </span>
                            {/* Radio or check if it's currently selected */}
                            {category === src._id && (
                                <input
                                    type="radio"
                                    name="source"
                                    checked={category === src._id}
                                    onChange={() => handleSelectSource(src._id)}
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
                        className="px-3 py-2 border outline-none bg-transparent rounded w-full text-black dark:text-white focus:border-[#815bf5] text-sm"
                    />
                    <button
                        onClick={handleCreateSource}
                        className="ml-2 bg-[#007A5A] hover:bg-[#15624f] p-2 
                           text-white rounded-full"
                    >
                        <Plus className="" />
                    </button>
                </div>
            </div>
        </div>
    );
};


interface UnitSelectPopupProps {
    units: IUnit[];
    unit: string;                // the currently selected source _id (or name)
    setUnit: (val: string) => void;

    newUnit: string;
    setNewUnit: React.Dispatch<React.SetStateAction<string>>;
    setUnits: React.Dispatch<React.SetStateAction<ICategory[]>>;

    searchUnitQuery: string;
    setSearchUnitQuery: React.Dispatch<React.SetStateAction<string>>;

    onClose: () => void;
    closeOnSelect: (sourceName: string) => void;
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
    const { toast } = useToast();

    // Filter the sources by the search query
    const filteredSources = units.filter((src) =>
        src.name.toLowerCase().includes(searchUnitQuery.toLowerCase())
    );

    // When user selects a source from the list
    const handleSelectSource = (selectedSourceId: string) => {
        const selected = units.find((src) => src._id === selectedSourceId);
        if (selected) {
            setUnit(selected._id);          // store the chosen source's _id
            closeOnSelect(selected.name);     // to show in the button label, e.g.
        }
    };

    // Create new source
    const handleCreateSource = async () => {
        if (!newUnit.trim()) return;
        try {
            // your API endpoint for new category creation. e.g. /api/categories
            const response = await axios.post("/api/units", {
                name: newUnit,
                // orgId: ...
            });
            if (response.status === 201) {
                // Add the new source to the local list
                setUnits((prev) => [...prev, response.data]);
                setNewUnit("");
                // toast.success("Source Created Successfully!");
            } else {
                console.error("Error creating source:", response.data.error);
            }
        } catch (error) {
            console.error("Error creating source:", error);
        }
    };

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


    return (
        <div
            ref={popupRef}
            className="absolute dark:bg-[#020713] bg-white border -mt-3  rounded shadow-md p-4 w-[100%]  z-50"
        >
            {/* Search Input */}
            <input
                placeholder="Search Units"
                className="h-8 text-xs px-4 mb-2 w-full
                     border dark:border-border dark:bg-[#282D32]
                     focus:border-[#815bf5] outline-none rounded"
                value={searchUnitQuery}
                onChange={(e) => setSearchUnitQuery(e.target.value)}
            />

            {/* Source List */}
            {filteredSources?.length === 0 ? (
                <div className="dark:text-white p-2 text-sm">No Units found</div>
            ) : (
                <div className="w-full text-sm text-white max-h-40 overflow-y-scroll scrollbar-hide">
                    {filteredSources?.map((src) => (
                        <div
                            key={src._id}
                            className="cursor-pointer p-2 hover:bg-accent flex items-center mb-1"
                            onClick={() => handleSelectSource(src._id)}
                        >
                            <span className="px-2 dark:text-white text-black text-xs">
                                {src.name}
                            </span>
                            {/* Radio or check if it's currently selected */}
                            {unit === src._id && (
                                <input
                                    type="radio"
                                    name="source"
                                    checked={unit === src._id}
                                    onChange={() => handleSelectSource(src._id)}
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
                        className="px-3 py-2 border outline-none bg-transparent rounded w-full text-black dark:text-white focus:border-[#815bf5] text-sm"
                    />
                    <button
                        onClick={handleCreateSource}
                        className="ml-2 bg-[#007A5A] hover:bg-[#15624f] p-2 
                           text-white rounded-full"
                    >
                        <Plus className="" />
                    </button>
                </div>
            </div>
        </div>
    );
};