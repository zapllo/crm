"use client";

import React, { useEffect, useState, ChangeEvent, useRef } from "react";
import axios from "axios";
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    User,
} from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CrossCircledIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import FilterModal from "@/components/modals/filters/filterLeads";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaCalendar, FaMoneyBill, FaUser } from "react-icons/fa";
import { endOfToday, format, formatDistanceToNow, startOfMonth, startOfToday, startOfWeek, startOfYesterday, subMonths } from "date-fns";
import { useUserContext } from "@/contexts/userContext";

/* ---------------- TYPES ---------------- */
interface Lead {
    assignedTo: string;
    _id: string;
    leadId: string;
    title: string;
    description?: string;
    product?: string;
    contact?: string;
    amount?: number;
    closeDate?: string;
    stage?: string;
}

interface Stage {
    _id?: string;       // if you want the ObjectId as well
    name: string;
    color: string;      // add color here
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
    }[];
    closeStages: {
        _id: string;
        name: string;
        color: string;
    }[];
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

// For the user in the Sales Team
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


/* 
  For filter dialog:
  We'll keep arrays for selected assignedTo, selectedStages, selectedTags, selectedCompanies
*/
interface FiltersState {
    assignedTos: string[]; // array of userIds
    stages: string[];      // array of stage names
    tags: string[];        // e.g. ["Important", "FollowUp"]
    companies: string[];   // e.g. ["Acme Inc", ...]
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function LeadsDashboard() {
    // Pipelines & Board
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
    const { user } = useUserContext();

    console.log(user, 'check')
    // Stages/Leads
    const [stages, setStages] = useState<Stage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Searching & Filtering
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<FiltersState>({
        assignedTos: [],
        stages: [],
        tags: [],
        companies: [],
    });
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
    const [closeDate, setCloseDate] = useState("");

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

    const [dateFilter, setDateFilter] = useState<string>("AllTime");
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
    });


    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, // must move pointer 5px before drag starts
        },
    });

    // 2. Combine sensors if you have more than one
    const sensors = useSensors(pointerSensor);


    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const router = useRouter();

    /* ---------------- Effects ---------------- */
    // 1) Load pipeline board on mount
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get<Pipeline[]>("/api/pipelines");
                setPipelines(response.data);

                if (response.data.length > 0) {
                    const first = response.data[0];
                    setSelectedPipeline(first._id);
                    prepareStages(first);
                }
            } catch (error) {
                console.error("Failed to fetch pipelines:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPipelines();
    }, []);



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
                    startDate = new Date(customDateRange.start);
                    endDate = new Date(customDateRange.end);
                }
                break;
            default:
                startDate = null;
        }


        fetchLeadsWithDateRange(startDate, endDate);
    }, [dateFilter, customDateRange]);

    console.log(selectedPipeline, 'okay')
    const fetchLeadsWithDateRange = async (startDate: Date, endDate: Date) => {
        try {
            // Convert to UTC
            const startUTC = new Date(startDate.setUTCHours(0, 0, 0, 0));
            const endUTC = new Date(endDate.setUTCHours(23, 59, 59, 999));

            console.log("Requesting Leads from:", startUTC.toISOString(), "to", endUTC.toISOString());

            const response = await axios.get("/api/leads", {
                params: {
                    startDate: startUTC.toISOString(),
                    endDate: endUTC.toISOString(),
                    pipelineId: selectedPipeline
                },
            });
            console.log("Leads Received:", response.data);
            setStages(response.data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };



    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get("/api/tags");
                setTags(response.data);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
            }
        };
    });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get<Company[]>("/api/companies");
                setCompanies(response.data);
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        fetchCompanies();
    }, []);

    // 2) When user opens the Add Lead modal, load products & contacts
    // 2) When user opens the Add Lead modal, load products & contacts, plus the Sales Team
    useEffect(() => {
        if (isLeadModalOpen) {
            const fetchDropdownData = async () => {
                try {
                    const [productsRes, contactsRes, salesTeamRes] = await Promise.all([
                        axios.get("/api/products"),
                        axios.get("/api/contacts"),
                        axios.get("/api/team-sales"), // fetch the single Sales Team
                    ]);

                    setProducts(
                        productsRes.data.map((p: any) => ({ _id: p._id, name: p.productName }))
                    );
                    setContacts(
                        contactsRes.data.map((c: any) => ({
                            _id: c._id,
                            name: `${c.firstName} ${c.lastName}`,
                        }))
                    );

                    // SalesTeam doc may have 'members': array of user docs
                    if (salesTeamRes.data && salesTeamRes.data.members) {
                        const members = salesTeamRes.data.members.map((u: any) => ({
                            _id: u._id,
                            firstName: u.firstName,
                            lastName: u.lastName,
                        }));
                        setTeamMembers(members);
                    } else {
                        setTeamMembers([]);
                    }
                } catch (error) {
                    console.error("Error fetching dropdown data:", error);
                }
            };
            fetchDropdownData();
        }
    }, [isLeadModalOpen]);


    useEffect(() => {
        if (!modalPipeline) {
            setModalStages([]);
            setModalStage("");
            return;
        }

        const pipelineDoc = pipelines.find((p) => p._id === modalPipeline);
        if (pipelineDoc) {
            // Each stage in openStages and closeStages looks like { _id, name, color }
            const combined = [
                ...pipelineDoc.openStages.map((st) => ({ _id: st._id, name: st.name })),
                ...pipelineDoc.closeStages.map((st) => ({ _id: st._id, name: st.name })),
            ];
            setModalStages(combined);

            // Default the <select> value to the first stage’s .name if you wish
            setModalStage(combined.length > 0 ? combined[0].name : "");
        }
    }, [modalPipeline, pipelines]);


    /* ---------------- Functions ---------------- */
    // Prepare board for a given pipeline
    // Prepare board for a given pipeline
    const prepareStages = async (pipeline: Pipeline) => {
        try {
            // Build openStages array
            const openStages = await Promise.all(
                pipeline.openStages.map(async (stObj: { name: string; color: string; _id: string }): Promise<Stage> => {
                    // stObj = { name, color, _id }
                    const res = await axios.get(`/api/leads?pipelineId=${pipeline._id}&stage=${stObj.name}`);
                    return {
                        name: stObj.name,
                        color: stObj.color,  // pass color
                        leads: res.data,
                        type: "open"
                    };
                })
            );

            // Build closeStages array
            const closeStages = await Promise.all(
                pipeline.closeStages.map(async (stObj: { name: string; color: string; _id: string }): Promise<Stage> => {
                    const res = await axios.get(`/api/leads?pipelineId=${pipeline._id}&stage=${stObj.name}`);
                    return {
                        name: stObj.name,
                        color: stObj.color,
                        leads: res.data,
                        type: "close"
                    };
                })
            );

            setStages([...openStages, ...closeStages]);
            setCurrentPage(0);
        } catch (error) {
            console.error("Failed to prepare stages:", error);
        }
    };


    // Called when user picks a pipeline in the board
    const handlePipelineChange = async (val: string) => {
        setSelectedPipeline(val);
        try {
            const response = await axios.get<Pipeline>(`/api/pipelines/${val}`);
            prepareStages(response.data);
        } catch (error) {
            console.error("Failed to fetch pipeline stages:", error);
        }
    };

    // Add new lead from the modal
    const handleAddLead = async () => {
        if (!modalPipeline || !modalStage) {
            console.error("No pipeline or stage selected in modal!");
            return;
        }
        try {
            await axios.post("/api/leads", {
                pipeline: modalPipeline,
                stage: modalStage,
                title: leadTitle,
                description,
                product: selectedProduct,
                contact: selectedContact,
                assignedTo: assignedTo,
                estimateAmount,
                closeDate,
            });

            // refresh board if current pipeline == modalPipeline
            if (selectedPipeline && selectedPipeline === modalPipeline) {
                const updated = await axios.get(`/api/pipelines/${selectedPipeline}`);
                await prepareStages(updated.data);
            }

            // reset fields
            setIsLeadModalOpen(false);
            setLeadTitle("");
            setDescription("");
            setEstimateAmount("");
            setCloseDate("");
            setSelectedProduct(null);
            setSelectedContact(null);
            setModalPipeline("");
            setModalStage("");
            setModalStages([]);
        } catch (error) {
            console.error("Failed to create lead:", error);
        }
    };

    // -------------- Drag + Drop ---------------
    const handleDragEnd = (event: DragEndEvent) => {
        const { over } = event;
        if (draggedLead && over) {
            const newStage = over.id as string;
            // find current stage
            const currentStage = stages.find((st) =>
                st.leads.some((ld) => ld._id === draggedLead._id)
            );
            // if same stage, do nothing
            if (currentStage?.name === newStage) {
                setDraggedLead(null);
                return;
            }
            // otherwise set target & show remark dialog
            setTargetStage(newStage);
            setRemarkDialogOpen(true);
        }
    };

    const handleUpdateStage = async () => {
        if (draggedLead && targetStage && remark) {
            try {
                await axios.post("/api/leads/update-stage", {
                    leadId: draggedLead._id,
                    newStage: targetStage,
                    movedBy: user?.userId,
                    remark,
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
            } finally {
                setDraggedLead(null);
            }
        }
    };

    // stage card actions
    function handleDeleteStage(stageName: string) {
        console.log("Delete stage: ", stageName);
    }
    function handleEditStage(stage: Stage) {
        console.log("Edit stage:", stage);
    }
    function handleAddLeadToStage(stageName: string) {
        console.log("Add lead to stage: ", stageName);
    }
    function handleSelectToggle(stageName: string) {
        console.log("Select/Unselect stage: ", stageName);
    }

    // pagination
    const totalPages = Math.ceil(stages.length / itemsPerPage);
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
    };
    const handlePreviousPage = () => {
        if (currentPage > 0) setCurrentPage((prev) => prev - 1);
    };




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
    };

    const clearFilters = () => {
        setAssignedToFilters([]);
        setStageFilters([]);
        setTagFilters([]);
        setCompanyFilters([]);
    };

    // For each stage, we apply searchTerm & filters
    function getFilteredLeads(leads: Lead[]) {
        let filtered = leads;

        // Filter by assignedTo
        if (assignedToFilters.length > 0) {
            filtered = filtered.filter((ld) => ld.assignedTo && assignedToFilters.includes(ld.assignedTo));
        }

        // Filter by stage
        if (stageFilters.length > 0) {
            filtered = filtered.filter((ld) => ld.stage && stageFilters.includes(ld.stage));
        }

        // Filter by tags, if you store lead.tags as an array
        if (tagFilters.length > 0) {
            filtered = filtered.filter((ld) =>
                ld.tags?.some((t) => tagFilters.includes(t))
            );
        }

        // Filter by companies if you store lead.company or lead.companies
        if (companyFilters.length > 0) {
            filtered = filtered.filter((ld) =>
                ld.company && companyFilters.includes(ld.company)
            );
        }

        return filtered;
    }



    // Summaries
    // We'll gather all leads from all stages, then compute open/closed
    const allLeads = stages.flatMap((st) => st.leads);
    const filteredAllLeads = allLeads.map((ld) => ld); // no search/filters here if you want total always?

    // If you want the summary to also reflect search/filters, do:
    // const filteredAllLeads = stages.flatMap(st => getFilteredLeads(st.leads));

    const openLeads = filteredAllLeads.filter((ld) =>
        // if the pipeline stage is "open" or ld.stage is in pipeline openStages
        // we can guess if ld.stage is in pipelineDoc.openStages
        // for simplicity, let's assume any stage in pipeline.openStages => "open"
        // We'll just do a naive check:
        ld.stage && pipelines.find((p) => p._id === selectedPipeline)?.openStages.includes(ld.stage)
    );
    // Fetch the selected pipeline
    const selectedPipelineDoc = pipelines.find(p => p._id === selectedPipeline);

    const closedLeads = filteredAllLeads.filter((lead) =>
        selectedPipelineDoc?.closeStages.some(stage => stage.name === lead.stage)
    );

    // Won Leads and Amount (filtered from closed leads)
    const wonLeads = closedLeads.filter(lead =>
        selectedPipelineDoc?.closeStages.some(stage => stage.name === lead.stage && stage.won)
    );
    const wonCount = wonLeads.length;
    const wonAmount = wonLeads.reduce((sum, lead) => sum + (lead.amount || 0), 0);

    // Lost Leads and Amount (filtered from closed leads)
    const lostLeads = closedLeads.filter(lead =>
        selectedPipelineDoc?.closeStages.some(stage => stage.name === lead.stage && stage.lost)
    );
    const lostCount = lostLeads.length;
    const lostAmount = lostLeads.reduce((sum, lead) => sum + (lead.amount || 0), 0);

    // Total Leads and Amount
    const totalCount = allLeads.length;
    const totalAmount = allLeads.reduce((sum, lead) => sum + (lead.amount || 0), 0);

    // Open Leads and Amount
    const openCount = openLeads.length;
    const openAmount = openLeads.reduce((sum, lead) => sum + (lead.amount || 0), 0);

    // Closed Leads and Amount
    const closedCount = closedLeads.length;
    const closedAmount = closedLeads.reduce((sum, lead) => sum + (lead.amount || 0), 0);



    /* ---------------- RENDER ---------------- */
    if (isLoading) {
        return (
            <div className="p-4 text-center">
                <p>Loading pipelines...</p>
            </div>
        );
    }

    function handleScrollLeft() {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -500, // Adjust the scroll distance as needed
                behavior: 'smooth',
            });
        }
    }

    function handleScrollRight() {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 500,
                behavior: 'smooth',
            });
        }
    }

    return (
        <div className="p-4  h-screen ">
            <div className="flex justify-center gap-4 mb-6">
                {["Today", "Yesterday", "ThisWeek", "ThisMonth", "LastMonth", "AllTime"].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-4 text-xs h-8 rounded ${dateFilter === filter ? "bg-[#815BF5] text-white" : "border text-white"
                            }`}
                    >
                        {filter.replace(/([A-Z])/g, " $1").trim()} {/* Converts "ThisWeek" to "This Week" */}
                    </button>
                ))}
                <button
                    onClick={() => setIsCustomModalOpen(true)}
                    className={`px-4 text-xs h-8 rounded ${dateFilter === "Custom" ? "bg-[#815BF5] text-white" : "border text-white"}`}
                >
                    Custom
                </button>
            </div>

            {/* Header Section */}
            <div className="flex justify-center">
                <div className="flex gap-4 items-center mb-6">
                    {/* Board Pipeline Filter */}
                    <Select
                        value={selectedPipeline ?? ""}
                        onValueChange={(val) => handlePipelineChange(val)}
                    >
                        <SelectTrigger className=" bg-[#04061e] text-sm border border-gray-600 focus:border-[#815bf5] rounded">
                            <SelectValue placeholder="Select a Pipeline" />
                        </SelectTrigger>
                        <SelectContent>
                            {pipelines.map((pipeline) => (
                                <SelectItem key={pipeline._id} value={pipeline._id}>
                                    {pipeline.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* + Lead button */}
                    <Button
                        variant="default"
                        onClick={() => {
                            setIsLeadModalOpen(true);
                            // If you want to default the modal's pipeline to the board pipeline:
                            setModalPipeline(selectedPipeline ?? "");
                        }}
                        className="bg-[#815bf5] text-white hover:bg-[#5f31e9] text-sm"
                    >
                        + Lead
                    </Button>

                    {/* Search Leads input */}
                    <Input
                        type="text"
                        label='Search Leads'
                        placeholder="Search Leads"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-sm border border-gray-600 focus:border-[#815bf5] rounded"
                    />


                    {/* Filter button */}
                    <Button
                        variant="default"
                        onClick={openFilterModal}
                        className="flex items-center gap-2 text-sm bg-[#017a5b] hover:bg-green-800"
                    >
                        <img src="/icons/crm.png" className="h-4" alt="CRM" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* ----- STATS ROW ----- */}
            <div className="flex justify-center">
                <div className="flex gap-4">
                    {/* Total Leads */}
                    <div className="border flex items-center border-l-2 w-32 border-l-yellow-300 rounded p-2 text-center text-xs text-white">
                        <div>
                            <h1>Total: <span>{totalCount}</span></h1>
                            <h1>Amount: <span>₹{totalAmount}</span></h1>
                        </div>
                    </div>

                    {/* Open Leads */}
                    <div className="border flex items-center border-l-2 w-32 border-l-green-300 rounded p-2 text-center text-xs text-white">
                        <div>
                            <h1>Open: <span>{openCount}</span></h1>
                            <h1>Amount: <span>₹{openAmount}</span></h1>
                        </div>
                    </div>

                    {/* Closed Leads */}
                    <div className="border flex items-center border-l-2 w-32 border-l-red-800 rounded p-2 text-center text-xs text-white">
                        <div>
                            <h1>Closed: <span>{closedCount}</span></h1>
                            <h1>Amount: <span>₹{closedAmount}</span></h1>
                        </div>
                    </div>

                    {/* Won Leads */}
                    <div className="border flex items-center border-l-2 w-32 border-l-blue-500 rounded p-2 text-center text-xs text-white">
                        <div>
                            <h1>Won: <span>{wonCount}</span></h1>
                            <h1>Amount: <span>₹{wonAmount}</span></h1>
                        </div>
                    </div>

                    {/* Lost Leads */}
                    <div className="border flex items-center border-l-2 w-32 border-l-red-500 rounded p-2 text-center text-xs text-white">
                        <div>
                            <h1>Lost: <span>{lostCount}</span></h1>
                            <h1>Amount: <span>₹{lostAmount}</span></h1>
                        </div>
                    </div>
                </div>
            </div>



            <FilterModal
                isOpen={filterModalOpen}
                onClose={closeFilterModal}
                // Data
                teamMembers={teamMembers}   // e.g. fetched from your salesTeam doc
                stages={[...(pipelines.find((p) => p._id === selectedPipeline)?.openStages || []),
                ...(pipelines.find((p) => p._id === selectedPipeline)?.closeStages || []),
                ]}
                tags={tags}
                companies={companies}
                // Already selected
                selectedAssignedTo={assignedToFilters}
                selectedStages={stageFilters}
                selectedTags={tagFilters}
                selectedCompanies={companyFilters}
                // Callbacks
                onApply={applyFilters}
                onClear={clearFilters}
            />

            <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
                <DialogContent className="z-[100] h-screen p-6 max-w-md w-full  text-white">
                    <div className="flex justify-between items-center ">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">Add Lead</DialogTitle>
                        </DialogHeader>

                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-white">
                        {/* Pipeline */}
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium leading-none text-muted-foreground">
                                Pipeline
                            </label>
                            <select
                                value={modalPipeline}
                                onChange={(e) => setModalPipeline(e.target.value)}
                                className="
            block w-full rounded-md border border-gray-600 
            px-3 py-2 text-sm placeholder:text-gray-400
            focus:outline-none 
          "
                            >
                                <option value="">Select pipeline</option>
                                {pipelines.map((pl) => (
                                    <option key={pl._id} value={pl._id}>
                                        {pl.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stage dropdown */}
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium leading-none text-muted-foreground -400">
                                Stage
                            </label>
                            <select
                                value={modalStage}
                                onChange={(e) => setModalStage(e.target.value)}
                                className="
            block w-full rounded-md border border-gray-600 
            px-3 py-2 text-sm placeholder:text-gray-400
            focus:outline-none
          "
                            >
                                <option value="">Select stage</option>
                                {modalStages.map((st) => (
                                    <option key={st._id} value={st.name}>
                                        {st.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lead Title */}
                        <div className="flex flex-col space-y-1">
                            {/* <label className="text-sm font-medium leading-none text-gray-400">
                                Lead Title
                            </label> */}
                            <Input
                                type="text"
                                label="Lead Title"
                                value={leadTitle}
                                onChange={(e) => setLeadTitle(e.target.value)}
                                required
                                className="
            block w-full rounded-md   bg-transparent
            px-3 py-2 text-sm 
            focus:outline-none 
          "
                            />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col space-y-1">
                            {/* <label className="text-sm font-medium leading-none text-gray-400">
                                Description
                            </label> */}
                            <Textarea
                                value={description}
                                label="Description"
                                onChange={(e) => setDescription(e.target.value)}
                                className="
            block w-full rounded-md bg-transparent
            px-3 py-2 text-sm -gray-400
            focus:outline-none
          "
                            />
                        </div>

                        {/* Select Product */}
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium leading-none text-gray-400">
                                Product
                            </label>
                            <select
                                value={selectedProduct ?? ""}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="
            block w-full rounded-md border border-gray-600 
            px-3 py-2 text-sm 
            focus:outline-none 
          "
                            >
                                <option value="">Choose product</option>
                                {products.length > 0 ? (
                                    products.map((prod) => (
                                        <option key={prod._id} value={prod._id}>
                                            {prod.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        No products available
                                    </option>
                                )}
                            </select>
                        </div>

                        {/* Select Contact */}
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium leading-none text-gray-400">
                                Contact
                            </label>
                            <select
                                value={selectedContact ?? ""}
                                onChange={(e) => setSelectedContact(e.target.value)}
                                className="
            block w-full rounded-md border border-gray-600 
            px-3 py-2 text-sm 
            focus:outline-none 
          "
                            >
                                <option value="">Choose contact</option>
                                {contacts.length > 0 ? (
                                    contacts.map((contact) => (
                                        <option key={contact._id} value={contact._id}>
                                            {contact.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        No contacts available
                                    </option>
                                )}
                            </select>
                        </div>

                        {/* Estimate Amount */}
                        <div className="flex flex-col space-y-1">
                            {/* <label className="text-xs font-medium leading-none text-gray-400">
                                Estimate Amount
                            </label> */}
                            <Input
                                label="Estimate Amount"
                                type="number"
                                value={estimateAmount}
                                onChange={(e) => setEstimateAmount(Number(e.target.value))}
                                className="
            block w-full rounded-md border border-gray-600 bg-transparent
            px-3 py-2 text-sm 
            focus:outline-none 
          "
                            />
                        </div>
                        {/* Assigned To (Sales Team) */}
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium leading-none text-gray-400">
                                Assigned To (Team Member)
                            </label>
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="block w-full rounded-md border border-gray-600  px-3 py-2 text-sm focus:outline-none"
                            >
                                <option value="">-- None --</option>
                                {teamMembers.map((tm) => (
                                    <option key={tm._id} value={tm._id}>
                                        {tm.firstName} {tm.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Lead Close Date */}
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium leading-none text-gray-400">
                                Lead Close Date
                            </label>
                            <input
                                type="date"
                                value={closeDate}
                                onChange={(e) => setCloseDate(e.target.value)}
                                className="
            block w-full rounded-md border border-gray-600 bg-transparent
            px-3 py-2 text-sm placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#815bf5]
          "
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleAddLead}
                            className="
          w-full mt-4 inline-flex items-center justify-center
          rounded-md bg-[#815bf5] px-4 py-2 text-sm font-medium
          text-white hover:bg-[#5f31e9] focus:outline-none focus:ring-2
          focus:ring-[#5f31e9] focus:ring-offset-2
        "
                        >
                            + Assign Lead
                        </button>
                    </form>
                </DialogContent>
            </Dialog>




            {/* Drag-and-Drop Context */}
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                {/* Horizontal scroll controls */}
                <div className="flex justify-end mt-4 gap-2 mb-2">
                    <Button variant="outline" onClick={handleScrollLeft}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" onClick={handleScrollRight}>
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="
      flex 
      flex-nowrap
      gap-4 
      overflow-x-auto 
      w-full 
      mt-2
      py-2 
      scrollbar-hide
    "
                >
                    {stages.map((stage, index) => (
                        <DroppableStage
                            key={stage.name}
                            stage={stage}
                            onDelete={handleDeleteStage}
                            onEdit={handleEditStage}
                            onAddLead={handleAddLeadToStage}
                            onSelectToggle={handleSelectToggle}
                        >
                            {stage.leads.map((lead) => (
                                <DraggableLead
                                    key={lead._id}
                                    lead={lead}
                                    index={index}
                                    setDraggedLead={setDraggedLead}
                                />
                            ))}
                        </DroppableStage>
                    ))}
                </div>

                <DragOverlay>
                    {draggedLead ? (
                        <Card className="p-2 border rounded shadow-lg">
                            <h3 className="font-bold text-sm">{draggedLead.title}</h3>
                            <p className="text-sm text-gray-400 mt-2">ID: {draggedLead.leadId}</p>
                            <p className="text-sm text-gray-400">Amount: ₹{draggedLead.amount || 0}</p>
                        </Card>
                    ) : null}
                </DragOverlay>
            </DndContext>
            <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
                <DialogContent className="w-96 z-[100] p-6 bg-[#0B0D29]">
                    <div className="flex justify-between">
                        <DialogTitle className="text-md font-medium text-white">
                            Select Custom Date Range
                        </DialogTitle>
                        <DialogClose onClick={() => setIsCustomModalOpen(false)}>
                            <CrossCircledIcon className="scale-150 hover:bg-white rounded-full hover:text-[#815BF5]" />
                        </DialogClose>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsCustomModalOpen(false);
                            setDateFilter("Custom");
                        }}
                        className="space-y-4"
                    >
                        {/* Start Date Picker */}
                        <div className="w-full">
                            <button
                                type="button"
                                className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                            // onClick={() => setIsStartPickerOpen(true)}
                            >
                                {customDateRange.start ? (
                                    <div className="flex items-center gap-1">
                                        <FaCalendar className="h-4" />
                                        {format(new Date(customDateRange.start), "dd-MM-yyyy")}
                                    </div>
                                ) : (
                                    <div className="flex gap-1">
                                        <FaCalendar className="h-4" />
                                        <h1 className="text-xs">Start Date</h1>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* End Date Picker */}
                        <div className="w-full">
                            <button
                                type="button"
                                className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                            // onClick={() => setIsEndPickerOpen(true)}
                            >
                                {customDateRange.end ? (
                                    <div className="flex items-center gap-1">
                                        <FaCalendar className="h-4" />
                                        {format(new Date(customDateRange.end), "dd-MM-yyyy")}
                                    </div>
                                ) : (
                                    <div className="flex gap-1">
                                        <FaCalendar className="h-4" />
                                        <h1 className="text-xs">End Date</h1>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Apply Button */}
                        <button
                            type="submit"
                            className="bg-[#815BF5] text-white py-2 px-4 rounded w-full text-xs"
                        >
                            Apply
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Remark Dialog */}
            <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
                <DialogContent className="p-6 bg-[#0b0d29] text-white">
                    <DialogHeader>
                        <DialogTitle>Add Remark</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded bg-transparent"
                        placeholder={`Add a remark for moving the lead to ${targetStage}`}
                    />
                    <Button variant="default" className="mt-4" onClick={handleUpdateStage}>
                        Submit
                    </Button>
                </DialogContent>
            </Dialog>
        </div >
    );
}

/* ---------------- Draggable Lead ---------------- */
function DraggableLead({
    lead,
    setDraggedLead,
    index,
}: {
    lead: Lead;
    setDraggedLead: React.Dispatch<React.SetStateAction<Lead | null>>;
    index: number;
}) {
    const router = useRouter();

    const { attributes, listeners, setNodeRef } = useDraggable({
        id: lead._id,
        onDragStart: () => {
            setDraggedLead(lead);
        },
        onDragEnd: () => {
            setDraggedLead(null);
        },
    });

    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/CRM/leads/${lead._id}`);
    };

    return (
        <Card onMouseDown={(e) => e.stopPropagation()}
            onClick={handleNavigate} className=" mt-2  border bg-[#121212] hover:border-primary   rounded-none shadow-sm relative cursor-pointer">


            {/* Drag Handle */}
            <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                className="rounded p-2  "
                onMouseDown={() => setDraggedLead(lead)}
            >
                <div className="flex justify-between">
                    <h3 className="text-sm text-neutral-300">{lead.title}</h3>

                </div>
                {/* Lead Info */}
                <div className="flex items-center gap-1">
                    <div>
                        <Badge className="text-xs">{lead.leadId}</Badge>
                    </div>
                    <div>
                        {/* Time ago (e.g., "5 hours ago") */}
                        <h1 className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </h1>

                        {/* If you also want updatedAt timestamp */}
                        {lead.updatedAt && (
                            <h1 className="text-[10px] text-muted-foreground">
                                (Updated {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })})
                            </h1>
                        )}
                    </div>
                    {/* TIme stamps here */}
                </div>
                <div className="p-1 text-xs">
                    <div className="flex items-center gap-1">
                        <FaUser className="h-3 text-muted-foreground " />
                        <h1>{lead.contact?.firstName} {lead.contact?.lastName}</h1>
                    </div>
                    <div className="flex text-xs items-center gap-1">
                        <FaMoneyBill className="h-3 text-muted-foreground    " />
                        <h1 className="text-xs text-muted-foreground">Amount: <span className=" text-white">₹{lead.amount}</span></h1>
                    </div>
                    <div className="flex items-center text-xs gap-1">
                        <FaCalendar className="h-3 text-muted-foreground    " />
                        <h1 className="text-xs text-muted-foreground">Close Date: <span className=" text-white">{lead.closeDate ? format(new Date(lead.closeDate), "dd-MM-yyyy") : "N/A"}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaCalendar className="h-3 text-muted-foreground    " />
                        <h1 className="text-xs text-muted-foreground">Assigned To: <span className=" text-blue-400">{lead.assignedTo?.firstName}{' '}
                            {lead.assignedTo?.lastName}
                        </span>
                        </h1>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* ---------------- Droppable Stage ---------------- */
function DroppableStage({
    stage,
    children,
    onDelete,
    onEdit,
    onAddLead,
    onSelectToggle,
}: {
    stage: Stage;
    children: React.ReactNode;
    onDelete: (stageName: string) => void;
    onEdit: (stage: Stage) => void;
    onAddLead: (stageName: string) => void;
    onSelectToggle: (stageName: string) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.name,
    });

    const totalAmount = stage.leads.reduce((sum, ld) => sum + (ld.amount || 0), 0);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);

    function handleSelectToggle(stageName: string) {
        setSelectedStages((prev) =>
            prev.includes(stageName) ? prev.filter((s) => s !== stageName) : [...prev, stageName]
        );
    }

    return (
        <Card className=" min-w-[300px] bg-background  sm:min-w-[350px] md:min-w-[280px]">
            <div
                ref={setNodeRef}
                // We'll keep `border-t-4` (or 2) as the thickness, but override color via inline style
                className={` rounded-lg min-h-screen       border-t-2 
                       ${isOver ? "" : ""}`}
                style={{ borderTopColor: stage.color }}
            >

                <div className=" bg-[#121212]   rounded-t-lg  items-center">
                    <div className="flex justify-between  items-center">
                        <h3 className="font-medium text-sm px-4  flex justify-between items-center">

                            {stage.name}</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-500">
                                    <DotsVerticalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Stage Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDelete(stage.name)}>
                                    Delete Stage
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(stage)}>
                                    Edit Stage
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onAddLead(stage.name)}>
                                    Add Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onSelectToggle(stage.name)}>
                                    Select/Unselect
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className=" px-4 text-sm flex border-b pb-2 gap-2 text-gray-400">
                        <p className="text-xs">{`${stage.leads.length} leads`}</p>
                        <p className="text-green-500 text-xs">
                            ₹<span className="text-white ml-1">{totalAmount}/-</span>
                        </p>
                    </div>
                </div>



                {/* Optional checkbox if "selectedStages" includes this stage */}
                {selectedStages.includes(stage.name) && (
                    <input type="checkbox" className="mt-2" />
                )}


                {children}
            </div>
        </Card >
    );
}
