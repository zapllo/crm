"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    AlertCircle,
    ArrowRight,
    CheckCircle,
    InfoIcon
} from "lucide-react";
import { IconReplace } from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface StageOption {
    _id: string;
    name: string;
    color?: string;
    type?: "open" | "close";
}

export default function MoveLeadDialog({ leadId, currentStage, onLeadMoved }: {
    leadId: string;
    currentStage: string;
    onLeadMoved: () => void
}) {
    // State management
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [modalPipeline, setModalPipeline] = useState<string>("");
    const [modalStages, setModalStages] = useState<StageOption[]>([]);
    const [modalStage, setModalStage] = useState<string>("");
    const [remark, setRemark] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [currentPipelineName, setCurrentPipelineName] = useState<string>("");

    // Fetch pipelines on component mount
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get("/api/pipelines");
                setPipelines(response.data);

                // Find current pipeline name for the current stage
                if (currentStage) {
                    for (const pipeline of response.data) {
                        const isInOpen = pipeline.openStages.some((stage: { name: string }) => stage.name === currentStage);
                        const isInClose = pipeline.closeStages.some((stage: { name: string }) => stage.name === currentStage);

                        if (isInOpen || isInClose) {
                            setCurrentPipelineName(pipeline.name);
                            break;
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching pipelines:", error);
                setError("Failed to fetch pipelines. Please try again.");
            }
        };

        fetchPipelines();
    }, [currentStage]);

    // Update stages when pipeline selection changes
    useEffect(() => {
        if (!modalPipeline) {
            setModalStages([]);
            setModalStage("");
            return;
        }

        const selectedPipeline = pipelines.find((p) => p._id === modalPipeline);
        if (selectedPipeline) {
            const allStages = [
                ...selectedPipeline.openStages.map((st) => ({
                    _id: st._id,
                    name: st.name,
                    color: st.color || "#3b82f6",
                    type: "open" as const
                })),
                ...selectedPipeline.closeStages.map((st) => ({
                    _id: st._id,
                    name: st.name,
                    color: st.color || "#10b981",
                    type: "close" as const
                })),
            ];
            setModalStages(allStages);

            // Auto-select the first stage if available
            if (allStages.length > 0) {
                setModalStage(allStages[0].name);
            }
        }
    }, [modalPipeline, pipelines]);

    // Reset form on dialog close
    const resetForm = () => {
        setModalPipeline("");
        setModalStage("");
        setRemark("");
        setError(null);
        setSuccess(false);
    };

    // Handle moving lead to new stage
    const handleMoveLead = async () => {
        if (!modalPipeline || !modalStage || !remark.trim()) {
            setError("Please fill in all required fields");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const selectedStageObject = modalStages.find((stage: StageOption) => stage.name === modalStage);
            if (!selectedStageObject) {
                setError("Invalid stage selected.");
                setIsLoading(false);
                return;
            }

            // Get the pipeline name for display in the success message
            const pipelineName = pipelines.find((p: Pipeline) => p._id === modalPipeline)?.name || "new pipeline";

            await axios.post("/api/leads/update-stage", {
                leadId,
                newPipeline: modalPipeline,
                newStage: selectedStageObject.name,
                remark,
            });

            setSuccess(true);

            // Close dialog after a brief delay to show success message
            setTimeout(() => {
                onLeadMoved(); // Refresh lead details
                setIsDialogOpen(false);
                resetForm();
            }, 1500);

        } catch (error) {
            console.error("Error moving lead:", error);
            setError("Failed to move lead. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Get stage badge color
    const getStageColor = (stageName: string, stageColor?: string): React.CSSProperties | string => {
        if (!stageColor) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";

        // Convert hex to rgba with transparency
        const hexToRgba = (hex: string, alpha = 0.2) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        return {
            backgroundColor: hexToRgba(stageColor, 0.15),
            color: stageColor,
            borderColor: hexToRgba(stageColor, 0.3)
        };
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button
                size='sm'
                    variant="outline"
                    className="hover:bg-accent  hover:text-black w-full flex transition-colors border-none "
                >
                    <IconReplace className="h-4 w-4 mt-1" />

                </Button>
            </DialogTrigger>

            <DialogContent style={{ pointerEvents: 'auto' }} className="max-w-lg sm:max-w-xl h-full max-h-screen p-0 overflow-y-scroll scrollbar-hide z-[100]">
                <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <IconReplace className="h-5 w-5 text-blue-600" />
                        Move Lead
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    {/* Current Status Section */}
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            Current Status
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                                {currentPipelineName}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300">
                                {currentStage}
                            </Badge>
                        </div>
                    </div>

                    {/* Pipeline Dropdown */}
                    <div>
                        <Label className="text-sm font-medium block mb-1.5">Select Pipeline</Label>
                        <Select value={modalPipeline} onValueChange={(val) => setModalPipeline(val)}>
                            <SelectTrigger className="w-full bg-card border-input">
                                <SelectValue placeholder="Choose a pipeline" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                {pipelines.map((pipeline) => (
                                    <SelectItem
                                        className="hover:bg-accent cursor-pointer"
                                        key={pipeline._id}
                                        value={pipeline._id}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{pipeline.name}</span>
                                            <Badge variant="outline" className="text-xs ml-auto">
                                                {pipeline.openStages.length + pipeline.closeStages.length} stages
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stage Selection */}
                    <div>
                        <Label className="text-sm font-medium block mb-1.5">Select Stage</Label>

                        {!modalPipeline ? (
                            <div className="text-center border rounded-md p-4 text-muted-foreground text-sm bg-muted/20">
                                Please select a pipeline first
                            </div>
                        ) : modalStages.length === 0 ? (
                            <div className="text-center border rounded-md p-4 text-muted-foreground text-sm bg-muted/20">
                                No stages found in this pipeline
                            </div>
                        ) : (
                            <ScrollArea className="h-[150px] border rounded-md">
                                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {modalStages.map((stage) => {
                                        const isSelected = modalStage === stage.name;
                                        const stageColorStyle = getStageColor(stage.name, stage.color);

                                        return (
                                            <motion.div
                                                key={stage._id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Card
                                                    className={`
                                                    p-3 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-1' : 'hover:border-primary/40'}
                                                `}
                                                    onClick={() => setModalStage(stage.name)}
                                                    style={isSelected ? undefined : typeof stageColorStyle === 'object' ? stageColorStyle : undefined}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{stage.name}</span>
                                                        {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {stage.type === "close" ? "Closing Stage" : "Open Stage"}
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Remarks Textarea */}
                    <div className="">
                        <div className="flex justify-between mb-1.5">
                            <Label className="text-sm font-medium">Remarks</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="h-6 w-6 p-0">
                                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">Explain why the lead is being moved</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter the reason for moving this lead..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-6 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 text-sm"
                        >
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-6 py-2 text-green-600 bg-green-50 dark:bg-green-900/20 flex items-center gap-2 text-sm"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Lead successfully moved!
                        </motion.div>
                    )}
                </AnimatePresence>

                <DialogFooter className="px-6 py-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleMoveLead}
                        disabled={isLoading || !modalPipeline || !modalStage || !remark.trim()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4" />
                                Moving...
                            </>
                        ) : (
                            <>
                                <IconReplace className="h-4 w-4" />
                                Move Lead
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
