"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Loader2, Notebook, Plus } from "lucide-react";

interface AddNoteDialogProps {
    leadId: string;
    onNoteAdded: () => void;
}

export default function AddNoteDialog({ leadId, onNoteAdded }: AddNoteDialogProps) {
    const [noteText, setNoteText] = useState("");
    const [audioLink, setAudioLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddNote = async () => {
        if (!noteText && !audioLink) return; // Require at least text or audio link

        setIsLoading(true);
        try {
            await axios.post("/api/leads/notes", {
                leadId,
                text: noteText,
                audioLink,
            });

            // Also add a timeline entry indicating a note was added
            await axios.post("/api/leads/update-stage", {
                leadId,
                newStage: "Note Added",
                remark: `A new note was added: "${noteText}"`,
            });

            onNoteAdded(); // Refresh lead details
            setIsDialogOpen(false); // Close dialog
            setNoteText(""); // Reset fields
            setAudioLink("");
        } catch (error) {
            console.error("Error adding note:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hover:bg-[#016244] flex gap-1">
                    <Notebook className="h-5" />
                    Add Note
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg p-6">
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                </DialogHeader>

                {/* Note Textarea */}
                <Label className="text-sm font-medium">Note</Label>
                <Textarea
                    placeholder="Enter your note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                />

                {/* Optional Audio Link */}
                <Label className="text-sm font-medium mt-4">Audio Link (Optional)</Label>
                <Input
                    type="url"
                    placeholder="Paste audio link here..."
                    value={audioLink}
                    onChange={(e) => setAudioLink(e.target.value)}
                />

                {/* Submit Button */}
                <Button
                    className="bg-primary w-full mt-4"
                    onClick={handleAddNote}
                    disabled={isLoading || (!noteText && !audioLink)}
                >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Add Note"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
