'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogClose,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import CreatePipelineForm from "@/components/modals/pipelines/pipelineModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { Pencil, Trash2, Database, Tag, Users, Sparkles, Settings2, ListPlus, Plus, Filter, Loader2, LayoutTemplateIcon, Brain } from "lucide-react";
import EditPipelineForm from "@/components/modals/pipelines/editPipelineModal";
import AddFieldForm from "@/components/modals/pipelines/addFieldModal";
import EditFieldForm from "@/components/modals/pipelines/editFieldModal";
import EditTagModal from "@/components/modals/leadTags/editLeadTagModal";
import AddTagModal from "@/components/modals/leadTags/addLeadTagModal";
import AddContactFieldForm from "@/components/modals/contacts/addContactField";
import EditContactFieldForm from "@/components/modals/contacts/editContactField";
import AddContactTagModal from "@/components/modals/contactTags/addContactTags";
import EditContactTagModal from "@/components/modals/contactTags/editContactTags";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import PipelineTemplates from "@/components/pipelines/PipelineTemplates";
import AIPipelineModal from "@/components/modals/pipelines/aiPipelineModal";


interface CustomField {
    name: string;
    type: "Text" | "Date" | "Number" | "MultiSelect";
    options?: string[];
}

interface Stage {
    name: string;
}

interface Pipeline {
    _id: string;
    name: string;
    openStages: Stage[];
    closeStages: Stage[];
    customFields: CustomField[];
}


interface Tag {
    _id: string;
    name: string;
    color: string;
}

interface ContactFieldDefinition {
    _id: string;
    name: string;
    fieldType: "Text" | "Number" | "Date" | "Dropdown";
    mandatory: boolean;
    options?: string[];
}

/** For Contact Tags */
interface ContactTag {
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
    const { toast } = useToast();

    const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // States for Lead Custom Fields
    const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
    const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
    const [currentField, setCurrentField] = useState<CustomField | null>(null);

    //States for Contact Custom Fields
    const [fields, setFields] = useState<ContactFieldDefinition[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingField, setEditingField] = useState<ContactFieldDefinition | null>(null);

    const [filterPipelineId, setFilterPipelineId] = useState<string | null>(""); // State for dropdown filter
    const [tags, setTags] = useState<Tag[]>([]);
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
    const [currentTag, setCurrentTag] = useState<Tag | null>(null);

    // Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [searchContactField, setSearchContactField] = useState("");
    const [searchContactTag, setSearchContactTag] = useState("");

    // (NEW) CONTACTS TAB: States for Contact Tags
    const [contactTags, setContactTags] = useState<ContactTag[]>([]);
    const [isAddContactTagOpen, setIsAddContactTagOpen] = useState(false);
    const [isEditContactTagOpen, setIsEditContactTagOpen] = useState(false);
    const [currentContactTag, setCurrentContactTag] = useState<ContactTag | null>(
        null
    );
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
    const { isLoading: permissionsLoading, isInitialized } = usePermissions();

    // Add these to your state declarations
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        id: string;
        type: 'pipeline' | 'field' | 'tag' | 'contactField' | 'contactTag';
        name?: string;
    } | null>(null);

    const fetchTags = async () => {
        try {
            const response = await axios.get("/api/tags");
            setTags(response.data);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
            toast({
                title: "Error",
                description: "Failed to fetch tags. Please try again.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    // ===========================
    // CONTACT TAGS FETCH / DELETE
    // ===========================
    async function fetchContactTags() {
        try {
            const res = await axios.get<ContactTag[]>("/api/contact-tags");
            setContactTags(res.data);
        } catch (error) {
            console.error("Error fetching contact tags:", error);
            toast({
                title: "Error",
                description: "Failed to fetch contact tags. Please try again.",
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        fetchContactTags();
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
            toast({
                title: "Error",
                description: "Failed to fetch pipelines. Please try again.",
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        fetchPipelines();
    }, []);

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        fetchPipelines();
    };

    async function fetchFields() {
        try {
            const res = await axios.get("/api/contact-custom-fields");
            setFields(res.data);
        } catch (error) {
            console.error("Error fetching contact fields:", error);
            toast({
                title: "Error",
                description: "Failed to fetch contact fields. Please try again.",
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        fetchFields();
    }, []);

    const handleDelete = async (fieldId: string) => {
        // Get the field name to display in the confirmation
        const fieldToDelete = fields.find(field => field._id === fieldId);

        setItemToDelete({
            id: fieldId,
            type: 'contactField',
            name: fieldToDelete?.name || 'Unknown field'
        });
        setDeleteConfirmOpen(true);
    };

    // Replace your existing delete handlers with these versions:
    const handleDeletePipeline = async (pipeline: Pipeline) => {
        setItemToDelete({
            id: pipeline._id,
            type: 'pipeline',
            name: pipeline.name
        });
        setDeleteConfirmOpen(true);
    };

    const handleDeleteTag = async (tag: Tag) => {
        setItemToDelete({
            id: tag._id,
            type: 'tag',
            name: tag.name
        });
        setDeleteConfirmOpen(true);
    };

    const handleDeleteContactTag = async (tag: ContactTag) => {
        setItemToDelete({
            id: tag._id,
            type: 'contactTag',
            name: tag.name
        });
        setDeleteConfirmOpen(true);
    };

    const handleDeleteField = async (fieldIndex: number, pipeline: Pipeline, fieldName: string) => {
        setItemToDelete({
            id: `${pipeline._id}-${fieldIndex}`,
            type: 'field',
            name: fieldName
        });
        setDeleteConfirmOpen(true);
    };

    // Add this function to handle the actual deletion
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            switch (itemToDelete.type) {
                case 'pipeline':
                    await axios.delete(`/api/pipelines/${itemToDelete.id}`);
                    fetchPipelines();
                    toast({
                        title: "Success",
                        description: `Pipeline "${itemToDelete.name}" deleted successfully`
                    });
                    break;
                case 'tag':
                    await axios.delete(`/api/tags/${itemToDelete.id}`);
                    fetchTags();
                    toast({
                        title: "Success",
                        description: `Tag "${itemToDelete.name}" deleted successfully`
                    });
                    break;
                case 'contactTag':
                    await axios.delete('/api/contact-tags', { data: { id: itemToDelete.id } });
                    fetchContactTags();
                    toast({
                        title: "Success",
                        description: `Contact tag "${itemToDelete.name}" deleted successfully`
                    });
                    break;
                case 'contactField':
                    await axios.delete("/api/contact-custom-fields", { data: { id: itemToDelete.id } });
                    fetchFields();
                    toast({
                        title: "Success",
                        description: `Field "${itemToDelete.name}" deleted successfully`
                    });
                    break;
                case 'field':
                    const [pipelineId, fieldIndex] = itemToDelete.id.split('-');
                    const pipeline = pipelines.find(p => p._id === pipelineId);
                    if (pipeline) {
                        const updatedFields = pipeline.customFields.filter(
                            (_, index) => index !== parseInt(fieldIndex)
                        );
                        await axios.patch(`/api/pipelines/${pipelineId}`, {
                            customFields: updatedFields,
                        });
                        fetchPipelines();
                        toast({
                            title: "Success",
                            description: `Field "${itemToDelete.name}" deleted successfully`
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error('Failed to delete item:', error);
            toast({
                title: "Error",
                description: "Failed to delete. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        }
    };


    // Filter functions
    const filteredPipelines = pipelines.filter(pipeline =>
        pipeline.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFields = fields.filter(field =>
        field.name.toLowerCase().includes(searchContactField.toLowerCase())
    );

    const filteredContactTags = contactTags.filter(tag =>
        tag.name.toLowerCase().includes(searchContactTag.toLowerCase())
    );


    // Add permission check before rendering content
    if (permissionsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading permissions...</p>
                </div>
            </div>
        );
    }

    // Check for view permission after permissions are loaded
    if (isInitialized && !canView("Contacts")) {
        return (
            <NoPermissionFallback
                title="No Access to Settings "
                description="You don't have permission to view customize settings."
            />
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-8  mx-auto ">
            <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white">Customize</h1>
                    <p className="text-muted-foreground mt-1">Configure your CRM to match your workflow needs</p>
                </div>
                <Settings2 className="h-8 w-8 text-primary" />
            </motion.div>

            <Separator className="my-6" />

            <Tabs
                defaultValue={activeTab}
                onValueChange={handleTabChange}
                className="space-y-8"
            >
                {/* Tabs List */}
                <div className="flex justify-center">
                    <TabsList className="grid grid-cols-4  w-full  gap-x-6 bg-accent  ">

                        <TabsTrigger value="pipelines" className="  flex gap-2 items-center border-none ">
                            <Database className="h-4 w-4" />
                            <span>Pipelines</span>
                        </TabsTrigger>
                        <TabsTrigger value="pipelineTemplates" className="  flex gap-2 items-center border-none ">
                            <LayoutTemplateIcon className="h-4 w-4" />
                            <span>Pipeline Templates</span>
                        </TabsTrigger>


                        <TabsTrigger value="leads" className="  flex gap-2 items-center border-none">
                            <ListPlus className="h-4 w-4" />
                            <span>Leads</span>
                        </TabsTrigger>



                        <TabsTrigger value="contacts" className=" flex gap-2 items-center  border-none">
                            <Users className="h-4 w-4" />
                            <span>Contacts</span>
                        </TabsTrigger>

                    </TabsList>
                </div>

                {/* Pipelines Tab Content */}
                <TabsContent value="pipelines" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Database className="h-5 w-5 text-primary" />
                                        Pipelines
                                    </CardTitle>
                                    <CardDescription>Configure your sales processes and workflows</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {/* AI Generate Button */}
                                    <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
                                        {canAdd("Settings") ? (
                                            <DialogTrigger asChild>
                                               <Button  variant="outline"
                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600 hover:text-white gap-2"
                                                >
                                                    <Brain className="h-4 w-4 group-hover:animate-pulse" />
                                                    Generate with AI
                                                </Button>
                                            </DialogTrigger>
                                        ) : (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                          <Button  variant="outline"
                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600 hover:text-white gap-2"
                                                >
                                                            <Brain className="h-4 w-4 group-hover:animate-pulse" />
                                                            Generate with AI
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>You don't have permission to generate pipelines</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        <DialogContent className="z-[100] w-full">
                                            <DialogHeader>
                                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                                    <Brain className="h-5 w-5 text-primary" />
                                                    Generate Pipeline with AI
                                                </DialogTitle>
                                            </DialogHeader>
                                            <AIPipelineModal
                                                onClose={() => setIsAIDialogOpen(false)}
                                                onSuccess={fetchPipelines}
                                            />
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        {canAdd("Settings") ? (

                                            <DialogTrigger asChild>
                                                <Button className="group flex gap-2">
                                                    <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                                                    Create Pipeline
                                                </Button>

                                            </DialogTrigger>
                                        ) : (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button className="group flex opacity-30 gap-2">
                                                            <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                                                            Create Pipeline
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>You don't have permission to add companies</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        <DialogContent className="z-[100] p-6 h-fit max-h-screen m-auto overflow-y-scroll scrollbar-hide max-w-lg w-full">
                                            <DialogHeader>
                                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                                    <Sparkles className="h-5 w-5 text-primary" />
                                                    Create Pipeline
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="">
                                                <CreatePipelineForm onClose={handleCloseDialog} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <div className="relative mb-4">
                                        <Input
                                            type="text"
                                            placeholder="Search pipelines..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                        <Filter className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                                    </div>

                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-[200px]">Pipeline Name</TableHead>
                                                    <TableHead className="w-[300px]">Stages</TableHead>
                                                    <TableHead className="w-[120px]">Custom Fields</TableHead>
                                                    <TableHead className="w-[120px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                        </Table>

                                        <ScrollArea className="h-[400px]">
                                            <Table>
                                                <TableBody>
                                                    {filteredPipelines.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                                No pipelines found. Create your first pipeline!
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredPipelines.map((pipeline) => (
                                                            <TableRow key={pipeline._id} className="hover:bg-muted/50 transition-colors">
                                                                <TableCell className="w-[200px] font-medium">
                                                                    <div className="truncate pr-2" title={pipeline.name}>
                                                                        {pipeline.name}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="w-[300px]">
                                                                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                                                                        {pipeline.openStages.slice(0, 2).map((stage, i) => (
                                                                            <Badge key={`open-${i}`} variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">
                                                                                {typeof stage === 'object' ? stage.name : stage}
                                                                            </Badge>
                                                                        ))}
                                                                        {pipeline.closeStages.slice(0, 1).map((stage, i) => (
                                                                            <Badge key={`close-${i}`} variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs">
                                                                                {typeof stage === 'object' ? stage.name : stage}
                                                                            </Badge>
                                                                        ))}
                                                                        {(pipeline.openStages.length + pipeline.closeStages.length) > 3 && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                +{(pipeline.openStages.length + pipeline.closeStages.length) - 3} more
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="w-[120px]">
                                                                    <span className="text-muted-foreground">
                                                                        {pipeline.customFields.length} fields
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="w-[120px]">
                                                                    <div className="flex space-x-1">
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    {canEdit("Settings") && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => openEditModal(pipeline)}
                                                                                            className="h-8 w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                                                                                        >
                                                                                            <Pencil className="h-4 w-4" />
                                                                                        </Button>
                                                                                    )}
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Edit pipeline</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>

                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    {canDelete("Settings") && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => handleDeletePipeline(pipeline)}
                                                                                            className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4" />
                                                                                        </Button>
                                                                                    )}
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Delete pipeline</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    {/* Pipeline Templates Section - ADD THIS PART */}

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="z-[100] p-6 max-w-lg w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <Pencil className="h-5 w-5 text-primary" />
                                    Edit Pipeline
                                </DialogTitle>
                            </DialogHeader>
                            {selectedPipeline && (
                                <EditPipelineForm
                                    pipeline={selectedPipeline as any}
                                    onClose={handleEditClose}
                                    onUpdate={() => {
                                        fetchPipelines();
                                        toast({
                                            title: "Success",
                                            description: "Pipeline updated successfully"
                                        });
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>
                <TabsContent value="pipelineTemplates" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <PipelineTemplates />
                    </motion.div>
                </TabsContent>
                {/* Leads Tab Content */}
                <TabsContent value="leads" className="space-y-6">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Lead Custom Fields Card */}
                        <Card className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <ListPlus className="h-5 w-5 text-primary" />
                                        Lead Custom Fields
                                    </CardTitle>
                                    <CardDescription>Define custom fields for your leads</CardDescription>
                                </div>
                                {canAdd("Settings") && (
                                    <Button
                                        className="group flex gap-2"
                                        onClick={() => setIsFieldDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                        Add Field
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <div className="mb-4">
                                        <Select
                                            value={filterPipelineId || "All"}
                                            onValueChange={(value) => handleFilterChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                                    <SelectValue placeholder="Filter by Pipeline" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Pipelines</SelectItem>
                                                {pipelines.map((pipeline) => (
                                                    <SelectItem key={pipeline._id} value={pipeline._id}>
                                                        {pipeline.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <ScrollArea className="h-[350px]">
                                        {pipelines
                                            .filter((pipeline) =>
                                                filterPipelineId && filterPipelineId !== "All" ? pipeline._id === filterPipelineId : true
                                            )
                                            .flatMap((pipeline) =>
                                                pipeline.customFields.length === 0 ? [] : [
                                                    <div key={`${pipeline._id}-header`} className="mb-3 mt-2">
                                                        <h3 className="text-sm font-medium text-muted-foreground">
                                                            {pipeline.name}
                                                        </h3>
                                                        <Separator className="my-2" />
                                                    </div>,
                                                    ...pipeline.customFields.map((field, index) => (
                                                        <motion.div
                                                            key={`${pipeline._id}-${index}`}
                                                            className="p-3 mb-2 border rounded-md hover:bg-muted/50 transition-colors flex justify-between items-center"
                                                            initial={{ opacity: 0, x: -5 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                        >
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="bg-primary/10 text-primary">
                                                                        {field.type}
                                                                    </Badge>
                                                                    <p className="font-medium">{field.name}</p>
                                                                </div>
                                                                {field.options && field.options.length > 0 && (
                                                                    <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-1">
                                                                        {field.options.map((option, i) => (
                                                                            <Badge key={i} variant="secondary" className="text-xs">
                                                                                {option}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            {canEdit("Settings") && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => {
                                                                                        setSelectedPipeline(pipeline);
                                                                                        handleEditField(field);
                                                                                    }}
                                                                                    className="h-8 w-8 text-blue-500"
                                                                                >
                                                                                    <Pencil className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Edit field</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            {canDelete("Settings") && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => handleDeleteField(index, pipeline, field.name)}
                                                                                    className="h-8 w-8 text-red-500"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Delete field</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                ]
                                            )
                                        }
                                        {pipelines.every(p => p.customFields.length === 0) && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No custom fields found. Add your first field!
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lead Tags Card */}
                        <Card className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" />
                                        Lead Tags
                                    </CardTitle>
                                    <CardDescription>Manage tags for categorizing leads</CardDescription>
                                </div>
                                {canAdd("Settings") && (
                                    <Button
                                        className="group flex gap-2"
                                        onClick={() => setIsAddTagModalOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                        Add Tag
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <ScrollArea className="h-[350px]">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {tags.length === 0 ? (
                                                <div className="col-span-2 text-center py-8 text-muted-foreground">
                                                    No tags found. Create your first tag!
                                                </div>
                                            ) : (
                                                tags.map((tag, index) => (
                                                    <motion.div
                                                        key={tag._id}
                                                        className="border rounded-md p-3 flex justify-between items-center hover:bg-muted/50 transition-colors"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: tag.color }}
                                                            />
                                                            <Badge
                                                                className="px-3 text-[10px] text-nowrap py-1"
                                                                style={{
                                                                    backgroundColor: tag.color,
                                                                    color: '#fff'
                                                                }}
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        {canEdit("Settings") && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => {
                                                                                    setCurrentTag(tag);
                                                                                    setIsEditTagModalOpen(true);
                                                                                }}
                                                                                className="h-8 w-8 text-blue-500"
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Edit tag</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        {canDelete("Settings") && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleDeleteTag(tag)}
                                                                                className="h-8 w-8 text-red-500"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Delete tag</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Add Tag Modal */}
                    <Dialog open={isAddTagModalOpen} onOpenChange={setIsAddTagModalOpen}>
                        <DialogContent className="z-[100] max-w-md p-6 w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-primary" />
                                    Add Lead Tag
                                </DialogTitle>
                            </DialogHeader>
                            <AddTagModal
                                onClose={() => setIsAddTagModalOpen(false)}
                                onUpdate={() => {
                                    fetchTags();
                                    toast({
                                        title: "Success",
                                        description: "Tag created successfully"
                                    });
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Edit Tag Modal */}
                    <Dialog open={isEditTagModalOpen} onOpenChange={setIsEditTagModalOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <Pencil className="h-5 w-5 text-primary" />
                                    Edit Lead Tag
                                </DialogTitle>
                            </DialogHeader>
                            {currentTag && (
                                <EditTagModal
                                    tag={currentTag}
                                    onClose={() => setIsEditTagModalOpen(false)}
                                    onUpdate={() => {
                                        fetchTags();
                                        toast({
                                            title: "Success",
                                            description: "Tag updated successfully"
                                        });
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Add Field Modal */}
                    <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <ListPlus className="h-5 w-5 text-primary" />
                                    Add Custom Field
                                </DialogTitle>
                            </DialogHeader>
                            <AddFieldForm
                                pipelines={pipelines}
                                onClose={() => setIsFieldDialogOpen(false)}
                                onUpdate={() => {
                                    fetchPipelines();
                                    toast({
                                        title: "Success",
                                        description: "Field added successfully"
                                    });
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Edit Field Modal */}
                    <Dialog open={isEditFieldDialogOpen} onOpenChange={setIsEditFieldDialogOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <Pencil className="h-5 w-5 text-primary" />
                                    Edit Custom Field
                                </DialogTitle>
                            </DialogHeader>
                            {currentField && (
                                <EditFieldForm
                                    pipelineId={selectedPipeline?._id}
                                    field={currentField}
                                    onClose={() => setIsEditFieldDialogOpen(false)}
                                    onUpdate={() => {
                                        fetchPipelines();
                                        toast({
                                            title: "Success",
                                            description: "Field updated successfully"
                                        });
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Contacts Tab Content */}
                <TabsContent value="contacts" className="space-y-6">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Contact Custom Fields Card */}
                        <Card className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <ListPlus className="h-5 w-5 text-primary" />
                                        Contact Custom Fields
                                    </CardTitle>
                                    <CardDescription>Define custom fields for contacts</CardDescription>
                                </div>
                                {canAdd("Settings") && (
                                    <Button
                                        className="group flex gap-2"
                                        onClick={() => setIsAddOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                        Add Field
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <div className="relative mb-4">
                                        <Input
                                            type="text"
                                            placeholder="Search fields..."
                                            value={searchContactField}
                                            onChange={(e) => setSearchContactField(e.target.value)}
                                            className="pl-10"
                                        />
                                        <Filter className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                                    </div>

                                    <ScrollArea className="h-[350px]">
                                        {filteredFields.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                {fields.length === 0
                                                    ? "No custom fields found. Add your first field!"
                                                    : "No fields match your search."}
                                            </div>
                                        ) : (
                                            filteredFields.map((field, index) => (
                                                <motion.div
                                                    key={field._id}
                                                    className="p-3 mb-2 border rounded-md hover:bg-muted/50 transition-colors flex justify-between items-center"
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-primary/10 text-primary">
                                                                {field.fieldType}
                                                            </Badge>
                                                            <p className="font-medium">{field.name}</p>
                                                            {field.mandatory && (
                                                                <Badge variant="secondary">Required</Badge>
                                                            )}
                                                        </div>
                                                        {field.fieldType === "Dropdown" && field.options && field.options.length > 0 && (
                                                            <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-1">
                                                                {field.options.map((option, i) => (
                                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                                        {option}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    {canEdit("Settings") && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                setEditingField(field);
                                                                                setIsEditOpen(true);
                                                                            }}
                                                                            className="h-8 w-8 text-blue-500"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </TooltipTrigger>
                                                                <TooltipContent>Edit field</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    {canDelete("Settings") && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleDelete(field._id)}
                                                                            className="h-8 w-8 text-red-500"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </TooltipTrigger>
                                                                <TooltipContent>Delete field</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </ScrollArea>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Tags Card */}
                        <Card className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" />
                                        Contact Tags
                                    </CardTitle>
                                    <CardDescription>Manage tags for contacts</CardDescription>
                                </div>
                                {canAdd("Settings") && (
                                    <Button
                                        className="group flex gap-2"
                                        onClick={() => setIsAddContactTagOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                        Add Tag
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <div className="relative mb-4">
                                        <Input
                                            type="text"
                                            placeholder="Search tags..."
                                            value={searchContactTag}
                                            onChange={(e) => setSearchContactTag(e.target.value)}
                                            className="pl-10"
                                        />
                                        <Filter className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                                    </div>

                                    <ScrollArea className="h-[350px]">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {filteredContactTags.length === 0 ? (
                                                <div className="col-span-2 text-center py-8 text-muted-foreground">
                                                    {contactTags.length === 0
                                                        ? "No contact tags found. Create your first tag!"
                                                        : "No tags match your search."}
                                                </div>
                                            ) : (
                                                filteredContactTags.map((tag, index) => (
                                                    <motion.div
                                                        key={tag._id}
                                                        className="border rounded-md p-3 flex justify-between items-center hover:bg-muted/50 transition-colors"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: tag.color }}
                                                            />
                                                            <Badge
                                                                className="px-3 py-1"
                                                                style={{
                                                                    backgroundColor: tag.color,
                                                                    color: '#fff'
                                                                }}
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        {canEdit("Settings") && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => {
                                                                                    setCurrentContactTag(tag);
                                                                                    setIsEditContactTagOpen(true);
                                                                                }}
                                                                                className="h-8 w-8 text-blue-500"
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Edit tag</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        {canDelete("Settings") && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleDeleteContactTag(tag)}
                                                                                className="h-8 w-8 text-red-500"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Delete tag</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* ADD CONTACT TAG MODAL */}
                    <Dialog open={isAddContactTagOpen} onOpenChange={setIsAddContactTagOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-primary" />
                                    Add Contact Tag
                                </DialogTitle>
                            </DialogHeader>
                            <AddContactTagModal
                                onClose={() => setIsAddContactTagOpen(false)}
                                onUpdate={() => {
                                    fetchContactTags();
                                    toast({
                                        title: "Success",
                                        description: "Contact tag created successfully"
                                    });
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* EDIT CONTACT TAG MODAL */}
                    <Dialog open={isEditContactTagOpen} onOpenChange={setIsEditContactTagOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <Pencil className="h-5 w-5 text-primary" />
                                    Edit Contact Tag
                                </DialogTitle>
                            </DialogHeader>
                            {currentContactTag && (
                                <EditContactTagModal
                                    tag={currentContactTag}
                                    onClose={() => setIsEditContactTagOpen(false)}
                                    onUpdate={() => {
                                        fetchContactTags();
                                        toast({
                                            title: "Success",
                                            description: "Contact tag updated successfully"
                                        });
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Add Field Modal */}
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <ListPlus className="h-5 w-5 text-primary" />
                                    Add Contact Field
                                </DialogTitle>
                            </DialogHeader>
                            <AddContactFieldForm
                                onClose={() => setIsAddOpen(false)}
                                onUpdate={() => {
                                    fetchFields();
                                    toast({
                                        title: "Success",
                                        description: "Contact field added successfully"
                                    });
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Edit Field Modal */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="z-[100] p-6 max-w-md w-full">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-medium dark:text-white flex items-center gap-2">
                                    <Pencil className="h-5 w-5 text-primary" />
                                    Edit Contact Field
                                </DialogTitle>
                            </DialogHeader>
                            {editingField && (
                                <EditContactFieldForm
                                    field={editingField}
                                    onClose={() => {
                                        setEditingField(null);
                                        setIsEditOpen(false);
                                    }}
                                    onUpdate={() => {
                                        fetchFields();
                                        toast({
                                            title: "Success",
                                            description: "Contact field updated successfully"
                                        });
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl flex items-center gap-2 text-red-500">
                            <Trash2 className="h-5 w-5" />
                            Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            This action cannot be undone. This will permanently delete{' '}
                            {itemToDelete?.type === 'pipeline' && <strong>the pipeline</strong>}
                            {itemToDelete?.type === 'tag' && <strong>the tag</strong>}
                            {itemToDelete?.type === 'contactTag' && <strong>the contact tag</strong>}
                            {itemToDelete?.type === 'contactField' && <strong>the contact field</strong>}
                            {itemToDelete?.type === 'field' && <strong>the field</strong>}
                            {itemToDelete?.name ? <span className="font-medium"> "{itemToDelete.name}"</span> : ''}.
                            <br /><br />
                            Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
