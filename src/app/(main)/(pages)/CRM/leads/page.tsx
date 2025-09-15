"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle,
    Eye,
    EyeOff,
    IndianRupee,
    Loader2,
    Plus,
    Tag,
    Calendar as CalendarIcon,
    Filter,
    Search,
    Settings,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    Lock,
    Mail
} from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DotsVerticalIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import FilterModal from "@/components/modals/filters/filterLeads";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaCalendar, FaMoneyBill, FaUser } from "react-icons/fa";
import {
    endOfToday,
    format,
    formatDistanceToNow,
    startOfMonth,
    startOfToday,
    startOfWeek,
    startOfYesterday,
    subMonths,
} from "date-fns";
import { useUserContext } from "@/contexts/userContext";
import { cn } from "@/lib/utils";
import { toast, useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { usePermissions } from "@/hooks/use-permissions";
import { NoPermissionFallback } from "@/components/ui/no-permission-fallback";
import { canView, canAdd, canDelete, canEdit, usePermissionStatus } from "@/contexts/permissionsContext";
import MediaAttachments from "@/components/MediaAttachments";
import { Checkbox } from "@/components/ui/checkbox";
import BulkEmailDialog from "@/components/leads/bulkEmail";
import LeadActionMenu from "@/components/modals/leads/LeadActionMenu";
import MoveLeadDialog from "@/components/modals/leads/moveLeads2";

/* ---------------- TYPES ---------------- */
interface Lead {
    assignedTo: any;
    _id: string;
    leadId: string;
    title: string;
    description?: string;
    product?: string;
    contact?: any;
    amount?: number;
    closeDate?: string;
    stage?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    company?: string;
    source?: string;
    files?: string[];
    audioRecordings?: string[];
    links?: { url: string; title: string }[];
    customFieldValues?: Record<string, any>; // Add this line for custom field values
}

interface Stage {
    _id?: string;
    name: string;
    color: string;
    leads: Lead[];
    type: "open" | "close";
}

interface Pipeline {
    _id: string;
    name: string;
    openStages: {
        _id: string;
        name: string;
        color: string;
        won?: boolean;
        lost?: boolean;
    }[];
    closeStages: {
        _id: string;
        name: string;
        color: string;
        won?: boolean;
        lost?: boolean;
    }[];
    customFields?: {
        name: string;
        type: "Text" | "Date" | "Number" | "MultiSelect";
        options?: string[];
    }[]; // Add this line for custom field definitions
}

interface Product {
    _id: string;
    name: string;
}

interface Contact {
    _id: string;
    firstName: string;
    lastName: string;
}

interface TeamUser {
    _id: string;
    firstName: string;
    lastName: string;
}

interface Company {
    _id: string;
    companyName: string;
    taxNo: string;
    companyCode: string;
    country: string;
    shippingAddress: string;
    billingAddress: string;
    state: string;
    city: string;
    website: string;
    pincode: string;
}

interface Tag {
    _id: string;
    name: string;
    color: string;
}

interface StageOption {
    _id: string;
    name: string;
}

interface ISource {
    _id: string;
    name: string;
    role: string;
}

interface FiltersState {
    assignedTos: string[];
    stages: string[];
    tags: string[];
    companies: string[];
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function LeadsDashboard() {
    // Pipelines & Board
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
    const { user } = useUserContext();
    const [stages, setStages] = useState<Stage[]>([]);
    const [showCheckboxes, setShowCheckboxes] = useState(false);

    // Searching & Filtering
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<FiltersState>({
        assignedTos: [],
        stages: [],
        tags: [],
        companies: [],
    });

    // Add to your LeadsDashboard component state:
    const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
    const [showSendEmailButton, setShowSendEmailButton] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);


    // Add this function inside LeadsDashboard component:
    const toggleLeadSelection = (lead: Lead, isSelected: boolean) => {
        if (isSelected) {
            setSelectedLeads(prev => [...prev, lead]);
        } else {
            setSelectedLeads(prev => prev.filter(l => l._id !== lead._id));
        }
    };

    // Add this function to filter leads based on search term
    const filterLeadsBySearchTerm = (leads: Lead[], term: string) => {
        if (!term.trim()) return leads;

        const lowerCaseTerm = term.toLowerCase();
        return leads.filter(lead => {
            // Create searchable text from multiple fields
            const searchableText = [
                lead.title || '',                           // Lead title
                lead.leadId || '',                          // Lead ID
                lead.description || '',                     // Description
                lead.company || '',                         // Company name

                // Contact name - handle potential undefined values safely
                lead.contact?.firstName || '',              // Contact first name
                lead.contact?.lastName || '',               // Contact last name
                `${lead.contact?.firstName || ''} ${lead.contact?.lastName || ''}`, // Full contact name

                // Additional fields you might want to search
                lead.assignedTo?.firstName || '',           // Assigned user first name
                lead.assignedTo?.lastName || '',            // Assigned user last name
                `${lead.assignedTo?.firstName || ''} ${lead.assignedTo?.lastName || ''}`, // Full assigned name

                // Tags joined as a single string
                (lead.tags || []).join(' ')                 // Tags
            ].join(' ').toLowerCase();

            // Check if the search term is found in any of the combined text
            return searchableText.includes(lowerCaseTerm);
        });
    };


    // 1. Create a memoized filtered stages array based on the search term
    const filteredStages = useMemo(() => {
        if (!searchTerm.trim()) return stages;

        return stages.map(stage => {
            // Filter leads in this stage that match the search term
            const filteredLeads = stage.leads.filter(lead => {
                const term = searchTerm.toLowerCase();

                // Check each searchable field
                return (
                    // Lead title
                    (lead.title?.toLowerCase().includes(term)) ||

                    // Lead ID
                    (lead.leadId?.toLowerCase().includes(term)) ||

                    // Contact name
                    (lead.contact?.firstName?.toLowerCase().includes(term)) ||
                    (lead.contact?.lastName?.toLowerCase().includes(term)) ||

                    // Company
                    (lead.company?.toLowerCase().includes(term)) ||

                    // Description
                    (lead.description?.toLowerCase().includes(term)) ||

                    // Assigned person
                    (lead.assignedTo?.firstName?.toLowerCase().includes(term)) ||
                    (lead.assignedTo?.lastName?.toLowerCase().includes(term))
                );
            });

            // Return a new stage object with filtered leads
            return {
                ...stage,
                leads: filteredLeads
            };
        });
    }, [stages, searchTerm]);

    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(0);
    const itemsPerPage = 4;

    // Drag states
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
    const [targetStage, setTargetStage] = useState<string | null>(null);

    // Remark dialog
    const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
    const [remark, setRemark] = useState("");

    // Add Lead modal
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

    // Add Lead form states
    const [leadTitle, setLeadTitle] = useState("");
    const [description, setDescription] = useState("");
    const [estimateAmount, setEstimateAmount] = useState<number | "">("");
    const [closeDate, setCloseDate] = useState<Date | undefined>(undefined);

    // For the Add Lead modal: pipeline & stage selection
    const [modalPipeline, setModalPipeline] = useState<string>("");
    const [modalStages, setModalStages] = useState<StageOption[]>([]);
    const [modalStage, setModalStage] = useState<string>("");

    // Product & Contact
    const [products, setProducts] = useState<Product[]>([]);
    const [contacts, setContacts] = useState<{ _id: string; name: string }[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [selectedContact, setSelectedContact] = useState<string | null>(null);

    // AssignedTo from the Sales Team
    const [teamMembers, setTeamMembers] = useState<TeamUser[]>([]);
    const [assignedTo, setAssignedTo] = useState<string>("");

    // Filter state for leads
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [assignedToFilters, setAssignedToFilters] = useState<string[]>([]);
    const [stageFilters, setStageFilters] = useState<string[]>([]);
    const [tagFilters, setTagFilters] = useState<string[]>([]);
    const [companyFilters, setCompanyFilters] = useState<string[]>([]);

    const [companies, setCompanies] = useState<Company[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    // Shadcn date filtering
    const [dateFilter, setDateFilter] = useState<string>("Today");
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [isStartDateDialogOpen, setStartDateDialogOpen] = useState(false);
    const [isEndDateDialogOpen, setEndDateDialogOpen] = useState(false);

    // State for the current selected stage and pipeline
    const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

    // States for the dialogs
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
    const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
    const [isDeleteStageDialogOpen, setIsDeleteStageDialogOpen] = useState(false);
    const [editedStageName, setEditedStageName] = useState("");

    // Bulk delete
    const [isBulkDeleteEnabled, setIsBulkDeleteEnabled] = useState(false);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);

    // For the custom date range, store each as Date | undefined
    const [customDateRange, setCustomDateRange] = useState<{
        start?: Date;
        end?: Date;
    }>({});

    const [files, setFiles] = useState<string[]>([]);
    const [audioRecordings, setAudioRecordings] = useState<string[]>([]);
    const [links, setLinks] = useState<{ url: string; title: string }[]>([]);


    // Source selection
    const [sourceOpen, setSourceOpen] = useState(false);
    const [source, setSource] = useState("");
    const [sources, setSources] = useState<ISource[]>([]);
    const [newSource, setNewSource] = useState("");
    const [searchSourceQuery, setSearchSourceQuery] = useState("");
    const [popoverSourceInputValue, setPopoverSourceInputValue] = useState("");

    // Loading states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFetchingLeads, setIsFetchingLeads] = useState(false);
    const [isCreatingLead, setIsCreatingLead] = useState(false);
    const [isUpdatingStage, setIsUpdatingStage] = useState(false);
    const [loadingPipeline, setLoadingPipeline] = useState<string | null>(null);
    const [dateDialogOpen, setDateDialogOpen] = useState(false);

    // Refs
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    // Pointer sensors for drag and drop
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    });
    const sensors = useSensors(pointerSensor);

    // Get permissions and their loading status
    const { isLoading: permissionsLoading, isInitialized } = usePermissions();
    // Combined loading state
    const isPageLoading = isLoading || permissionsLoading;
    /* -------------------- Functions -------------------- */

    // Source popup handlers
    function handleSourceOpen() {
        setSourceOpen(true);
    }

    function handleCloseSourcePopup() {
        setSourceOpen(false);
    }

    function handleSourceClose(selectedName: string) {
        setPopoverSourceInputValue(selectedName);
        setSourceOpen(false);
    }

    // Handle opening of Add Lead dialog with preselected pipeline and stage
    const handleAddLeadToStage = (stage: Stage) => {
        setIsLeadModalOpen(true);
        setModalPipeline(selectedPipeline || '');
        setModalStage(stage.name);
        toast({
            title: "Adding new lead",
            description: `Creating a lead in the ${stage.name} stage`,
        });
    };

    // Edit Stage
    const handleEditStage = (stage: Stage) => {
        setSelectedStage(stage);
        setEditedStageName(stage.name);
        setIsEditStageDialogOpen(true);
    };

    // Delete Stage
    const handleDeleteStage = (stage: Stage) => {
        setSelectedStage(stage);
        setIsDeleteStageDialogOpen(true);
    };

    // Bulk delete toggle handler
    const handleBulkDeleteToggle = (stageName: string) => {
        if (selectedStages.includes(stageName)) {
            setSelectedStages(selectedStages.filter((name) => name !== stageName));
        } else {
            setSelectedStages([...selectedStages, stageName]);
        }
    };

    // Fetch all the data needed for add lead modal
    async function fetchAllDropdownData() {
        try {
            setIsLoading(true);
            const sourcesRes = await axios.get("/api/sources");
            setSources(sourcesRes.data);
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
            toast({
                title: "Could not load sources",
                description: "There was an error fetching the source options",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Edit Stage submission
    const handleEditStageSubmit = async () => {
        if (!selectedStage) return;
        try {
            setIsUpdatingStage(true);
            await axios.patch(`/api/pipelines/${selectedPipeline}/stages/${selectedStage._id}`, {
                name: editedStageName,
            });

            toast({
                title: "Stage updated",
                description: "The stage has been renamed successfully",
            });

            setIsEditStageDialogOpen(false);

            // Refresh the board
            if (selectedPipeline) {
                const updated = await axios.get(`/api/pipelines/${selectedPipeline}`);
                await prepareStages(updated.data);
            }
        } catch (error) {
            console.error("Failed to update stage:", error);
            toast({
                title: "Update failed",
                description: "There was a problem updating the stage",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingStage(false);
        }
    };

    // Delete Stage confirmation
    const handleDeleteStageSubmit = async () => {
        if (!selectedStage) return;
        try {
            setIsUpdatingStage(true);
            await axios.delete(`/api/pipelines/${selectedPipeline}/stages/${selectedStage._id}`);

            toast({
                title: "Stage deleted",
                description: "The stage has been removed successfully",
            });

            setIsDeleteStageDialogOpen(false);

            // Refresh the board
            if (selectedPipeline) {
                const updated = await axios.get(`/api/pipelines/${selectedPipeline}`);
                await prepareStages(updated.data);
            }
        } catch (error) {
            console.error("Failed to delete stage:", error);
            toast({
                title: "Delete failed",
                description: "There was a problem deleting the stage",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingStage(false);
        }
    };


    // Bulk Delete stages
    const handleBulkDeleteSubmit = async () => {
        if (!selectedStages.length) return;
        try {
            setIsUpdatingStage(true);
            await axios.post(`/api/pipelines/${selectedPipeline}/stages/bulk-delete`, {
                stageNames: selectedStages
            });

            toast({
                title: "Stages deleted",
                description: `Successfully deleted ${selectedStages.length} stages`,
            });

            setIsBulkDeleteEnabled(false);
            setSelectedStages([]);

            // Refresh the board
            if (selectedPipeline) {
                const updated = await axios.get(`/api/pipelines/${selectedPipeline}`);
                await prepareStages(updated.data);
            }
        } catch (error) {
            console.error("Failed to delete stages:", error);
            toast({
                title: "Delete failed",
                description: "There was a problem deleting the stages",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingStage(false);
        }
    };

    /* ---------------- Effects ---------------- */
    // Permission check is now available immediately
    const hasPermission = canView("Leads");

    // Only run data loading effects if user has permission
    useEffect(() => {
        // Skip loading data if no permission
        // if (!hasPermission) return;
        if (permissionsLoading || !isInitialized) return;
        if (!canView("Leads")) return;

        const fetchPipelines = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get<Pipeline[]>("/api/pipelines");
                setPipelines(response.data);

                if (response.data?.length > 0) {
                    const first = response.data[0];
                    setSelectedPipeline(first._id);
                    await prepareStages(first);
                }
            } catch (error) {
                console.error("Failed to fetch pipelines:", error);
                toast({
                    title: "Error loading pipelines",
                    description: "There was a problem loading your sales pipelines",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPipelines();
    }, []);

    // 2) Filter by date range whenever dateFilter or custom range changes
    useEffect(() => {
        let startDate: Date | null = null;
        let endDate: Date | null = endOfToday();

        switch (dateFilter) {
            case "Today":
                startDate = startOfToday();
                break;
            case "Yesterday":
                startDate = startOfYesterday();
                endDate = startOfToday();
                break;
            case "ThisWeek":
                startDate = startOfWeek(new Date());
                break;
            case "ThisMonth":
                startDate = startOfMonth(new Date());
                break;
            case "LastMonth":
                startDate = startOfMonth(subMonths(new Date(), 1));
                endDate = startOfMonth(new Date());
                break;
            case "Custom":
                if (customDateRange.start && customDateRange.end) {
                    startDate = customDateRange.start;
                    endDate = customDateRange.end;
                }
                break;
            case "AllTime":
                startDate = null;
                endDate = endOfToday();
                break;
            default:
                // AllTime => no filter
                startDate = null;
        }

        fetchLeadsWithDateRange(startDate, endDate);
        setDraggedLead(null);
    }, [dateFilter, selectedPipeline, customDateRange]);

    // 3) Fetch tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get("/api/tags");
                setTags(response.data);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
                toast({
                    title: "Error loading tags",
                    description: "There was a problem loading your tags",
                    variant: "destructive",
                });
            }
        };
        fetchTags();
    }, []);

    // 4) Fetch companies
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get<Company[]>("/api/companies");
                setCompanies(response.data);
            } catch (error) {
                console.error("Error fetching companies:", error);
                toast({
                    title: "Error loading companies",
                    description: "There was a problem loading your companies",
                    variant: "destructive",
                });
            }
        };
        fetchCompanies();
    }, []);

    // 5) When user opens the Add Lead modal, load products, contacts, sales team
    useEffect(() => {
        if (isLeadModalOpen) {
            const fetchDropdownData = async () => {
                try {
                    setIsLoading(true);
                    const [productsRes, contactsRes, usersRes, sourcesRes] = await Promise.all([
                        axios.get("/api/products"),
                        axios.get("/api/contacts"),
                        axios.get("/api/team-sales"),
                        axios.get("/api/sources"),
                    ]);

                    setProducts(productsRes.data?.map((p: any) => ({ _id: p._id, name: p.productName })));
                    setContacts(
                        contactsRes.data?.map((c: any) => ({
                            _id: c._id,
                            name: `${c.firstName} ${c.lastName}`,
                        }))
                    );

                    // Populate all users from the response as team members
                    if (usersRes.data) {
                        const members = usersRes.data?.map((u: any) => ({
                            _id: u._id,
                            firstName: u.firstName,
                            lastName: u.lastName,
                        }));
                        setTeamMembers(members);
                    } else {
                        setTeamMembers([]);
                    }

                    setSources(sourcesRes.data);
                } catch (error) {
                    console.error("Error fetching dropdown data:", error);
                    toast({
                        title: "Error loading data",
                        description: "Could not load all required form data",
                        variant: "destructive",
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDropdownData();
        }
    }, [isLeadModalOpen]);

    // 6) Whenever modalPipeline changes, build the stage list
    useEffect(() => {
        if (!modalPipeline) {
            setModalStages([]);
            setModalStage("");
            return;
        }
        const pipelineDoc = pipelines.find((p) => p._id === modalPipeline);
        if (pipelineDoc) {
            const combined = [
                ...pipelineDoc.openStages?.map((st) => ({ _id: st._id, name: st.name })),
                ...pipelineDoc.closeStages?.map((st) => ({ _id: st._id, name: st.name })),
            ];
            setModalStages(combined);
            setModalStage(combined?.length > 0 ? combined[0].name : "");
        }
    }, [modalPipeline, pipelines]);

    // Function to fetch leads based on date range
    const fetchLeadsWithDateRange = async (startDate: Date | null, endDate: Date | null) => {
        if (!selectedPipeline) return;

        try {
            setIsFetchingLeads(true);
            let startUTC = "";
            let endUTC = "";

            if (startDate) {
                const s = new Date(startDate);
                s.setUTCHours(0, 0, 0, 0);
                startUTC = s.toISOString();
            }

            if (endDate) {
                const e = new Date(endDate);
                e.setUTCHours(23, 59, 59, 999);
                endUTC = e.toISOString();
            }

            // Fetch the pipeline data first (to get stages)
            const pipelineResponse = await axios.get(`/api/pipelines/${selectedPipeline}`);
            const pipeline = pipelineResponse.data;

            // Fetch the filtered leads based on the date range for each stage
            const openStagesData = await Promise.all(
                pipeline.openStages.map(async (stage: Stage) => {
                    const response = await axios.get("/api/leads", {
                        params: {
                            startDate: startUTC,
                            endDate: endUTC,
                            pipelineId: selectedPipeline,
                            stage: stage.name, // Ensure we're getting leads for this stage
                        },
                    });
                    return {
                        ...stage,
                        leads: response.data.filter((lead: Lead) => {
                            const leadDate = new Date(lead.createdAt || lead.closeDate || Date.now());
                            return (
                                (!startDate || leadDate >= new Date(startUTC)) &&
                                (!endDate || leadDate <= new Date(endUTC))
                            );
                        }), // Filter leads within the date range
                    };
                })
            );

            const closeStagesData = await Promise.all(
                pipeline.closeStages.map(async (stage: Stage) => {
                    const response = await axios.get("/api/leads", {
                        params: {
                            startDate: startUTC,
                            endDate: endUTC,
                            pipelineId: selectedPipeline,
                            stage: stage.name, // Ensure we're getting leads for this stage
                        },
                    });
                    return {
                        ...stage,
                        leads: response.data.filter((lead: Lead) => {
                            const leadDate = new Date(lead.createdAt || lead.closeDate || Date.now());
                            return (
                                (!startDate || leadDate >= new Date(startUTC)) &&
                                (!endDate || leadDate <= new Date(endUTC))
                            );
                        }), // Filter leads within the date range
                    };
                })
            );

            // Combine the open and close stages with their filtered leads
            const allStages = [...openStagesData, ...closeStagesData];
            setStages(allStages); // Now set stages with the filtered leads

            toast({
                title: "Leads updated",
                description: `Showing leads from ${dateFilter === "Custom" ? "custom range" : dateFilter.toLowerCase()}`,
            });
        } catch (error) {
            console.error("Error fetching leads:", error);
            toast({
                title: "Error fetching leads",
                description: "There was a problem loading your leads",
                variant: "destructive",
            });
        } finally {
            setIsFetchingLeads(false);
        }
    };

    // Prepare board for a given pipeline
    const prepareStages = async (pipeline: Pipeline) => {
        try {
            setIsFetchingLeads(true);

            // Fetch open stages concurrently
            const openStages = Array.isArray(pipeline.openStages)
                ? await Promise.all(
                    pipeline.openStages.map(async (stObj) => {
                        // Check if the stage name exists
                        if (!stObj.name) {
                            console.error("Stage name is undefined in openStages:", stObj);
                            return null;
                        }

                        // Fetch leads for the stage
                        const res = await axios.get(`/api/leads?pipelineId=${pipeline._id}&stage=${stObj.name}`);
                        return res.data ? {
                            _id: stObj._id,
                            name: stObj.name,
                            color: stObj.color,
                            leads: res.data,
                            type: "open",
                        } : null;
                    })
                )
                : [];

            // Fetch close stages concurrently
            const closeStages = Array.isArray(pipeline.closeStages)
                ? await Promise.all(
                    pipeline.closeStages.map(async (stObj) => {
                        // Check if the stage name exists
                        if (!stObj.name) {
                            console.error("Stage name is undefined in closeStages:", stObj);
                            return null;
                        }

                        // Fetch leads for the stage
                        const res = await axios.get(`/api/leads?pipelineId=${pipeline._id}&stage=${stObj.name}`);
                        return res.data ? {
                            _id: stObj._id,
                            name: stObj.name,
                            color: stObj.color,
                            leads: res.data,
                            type: "close",
                        } : null;
                    })
                )
                : [];

            // Filter out null stages (if any stage was missing) and properly type cast
            const validStages = [...openStages.filter(Boolean), ...closeStages.filter(Boolean)] as Stage[];
            setStages(validStages);
            setCurrentPage(0);

            toast({
                title: "Pipeline loaded",
                description: `${pipeline.name} pipeline loaded successfully`,
            });
        } catch (error) {
            console.error("Failed to prepare stages:", error);
            toast({
                title: "Error loading stages",
                description: "Failed to prepare the pipeline stages",
                variant: "destructive",
            });
        } finally {
            setIsFetchingLeads(false);
        }
    };

    // When user picks a pipeline in the board
    const handlePipelineChange = async (val: string) => {
        setSelectedPipeline(val);
        setLoadingPipeline(val);

        try {
            const response = await axios.get<Pipeline>(`/api/pipelines/${val}`);
            await prepareStages(response.data);

            toast({
                title: "Pipeline changed",
                description: `Switched to ${response.data.name} pipeline`,
            });
        } catch (error) {
            console.error("Failed to fetch pipeline stages:", error);
            toast({
                title: "Error changing pipeline",
                description: "Failed to load the selected pipeline",
                variant: "destructive",
            });
        } finally {
            setLoadingPipeline(null);
        }
    };

    // Add new lead from the modal
    const handleAddLead = async () => {
        // Validate required fields
        const errors = [];

        if (!modalPipeline) errors.push("Pipeline is required");
        if (!modalStage) errors.push("Stage is required");
        if (!leadTitle.trim()) errors.push("Lead title is required");
        if (!selectedContact || selectedContact === "NONE") errors.push("Contact is required");

        if (errors.length > 0) {
            toast({
                title: "Missing required fields",
                description: (
                    <ul className="list-disc pl-4 space-y-1 mt-2">
                        {errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                        ))}
                    </ul>
                ),
                variant: "destructive",
            });
            return;
        }

        setIsCreatingLead(true);
        // Convert closeDate to string if needed
        const closeDateStr = closeDate ? format(closeDate, "yyyy-MM-dd") : "";

        try {
            // Prepare the data object, only including valid fields
            const leadData: any = {
                pipeline: modalPipeline,
                stage: modalStage,
                title: leadTitle,
                description,
                contact: selectedContact,
                closeDate: closeDateStr,
                files,
                audioRecordings,
                links
            };

            // Only add these fields if they have valid values
            if (selectedProduct && selectedProduct !== "NONE") {
                leadData.product = selectedProduct;
            }

            if (assignedTo && assignedTo !== "NONE") {
                leadData.assignedTo = assignedTo;
            }

            if (estimateAmount !== "") {
                leadData.estimateAmount = estimateAmount;
            }

            // Only include source if it's a valid value
            if (source && source.trim() !== "") {
                leadData.source = source;
            }

            await axios.post("/api/leads", leadData);

            // refresh board if current pipeline == modalPipeline
            if (selectedPipeline && selectedPipeline === modalPipeline) {
                const updated = await axios.get(`/api/pipelines/${selectedPipeline}`);
                await prepareStages(updated.data);
            }

            toast({
                title: "Lead created",
                description: "New lead has been created successfully",
            });

            // reset fields
            resetAddLeadForm();
            setIsLeadModalOpen(false);
        } catch (error) {
            console.error("Failed to create lead:", error);
            toast({
                title: "Failed to create lead",
                description: "There was an error creating your lead",
                variant: "destructive",
            });
        } finally {
            setIsCreatingLead(false);
        }
    };

    // Add a new state variable to track whether we're in edit mode
    const [isEditMode, setIsEditMode] = useState(false);
    const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);


    const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

    // Add this effect to fetch custom fields when pipeline changes
    useEffect(() => {
        if (!modalPipeline) {
            setCustomFieldValues({});
            return;
        }

        // Find the selected pipeline to get its custom field definitions
        const selectedPipeline = pipelines.find(p => p._id === modalPipeline);

        if (isEditMode && leadToEdit && leadToEdit.customFieldValues) {
            // If editing, preserve existing values
            setCustomFieldValues(leadToEdit.customFieldValues || {});
        } else {
            // If creating new, reset values
            setCustomFieldValues({});
        }
    }, [modalPipeline, pipelines, isEditMode, leadToEdit]);

    // Update handler to store custom field values
    const handleCustomFieldChange = (fieldName: string, value: any) => {
        setCustomFieldValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };
    // Add this function to handle editing a lead
    const handleEditLead = (lead: Lead) => {
        setLeadToEdit(lead);
        setIsEditMode(true);

        // Prefill the form with the lead's data
        setLeadTitle(lead.title || "");
        setDescription(lead.description || "");
        setEstimateAmount(lead.amount || "");
        setCloseDate(lead.closeDate ? new Date(lead.closeDate) : undefined);
        setEstimateAmount(lead.amount || "");

        // Pipeline & Stage
        setModalPipeline(selectedPipeline || ""); // Set to current pipeline or empty
        setModalStage(lead.stage || "");

        // Contact & Product
        setSelectedContact(lead.contact?._id || null);
        setSelectedProduct(lead.product || null);

        // Assignment
        setAssignedTo(lead.assignedTo?._id || "");

        // Source - need to set both the ID and the display name
        if (lead.source) {
            setSource(lead.source);
            // Find the source name for display
            const sourceName = sources.find(s => s._id === lead.source)?.name || "";
            setPopoverSourceInputValue(sourceName);
        }

        // Media attachments if available
        if (lead.files) setFiles(lead.files);
        if (lead.audioRecordings) setAudioRecordings(lead.audioRecordings);
        if (lead.links) setLinks(lead.links);
        // Load custom field values if available
        if (lead.customFieldValues) {
            setCustomFieldValues(lead.customFieldValues);
        } else {
            setCustomFieldValues({});
        }

        // Open the modal
        setIsLeadModalOpen(true);
    };

    // Add effect to reset custom fields when modal is closed
    useEffect(() => {
        if (!isLeadModalOpen) {
            setCustomFieldValues({});
        }
    }, [isLeadModalOpen]);
    // Modify the existing handleAddLead function to handle both add and edit
    const handleAddOrUpdateLead = async () => {
        // Validate required fields
        const errors = [];

        if (!modalPipeline) errors.push("Pipeline is required");
        if (!modalStage) errors.push("Stage is required");
        if (!leadTitle.trim()) errors.push("Lead title is required");
        if (!selectedContact || selectedContact === "NONE") errors.push("Contact is required");

        if (errors.length > 0) {
            toast({
                title: "Missing required fields",
                description: (
                    <ul className="list-disc pl-4 space-y-1 mt-2">
                        {errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                        ))}
                    </ul>
                ),
                variant: "destructive",
            });
            return;
        }

        setIsCreatingLead(true);
        // Convert closeDate to string if needed
        const closeDateStr = closeDate ? format(closeDate, "yyyy-MM-dd") : "";

        try {
            // Prepare the data object, only including valid fields
            const leadData: any = {
                pipeline: modalPipeline,
                stage: modalStage,
                title: leadTitle,
                description,
                contact: selectedContact,
                closeDate: closeDateStr,
                files,
                audioRecordings,
                links
            };

            if (Object.keys(customFieldValues).length > 0) {
                leadData.customFieldValues = customFieldValues;
            }

            // Only add these fields if they have valid values
            if (selectedProduct && selectedProduct !== "NONE") {
                leadData.product = selectedProduct;
            }

            if (assignedTo && assignedTo !== "NONE") {
                leadData.assignedTo = assignedTo;
            }

            if (estimateAmount !== "") {
                leadData.amount = estimateAmount;
            }

            // Only include source if it's a valid value
            if (source && source.trim() !== "") {
                leadData.source = source;
            }

            let responseMessage = "";

            if (isEditMode && leadToEdit) {
                // Add a remark for the timeline
                leadData.remark = "Lead information updated";

                // Update existing lead
                await axios.put(`/api/leads/${leadToEdit._id}`, leadData);
                responseMessage = "Lead updated successfully";
            } else {
                // Create new lead
                await axios.post("/api/leads", leadData);
                responseMessage = "New lead has been created successfully";
            }

            // refresh board if current pipeline == modalPipeline
            if (selectedPipeline && selectedPipeline === modalPipeline) {
                const updated = await axios.get(`/api/pipelines/${selectedPipeline}`);
                await prepareStages(updated.data);
            }

            toast({
                title: isEditMode ? "Lead updated" : "Lead created",
                description: responseMessage,
            });

            // reset fields
            resetAddLeadForm();
            setIsLeadModalOpen(false);
            setIsEditMode(false);
            setLeadToEdit(null);
        } catch (error) {
            console.error(isEditMode ? "Failed to update lead:" : "Failed to create lead:", error);
            toast({
                title: isEditMode ? "Failed to update lead" : "Failed to create lead",
                description: "There was an error with your request",
                variant: "destructive",
            });
        } finally {
            setIsCreatingLead(false);
        }
    };

    // Update the resetAddLeadForm function to also reset the edit mode
    function resetAddLeadForm() {
        setLeadTitle("");
        setDescription("");
        setEstimateAmount("");
        setCloseDate(undefined);
        setSelectedProduct(null);
        setSelectedContact(null);
        setModalPipeline("");
        setModalStage("");
        setModalStages([]);
        setAssignedTo("");
        setSource("");
        setNewSource("");
        setCustomDateRange({});
        setPopoverSourceInputValue("");
        setLinks([]);
        setFiles([]);
        setAudioRecordings([]);
        setIsEditMode(false);
        setLeadToEdit(null);
    }


    const handleDragStart = (event: any) => {
        const { active } = event;
        const { lead } = active.data.current;
        setDraggedLead(lead);
    };

    // -------------- Drag + Drop ---------------
    const handleDragEnd = (event: DragEndEvent) => {
        const { over, active } = event;

        if (!over || !active.id) return;

        const newStage = over.id as string;
        const leadId = active.id as string;

        // Find the dragged lead using its ID
        const draggedLeadItem = allLeads.find(lead => lead._id === leadId);

        if (!draggedLeadItem) return;

        // Find current stage of the lead
        const currentStage = stages.find(st =>
            st.leads.some(ld => ld._id === leadId)
        );

        // If we're dropping to the same stage, do nothing
        if (currentStage?.name === newStage) {
            setDraggedLead(null);
            return;
        }

        // Set the dragged lead and target stage to trigger the dialog
        setDraggedLead(draggedLeadItem);
        setTargetStage(newStage);

        // Important: Make sure to open the dialog
        setRemarkDialogOpen(true);

        toast({
            title: "Moving lead",
            description: `Please add a note about moving to ${newStage}`,
        });
    };

    const handleUpdateStage = async () => {
        if (!draggedLead || !targetStage) {
            toast({
                title: "Missing information",
                description: "Lead or target stage is missing",
                variant: "destructive",
            });
            return;
        }

        if (!remark.trim()) {
            toast({
                title: "Remark required",
                description: "Please add a note about this stage change",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsUpdatingStage(true);
            await axios.post("/api/leads/update-stage", {
                leadId: draggedLead._id,
                newStage: targetStage,
                movedBy: user?.userId,
                remark,
            });

            toast({
                title: "Stage updated",
                description: `Lead moved to ${targetStage} successfully`,
            });

            setRemarkDialogOpen(false);
            setRemark("");

            if (selectedPipeline) {
                const pipelineDoc = pipelines.find((p) => p._id === selectedPipeline);
                if (pipelineDoc) {
                    prepareStages(pipelineDoc);
                }
            }
        } catch (error) {
            console.error("Failed to update lead stage:", error);
            toast({
                title: "Update failed",
                description: "There was a problem updating the lead stage",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingStage(false);
            setDraggedLead(null);
        }
    };

    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -500,
                behavior: "smooth",
            });
        }
    };

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 500,
                behavior: "smooth",
            });
        }
    };

    // Filter modal handlers
    const openFilterModal = () => {
        setFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setFilterModalOpen(false);
    };

    const applyFilters = (filters: {
        assignedTo: string[];
        stages: string[];
        tags: string[];
        companies: string[];
    }) => {
        setAssignedToFilters(filters.assignedTo);
        setStageFilters(filters.stages);
        setTagFilters(filters.tags);
        setCompanyFilters(filters.companies);

        toast({
            title: "Filters applied",
            description: "Your lead view has been filtered",
        });
    };

    const clearFilters = () => {
        setAssignedToFilters([]);
        setStageFilters([]);
        setTagFilters([]);
        setCompanyFilters([]);

        toast({
            title: "Filters cleared",
            description: "All filters have been removed",
        });
    };

    // Calculate lead stats for dashboard
    const allLeads = stages.flatMap((st) => st.leads);
    const filteredAllLeads = allLeads; // currently no search/filters applied to the summary

    const selectedPipelineDoc = pipelines.find((p) => p._id === selectedPipeline);
    const closedStageNames = selectedPipelineDoc?.closeStages?.map((s) => s.name) || [];
    const openStageNames = selectedPipelineDoc?.openStages?.map((s) => s.name) || [];

    const openLeads = filteredAllLeads.filter((ld) =>
        ld && ld.stage && openStageNames.includes(ld.stage)
    );
    const closedLeads = filteredAllLeads.filter((ld) =>
        ld && ld.stage && closedStageNames.includes(ld.stage)
    );

    // For "won" or "lost," see which closeStages are won/lost
    const wonStageNames =
        selectedPipelineDoc?.closeStages.filter((s) => s.won)?.map((s) => s.name) || [];
    const lostStageNames =
        selectedPipelineDoc?.closeStages.filter((s) => s.lost)?.map((s) => s.name) || [];

    const wonLeads = closedLeads.filter((ld) => ld && ld.stage && wonStageNames.includes(ld.stage));
    const lostLeads = closedLeads.filter((ld) => ld && ld.stage && lostStageNames.includes(ld.stage));

    // Count & sum amounts
    const totalCount = allLeads?.length || 0;
    const totalAmount = allLeads?.reduce((sum, ld) => sum + (ld?.amount && !isNaN(ld.amount) ? ld.amount : 0), 0) || 0;

    const openCount = openLeads?.length || 0;
    const openAmount = openLeads?.reduce((sum, ld) => sum + (ld?.amount && !isNaN(ld.amount) ? ld.amount : 0), 0) || 0;

    const closedCount = closedLeads?.length || 0;
    const closedAmount = closedLeads?.reduce((sum, ld) => sum + (ld?.amount && !isNaN(ld.amount) ? ld.amount : 0), 0) || 0;

    const wonCount = wonLeads?.length || 0;
    const wonAmount = wonLeads?.reduce((sum, ld) => sum + (ld?.amount && !isNaN(ld.amount) ? ld.amount : 0), 0) || 0;

    const lostCount = lostLeads?.length || 0;
    const lostAmount = lostLeads?.reduce((sum, ld) => sum + (ld?.amount && !isNaN(ld.amount) ? ld.amount : 0), 0) || 0;

    // For stage changes
    const oldStageObj =
        selectedPipelineDoc && draggedLead && draggedLead.stage
            ? [...selectedPipelineDoc.openStages, ...selectedPipelineDoc.closeStages].find(
                (st) => st.name === draggedLead.stage
            )
            : null;

    const newStageObj =
        selectedPipelineDoc && targetStage
            ? [...selectedPipelineDoc.openStages, ...selectedPipelineDoc.closeStages].find(
                (st) => st.name === targetStage
            )
            : null;

    /* ---------------- RENDER ---------------- */
    // If user can't even view this page, show fallback
    if (permissionsLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-background/40 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">Loading permissions...</p>
            </div>
        );
    }

    // Check permissions after they've loaded
    // Check for view permission after permissions are loaded
    if (isInitialized && !canView("Leads")) {
        return (
            <NoPermissionFallback
                title="No Access to Leads"
                description="You don't have permission to view the leads page."
            />
        );
    }


    if (isLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-background/40 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">Loading your leads dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-4 mt-4  h-screen bg-background">
            <div className=" mx-auto">
                {/* Header with title */}
                {/* <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
                    <p className="text-muted-foreground">Manage your leads through the sales process</p>
                </div> */}

                {/* Date Range Quick Buttons */}
                <Card className="mb-6 border-none">
                    <CardContent className="p-2">
                        <div className="grid grid-cols-7 gap-2">
                            {[
                                { label: "Today", value: "Today" },
                                { label: "Yesterday", value: "Yesterday" },
                                { label: "This Week", value: "ThisWeek" },
                                { label: "This Month", value: "ThisMonth" },
                                { label: "Last Month", value: "LastMonth" },
                                { label: "All Time", value: "AllTime" },
                                { label: "Custom", value: "Custom" }
                            ].map((filter) => (
                                <Button
                                    key={filter.value}
                                    onClick={() => {
                                        setDateFilter(filter.value);
                                        if (filter.value === "Custom") {
                                            setIsCustomModalOpen(true);
                                        }
                                    }}
                                    variant={dateFilter === filter.value ? "default" : "outline"}
                                    className="h-9 text-xs"
                                    disabled={isFetchingLeads}
                                >
                                    {isFetchingLeads && dateFilter === filter.value ? (
                                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    ) : (
                                        <CalendarIcon className="h-3 w-3 mr-2" />
                                    )}
                                    {filter.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                {/* Header Section (Pipeline select, +Lead, Search, Filter) */}
                <div className="flex items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2 flex-grow">
                        {/* Pipeline Select (Shadcn) */}
                        <Select
                            value={selectedPipeline ?? "NONE"}
                            onValueChange={(val) => handlePipelineChange(val)}
                            disabled={isFetchingLeads || loadingPipeline !== null}
                        >
                            <SelectTrigger className="w-[220px]">
                                {loadingPipeline ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : null}
                                <SelectValue placeholder="Select a Pipeline" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                {pipelines?.map((pipeline) => (
                                    <SelectItem key={pipeline._id} value={pipeline._id}>
                                        {pipeline.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Search input */}
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Conditionally render Add Lead button based on permissions */}
                        {canAdd("Leads") ? (
                            <Button
                                variant="default"
                                onClick={() => {
                                    setIsLeadModalOpen(true);
                                }}
                                className="gap-1"
                                disabled={isCreatingLead}
                            >
                                {isCreatingLead ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditMode ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>{isEditMode ? "Update Lead" : "Create Lead"}</>
                                )}
                            </Button>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="default"
                                            className="gap-1 opacity-50 cursor-not-allowed"
                                            disabled
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Lead
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You don't have permission to add leads</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}


                        {/* Filter button */}
                        <Button
                            variant="outline"
                            onClick={openFilterModal}
                            className="gap-1"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                            {(assignedToFilters.length > 0 || stageFilters.length > 0 ||
                                tagFilters.length > 0 || companyFilters.length > 0) && (
                                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                        {assignedToFilters.length + stageFilters.length +
                                            tagFilters.length + companyFilters.length}
                                    </Badge>
                                )}
                        </Button>
                    </div>
                </div>

                {/* ----- STATS CARDS - REDESIGNED: SLEEKER & MORE ENGAGING ----- */}
                <div className="grid grid-cols-5 gap-3 mb-6">
                    {/* Total */}
                    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/5 opacity-50" /> */}
                        <CardContent className="p-3 relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">Total Leads</p>
                                    <h3 className="text-2xl font-bold mt-1">{totalCount}</h3>
                                </div>
                                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform duration-200">
                                    <FaUser className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <div className="mt-1.5 text-xs font-medium text-muted-foreground flex items-center">
                                <span className='flex gap-1 items-center'><FaMoneyBill />{totalAmount.toLocaleString()}</span>
                                <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground mx-1"></span>
                                <span>Total Value</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Open */}
                    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/5 opacity-50" /> */}
                        <CardContent className="p-3 relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400">Open Leads</p>
                                    <h3 className="text-2xl font-bold mt-1">{openCount}</h3>
                                </div>
                                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-200">
                                    <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="mt-1.5 text-xs font-medium text-muted-foreground flex items-center">
                                <span className='flex gap-1 items-center'><FaMoneyBill />{openAmount.toLocaleString()}</span>
                                {totalCount > 0 && (
                                    <>
                                        <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground mx-1"></span>
                                        <span>{Math.round((openCount / totalCount) * 100)}% of total</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Closed */}
                    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/5 opacity-50" /> */}
                        <CardContent className="p-3 relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">Closed Leads</p>
                                    <h3 className="text-2xl font-bold mt-1">{closedCount}</h3>
                                </div>
                                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-200">
                                    <EyeOff className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div className="mt-1.5 text-xs font-medium text-muted-foreground flex items-center">
                                <span className='flex gap-1 items-center'><FaMoneyBill />{closedAmount.toLocaleString()}</span>
                                {totalCount > 0 && (
                                    <>
                                        <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground mx-1"></span>
                                        <span>{Math.round((closedCount / totalCount) * 100)}% of total</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Won */}
                    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/5 opacity-50" /> */}
                        <CardContent className="p-3 relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Won Leads</p>
                                    <h3 className="text-2xl font-bold mt-1">{wonCount}</h3>
                                </div>
                                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-200">
                                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-1.5 text-xs font-medium text-muted-foreground flex items-center">
                                <span className='flex gap-1 items-center'><FaMoneyBill />{wonAmount.toLocaleString()}</span>
                                {closedCount > 0 && (
                                    <>
                                        <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground mx-1"></span>
                                        <span>{Math.round((wonCount / closedCount) * 100)}% win rate</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lost */}
                    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-800/5 opacity-50" /> */}
                        <CardContent className="p-3 relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-red-600 dark:text-red-400">Lost Leads</p>
                                    <h3 className="text-2xl font-bold mt-1">{lostCount}</h3>
                                </div>
                                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 group-hover:scale-110 transition-transform duration-200">
                                    <Cross2Icon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <div className="mt-1.5 text-xs font-medium text-muted-foreground flex items-center">
                                <span className='flex gap-1 items-center'><FaMoneyBill />{lostAmount.toLocaleString()}</span>
                                {closedCount > 0 && (
                                    <>
                                        <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground mx-1"></span>
                                        <span>{Math.round((lostCount / closedCount) * 100)}% loss rate</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>


                <FilterModal
                    isOpen={filterModalOpen}
                    onClose={closeFilterModal}
                    // Data
                    teamMembers={teamMembers}
                    stages={[
                        ...(pipelines.find(p => p._id === selectedPipeline)?.openStages.map(s => s.name) || []),
                        ...(pipelines.find(p => p._id === selectedPipeline)?.closeStages.map(s => s.name) || []),
                    ]}
                    tags={tags.map(t => t.name)}
                    companies={companies.map(c => c.companyName)}
                    // Already selected
                    selectedAssignedTo={assignedToFilters}
                    selectedStages={stageFilters}
                    selectedTags={tagFilters}
                    selectedCompanies={companyFilters}
                    // Callbacks
                    onApply={applyFilters}
                    onClear={clearFilters}
                />

                {selectedLeads.length > 0 && (
                    <div className="mb-4 flex items-center justify-between bg-muted/50 p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={selectedLeads.length > 0}
                                onCheckedChange={() => setSelectedLeads([])}
                            />
                            <span className="text-sm font-medium">{selectedLeads.length} leads selected</span>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setIsEmailDialogOpen(true)}
                            className="gap-2"
                        >
                            <Mail className="h-4 w-4" />
                            Send Email to Selected
                        </Button>
                    </div>
                )}
                {/* Horizontal scroll controls for pipeline */}
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-xl font-semibold">Pipeline Stages</h2>
                        {isFetchingLeads && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Updating leads...</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {/* Add the Select Mode Toggle button here */}
                        <Button
                            variant="outline"
                            onClick={() => setShowCheckboxes(!showCheckboxes)}
                            className="gap-1"
                        >
                            {showCheckboxes ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Exit Selection
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Select Leads
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleScrollLeft}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleScrollRight}>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Drag-and-Drop Context */}
                <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onDragStart={handleDragStart}
                >
                    <div
                        ref={scrollContainerRef}
                        className="w-full overflow-x-auto mb-24 scrollbar-hide h-[calc(120vh-380px)]" // Adjusted height for sleeker cards
                    >

                        <div className="flex gap-4  p-2  min-w-max">
                            {/* Use filteredStages instead of stages */}
                            {filteredStages.map((stage) => (
                                <DroppableStage
                                    key={stage._id || stage.name}
                                    stage={stage}
                                    onAddLead={canAdd("Leads") ? handleAddLeadToStage : undefined}
                                    onEditStage={canEdit("Leads") ? handleEditStage : undefined}
                                    onDeleteStage={canDelete("Leads") ? handleDeleteStage : undefined}
                                    onBulkDeleteToggle={canDelete("Leads") ? handleBulkDeleteToggle : undefined}
                                    isBulkDeleteEnabled={isBulkDeleteEnabled && canDelete("Leads")}
                                    canAddLead={canAdd("Leads")}
                                    canEditStage={canEdit("Leads")}
                                    canDeleteStage={canDelete("Leads")}
                                    showCheckboxes={showCheckboxes}
                                >
                                    {stage.leads.map((lead) => (
                                        <DraggableLead
                                            key={lead._id}
                                            lead={lead}
                                            setDraggedLead={setDraggedLead}
                                            canDrag={canEdit("Leads")}
                                            canView={canView("Leads")}
                                            onSelectChange={toggleLeadSelection}
                                            showCheckboxes={showCheckboxes}
                                            onLeadDeleted={() => {
                                                // Refresh the pipeline to show the updated leads
                                                if (selectedPipeline) {
                                                    const pipelineDoc = pipelines.find((p) => p._id === selectedPipeline);
                                                    if (pipelineDoc) {
                                                        prepareStages(pipelineDoc);
                                                    }
                                                }
                                            }}
                                            onLeadMoved={() => {
                                                // Refresh the pipeline to show the updated leads
                                                if (selectedPipeline) {
                                                    const pipelineDoc = pipelines.find((p) => p._id === selectedPipeline);
                                                    if (pipelineDoc) {
                                                        prepareStages(pipelineDoc);
                                                    }
                                                }
                                            }}
                                            onLeadEdit={handleEditLead}
                                        />
                                    ))}
                                </DroppableStage>
                            ))}
                        </div>
                    </div>

                    {/* Improved drag overlay with animation and highlights */}
                    <DragOverlay>
                        {draggedLead ? (
                            <Card className="w-[280px] shadow-xl border-2 border-primary bg-background/80 backdrop-blur-sm animate-pulse">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                        <h3 className="font-medium text-sm">{draggedLead.title}</h3>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            {draggedLead.leadId}
                                        </Badge>
                                        <p className="text-xs flex items-center gap-1 font-medium">
                                            <FaMoneyBill />{draggedLead.amount?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    {draggedLead.contact && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                            {draggedLead.contact.firstName} {draggedLead.contact.lastName}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ) : null}
                    </DragOverlay>
                </DndContext>
                <BulkEmailDialog
                    isOpen={isEmailDialogOpen}
                    onClose={() => setIsEmailDialogOpen(false)}
                    selectedLeads={selectedLeads}
                />

                {/* Add Lead Dialog */}
                <Dialog
                    open={isLeadModalOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            resetAddLeadForm();
                        }
                        setIsLeadModalOpen(open);
                    }}
                >
                    <DialogContent className="sm:max-w-[500px] h-fit max-h-screen m-auto overflow-y-scroll scrollbar-hide z-[100]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold"> {isEditMode ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                            <DialogDescription>
                                {isEditMode
                                    ? "Update the lead information below."
                                    : "Fill in the details to create a new sales lead."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Pipeline & Stage Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Pipeline *</label>
                                    <Select
                                        value={modalPipeline}
                                        onValueChange={(val) => setModalPipeline(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select pipeline" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100]">
                                            {pipelines?.map((pl) => (
                                                <SelectItem className="hover:bg-accent" key={pl._id} value={pl._id}>
                                                    {pl.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stage</label>
                                    <Select
                                        value={modalStage}
                                        onValueChange={(val) => setModalStage(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select stage" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100]">
                                            {modalStages?.map((st) => (
                                                <SelectItem className="hover:bg-accent" key={st._id} value={st.name}>
                                                    {st.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Lead Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Lead Title *</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Enterprise Software Deal"
                                    value={leadTitle}
                                    onChange={(e) => setLeadTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    placeholder="Lead details..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Product & Contact Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Product</label>
                                    <Select
                                        value={selectedProduct ?? "NONE"}
                                        onValueChange={(val) => setSelectedProduct(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose product" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100]">
                                            <SelectItem value="NONE">Select product</SelectItem>
                                            {products?.map((prod) => (
                                                <SelectItem className='hover:bg-accent' key={prod._id} value={prod._id}>
                                                    {prod.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact *</label>
                                    <Select
                                        value={selectedContact ?? "NONE"}
                                        onValueChange={(val) => setSelectedContact(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose contact" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100]">
                                            <SelectItem value="NONE">Select contact</SelectItem>
                                            {contacts?.map((contact) => (
                                                <SelectItem className="hover:bg-accent" key={contact._id} value={contact._id}>
                                                    {contact.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Estimate Amount & Close Date Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Estimate Amount</label>
                                    <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                                        <div className="px-3 py-2 bg-muted">
                                            <FaMoneyBill className=" text-muted-foreground" />
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={estimateAmount}
                                            onChange={(e) => setEstimateAmount(Number(e.target.value))}
                                            className="flex-1 px-3 py-2 text-sm border-0 focus:outline-none bg-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Close Date</label>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                        onClick={() => setDateDialogOpen(true)}
                                    >
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        {closeDate ? format(closeDate, "PPP") : "Select date"}
                                    </Button>
                                </div>
                            </div>

                            {/* Assigned To & Source Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assigned To *</label>
                                    <Select
                                        value={assignedTo}
                                        onValueChange={(val) => setAssignedTo(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Assigned To" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100]">
                                            <SelectItem value="NONE">Select User</SelectItem>
                                            {teamMembers?.map((tm) => (
                                                <SelectItem className="hover:bg-accent" key={tm._id} value={tm._id}>
                                                    {tm.firstName} {tm.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Source</label>
                                    <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <Tag className="mr-2 h-4 w-4" />
                                                {popoverSourceInputValue || "Select source"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                            <SourceSelectPopup
                                                sources={sources}
                                                source={source}
                                                setSource={setSource}
                                                newSource={newSource}
                                                setSources={setSources}
                                                setNewSource={setNewSource}
                                                searchSourceQuery={searchSourceQuery}
                                                setSearchSourceQuery={setSearchSourceQuery}
                                                onClose={handleCloseSourcePopup}
                                                closeOnSelect={handleSourceClose}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                        {modalPipeline && pipelines.find(p => p._id === modalPipeline)?.customFields && (pipelines.find(p => p._id === modalPipeline)?.customFields?.length ?? 0) > 0 && (
                            <div className="space-y-4 mt-4">
                                <Separator />
                                <h3 className="text-sm font-medium">Custom Fields</h3>

                                <div className="grid gap-4">
                                    {pipelines.find(p => p._id === modalPipeline)?.customFields?.map((field) => (
                                        <div key={field.name} className="space-y-2">
                                            <label className="text-sm font-medium">{field.name}</label>

                                            {field.type === "Text" && (
                                                <Input
                                                    value={customFieldValues[field.name] || ""}
                                                    onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                                />
                                            )}

                                            {field.type === "Number" && (
                                                <Input
                                                    type="number"
                                                    value={customFieldValues[field.name] || ""}
                                                    onChange={(e) => handleCustomFieldChange(field.name, Number(e.target.value))}
                                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                                />
                                            )}

                                            {field.type === "Date" && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start text-left font-normal"
                                                        >
                                                            {customFieldValues[field.name] ? format(new Date(customFieldValues[field.name]), "PPP") : (
                                                                <span className="text-muted-foreground">Select date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={customFieldValues[field.name] ? new Date(customFieldValues[field.name]) : undefined}
                                                            onSelect={(date) => handleCustomFieldChange(field.name, date)}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}

                                            {field.type === "MultiSelect" && field.options && (
                                                <Select
                                                    value={customFieldValues[field.name] || ""}
                                                    onValueChange={(val) => handleCustomFieldChange(field.name, val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                                                    </SelectTrigger>
                                                    <SelectContent className="z-[100]">
                                                        {field.options.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <MediaAttachments
                            initialFiles={files}
                            initialAudioRecordings={audioRecordings}
                            initialLinks={links}
                            onFilesChange={setFiles}
                            onAudioRecordingsChange={setAudioRecordings}
                            onLinksChange={setLinks}
                        />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    resetAddLeadForm();
                                    setIsLeadModalOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleAddOrUpdateLead}
                                disabled={isCreatingLead}
                            >
                                {isCreatingLead ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditMode ? "Updating... " : "Creating..."}
                                    </>
                                ) : (
                                    isEditMode ? "Update Lead" : "Create Lead"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Calendar Dialog for Lead Close Date */}
                <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
                    <DialogContent className="w-fit z-[100] p-0">
                        <DialogHeader className="p-4 pb-0">
                            <DialogTitle>Select Close Date</DialogTitle>
                            <DialogDescription>
                                Choose the expected date to close this lead.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 pt-0">
                            <Calendar
                                mode="single"
                                selected={closeDate}
                                onSelect={(day) => setCloseDate(day)}
                                initialFocus
                                className="rounded-md border"
                            />
                        </div>
                        <DialogFooter className="p-4 pt-0">
                            <Button
                                onClick={() => setDateDialogOpen(false)}
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Custom Date Range Dialog */}
                <Dialog
                    open={isCustomModalOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            // Only apply the current custom range if both dates are selected
                            if (!customDateRange.start || !customDateRange.end) {
                                toast({
                                    title: "Incomplete date range",
                                    description: "Both start and end dates are required",
                                    variant: "destructive",
                                });
                            }
                        }
                        setIsCustomModalOpen(open);
                    }}
                >
                    <DialogContent className="sm:max-w-[500px] z-[100]">
                        <DialogHeader>
                            <DialogTitle>Custom Date Range</DialogTitle>
                            <DialogDescription>
                                Select specific start and end dates to filter your leads.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            {customDateRange.start ? (
                                                format(customDateRange.start, "PPP")
                                            ) : (
                                                <span className="text-muted-foreground">Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={customDateRange.start}
                                            onSelect={(date) =>
                                                setCustomDateRange((prev) => ({ ...prev, start: date || undefined }))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            {customDateRange.end ? (
                                                format(customDateRange.end, "PPP")
                                            ) : (
                                                <span className="text-muted-foreground">Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={customDateRange.end}
                                            onSelect={(date) =>
                                                setCustomDateRange((prev) => ({ ...prev, end: date || undefined }))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsCustomModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (!customDateRange.start || !customDateRange.end) {
                                        toast({
                                            title: "Incomplete selection",
                                            description: "Please select both start and end dates",
                                            variant: "destructive",
                                        });
                                        return;
                                    }

                                    if (customDateRange.start > customDateRange.end) {
                                        toast({
                                            title: "Invalid date range",
                                            description: "End date must be after start date",
                                            variant: "destructive",
                                        });
                                        return;
                                    }

                                    setDateFilter("Custom");
                                    setIsCustomModalOpen(false);
                                }}
                            >
                                Apply Range
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Stage Dialog */}
                <Dialog open={isEditStageDialogOpen} onOpenChange={setIsEditStageDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] z-[100]">
                        <DialogHeader>
                            <DialogTitle>Edit Stage</DialogTitle>
                            <DialogDescription>
                                Update the name of this pipeline stage.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stage Name</label>
                                <Input
                                    value={editedStageName}
                                    onChange={(e) => setEditedStageName(e.target.value)}
                                    placeholder="Enter stage name"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditStageDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEditStageSubmit}
                                disabled={isUpdatingStage || !editedStageName.trim()}
                            >
                                {isUpdatingStage ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>Save Changes</>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Stage Alert Dialog */}
                <AlertDialog open={isDeleteStageDialogOpen} onOpenChange={setIsDeleteStageDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the stage "{selectedStage?.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={handleDeleteStageSubmit}
                                disabled={isUpdatingStage}
                            >
                                {isUpdatingStage ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>Delete Stage</>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Remark Dialog */}
                <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
                    <DialogContent className="sm:max-w-[500px] z-[100]">
                        <DialogHeader>
                            <DialogTitle>Stage Change</DialogTitle>
                            <DialogDescription>
                                Please provide a note about this stage change.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <div className="flex items-center justify-between mb-4">

                                <div className="flex items-center gap-2">
                                    <Badge
                                        className="px-3 py-1"
                                        style={{
                                            backgroundColor: oldStageObj?.color || "#999",
                                            color: isDarkColor(oldStageObj?.color) ? 'white' : 'black'
                                        }}
                                    >
                                        {oldStageObj?.name || draggedLead?.stage}
                                    </Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <Badge
                                        className="px-3 py-1"
                                        style={{
                                            backgroundColor: newStageObj?.color || "#999",
                                            color: isDarkColor(newStageObj?.color) ? 'white' : 'black'
                                        }}
                                    >
                                        {newStageObj?.name || targetStage}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Lead</label>
                                    <Badge variant="outline">{draggedLead?.leadId}</Badge>
                                </div>
                                <p className="text-sm font-semibold">{draggedLead?.title}</p>
                            </div>

                            <div className="space-y-2 mt-4">
                                <label className="text-sm font-medium">Note about this change*</label>
                                <Textarea
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    placeholder="Why is this lead changing stages?"
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRemarkDialogOpen(false);
                                    setDraggedLead(null);
                                    setTargetStage(null);
                                    setRemark("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateStage}
                                disabled={isUpdatingStage || !remark.trim()}
                            >
                                {isUpdatingStage ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>Move Lead</>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

/* Helper function to determine if a color is dark (for text contrast) */
function isDarkColor(hexColor?: string): boolean {
    if (!hexColor) return false;

    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate brightness (ITU-R BT.709)
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

    // Return true if color is dark
    return brightness < 0.5;
}

/* ---------------- Draggable Lead Component ---------------- */
// ... existing code ...

function DraggableLead({
    lead,
    setDraggedLead,
    canDrag = true,
    canView = true,
    onSelectChange, // Add this prop
    showCheckboxes = false, // Add this prop with default false
    onLeadDeleted,
    onLeadMoved,
    onLeadEdit, // Add this prop
}: {
    lead: Lead;
    setDraggedLead: React.Dispatch<React.SetStateAction<Lead | null>>;
    canDrag?: boolean;
    canView?: boolean;
    onSelectChange?: (lead: Lead, isSelected: boolean) => void; // Add this
    showCheckboxes?: boolean; //
    onLeadDeleted?: () => void;
    onLeadMoved?: () => void;
    onLeadEdit?: (lead: Lead) => void; // Add this type
}) {
    const router = useRouter();
    const [isSelected, setIsSelected] = useState(false);
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: lead._id,
        data: {
            lead,
        },
        disabled: !canDrag, // Disable dragging if user doesn't have edit permission
    })

    const handleNavigate = (e: React.MouseEvent) => {
        if (!canView) return; // Don't navigate if can't view
        e.stopPropagation();
        router.push(`/CRM/leads/${lead._id}`);
    };

    const toggleSelection = () => {
        const newState = !isSelected;
        setIsSelected(newState);
        if (onSelectChange) {
            onSelectChange(lead, newState);
        }
    };

    const handleCheckboxChange = (checked: boolean | string) => {
        const isChecked = !!checked;
        setIsSelected(isChecked);
        if (onSelectChange) {
            onSelectChange(lead, isChecked);
        }
    };
    return (
        <Card
            className="mt-3 border hover:border-primary relative hover:shadow-md transition-all duration-200 cursor-pointer"
        >
            <div
                className="absolute right-8  items-center flex">

                <MoveLeadDialog
                    leadId={lead._id}
                    currentStage={lead.stage || ""}
                    onLeadMoved={() => {
                        if (onLeadMoved) onLeadMoved();
                    }}
                />
            </div>
            <LeadActionMenu
                leadId={lead._id}
                lead={lead}
                currentStage={lead.stage || ""}
                canEdit={canEdit("Leads")}
                canDelete={canDelete("Leads")}
                canMove={canDrag}
                onDeleteSuccess={onLeadDeleted}
                onMoveSuccess={onLeadMoved}
                onEditClick={onLeadEdit}
            />
            <div
                ref={canDrag ? setNodeRef : undefined}
                {...(canDrag ? attributes : {})}
                {...(canDrag ? listeners : {})}
                className="p-3"
                onClick={canView ? handleNavigate : undefined}
            >

                <div className="flex gap-4 items-start">
                    {showCheckboxes && (
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
                            className="h-4 w-4"
                        />
                    )}
                    <h3 className="font-medium text-sm line-clamp-2">
                        {lead.title.length > 20 ? `${lead.title.slice(0, 20)}...` : lead.title}
                    </h3>

                </div>

                {isSelected && (
                    <div className="mt-1 mb-2">
                        <Badge variant="secondary" className="text-xs">Selected</Badge>
                    </div>
                )}

                <Separator className="my-2" />

                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10">
                                {lead.contact?.firstName?.[0]}{lead.contact?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground line-clamp-1">
                            {lead.contact?.firstName} {lead.contact?.lastName}
                        </span>
                    </div>

                    {/* Rest of the card content remains unchanged */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <FaMoneyBill className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{lead.amount?.toLocaleString() || 0}</span>
                        </div>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {lead.closeDate
                                                ? format(new Date(lead.closeDate), "dd MMM")
                                                : "N/A"}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Close Date: {lead.closeDate
                                        ? format(new Date(lead.closeDate), "PPP")
                                        : "Not set"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Rest of your existing lead card content */}
                    {lead.assignedTo && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="bg-blue-500/10 text-blue-500 text-[8px]">
                                    {lead.assignedTo?.firstName?.[0]}{lead.assignedTo?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-blue-500">
                                {lead.assignedTo?.firstName} {lead.assignedTo?.lastName}
                            </span>
                        </div>
                    )}
                    <div className='flex items-center justify-between'>
                        {lead.createdAt && (
                            <p className="text-[10px] text-muted-foreground mt-2">
                                Created {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                            </p>
                        )}
                        <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs  h-5">
                                {lead.leadId}
                            </Badge>

                        </div>
                    </div>
                </div>
            </div>
        </Card >
    );
}

// ... rest of your code
/* ---------------- Droppable Stage Component ---------------- */
function DroppableStage({
    stage,
    children,
    onAddLead,
    onEditStage,
    onDeleteStage,
    onBulkDeleteToggle,
    isBulkDeleteEnabled,
    canAddLead = true,
    canEditStage = true,
    canDeleteStage = true,
    showCheckboxes = false,
    searchTerm = "",
}: {
    stage: Stage;
    children: React.ReactNode;
    onAddLead?: (stage: Stage) => void;
    onEditStage?: (stage: Stage) => void;
    onDeleteStage?: (stage: Stage) => void;
    onBulkDeleteToggle?: (stageName: string) => void;
    isBulkDeleteEnabled?: boolean;
    canAddLead?: boolean;
    canEditStage?: boolean;
    canDeleteStage?: boolean;
    showCheckboxes?: boolean;
    searchTerm?: string;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.name,
        disabled: !canEditStage,
    });

    const totalAmount = stage?.leads?.reduce((sum, ld) => sum + (ld.amount || 0), 0) || 0;
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    function handleSelectToggle(stageName: string) {
        setSelectedStages((prev) =>
            prev.includes(stageName) ? prev.filter((s) => s !== stageName) : [...prev, stageName]
        );
    }

    const handleBulkDeleteToggle = (stageName: string) => {
        if (onBulkDeleteToggle) onBulkDeleteToggle(stageName);
    };

    const filteredChildren = React.Children.toArray(children).filter(child => {
        if (!searchTerm.trim()) return true;
        return React.isValidElement(child) &&
            String(child.key).toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <Card
            className={cn(
                "min-w-[325px] border bg-card transition-all duration-150 flex flex-col h-[calc(115vh-360px)]", // Added flex and height
                isOver && canEditStage && "ring-2 ring-primary ring-offset-2"
            )}
            style={{
                borderTopWidth: '3px',
                borderTopColor: stage.color,
                boxShadow: isOver ? `0 0 0 1px ${stage.color}` : undefined
            }}
        >
            {/* Fixed Header */}
            <CardHeader className="p-3 pb-1 space-y-0 flex-shrink-0 border-b bg-card">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">
                            {stage.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                            {stage?.leads?.length || 0}
                        </Badge>
                    </div>

                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>

                        {(canAddLead || canEditStage || canDeleteStage) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <DotsVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Stage Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {canAddLead && onAddLead && (
                                        <DropdownMenuItem onClick={() => onAddLead(stage)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Lead
                                        </DropdownMenuItem>
                                    )}
                                    {canEditStage && onEditStage && (
                                        <DropdownMenuItem onClick={() => onEditStage(stage)}>
                                            <Settings className="h-4 w-4 mr-2" />
                                            Edit Stage
                                        </DropdownMenuItem>
                                    )}

                                    {canDeleteStage && onDeleteStage && (
                                        <DropdownMenuItem onClick={() => onDeleteStage(stage)} className="text-destructive">
                                            <Cross2Icon className="h-4 w-4 mr-2" />
                                            Delete Stage
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                    <p className="text-muted-foreground text-xs">Total:</p>
                    <p className="font-medium text-lg flex gap-1 items-center">
                        <FaMoneyBill />
                        {totalAmount.toLocaleString()}
                    </p>
                </div>
            </CardHeader>

            {/* Scrollable Content Area */}
            <div
                ref={canEditStage ? setNodeRef : undefined}
                className={cn(
                    "flex-1 overflow-hidden transition-all duration-300",
                    isCollapsed && "opacity-50"
                )}
            >
                <ScrollArea className="h-full">
                    <div className="p-2">
                        {isBulkDeleteEnabled && (
                            <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        onChange={() => handleBulkDeleteToggle(stage.name)}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs font-medium">Select for bulk delete</span>
                                </label>
                            </div>
                        )}

                        {/* Lead Cards */}
                        {searchTerm.trim() ? filteredChildren : children}

                        {/* Empty State */}
                        {(stage.leads?.length === 0 || (searchTerm.trim() && filteredChildren.length === 0)) && (
                            <div className="flex flex-col items-center justify-center h-40 text-center border border-dashed rounded-md p-4 mx-2 mt-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                    {searchTerm.trim() ? "No matching leads found" : "No leads in this stage"}
                                </p>

                                {!searchTerm.trim() && canAddLead && onAddLead && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => onAddLead(stage)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Lead
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </Card>
    );
}

/* ---------------- Source Select Popup Component ---------------- */
const SourceSelectPopup: React.FC<{
    sources: ISource[];
    source: string;
    setSource: (val: string) => void;
    newSource: string;
    setNewSource: React.Dispatch<React.SetStateAction<string>>;
    setSources: React.Dispatch<React.SetStateAction<ISource[]>>;
    searchSourceQuery: string;
    setSearchSourceQuery: React.Dispatch<React.SetStateAction<string>>;
    onClose: () => void;
    closeOnSelect: (sourceName: string) => void;
    role?: string;
}> = ({
    sources,
    source,
    setSource,
    newSource,
    setNewSource,
    setSources,
    searchSourceQuery,
    setSearchSourceQuery,
    onClose,
    closeOnSelect,
    role,
}) => {
        const { toast } = useToast();
        const [isCreatingSource, setIsCreatingSource] = useState(false);

        // Filter the sources by the search query
        const filteredSources = sources.filter((src) =>
            src.name.toLowerCase().includes(searchSourceQuery.toLowerCase())
        );

        // When user selects a source from the list
        const handleSelectSource = (selectedSourceId: string) => {
            const selected = sources.find((src) => src._id === selectedSourceId);
            if (selected) {
                setSource(selected._id);          // store the chosen source's _id
                closeOnSelect(selected.name);     // to show in the button label, e.g.
            }
        };

        // Create new source
        const handleCreateSource = async () => {
            if (!newSource.trim()) {
                toast({
                    title: "Source name required",
                    description: "Please enter a name for the new source",
                    variant: "destructive",
                });
                return;
            }

            try {
                setIsCreatingSource(true);
                // API endpoint for new source creation
                const response = await axios.post("/api/sources", {
                    name: newSource.trim(),
                });

                if (response.status === 201) {
                    // Add the new source to the local list
                    setSources((prev) => [...prev, response.data]);
                    setNewSource("");
                    toast({
                        title: "Source created",
                        description: "New lead source has been created successfully",
                    });
                }
            } catch (error) {
                console.error("Error creating source:", error);
                toast({
                    title: "Failed to create source",
                    description: "There was an error creating the lead source",
                    variant: "destructive",
                });
            } finally {
                setIsCreatingSource(false);
            }
        };

        return (
            <div className="p-2">
                <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sources..."
                        className="pl-8"
                        value={searchSourceQuery}
                        onChange={(e) => setSearchSourceQuery(e.target.value)}
                    />
                </div>

                <ScrollArea className="h-60 border rounded-md p-1">
                    {filteredSources.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No sources found
                        </div>
                    ) : (
                        <div className="space-y-1 p-1">
                            {filteredSources.map((src) => (
                                <div
                                    key={src._id}
                                    className={cn(
                                        "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent",
                                        source === src._id && "bg-accent"
                                    )}
                                    onClick={() => handleSelectSource(src._id)}
                                >
                                    <span className="text-sm">{src.name}</span>
                                    {source === src._id && (
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <Separator className="my-3" />

                <div className="space-y-2">
                    <p className="text-sm font-medium">Create New Source</p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter source name"
                            value={newSource}
                            onChange={(e) => setNewSource(e.target.value)}
                        />
                        <Button
                            size="icon"
                            onClick={handleCreateSource}
                            disabled={isCreatingSource || !newSource.trim()}
                        >
                            {isCreatingSource ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

