"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { IconReplace } from "@tabler/icons-react";

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
}

export default function MoveLeadDialog({ leadId, currentStage, onLeadMoved }: { leadId: string; currentStage: string; onLeadMoved: () => void }) {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [modalPipeline, setModalPipeline] = useState<string>("");
    const [modalStages, setModalStages] = useState<StageOption[]>([]);
    const [modalStage, setModalStage] = useState<string>("");
    const [remark, setRemark] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get("/api/pipelines");
                setPipelines(response.data);
            } catch (error) {
                console.error("Error fetching pipelines:", error);
            }
        };
        fetchPipelines();
    }, []);

    useEffect(() => {
        if (!modalPipeline) {
            setModalStages([]);
            setModalStage("");
            return;
        }

        const selectedPipeline = pipelines.find((p) => p._id === modalPipeline);
        if (selectedPipeline) {
            const allStages = [
                ...selectedPipeline.openStages.map((st) => ({ _id: st._id, name: st.name })),
                ...selectedPipeline.closeStages.map((st) => ({ _id: st._id, name: st.name })),
            ];
            setModalStages(allStages);

            // Auto-select the first stage if available
            if (allStages.length > 0) {
                setModalStage(allStages.length > 0 ? allStages[0].name : "");
            }
        }
    }, [modalPipeline, pipelines]);

    const handleMoveLead = async () => {
        if (!modalPipeline || !modalStage || !remark) return;
        setIsLoading(true);

        try {
            const selectedStageObject = modalStages.find(stage => stage.name === modalStage);
            if (!selectedStageObject) {
                console.error("Invalid stage selected.");
                setIsLoading(false);
                return;
            }

            await axios.post("/api/leads/update-stage", {
                leadId,
                newPipeline: modalPipeline,
                newStage: selectedStageObject.name, // ✅ Send stage `name` instead of `_id`
                remark,
            });

            onLeadMoved(); // Refresh lead details
            setIsDialogOpen(false); // Close dialog after action
        } catch (error) {
            console.error("Error moving lead:", error);
        } finally {
            setIsLoading(false);
        }
    };

    console.log(modalStage, 'okay')

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hover:bg-[#016244] flex gap-1">
                    <IconReplace className="h-5" />
                    Move To
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg p-6">
                <DialogHeader>
                    <DialogTitle>Move Lead</DialogTitle>
                </DialogHeader>

                {/* Pipeline Dropdown */}
                <Label className="text-sm font-medium">Select Pipeline</Label>
                <select
                    className="w-full border outline-none rounded-md p-2 bg-background text-foreground"
                    value={modalPipeline}
                    onChange={(e) => setModalPipeline(e.target.value)}
                >
                    <option value="" disabled>
                        Choose a pipeline
                    </option>
                    {pipelines.map((pipeline) => (
                        <option key={pipeline._id} value={pipeline._id}>
                            {pipeline.name}
                        </option>
                    ))}
                </select>

                {/* Stage Dropdown */}
                <Label className="text-sm font-medium mt-4">Select Stage</Label>
                <select
                    className="w-full border outline-none rounded-md p-2 bg-background text-foreground"
                    value={modalStage}
                    onChange={(e) => setModalStage(e.target.value)} // ✅ Store stage name
                    disabled={!modalPipeline}
                >
                    <option value="" disabled>
                        Choose a stage
                    </option>
                    {modalStages.map((stage) => (
                        <option key={stage._id} value={stage.name}> {/* ✅ Send name instead of _id */}
                            {stage.name}
                        </option>
                    ))}
                </select>


                {/* Remarks Textarea */}
                <Label className="text-sm font-medium mt-4">Remarks</Label>
                <Textarea
                    placeholder="Enter remarks..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                />

                {/* Submit Button */}
                <Button
                    className="bg-primary w-full mt-4"
                    onClick={handleMoveLead}
                    disabled={isLoading || !modalPipeline || !modalStage || !remark}
                >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Move Lead"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
