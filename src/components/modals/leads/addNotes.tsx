"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import {
    Loader2,
    Notebook,
    Plus,
    Music,
    MessageSquare,
    Link,
    CheckCircle,
    AlertCircle
} from "lucide-react";

interface AddNoteDialogProps {
    leadId: string;
    onNoteAdded: () => void;
}

export default function AddNoteDialog({ leadId, onNoteAdded }: AddNoteDialogProps) {
    const [noteText, setNoteText] = useState("");
    const [audioLink, setAudioLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"text" | "audio">("text");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const resetForm = () => {
        setNoteText("");
        setAudioLink("");
        setActiveTab("text");
        setError(null);
        setSuccess(false);
    };

    const handleAddNote = async () => {
        // Validate inputs
        if (activeTab === "text" && !noteText.trim()) {
            setError("Please enter a note");
            return;
        }

        if (activeTab === "audio" && !audioLink.trim()) {
            setError("Please provide an audio link");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await axios.post("/api/leads/notes", {
                leadId,
                text: activeTab === "text" ? noteText : null,
                audioLink: activeTab === "audio" ? audioLink : null,
            });

            // Also add a timeline entry indicating a note was added
            await axios.post("/api/leads/update-stage", {
                leadId,
                newStage: "Note Added",
                remark: activeTab === "text"
                    ? `A new note was added: "${noteText.substring(0, 50)}${noteText.length > 50 ? '...' : ''}"`
                    : "An audio note was added",
            });

            setSuccess(true);
            onNoteAdded(); // Refresh lead details

            // Close dialog after a brief delay to show success message
            setTimeout(() => {
                setIsDialogOpen(false);
                resetForm();
            }, 1500);

        } catch (error) {
            console.error("Error adding note:", error);
            setError("Failed to add note. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="hover:bg-accent border-none hover:text-black w-full flex gap-1 transition-colors"
                >
                    <Notebook className="h-5 w-5" />
                    Add Note
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg sm:max-w-xl p-0 overflow-hidden z-[100]">
                <DialogHeader className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Notebook className="h-5 w-5 text-emerald-600" />
                        Add Note
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "text" | "audio")}
                    className="w-full"
                >
                    <TabsList className="grid grid-cols-2 w-full rounded-none border-b">
                        <TabsTrigger
                            value="text"
                            className="data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-950/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400 rounded-none flex gap-2 py-3"
                        >
                            <MessageSquare className="h-5 w-5" />
                            Text Note
                        </TabsTrigger>
                        <TabsTrigger
                            value="audio"
                            className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-950/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 rounded-none flex gap-2 py-3"
                        >
                            <Music className="h-5 w-5" />
                            Audio Note
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6">
                        <TabsContent value="text" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label className="text-sm font-medium" htmlFor="note-text">
                                            Note Content
                                        </Label>
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-normal bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                                        >
                                            Text Note
                                        </Badge>
                                    </div>
                                    <Textarea
                                        id="note-text"
                                        placeholder="Enter your note about this lead..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        className="min-h-[200px] resize-none focus-visible:ring-green-500"
                                    />
                                </div>

                                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="underline decoration-dotted">
                                                Pro Tip:
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <p>Format with markdown for better readability</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    {" "}
                                    Use detailed notes to keep track of important information about this lead.
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="audio" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label className="text-sm font-medium" htmlFor="audio-link">
                                            Audio Recording URL
                                        </Label>
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-normal bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                                        >
                                            Audio Note
                                        </Badge>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="audio-link"
                                            type="url"
                                            placeholder="Paste audio recording URL..."
                                            value={audioLink}
                                            onChange={(e) => setAudioLink(e.target.value)}
                                            className="pr-10 focus-visible:ring-purple-500"
                                        />
                                        <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>

                                {audioLink && (
                                    <div className="bg-muted/30 rounded-md p-3">
                                        <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Music className="h-4 w-4 text-purple-600" />
                                            Audio Preview
                                        </div>
                                        <audio controls className="w-full">
                                            <source src={audioLink} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}

                                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                                    Record audio using your favorite tool and paste the link here.
                                    Audio notes are great for capturing detailed conversations.
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                {error && (
                    <div className="px-6 py-2 text-red-600 bg-red-50 dark:bg-red-950/30 flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-6 py-2 text-green-600 bg-green-50 dark:bg-green-950/30 flex items-center gap-2 text-sm"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Note added successfully!
                    </motion.div>
                )}

                <DialogFooter className="px-6 py-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddNote}
                        disabled={isLoading ||
                            (activeTab === "text" && !noteText.trim()) ||
                            (activeTab === "audio" && !audioLink.trim())}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Note
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}