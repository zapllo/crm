"use client";

import { useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Stage {
    name: string;
    color: string;
    won?: boolean;
    lost?: boolean;
}

interface Pipeline {
    _id: string;
    name: string;
    openStages: Stage[];
    closeStages: Stage[];
    customFields: { name: string; type: string; options?: string[] }[];
}

interface EditPipelineFormProps {
    pipeline: Pipeline;
    onClose: () => void;
    onUpdate: () => void; // Callback to refresh the pipeline list
}

export default function EditPipelineForm({
    pipeline,
    onClose,
    onUpdate,
}: EditPipelineFormProps) {
    const [name, setName] = useState(pipeline.name);
    const [openStages, setOpenStages] = useState<Stage[]>(pipeline.openStages);
    const [closeStages, setCloseStages] = useState<Stage[]>(pipeline.closeStages);

    // Temporary dialog states
    const [currentStageName, setCurrentStageName] = useState("");
    const [currentStageColor, setCurrentStageColor] = useState("#000000");
    const [currentStageType, setCurrentStageType] = useState<"open" | "close">("open");
    const [isWonStage, setIsWonStage] = useState(false);
    const [isLostStage, setIsLostStage] = useState(false);
    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);

    // Example color palette
    const colors = [
        "#FF0000", "#FF8000", "#FFD700", "#008000", "#00BFFF", "#0000FF",
        "#800080", "#FF69B4", "#8B4513", "#808000", "#00FF7F", "#4682B4",
        "#6A5ACD", "#000000"
    ];

    const handleAddStage = (type: "open" | "close") => {
        setCurrentStageType(type);
        setCurrentStageName("");
        setCurrentStageColor("#000000");
        setIsWonStage(false);
        setIsLostStage(false);
        setIsStageDialogOpen(true);
    };

    const handleSaveStage = () => {
        const newStage: Stage = {
            name: currentStageName,
            color: currentStageColor,
            won: currentStageType === "close" ? isWonStage : undefined,
            lost: currentStageType === "close" ? isLostStage : undefined,
        };

        if (currentStageType === "open") {
            setOpenStages((prev) => [...prev, newStage]);
        } else {
            setCloseStages((prev) => [...prev, newStage]);
        }
        setIsStageDialogOpen(false);
    };

    const handleDeleteOpenStage = (index: number) => {
        setOpenStages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDeleteCloseStage = (index: number) => {
        setCloseStages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleToggleWonLost = (index: number, type: "won" | "lost") => {
        setCloseStages((prev) =>
            prev.map((stage, i) =>
                i === index ? { ...stage, won: type === "won", lost: type === "lost" } : stage
            )
        );
    };

    const handleUpdate = async () => {
        try {
            await axios.patch(`/api/pipelines/${pipeline._id}`, {
                name,
                openStages,
                closeStages,
                customFields: pipeline.customFields, // Keep any existing fields
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update pipeline:", error);
        }
    };

    return (
        <>
            <div className="space-y-4 mt-2 text-white">
                {/* Pipeline Name */}
                <div className="relative">
                    <label className="absolute text-xs text-gray-400 left-2 -top-2 bg-gray-900 px-1">
                        Pipeline Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 rounded bg-transparent text-white outline-none border border-gray-600 focus:ring-2 focus:ring-[#815bf5]"
                        required
                    />
                </div>

                {/* Open Stages */}
                <div className="relative border rounded">
                    <div className="flex items-center border-b justify-between">
                        <label className="p-3 text-xs text-gray-400">Open Stages</label>
                        <button
                            type="button"
                            onClick={() => handleAddStage("open")}
                            className="border rounded bg-[#815bf5] px-2 py-1 text-xs text-white"
                        >
                            + Add Open Stage
                        </button>
                    </div>
                    <div className="space-y-2 h-full">
                        {openStages.map((stage, index) => (
                            <div key={index} className="flex justify-between border-b p-2 items-center">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                                    <span className="text-sm px-1 text-white">{stage.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteOpenStage(index)}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    <Trash2 className="h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Close Stages */}
                <div className="relative border rounded">
                    <div className="flex items-center border-b justify-between">
                        <label className="p-3 text-xs text-gray-400">Close Stages</label>
                        <button
                            type="button"
                            onClick={() => handleAddStage("close")}
                            className="border rounded bg-[#815bf5] px-2 py-1 text-xs text-white"
                        >
                            + Add Close Stage
                        </button>
                    </div>
                    <div className="space-y-2 h-full">
                        {closeStages.map((stage, index) => (
                            <div key={index} className="flex justify-between border-b p-2 items-center">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
                                    <span className="text-sm px-1 text-white">{stage.name}</span>
                                    {stage.won && <span className="text-green-400">(Won)</span>}
                                    {stage.lost && <span className="text-red-400">(Lost)</span>}
                                </div>

                                {/* Won/Lost Toggle */}
                                <div className="flex items-center space-x-2">
                                    <Label>Won:</Label>
                                    <Switch
                                        checked={stage.won}
                                        onCheckedChange={() => handleToggleWonLost(index, "won")}

                                    />
                                    <Label>Lost:</Label>

                                    <Switch
                                        checked={stage.lost}
                                        onCheckedChange={() => handleToggleWonLost(index, "lost")}

                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleDeleteCloseStage(index)}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    <Trash2 className="h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Add Stage Dialog */}
                <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
                    <DialogContent className="z-[100] p-6 max-w-sm w-full">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-medium text-white">
                                Add Stage
                            </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                            <input
                                type="text"
                                value={currentStageName}
                                onChange={(e) => setCurrentStageName(e.target.value)}
                                className="w-full p-2 rounded bg-transparent text-white outline-none border  focus:ring-2 focus:ring-[#815bf5]"
                                placeholder="Enter Stage Name"
                            />
                            {/* Color Grid Selection */}
                            <div>
                                <label className="text-sm text-gray-400">Select Color</label>
                                <div className="grid grid-cols-8 gap-2 mt-2">
                                    {colors.map((c) => (
                                        <button
                                            type="button"
                                            key={c}
                                            onClick={() => setCurrentStageColor(c)}
                                            className={`w-8 h-8 rounded-full ${currentStageColor === c ? "ring-2 ring-white" : ""
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <DialogClose asChild>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </DialogClose>
                                <button
                                    type="button"
                                    onClick={handleSaveStage}
                                    className="px-4 py-2 bg-[#815bf5] text-white rounded hover:bg-[#5f31e9]"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Submit Button */}
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Update Pipeline
                    </button>
                </div>
            </div>
        </>
    );
}
