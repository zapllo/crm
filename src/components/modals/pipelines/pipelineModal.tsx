"use client";

import { useState } from "react";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogClose,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Stage {
    name: string;
    color: string;
    won?: boolean;
    lost?: boolean;
}

export default function CreatePipelineForm({ onClose }: { onClose: () => void }) {
    const [name, setName] = useState("");
    const [openStages, setOpenStages] = useState<Stage[]>([]);
    const [closeStages, setCloseStages] = useState<Stage[]>([]);

    // Temporary states for the dialog
    const [currentStageName, setCurrentStageName] = useState("");
    const [currentStageColor, setCurrentStageColor] = useState("#FFFFFF");
    const [currentStageType, setCurrentStageType] = useState<"open" | "close">("open");
    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
    const [isWonStage, setIsWonStage] = useState(false);
    const [isLostStage, setIsLostStage] = useState(false);

    // For re-opening the modal after creation
    const [keepModalOpen, setKeepModalOpen] = useState(false);

    // Example color palette
    const colors = [
        "#FF0000", "#FF8000", "#FFD700", "#008000", "#00BFFF", "#0000FF",
        "#800080", "#FF69B4", "#8B4513", "#808000", "#00FF7F", "#4682B4",
        "#6A5ACD", "#FFFFFF"
    ];

    const handleAddStage = (type: "open" | "close") => {
        setCurrentStageType(type);
        setCurrentStageName("");
        setCurrentStageColor("#FFFFFF");
        setIsWonStage(false);
        setIsLostStage(false);
        setIsStageDialogOpen(true);
    };

    const handleSaveStage = () => {
        const newStage = {
            name: currentStageName,
            color: currentStageColor,
            won: currentStageType === "close" ? isWonStage : false,
            lost: currentStageType === "close" ? isLostStage : false,
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("/api/pipelines", {
                name,
                openStages,
                closeStages,
            });
            alert("Pipeline created successfully!");
            if (!keepModalOpen) {
                onClose();
            }
        } catch (error) {
            alert("Failed to create pipeline.");
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
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

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-[#815bf5] text-white rounded hover:bg-[#5f31e9] text-sm mt-4"
                >
                    + Add Pipeline
                </button>
            </form>

            {/* Add Stage Dialog */}
            <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
                <DialogContent className="z-[100] p-6 max-w-sm w-full">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-medium text-white">Add Stage</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        <input
                            type="text"
                            value={currentStageName}
                            onChange={(e) => setCurrentStageName(e.target.value)}
                            className="w-full p-2 rounded bg-transparent text-white outline-none border focus:ring-2 focus:ring-[#815bf5]"
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
                        {/* Won/Lost Toggle - Only for Close Stages */}
                        {currentStageType === "close" && (
                            <div className="flex items-center justify-between mt-2">
                                <label className="text-sm text-gray-400">Mark as:</label>
                                <Label>Won:</Label>
                                <Switch checked={isWonStage} onCheckedChange={() => { setIsWonStage(true); setIsLostStage(false); }} />
                                <Label>Lost:</Label>
                                <Switch checked={isLostStage} onCheckedChange={() => { setIsLostStage(true); setIsWonStage(false); }} />
                            </div>
                        )}

                        <button onClick={handleSaveStage} className="px-4 py-2 bg-[#815bf5] text-white rounded hover:bg-[#5f31e9]">
                            Save
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
