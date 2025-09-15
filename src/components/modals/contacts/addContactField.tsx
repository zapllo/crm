"use client";
import React, { useState } from "react";
import axios from "axios";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
interface AddContactFieldFormProps {
  onClose: () => void;
  onUpdate: () => void;
}

export default function AddContactFieldForm({
  onClose,
  onUpdate,
}: AddContactFieldFormProps) {
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<"Text" | "Number" | "Date" | "Dropdown">("Text");
  const [mandatory, setMandatory] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fieldTypeIcons = {
    Text: "Aa",
    Number: "123",
    Date: "📅",
    Dropdown: "▼"
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
    } else {
      toast({
        title: "Option cannot be empty",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (fieldType === "Dropdown" && options.length === 0) {
      toast({
        title: "Please add at least one option",
        description: "Dropdown fields require options to choose from",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post("/api/contact-custom-fields", {
        name,
        fieldType,
        mandatory,
        options: fieldType === "Dropdown" ? options : [],
      });
      toast({
        title: "Field created successfully",
        description: `The ${name} field has been added`,
        duration: 3000,
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to add field",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Failed to add contact field:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="field-name">Field Name</Label>
          <Input
            id="field-name"
            placeholder="Enter field name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-type">Field Type</Label>
          <Select value={fieldType} onValueChange={(value) => setFieldType(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {(["Text", "Number", "Date", "Dropdown"] as const).map((type) => (
                <SelectItem className="hover:bg-accent" key={type} value={type}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                      {fieldTypeIcons[type]}
                    </span>
                    <span>{type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="mandatory-switch"
            checked={mandatory}
            onCheckedChange={setMandatory}
          />
          <Label htmlFor="mandatory-switch" className="text-sm">
            Make this field mandatory
          </Label>
        </div>

        {fieldType === "Dropdown" && (
          <div className="space-y-3 p-3 border rounded-md bg-secondary/20">
            <Label htmlFor="option-input">Add Options</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="option-input"
                placeholder="Type an option"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddOption}
                variant="outline"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>Dropdown fields need at least one option</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>These options will be shown as choices for this field.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {options.length > 0 && (
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground mb-2">Added Options</Label>
                <ScrollArea className="h-24 rounded-md border p-2">
                  <div className="flex flex-wrap gap-2">
                    {options.map((option, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="px-2.5 py-1"
                      >
                        {option}
                        <button
                          type="button"
                          className="ml-1 text-muted-foreground hover:text-destructive"
                          onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Field"}
        </Button>
      </div>
    </form>
  );
}