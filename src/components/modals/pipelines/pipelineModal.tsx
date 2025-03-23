"use client";

import { useState } from "react";
import axios from "axios";
import { ArrowUpDown, Check, Loader2, MoveHorizontal, PlusCircle, Save, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Stage {
    name: string;
    color: string;
    won?: boolean;
    lost?: boolean;
}

export default function CreatePipelineForm({ onClose }: { onClose: () => void }) {
    const [name, setName] = useState("");
    const [openStages, setOpenStages] = useState<Stage[]>([
        { name: "Qualification", color: "#2196F3" },
        { name: "Needs Analysis", color: "#673AB7" }
    ]);
    const [closeStages, setCloseStages] = useState<Stage[]>([
        { name: "Won", color: "#4CAF50", won: true },
        { name: "Lost", color: "#F44336", lost: true }
    ]);

    // Temporary states for the dialog
    const [currentStageType, setCurrentStageType] = useState<"open" | "close">("open");
    const [currentStageIndex, setCurrentStageIndex] = useState<number | null>(null);
    const [currentStageName, setCurrentStageName] = useState("");
    const [currentStageColor, setCurrentStageColor] = useState("#4CAF50");
    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
    const [isWonStage, setIsWonStage] = useState(false);
    const [isLostStage, setIsLostStage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const { toast } = useToast();

    // Color palette with labels
    const colors = [
        { value: "#F44336", label: "Red" },
        { value: "#FF9800", label: "Orange" },
        { value: "#FFEB3B", label: "Yellow" },
        { value: "#4CAF50", label: "Green" },
        { value: "#2196F3", label: "Blue" },
        { value: "#673AB7", label: "Purple" },
        { value: "#E91E63", label: "Pink" },
        { value: "#795548", label: "Brown" },
        { value: "#607D8B", label: "Blue Grey" },
        { value: "#9E9E9E", label: "Grey" },
        { value: "#000000", label: "Black" },
        { value: "#FFFFFF", label: "White" },
    ];

    const handleAddStage = (type: "open" | "close") => {
        setCurrentStageType(type);
        setCurrentStageIndex(null);
        setCurrentStageName("");
        setCurrentStageColor(type === "open" ? "#2196F3" : "#4CAF50");
        setIsWonStage(type === "close");
        setIsLostStage(false);
        setIsStageDialogOpen(true);
    };

    const handleEditStage = (type: "open" | "close", index: number) => {
        const stages = type === "open" ? openStages : closeStages;
        const stage = stages[index];

        setCurrentStageType(type);
        setCurrentStageIndex(index);
        setCurrentStageName(stage.name);
        setCurrentStageColor(stage.color);
        setIsWonStage(!!stage.won);
        setIsLostStage(!!stage.lost);
        setIsStageDialogOpen(true);
    };

    const handleSaveStage = () => {
        if (!currentStageName.trim()) {
            toast({
                title: "Stage name required",
                description: "Please enter a name for this stage",
                variant: "destructive",
            });
            return;
        }

        const newStage: Stage = {
            name: currentStageName,
            color: currentStageColor,
            won: currentStageType === "close" ? isWonStage : undefined,
            lost: currentStageType === "close" ? isLostStage : undefined,
        };

        if (currentStageType === "open") {
            if (currentStageIndex !== null) {
                // Edit existing stage
                setOpenStages(prev =>
                    prev.map((stage, i) => i === currentStageIndex ? newStage : stage)
                );
            } else {
                // Add new stage
                setOpenStages(prev => [...prev, newStage]);
            }
        } else {
            if (currentStageIndex !== null) {
                // Edit existing stage
                setCloseStages(prev =>
                    prev.map((stage, i) => i === currentStageIndex ? newStage : stage)
                );
            } else {
                // Add new stage
                setCloseStages(prev => [...prev, newStage]);
            }
        }
        setIsStageDialogOpen(false);
    };

    const handleDeleteStage = (type: "open" | "close", index: number) => {
        if (type === "open") {
            setOpenStages(prev => prev.filter((_, i) => i !== index));
        } else {
            setCloseStages(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Drag and drop functionality
    const handleDragStart = (e: React.DragEvent, type: string, index: number) => {
        e.dataTransfer.setData("type", type);
        e.dataTransfer.setData("index", String(index));
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, type: string, dropIndex: number) => {
        e.preventDefault();
        const sourceType = e.dataTransfer.getData("type");
        const sourceIndex = Number(e.dataTransfer.getData("index"));

        if (sourceType === type) {
            // Reorder within the same list
            if (type === "open") {
                const newStages = [...openStages];
                const [movedStage] = newStages.splice(sourceIndex, 1);
                newStages.splice(dropIndex, 0, movedStage);
                setOpenStages(newStages);
            } else {
                const newStages = [...closeStages];
                const [movedStage] = newStages.splice(sourceIndex, 1);
                newStages.splice(dropIndex, 0, movedStage);
                setCloseStages(newStages);
            }
        }

        setIsDragging(false);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDragOverIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({
                title: "Pipeline name required",
                description: "Please enter a name for this pipeline",
                variant: "destructive",
            });
            return;
        }

        if (openStages.length === 0) {
            toast({
                title: "Open stages required",
                description: "A pipeline must have at least one open stage",
                variant: "destructive",
            });
            return;
        }

        if (closeStages.length === 0) {
            toast({
                title: "Close stages required",
                description: "A pipeline must have at least one close stage",
                variant: "destructive",
            });
            return;
        }

        // Ensure at least one won or lost stage
        const hasWonOrLost = closeStages.some(stage => stage.won || stage.lost);
        if (!hasWonOrLost) {
            toast({
                title: "Outcome stages required",
                description: "At least one close stage must be marked as Won or Lost",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            await axios.post("/api/pipelines", {
                name,
                openStages,
                closeStages,
            });
            toast({
                title: "Pipeline created successfully",
                description: `The ${name} pipeline has been created`,
            });
            onClose();
        } catch (error) {
            toast({
                title: "Failed to create pipeline",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            });
            console.error("Failed to create pipeline:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6  m-auto">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="pipeline-name">Pipeline Name</Label>
                    <Input
                        id="pipeline-name"
                        placeholder="e.g., Sales Pipeline, Customer Onboarding"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <Tabs defaultValue="open">
                    <TabsList className="grid w-full bg-accent  grid-cols-2">
                        <TabsTrigger value="open" className="flex items-center border-none gap-2">
                            Open Stages
                            <Badge variant="secondary" className="ml-1">
                                {openStages.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="close" className="flex border-none items-center gap-2">
                            Close Stages
                            <Badge variant="secondary" className="ml-1">
                                {closeStages.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="open" className="space-y-4 mt-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium">
                                    Open Stages
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    These are the stages a deal goes through during the sales process.
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleAddStage("open")}
                            >
                                <PlusCircle className="h-4 w-4 mr-1" />
                                Add Stage
                            </Button>
                        </div>

                        <Card>
                            <ScrollArea className="h-[220px]">
                                <div className="p-1">
                                    {openStages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-24 text-center">
                                            <p className="text-muted-foreground mb-2">No open stages defined</p>
                                            <Button
                                                type="button"
                                                onClick={() => handleAddStage("open")}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                Add Your First Stage
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {openStages.map((stage, index) => (
                                                <div
                                                    key={index}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, "open", index)}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDrop={(e) => handleDrop(e, "open", index)}
                                                    onDragEnd={handleDragEnd}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 border rounded-md transition-colors hover:bg-accent",
                                                        isDragging && "cursor-move",
                                                        dragOverIndex === index && "border-dashed border-primary"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-5 w-5 flex-shrink-0">
                                                            <ArrowUpDown className="h-5 w-5 text-muted-foreground cursor-move" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: stage.color }}
                                                            />
                                                            <span>{stage.name}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                        onClick={() => handleEditStage("open", index)}
                                                                    >
                                                                        <PlusCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Edit Stage
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                        onClick={() => handleDeleteStage("open", index)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Delete Stage
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="close" className="space-y-4 mt-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-medium">
                                    Close Stages
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    These are the final outcomes of your deals. Mark them as Won or Lost.
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleAddStage("close")}
                            >
                                <PlusCircle className="h-4 w-4 mr-1" />
                                Add Stage
                            </Button>
                        </div>

                        <Card>
                            <ScrollArea className="h-[220px]">
                                <div className="p-1">
                                    {closeStages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-24 text-center">
                                            <p className="text-muted-foreground mb-2">No close stages defined</p>
                                            <Button
                                                type="button"
                                                onClick={() => handleAddStage("close")}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                Add Your First Stage
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {closeStages.map((stage, index) => (
                                                <div
                                                    key={index}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, "close", index)}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDrop={(e) => handleDrop(e, "close", index)}
                                                    onDragEnd={handleDragEnd}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 border rounded-md transition-colors hover:bg-accent",
                                                        isDragging && "cursor-move",
                                                        dragOverIndex === index && "border-dashed border-primary"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-5 w-5 flex-shrink-0">
                                                            <ArrowUpDown className="h-5 w-5 text-muted-foreground cursor-move" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: stage.color }}
                                                            />
                                                            <span className="mr-2">{stage.name}</span>
                                                            {stage.won && (
                                                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                                                                    Won
                                                                </Badge>
                                                            )}
                                                            {stage.lost && (
                                                                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                                                                    Lost
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1 mr-2">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="flex items-center">
                                                                            <Button
                                                                                type="button"
                                                                                variant={stage.won ? "default" : "outline"}
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={() => {
                                                                                    setCloseStages(prev =>
                                                                                        prev.map((s, i) =>
                                                                                            i === index
                                                                                                ? { ...s, won: !s.won, lost: false }
                                                                                                : s
                                                                                        )
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <Check className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {stage.won ? "Unmark as Won" : "Mark as Won"}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="flex items-center">
                                                                            <Button
                                                                                type="button"
                                                                                variant={stage.lost ? "default" : "outline"}
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={() => {
                                                                                    setCloseStages(prev =>
                                                                                        prev.map((s, i) =>
                                                                                            i === index
                                                                                                ? { ...s, lost: !s.lost, won: false }
                                                                                                : s
                                                                                        )
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {stage.lost ? "Unmark as Lost" : "Mark as Lost"}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0"
                                                                            onClick={() => handleEditStage("close", index)}
                                                                        >
                                                                            <PlusCircle className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Edit Stage
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                            onClick={() => handleDeleteStage("close", index)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Delete Stage
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Add/Edit Stage Dialog */}
            <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
                <DialogContent className="sm:max-w-md z-[100]">
                    <DialogHeader>
                        <DialogTitle>
                            {currentStageIndex !== null ? "Edit Stage" : "Add New Stage"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="stage-name">Stage Name</Label>
                            <Input
                                id="stage-name"
                                value={currentStageName}
                                onChange={(e) => setCurrentStageName(e.target.value)}
                                placeholder="e.g., Qualification, Negotiation, Contract"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Stage Color</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {colors.map((color) => (
                                    <TooltipProvider key={color.value}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStageColor(color.value)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                                                        currentStageColor === color.value
                                                            ? "border-primary shadow-md"
                                                            : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: color.value }}
                                                >
                                                    {currentStageColor === color.value && (
                                                        <Check className={cn(
                                                            "h-4 w-4 mx-auto",
                                                            ["#FFFFFF", "#FFEB3B"].includes(color.value)
                                                                ? "text-black"
                                                                : "text-white"
                                                        )} />
                                                    )}
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>{color.label}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>

                        {currentStageType === "close" && (
                            <div className="space-y-2 border p-3 rounded-md bg-muted/50">
                                <Label className="block mb-2">Stage Outcome</Label>
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="won-switch"
                                                checked={isWonStage}
                                                onCheckedChange={(checked) => {
                                                    setIsWonStage(checked);
                                                    if (checked) setIsLostStage(false);
                                                }}
                                            />
                                            <Label htmlFor="won-switch">Won Outcome</Label>
                                        </div>
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                                            Won
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="lost-switch"
                                                checked={isLostStage}
                                                onCheckedChange={(checked) => {
                                                    setIsLostStage(checked);
                                                    if (checked) setIsWonStage(false);
                                                }}
                                            />
                                            <Label htmlFor="lost-switch">Lost Outcome</Label>
                                        </div>
                                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                                            Lost
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Close stages should be marked as either Won or Lost to properly track your deal outcomes.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsStageDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveStage}
                        >
                            {currentStageIndex !== null ? "Update Stage" : "Add Stage"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="space-y-4 mt-6">
                <div className="flex items-center gap-2 border rounded-md p-3 bg-muted/30">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">Pipeline Ready for Creation</h4>
                        <p className="text-xs text-muted-foreground">
                            Your pipeline has {openStages.length} open stages and {closeStages.length} close stages.
                        </p>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || name.trim() === '' || openStages.length === 0 || closeStages.length === 0}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Pipeline...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Pipeline
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}