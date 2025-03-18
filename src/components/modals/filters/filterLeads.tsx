"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

// For the left nav sections
interface Section {
    name: string;
  
}

// For the data references
interface TeamUser {
    _id: string;
    firstName: string;
    lastName: string;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;

    // Assigned to (Team members)
    teamMembers: TeamUser[];
    // Stages
    stages: string[];
    // Tags
    tags: string[];
    // Companies
    companies: string[];

    // Already selected
    selectedAssignedTo: string[];
    selectedStages: string[];
    selectedTags: string[];
    selectedCompanies: string[];

    // Callback to apply the filters
    onApply: (filters: {
        assignedTo: string[];
        stages: string[];
        tags: string[];
        companies: string[];
    }) => void;

    // Callback to clear filters
    onClear: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    teamMembers,
    stages,
    tags,
    companies,
    selectedAssignedTo,
    selectedStages,
    selectedTags,
    selectedCompanies,
    onApply,
    onClear,
}) => {
    // Local state for the user’s current selections
    const [tempAssignedTo, setTempAssignedTo] = useState<string[]>(selectedAssignedTo);
    const [tempStages, setTempStages] = useState<string[]>(selectedStages);
    const [tempTags, setTempTags] = useState<string[]>(selectedTags);
    const [tempCompanies, setTempCompanies] = useState<string[]>(selectedCompanies);

    // For the left nav
    const [activeSection, setActiveSection] = useState<string>("Assigned To");
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Re-initialize local states when the modal opens
    useEffect(() => {
        if (isOpen) {
            setTempAssignedTo(selectedAssignedTo);
            setTempStages(selectedStages);
            setTempTags(selectedTags);
            setTempCompanies(selectedCompanies);
            setActiveSection("Assigned To");
            setSearchTerm("");
        }
    }, [
        isOpen,
        selectedAssignedTo,
        selectedStages,
        selectedTags,
        selectedCompanies
    ]);

    // Generic toggle helper
    const toggleItem = (
        item: string,
        collection: string[],
        setCollection: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        if (collection.includes(item)) {
            setCollection(collection.filter((i) => i !== item));
        } else {
            setCollection([...collection, item]);
        }
    };

    // “Apply” the local state to the parent
    const handleApplyFilters = () => {
        onApply({
            assignedTo: tempAssignedTo,
            stages: tempStages,
            tags: tempTags,
            companies: tempCompanies,
        });
        onClose();
    };

    // “Clear” means reset local and call parent’s onClear
    const handleClearFilters = () => {
        setTempAssignedTo([]);
        setTempStages([]);
        setTempTags([]);
        setTempCompanies([]);
        onClear();
    };

    // The left nav sections
    const sections: Section[] = [
        { name: "Assigned To" },
        { name: "Stage" },
        { name: "Tags" },
        { name: "Companies" },
    ];

    // The dynamic right content
    const lowerSearch = searchTerm.toLowerCase();

    const renderRightPanel = () => {
        switch (activeSection) {
            case "Assigned To":
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Search members"
                            className="w-full px-2 py-2 bg-transparent border border-gray-600 outline-none text-white mb-4 rounded-md text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {teamMembers
                                .filter((tm) =>
                                    `${tm.firstName} ${tm.lastName}`
                                        .toLowerCase()
                                        .includes(lowerSearch)
                                )
                                .map((tm) => {
                                    const checked = tempAssignedTo.includes(tm._id);
                                    return (
                                        <label
                                            key={tm._id}
                                            className="flex justify-between cursor-pointer items-center"
                                        >
                                            <div className="flex items-center">
                                                <div className="h-6 w-6 bg-[#815BF5] text-center rounded-full mr-2 text-xs flex items-center justify-center">
                                                    {tm.firstName.slice(0, 1)}
                                                    {tm.lastName.slice(0, 1)}
                                                </div>
                                                <span className="text-xs">
                                                    {tm.firstName} {tm.lastName}
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleItem(tm._id, tempAssignedTo, setTempAssignedTo)
                                                }
                                                className="mr-2 rounded-full"
                                            />
                                        </label>
                                    );
                                })}
                        </div>
                    </div>
                );
            case "Stage":
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Search stages"
                            className="w-full px-2 py-2 bg-transparent border border-gray-600 outline-none text-white mb-4 rounded-md text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {stages
                                .filter((st) => st.toLowerCase().includes(lowerSearch))
                                .map((st) => {
                                    const checked = tempStages.includes(st);
                                    return (
                                        <label
                                            key={st}
                                            className="flex justify-between cursor-pointer items-center"
                                        >
                                            <span className="text-xs">{st}</span>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleItem(st, tempStages, setTempStages)}
                                                className="mr-2 rounded-full"
                                            />
                                        </label>
                                    );
                                })}
                        </div>
                    </div>
                );
            case "Tags":
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Search tags"
                            className="w-full px-2 py-2 bg-transparent border border-gray-600 outline-none text-white mb-4 rounded-md text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {tags
                                .filter((tag) => tag.toLowerCase().includes(lowerSearch))
                                .map((tag) => {
                                    const checked = tempTags.includes(tag);
                                    return (
                                        <label
                                            key={tag}
                                            className="flex justify-between cursor-pointer items-center"
                                        >
                                            <span className="text-xs">{tag}</span>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleItem(tag, tempTags, setTempTags)}
                                                className="mr-2 rounded-full"
                                            />
                                        </label>
                                    );
                                })}
                        </div>
                    </div>
                );
            case "Companies":
                return (
                    <div>
                        <input
                            type="text"
                            placeholder="Search companies"
                            className="w-full px-2 py-2 bg-transparent border border-gray-600 outline-none text-white mb-4 rounded-md text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {companies
                                .filter((co) => co.toLowerCase().includes(lowerSearch))
                                .map((co) => {
                                    const checked = tempCompanies.includes(co);
                                    return (
                                        <label
                                            key={co}
                                            className="flex justify-between cursor-pointer items-center"
                                        >
                                            <span className="text-xs">{co}</span>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleItem(co, tempCompanies, setTempCompanies)
                                                }
                                                className="mr-2 rounded-full"
                                            />
                                        </label>
                                    );
                                })}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="h-fit bg-[#0b0d29] text-white">
                {/* Header */}
                <DialogHeader>
                    <div className="flex justify-between items-center border-b py-4 px-6">
                        <DialogTitle className="text-lg text-white">Filter Leads</DialogTitle>
                        <DialogClose className="text-white hover:bg-white rounded-full hover:text-[#815BF5]">
                            <CrossCircledIcon className="scale-150 cursor-pointer " />
                        </DialogClose>
                    </div>
                </DialogHeader>

                <div className="flex">
                    {/* Left nav with sections */}
                    <div className="border-r h-[300px] -mt-4 min-w-[120px]">
                        <ul className="space-y-2 mt-2 text-xs">
                            {sections.map((section) => (
                                <li
                                    key={section.name}
                                    className={`cursor-pointer text-sm px-8 py-3 w-full flex items-center 
                    ${activeSection === section.name
                                            ? "bg-[#282D32]"
                                            : "hover:bg-[#1f222a]"
                                        }
                  `}
                                    onClick={() => {
                                        setActiveSection(section.name);
                                        setSearchTerm("");
                                    }}
                                >
                                    {/* <img src={section.imgSrc} alt={section.name} className="mr-2 h-4" /> */}
                                    {section.name}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right panel */}
                    <div className="w-[60%] p-4 overflow-y-auto scrollbar-hide" style={{ maxHeight: '400px' }}>
                        {renderRightPanel()}
                    </div>
                </div>

                {/* Footer buttons */}
                <DialogFooter>
                    <div className="flex justify-between px-6 space-x-4 py-4">
                        <Button
                            variant="outline"
                            className="text-xs"
                            onClick={handleClearFilters}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="default"
                            className="bg-[#017a5b] text-white hover:bg-green-600 text-xs"
                            onClick={handleApplyFilters}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FilterModal;
