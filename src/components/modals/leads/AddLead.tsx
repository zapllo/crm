"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, Tag, Plus, Check, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle } from "lucide-react";
import MediaAttachments from "@/components/MediaAttachments";
import { FaMoneyBill } from "react-icons/fa";

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
  customFields?: {
    name: string;
    type: "Text" | "Date" | "Number" | "MultiSelect";
    options?: string[];
  }[];
}

interface Product {
  _id: string;
  productName: string;
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

interface StageOption {
  _id: string;
  name: string;
}

interface ISource {
  _id: string;
  name: string;
}

interface AddLeadProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLeadCreated?: () => void;
  preselectedPipeline?: string;
  preselectedStage?: string;
}

const AddLead: React.FC<AddLeadProps> = ({
  isOpen,
  setIsOpen,
  onLeadCreated,
  preselectedPipeline,
  preselectedStage
}) => {
  const { toast } = useToast();

  // Form states
  const [leadTitle, setLeadTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimateAmount, setEstimateAmount] = useState<number | "">("");
  const [closeDate, setCloseDate] = useState<Date | undefined>(undefined);

  // Pipeline & Stage
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [modalPipeline, setModalPipeline] = useState<string>("");
  const [modalStages, setModalStages] = useState<StageOption[]>([]);
  const [modalStage, setModalStage] = useState<string>("");

  // Product & Contact
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<{ _id: string; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  // Team & Source
  const [teamMembers, setTeamMembers] = useState<TeamUser[]>([]);
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [sources, setSources] = useState<ISource[]>([]);
  const [source, setSource] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState("");
  const [searchSourceQuery, setSearchSourceQuery] = useState("");
  const [popoverSourceInputValue, setPopoverSourceInputValue] = useState("");

  // Media attachments
  const [files, setFiles] = useState<string[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<string[]>([]);
  const [links, setLinks] = useState<{ url: string; title: string }[]>([]);

  // Custom fields
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  // Reset form
  const resetForm = () => {
    setLeadTitle("");
    setDescription("");
    setEstimateAmount("");
    setCloseDate(undefined);
    setSelectedProduct(null);
    setSelectedContact(null);
    setModalPipeline(preselectedPipeline || "");
    setModalStage(preselectedStage || "");
    setModalStages([]);
    setAssignedTo("");
    setSource("");
    setNewSource("");
    setPopoverSourceInputValue("");
    setLinks([]);
    setFiles([]);
    setAudioRecordings([]);
    setCustomFieldValues({});
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (preselectedPipeline) {
        setModalPipeline(preselectedPipeline);
      }
      if (preselectedStage) {
        setModalStage(preselectedStage);
      }
    } else {
      resetForm();
    }
  }, [isOpen, preselectedPipeline, preselectedStage]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pipelinesRes, productsRes, contactsRes, usersRes, sourcesRes] = await Promise.all([
        axios.get("/api/pipelines"),
        axios.get("/api/products"),
        axios.get("/api/contacts"),
        axios.get("/api/team-sales"),
        axios.get("/api/sources"),
      ]);

      setPipelines(pipelinesRes.data);
      setProducts(productsRes.data?.map((p: any) => ({ _id: p._id, productName: p.productName })) || []);
      setContacts(
        contactsRes.data?.map((c: any) => ({
          _id: c._id,
          name: `${c.firstName} ${c.lastName}`,
        })) || []
      );
      setTeamMembers(usersRes.data || []);
      setSources(sourcesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error loading data",
        description: "Could not load all required form data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update stages when pipeline changes
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
      if (!preselectedStage && combined?.length > 0) {
        setModalStage(combined[0].name);
      }
    }
  }, [modalPipeline, pipelines, preselectedStage]);

  // Handle custom field changes
  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Source handlers
  const handleSourceOpen = () => setSourceOpen(true);
  const handleCloseSourcePopup = () => setSourceOpen(false);
  const handleSourceClose = (selectedName: string) => {
    setPopoverSourceInputValue(selectedName);
    setSourceOpen(false);
  };

  // Submit lead
  const handleSubmit = async () => {
    // Validation
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
    const closeDateStr = closeDate ? format(closeDate, "yyyy-MM-dd") : "";

    try {
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

      if (selectedProduct && selectedProduct !== "NONE") {
        leadData.product = selectedProduct;
      }

      if (assignedTo && assignedTo !== "NONE") {
        leadData.assignedTo = assignedTo;
      }

      if (estimateAmount !== "") {
        leadData.amount = estimateAmount;
      }

      if (source && source.trim() !== "") {
        leadData.source = source;
      }

      await axios.post("/api/leads", leadData);

      toast({
        title: "Lead created",
        description: "New lead has been created successfully",
      });

      if (onLeadCreated) {
        onLeadCreated();
      }

      resetForm();
      setIsOpen(false);
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

  const selectedPipelineDoc = pipelines.find(p => p._id === modalPipeline);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] h-fit max-h-screen m-auto overflow-y-scroll scrollbar-hide z-[100]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Lead</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new sales lead.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
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
                  <label className="text-sm font-medium">Stage *</label>
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
                          {prod.productName}
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
                      <FaMoneyBill className="text-muted-foreground" />
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
                  <label className="text-sm font-medium">Assigned To</label>
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

              {/* Custom Fields */}
              {selectedPipelineDoc?.customFields && selectedPipelineDoc.customFields.length > 0 && (
                <div className="space-y-4 mt-4">
                  <Separator />
                  <h3 className="text-sm font-medium">Custom Fields</h3>

                  <div className="grid gap-4">
                    {selectedPipelineDoc.customFields.map((field) => (
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
                                <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
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

              {/* Media Attachments */}
              <MediaAttachments
                initialFiles={files}
                initialAudioRecordings={audioRecordings}
                initialLinks={links}
                onFilesChange={setFiles}
                onAudioRecordingsChange={setAudioRecordings}
                onLinksChange={setLinks}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isCreatingLead || isLoading}
            >
              {isCreatingLead ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Lead"
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
    </>
  );
};

// Source Select Popup Component
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
      setSource(selected._id);
      closeOnSelect(selected.name);
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
      const response = await axios.post("/api/sources", {
        name: newSource.trim(),
      });

      if (response.status === 201) {
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

export default AddLead;