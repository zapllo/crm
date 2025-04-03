"use client";

import { useState } from "react";
import axios from "axios";
import { ArrowUpDown, Check, Loader2, MoveHorizontal, PlusCircle, Save, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
    const [currentStageType, setCurrentStageType] = useState<"open" | "close">("open");
    const [currentStageIndex, setCurrentStageIndex] = useState<number | null>(null);
    const [currentStageName, setCurrentStageName] = useState("");
    const [currentStageColor, setCurrentStageColor] = useState("#000000");
    const [isWonStage, setIsWonStage] = useState(false);
    const [isLostStage, setIsLostStage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const { toast } = useToast();

    // Example color palette with labels
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
        setCurrentStageColor("#4CAF50");
        setIsWonStage(false);
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

    const handleToggleWonLost = (index: number, type: "won" | "lost") => {
        setCloseStages(prev =>
            prev.map((stage, i) => {
                if (i === index) {
                    // For "won" action, turn off "lost" and vice versa
                    if (type === "won") {
                        return { ...stage, won: !stage.won, lost: false };
                    } else {
                        return { ...stage, lost: !stage.lost, won: false };
                    }
                }
                return stage;
            })
        );
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

    const handleUpdate = async () => {
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
            await axios.patch(`/api/pipelines/${pipeline._id}`, {
                name,
                openStages,
                closeStages,
                customFields: pipeline.customFields, // Keep any existing fields
            });
            toast({
                title: "Pipeline updated successfully",
                description: `The ${name} pipeline has been updated`,
            });
            onUpdate();
            onClose();
        } catch (error) {
            toast({
                title: "Failed to update pipeline",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            });
            console.error("Failed to update pipeline:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="pipeline-name">Pipeline Name</Label>
                    <Input
                        id="pipeline-name"
                        placeholder="Enter pipeline name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <Tabs defaultValue="open">
                    <TabsList className="grid w-full gap-2 bg-accent grid-cols-2">
                        <TabsTrigger className="border-none" value="open">Open Stages ({openStages.length})</TabsTrigger>
                        <TabsTrigger className="border-none" value="close">Close Stages ({closeStages.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="open" className="space-y-4">
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
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddStage("open")}
                            >
                                <PlusCircle className="h-4 w-4 mr-1" />
                                Add Stage
                            </Button>
                        </div>

                        <Card>
                            <ScrollArea className="h-[250px]">
                                <div className="p-1">
                                    {openStages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-24 text-center">
                                            <p className="text-muted-foreground mb-2">No open stages defined</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddStage("open")}
                                            >
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                Add First Stage
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
                                                        "flex items-center justify-between p-3 border rounded-md",
                                                        isDragging && "cursor-move",
                                                        dragOverIndex === index && "border-dashed border-primary"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-5 w-5 flex-shrink-0">
                                                            <MoveHorizontal className="h-5 w-5 text-muted-foreground cursor-move" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: stage.color }}
                                                            />
                                                            <span>{stage.name}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleEditStage("open", index)}
                                                        >
                                                            <PlusCircle className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="z-[100]">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Stage</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete the "{stage.name}" stage?
                                                                        Any deals in this stage will need to be moved manually.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteStage("open", index)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="close" className="space-y-4">
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
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddStage("close")}
                            >
                                <PlusCircle className="h-4 w-4 mr-1" />
                                Add Stage
                            </Button>
                        </div>

                        <Card>
                            <ScrollArea className="h-[250px]">
                                <div className="p-1">
                                    {closeStages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-24 text-center">
                                            <p className="text-muted-foreground mb-2">No close stages defined</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddStage("close")}
                                            >
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                Add First Stage
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
                                                        "flex items-center justify-between p-3 border rounded-md",
                                                        isDragging && "cursor-move",
                                                        dragOverIndex === index && "border-dashed border-primary"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-5 w-5 flex-shrink-0">
                                                            <MoveHorizontal className="h-5 w-5 text-muted-foreground cursor-move" />
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
                                                                                onClick={() => handleToggleWonLost(index, "won")}
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
                                                                                onClick={() => handleToggleWonLost(index, "lost")}
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

                                                        <div className="flex gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => handleEditStage("close", index)}
                                                            >
                                                                <PlusCircle className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        <span className="sr-only">Delete</span>
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                    <AlertDialogContent className="z-[100]">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Stage</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete the "{stage.name}" stage?
                                                                            Any deals in this stage will need to be moved manually.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteStage("close", index)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
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
                                                        "w-8 h-8 rounded-full border-2",
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

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="min-w-[120px]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}