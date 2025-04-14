"use client";

import { useState } from "react";
import axios from "axios";
import { Check, InfoIcon, Loader2, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ContactTag {
  _id: string;
  name: string;
  color: string;
}

interface EditContactTagModalProps {
  tag: ContactTag;
  onClose: () => void;
  onUpdate: () => void;
  onDelete?: () => void;
}

// Organized color palette with semantic meanings
const colorOptions = [
  // Primary colors
  { value: "#FF5555", label: "Red" },
  { value: "#FFA500", label: "Orange" },
  { value: "#FFDD00", label: "Yellow" },
  { value: "#4CAF50", label: "Green" },
  { value: "#2196F3", label: "Blue" },
  { value: "#673AB7", label: "Purple" },
  { value: "#E91E63", label: "Pink" },
  { value: "#795548", label: "Brown" },

  // Neutral colors
  { value: "#607D8B", label: "Blue Grey" },
  { value: "#9E9E9E", label: "Grey" },
  { value: "#000000", label: "Black" },
  { value: "#FFFFFF", label: "White" },
];

export default function EditContactTagModal({
  tag,
  onClose,
  onUpdate,
  onDelete,
}: EditContactTagModalProps) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast({
        title: "Tag name required",
        description: "Please enter a name for this tag",
        variant: "destructive",
      });
      return;
    }

    if (!color) {
      toast({
        title: "Color selection required",
        description: "Please select a color for this tag",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.patch("/api/contact-tags", {
        id: tag._id,
        updates: { name, color },
      });
      toast({
        title: "Tag updated successfully",
        description: `The ${name} tag has been updated`,
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to update tag",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update contact tag:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/contact-tags?id=${tag._id}`);
      toast({
        title: "Tag deleted successfully",
        description: `The ${tag.name} tag has been removed`,
      });
      if (onDelete) onDelete();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to delete tag",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete contact tag:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasChanges = name !== tag.name || color !== tag.color;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tag-name">Tag Name</Label>
          <Input
            id="tag-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. VIP Client, Hot Lead, Needs Follow-up"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Tag Color</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="max-w-xs">
                    Choose a color that helps you quickly identify the purpose of this tag.
                    For example, use red for urgent matters, green for positive statuses.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <ScrollArea className="h-36 rounded-md border">
            <div className="grid grid-cols-6 gap-2 p-3">
              {colorOptions.map((c) => (
                <TooltipProvider key={c.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={cn(
                          "relative h-10 aspect-square rounded-full border-2 transition-all hover:scale-110",
                          color === c.value
                            ? "border-ring shadow-md"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: c.value }}
                      >
                        {color === c.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className={cn(
                              "h-4 w-4",
                              ["#FFFFFF", "#FFDD00", "#E7E7E7"].includes(c.value)
                                ? "text-black"
                                : "text-white"
                            )} />
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{c.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </ScrollArea>
        </div>


      </div>

      <div className="flex justify-between items-center pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the "{tag.name}" tag. Any contacts using this tag will no longer be tagged with it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
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
    </form>
  );
}
