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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Filter, Search, UserRound, Tag, Building2, GitCommitHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    // Local state for the user's current selections
    const [tempAssignedTo, setTempAssignedTo] = useState<string[]>(selectedAssignedTo);
    const [tempStages, setTempStages] = useState<string[]>(selectedStages);
    const [tempTags, setTempTags] = useState<string[]>(selectedTags);
    const [tempCompanies, setTempCompanies] = useState<string[]>(selectedCompanies);

    // For the active tab and search
    const [activeTab, setActiveTab] = useState<string>("assignedTo");
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Initialize or reset the local states when the modal opens
    useEffect(() => {
        if (isOpen) {
            setTempAssignedTo(selectedAssignedTo);
            setTempStages(selectedStages);
            setTempTags(selectedTags);
            setTempCompanies(selectedCompanies);
            setActiveTab("assignedTo");
            setSearchTerm("");
        }
    }, [
        isOpen,
        selectedAssignedTo,
        selectedStages,
        selectedTags,
        selectedCompanies
    ]);

    // Calculate total number of filters applied
    const totalFiltersApplied = tempAssignedTo.length + tempStages.length + tempTags.length + tempCompanies.length;

    // Generic toggle helper
    // Update the toggleItem function to properly handle state
    const toggleItem = (
        item: string,
        collection: string[],
        setCollection: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setCollection(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };
    // "Apply" the local state to the parent
    const handleApplyFilters = () => {
        onApply({
            assignedTo: tempAssignedTo,
            stages: tempStages,
            tags: tempTags,
            companies: tempCompanies,
        });
        onClose();
    };

    // "Clear" means reset local and call parent's onClear
    const handleClearFilters = () => {
        setTempAssignedTo([]);
        setTempStages([]);
        setTempTags([]);
        setTempCompanies([]);
        onClear();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className=" h-fit z-[100] p-0 gap-0 bg-background">
                {/* Header */}
                <DialogHeader className="px-6 py-3 border-b sticky top-0 bg-background z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <DialogTitle className="text-lg">Filter Leads</DialogTitle>
                            {totalFiltersApplied > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {totalFiltersApplied} active
                                </Badge>
                            )}
                        </div>
                        <DialogClose className="rounded-full hover:bg-muted">
                            <CrossCircledIcon className="scale-125 cursor-pointer" />
                        </DialogClose>
                    </div>
                </DialogHeader>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Tabs for mobile, sidebar for desktop */}
                    <div className="md:hidden w-full border-b">
                        <Tabs defaultValue="assignedTo" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-4 w-full">
                                <TabsTrigger value="assignedTo" className="text-xs">
                                    Team
                                    {tempAssignedTo.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                            {tempAssignedTo.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="stages" className="text-xs">
                                    Stages
                                    {tempStages.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                            {tempStages.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="tags" className="text-xs">
                                    Tags
                                    {tempTags.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                            {tempTags.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="companies" className="text-xs">
                                    Companies
                                    {tempCompanies.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                            {tempCompanies.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Sidebar Navigation (hidden on mobile) */}
                    <div className="hidden md:block w-56 border-r h-full bg-muted/30">
                        <div className="space-y-1 p-2">
                            {[
                                { id: "assignedTo", label: "Team Members", icon: <UserRound className="h-4 w-4" />, count: tempAssignedTo.length },
                                { id: "stages", label: "Stages", icon: <GitCommitHorizontal className="h-4 w-4" />, count: tempStages.length },
                                { id: "tags", label: "Tags", icon: <Tag className="h-4 w-4" />, count: tempTags.length },
                                { id: "companies", label: "Companies", icon: <Building2 className="h-4 w-4" />, count: tempCompanies.length }
                            ].map((item) => (
                                <Button
                                    key={item.id}
                                    variant={activeTab === item.id ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start text-left",
                                        activeTab === item.id ? "bg-secondary" : ""
                                    )}
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {item.count > 0 && (
                                        <Badge
                                            variant={activeTab === item.id ? "default" : "secondary"}
                                            className="ml-auto"
                                        >
                                            {item.count}
                                        </Badge>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden">
                        <div className="flex flex-col h-full">
                            {/* Search input */}
                            <div className="p-4 border-b">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder={`Search ${activeTab === "assignedTo" ? "members" : activeTab}...`}
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Content based on selected tab */}
                            <ScrollArea className="flex-1 p-4">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-2"
                                    >
                                        {/* Team Members */}
                                        {activeTab === "assignedTo" && (
                                            <div className="space-y-2">
                                                {teamMembers
                                                    .filter(tm =>
                                                        `${tm.firstName} ${tm.lastName}`
                                                            .toLowerCase()
                                                            .includes(searchTerm.toLowerCase())
                                                    )
                                                    .map(tm => (
                                                        <div
                                                            key={tm._id}
                                                            className={cn(
                                                                "flex items-center justify-between p-3 rounded-md",
                                                                tempAssignedTo.includes(tm._id)
                                                                    ? "bg-primary/10 border border-primary/20"
                                                                    : "hover:bg-muted border border-transparent"
                                                            )}
                                                            onClick={() => toggleItem(tm._id, tempAssignedTo, setTempAssignedTo)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback className="bg-primary/20 text-primary">
                                                                        {tm.firstName.charAt(0)}{tm.lastName.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span>{tm.firstName} {tm.lastName}</span>
                                                            </div>
                                                            <Checkbox
                                                                checked={tempAssignedTo.includes(tm._id)}
                                                                onCheckedChange={() => toggleItem(tm._id, tempAssignedTo, setTempAssignedTo)}
                                                            />
                                                        </div>
                                                    ))}
                                                {teamMembers.filter(tm =>
                                                    `${tm.firstName} ${tm.lastName}`
                                                        .toLowerCase()
                                                        .includes(searchTerm.toLowerCase())
                                                ).length === 0 && (
                                                        <div className="text-center p-8 text-muted-foreground">
                                                            No team members found matching your search
                                                        </div>
                                                    )}
                                            </div>
                                        )}

                                        {/* Stages */}
                                        {activeTab === "stages" && (
                                            <div className="space-y-2">
                                                {stages
                                                    .filter(stage =>
                                                        stage.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map(stage => (
                                                        <div
                                                            key={stage}
                                                            className={cn(
                                                                "flex items-center justify-between p-3 rounded-md",
                                                                tempStages.includes(stage)
                                                                    ? "bg-primary/10 border border-primary/20"
                                                                    : "hover:bg-muted border border-transparent"
                                                            )}
                                                            onClick={() => toggleItem(stage, tempStages, setTempStages)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                                                <span>{stage}</span>
                                                            </div>
                                                            <Checkbox
                                                                checked={tempStages.includes(stage)}
                                                                onCheckedChange={() => toggleItem(stage, tempStages, setTempStages)}
                                                            />
                                                        </div>
                                                    ))}
                                                {stages.filter(stage =>
                                                    stage.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).length === 0 && (
                                                        <div className="text-center p-8 text-muted-foreground">
                                                            No stages found matching your search
                                                        </div>
                                                    )}
                                            </div>
                                        )}

                                        {/* Tags */}
                                        {activeTab === "tags" && (
                                            <div className="space-y-2">
                                                {tags
                                                    .filter(tag =>
                                                        tag.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map(tag => (
                                                        <div
                                                            key={tag}
                                                            className={cn(
                                                                "flex items-center justify-between p-3 rounded-md",
                                                                tempTags.includes(tag)
                                                                    ? "bg-primary/10 border border-primary/20"
                                                                    : "hover:bg-muted border border-transparent"
                                                            )}
                                                            onClick={() => toggleItem(tag, tempTags, setTempTags)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="outline" className="bg-muted/50">
                                                                    <Tag className="h-3 w-3 mr-1" />
                                                                    {tag}
                                                                </Badge>
                                                            </div>
                                                            <Checkbox
                                                                checked={tempTags.includes(tag)}
                                                                onCheckedChange={() => toggleItem(tag, tempTags, setTempTags)}
                                                            />
                                                        </div>
                                                    ))}
                                                {tags.filter(tag =>
                                                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).length === 0 && (
                                                        <div className="text-center p-8 text-muted-foreground">
                                                            No tags found matching your search
                                                        </div>
                                                    )}
                                            </div>
                                        )}

                                        {/* Companies */}
                                        {activeTab === "companies" && (
                                            <div className="space-y-2">
                                                {companies
                                                    .filter(company =>
                                                        company.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map(company => (
                                                        <div
                                                            key={company}
                                                            className={cn(
                                                                "flex items-center justify-between p-3 rounded-md",
                                                                tempCompanies.includes(company)
                                                                    ? "bg-primary/10 border border-primary/20"
                                                                    : "hover:bg-muted border border-transparent"
                                                            )}
                                                            onClick={() => toggleItem(company, tempCompanies, setTempCompanies)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                <span>{company}</span>
                                                            </div>
                                                            <Checkbox
                                                                checked={tempCompanies.includes(company)}
                                                                onCheckedChange={() => toggleItem(company, tempCompanies, setTempCompanies)}
                                                            />
                                                        </div>
                                                    ))}
                                                {companies.filter(company =>
                                                    company.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).length === 0 && (
                                                        <div className="text-center p-8 text-muted-foreground">
                                                            No companies found matching your search
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                {/* Filter Summary Bar */}
                <div className="p-4 border-t">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tempAssignedTo.length > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <UserRound className="h-3 w-3" />
                                {tempAssignedTo.length} Team {tempAssignedTo.length === 1 ? 'Member' : 'Members'}
                            </Badge>
                        )}
                        {tempStages.length > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <GitCommitHorizontal className="h-3 w-3" />
                                {tempStages.length} {tempStages.length === 1 ? 'Stage' : 'Stages'}
                            </Badge>
                        )}
                        {tempTags.length > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {tempTags.length} {tempTags.length === 1 ? 'Tag' : 'Tags'}
                            </Badge>
                        )}
                        {tempCompanies.length > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {tempCompanies.length} {tempCompanies.length === 1 ? 'Company' : 'Companies'}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Footer buttons */}
                <DialogFooter className="px-6 py-4 border-t">
                    <div className="flex justify-between w-full gap-4">
                        <Button
                            variant="outline"
                            onClick={handleClearFilters}
                            className="flex-1 sm:flex-none"
                        >
                            Clear All
                        </Button>
                        <Button
                            variant="default"
                            className="flex-1 sm:flex-none flex items-center gap-2"
                            onClick={handleApplyFilters}
                        >
                            <Check className="h-4 w-4" />
                            Apply Filters
                            {totalFiltersApplied > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {totalFiltersApplied}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FilterModal;