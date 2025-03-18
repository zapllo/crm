'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogClose,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import CreatePipelineForm from "@/components/modals/pipelines/pipelineModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { Pencil, Trash2 } from "lucide-react";
import EditPipelineForm from "@/components/modals/pipelines/editPipelineModal";
import AddFieldForm from "@/components/modals/pipelines/addFieldModal";
import EditFieldForm from "@/components/modals/pipelines/editFieldModal";
import EditTagModal from "@/components/modals/leadTags/editLeadTagModal";
import AddTagModal from "@/components/modals/leadTags/addLeadTagModal";

interface CustomField {
    name: string;
    type: "Text" | "Date" | "Number" | "MultiSelect";
    options?: string[];
}

interface Pipeline {
    _id: string;
    name: string;
    openStages: string[];
    closeStages: string[];
    customFields: CustomField[];
}

interface Tag {
    _id: string;
    name: string;
    color: string;
}

export default function CustomizePage() {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("pipelines");
    const [previousTab, setPreviousTab] = useState<string | null>(null);
    const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right");

    const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // States for Lead Custom Fields
    const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
    const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
    const [currentField, setCurrentField] = useState<CustomField | null>(null);

    const [filterPipelineId, setFilterPipelineId] = useState<string | null>(""); // State for dropdown filter
    const [tags, setTags] = useState<Tag[]>([]);
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
    const [currentTag, setCurrentTag] = useState<Tag | null>(null);

    const fetchTags = async () => {
        try {
            const response = await axios.get("/api/tags");
            setTags(response.data);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const handleDeleteTag = async (id: string) => {
        try {
            await axios.delete(`/api/tags/${id}`);
            fetchTags();
        } catch (error) {
            console.error("Failed to delete tag:", error);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleFilterChange = (pipelineId: string) => {
        setFilterPipelineId(pipelineId);
    };


    const openEditModal = (pipeline: Pipeline) => {
        setSelectedPipeline(pipeline);
        setIsEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setIsEditDialogOpen(false);
        setSelectedPipeline(null);
    };

    const handleEditField = (field: CustomField) => {
        setCurrentField(field);
        setIsEditFieldDialogOpen(true);
    };

    const handleDeleteField = async (fieldIndex: number) => {
        if (!selectedPipeline) return;
        try {
            const updatedFields = selectedPipeline.customFields.filter(
                (_, index) => index !== fieldIndex
            );
            await axios.patch(`/api/pipelines/${selectedPipeline._id}`, {
                customFields: updatedFields,
            });
            fetchPipelines();
        } catch (error) {
            console.error("Failed to delete field:", error);
        }
    };

    const handleTabChange = (newTab: string) => {
        const tabOrder = ["pipelines", "leads", "contacts"]; // Define your tab order
        const newIndex = tabOrder.indexOf(newTab);
        const previousIndex = tabOrder.indexOf(activeTab);

        // Determine the direction based on index comparison
        if (newIndex > previousIndex) {
            setAnimationDirection("right");
        } else if (newIndex < previousIndex) {
            setAnimationDirection("left");
        }

        // Update the active and previous tabs
        setPreviousTab(activeTab);
        setActiveTab(newTab);
    };


    async function fetchPipelines() {
        try {
            const response = await axios.get<Pipeline[]>("/api/pipelines");
            setPipelines(response.data);
        } catch (error) {
            console.error("Failed to fetch pipelines:", error);
        }
    }
    useEffect(() => {
        fetchPipelines();
    }, []);

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    return (
        <div className="min-h-screen p-10 text-white">
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-6">
                {/* Tabs List */}
                <div className="flex justify-center  ">
                    <div className="border-b w-full px-12">
                        <div className="flex justify-center">
                            <TabsList className=" rounded-md space-x-12">
                                <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
                                <TabsTrigger value="leads">Leads</TabsTrigger>
                                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>
                </div>
                {/* Pipelines Tab Content */}
                <TabsContent value="pipelines" direction={animationDirection}>
                    <div className='border fade-in-bottom rounded p-3'>
                        <div className="flex justify-between  items-center mb-6">
                            <h1 className="text-2xl font-semibold text-gray-200">Pipeline</h1>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <button className="bg-[#815bf5] text-sm text-white px-4 py-2 rounded hover:bg-[#5f31e9] ">
                                        + Pipeline
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="z-[100] p-6 max-w-lg w-full">
                                    <div className="flex justify-between items-center">
                                        <DialogHeader>
                                            <DialogTitle className="text-lg font-medium text-white">
                                                Create Pipeline
                                            </DialogTitle>
                                        </DialogHeader>
                                        <DialogClose>
                                            <CrossCircledIcon className="scale-150 cursor-pointer  hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
                                        </DialogClose>
                                    </div>
                                    <div className="mt-4">
                                        <CreatePipelineForm onClose={handleCloseDialog} />
                                    </div>
                                    <DialogClose asChild>
                                        <button
                                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                            aria-label="Close"
                                        >
                                            ×
                                        </button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="   shadow-md rounded-lg bg-transparent">
                            <table className="min-w-full border-collapser border rounded-lg text-gray-300">
                                <thead className="bg-[#815bf5] p-2 text-white font-bold ">
                                    <tr className="w-full  rounded-lg">
                                        <th className="w-full   text-muted-foreground text-left">
                                            <div className=" rounded w-full p-2 px-4  ">
                                                <h1 className="text-sm text-white">Pipelines</h1>
                                            </div>
                                        </th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pipelines.map((pipeline) => (
                                        <tr key={pipeline._id} className="border-b">
                                            <td className="px-4 py-2">{pipeline.name}</td>
                                            <td className="px-4 py-2 flex text-right">
                                                <button onClick={() => openEditModal(pipeline)} className="text-blue-500 px-2 hover:underline">
                                                    <Pencil className="h-4" />
                                                </button>
                                                <button className="text-red-500 px-2 hover:underline">
                                                    <Trash2 className="h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="z-[100] p-6 max-w-lg w-full">
                            <div className="flex justify-between items-center">
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-medium text-white">
                                        Edit Pipeline
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogClose>
                                    <CrossCircledIcon className="scale-150 cursor-pointer  hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
                                </DialogClose>
                            </div>
                            {selectedPipeline && (
                                <EditPipelineForm
                                    pipeline={selectedPipeline}
                                    onClose={handleEditClose}
                                    onUpdate={() => {
                                        fetchPipelines();
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Leads Tab Content */}
                <TabsContent value="leads" direction={animationDirection}>
                    <div className="grid  grid-cols-2 gap-2">
                        <div className="p-4 fade-in-bottom bg-[#0A0D28] rounded shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-xl font-semibold text-gray-200">Lead Custom Fields</h1>
                                <button
                                    className="bg-[#815bf5] text-sm text-white px-4 py-2 rounded hover:bg-[#5f31e9]"
                                    onClick={() => setIsFieldDialogOpen(true)}
                                >
                                    + Fields
                                </button>
                            </div>

                            {/* Pipeline Dropdown for Filtering */}
                            <div className="mb-4">
                                <label className="text-sm text-gray-400">Filter by Pipeline</label>
                                <select
                                    value={filterPipelineId || ""}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    className="w-full p-2 rounded bg-[#0a0d28] text-white border border-gray-600 focus:ring-2 focus:ring-[#815bf5]"
                                >
                                    <option value="">All Pipelines</option>
                                    {pipelines.map((pipeline) => (
                                        <option key={pipeline._id} value={pipeline._id}>
                                            {pipeline.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Fields Table */}
                            <div className="border rounded bg-transparent">
                                <div className="bg-[#815bf5] p-2 text-white font-bold rounded-t">Fields</div>
                                {pipelines
                                    .filter((pipeline) =>
                                        filterPipelineId ? pipeline._id === filterPipelineId : true
                                    )
                                    .flatMap((pipeline) =>
                                        pipeline.customFields.map((field, index) => (
                                            <div
                                                key={`${pipeline._id}-${index}`}
                                                className="p-3 border-b border-gray-700 flex justify-between items-center"
                                            >
                                                <div>
                                                    <p className="text-white font-medium">{field.name}</p>
                                                    <p className="text-sm text-gray-400">Data Type: [{field.type}]</p>
                                                    <p className="text-sm text-gray-400">Pipeline Name: [{pipeline.name}]</p>
                                                </div>
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPipeline(pipeline);
                                                            handleEditField(field);
                                                        }}
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        <Pencil className="h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteField(
                                                                pipeline.customFields.indexOf(field)
                                                            )
                                                        }
                                                        className="text-red-500 hover:underline"
                                                    >
                                                        <Trash2 className="h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                            </div>
                        </div>
                        <div className="p-4 bg-[#0A0D28] fade-in-bottom2 rounded shadow-md">
                            <div className="flex justify-between border-b  items-center mb-4">
                                <h1 className="text-xl font-semibold text-gray-200">Lead Tags</h1>
                                <button
                                    className="bg-[#815bf5] text-sm text-white px-4 py-2 rounded hover:bg-[#5f31e9]"
                                    onClick={() => setIsAddTagModalOpen(true)}
                                >
                                    + Tag
                                </button>
                            </div>
                            <div className="border rounded bg-transparent">
                                <div className="bg-[#815bf5] p-2 text-white font-bold rounded-t">
                                    All Tags
                                </div>
                                <div className="p-3 space-y-2">
                                    {tags.map((tag) => (
                                        <div
                                            key={tag._id}
                                            className="flex justify-between items-center border-b border-gray-700 p-2"
                                        >
                                            <div className="text-white rounded-full items-center flex  px-2 py-1" style={{ backgroundColor: tag.color }}>
                                                <span className="text-white" style={{ backgroundColor: tag.color }}>
                                                    {tag.name}
                                                </span>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => {
                                                        setCurrentTag(tag);
                                                        setIsEditTagModalOpen(true);
                                                    }}
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    <Pencil className="h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTag(tag._id)}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    <Trash2 className="h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Add Tag Modal */}
                    <Dialog open={isAddTagModalOpen} onOpenChange={setIsAddTagModalOpen}>
                        <DialogContent className="z-[100] max-w-md p-6 w-full">
                            <AddTagModal
                                onClose={() => setIsAddTagModalOpen(false)}
                                onUpdate={fetchTags}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Edit Tag Modal */}
                    <Dialog open={isEditTagModalOpen} onOpenChange={setIsEditTagModalOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            {currentTag && (
                                <EditTagModal
                                    tag={currentTag}
                                    onClose={() => setIsEditTagModalOpen(false)}
                                    onUpdate={fetchTags}
                                />
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Add Field Modal */}
                    <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            <AddFieldForm
                                pipelines={pipelines}
                                onClose={() => setIsFieldDialogOpen(false)}
                                onUpdate={fetchPipelines}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Edit Field Modal */}
                    <Dialog open={isEditFieldDialogOpen} onOpenChange={setIsEditFieldDialogOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            {currentField && (
                                <EditFieldForm
                                    pipelineId={selectedPipeline?._id}
                                    field={currentField}
                                    onClose={() => setIsEditFieldDialogOpen(false)}
                                    onUpdate={fetchPipelines}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Contacts Tab Content */}
                <TabsContent value="contacts" direction={animationDirection}>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-200 mb-4">Contacts</h1>
                        <p className="text-gray-400">Contacts content goes here...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
}
