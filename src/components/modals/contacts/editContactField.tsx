"use client";
import React, { useState } from "react";
import axios from "axios";
import { PlusCircle, Trash2, AlertCircle, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ContactFieldDefinition {
  _id: string;
  name: string;
  fieldType: "Text" | "Number" | "Date" | "Dropdown";
  mandatory: boolean;
  options?: string[];
}

interface EditContactFieldFormProps {
  field: ContactFieldDefinition;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditContactFieldForm({
  field,
  onClose,
  onUpdate,
}: EditContactFieldFormProps) {
  const [name, setName] = useState(field.name);
  const [fieldType, setFieldType] = useState(field.fieldType);
  const [mandatory, setMandatory] = useState(field.mandatory);
  const [options, setOptions] = useState<string[]>(field.options || []);
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

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
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
      await axios.patch("/api/contact-custom-fields", {
        id: field._id,
        updates: {
          name,
          fieldType,
          mandatory,
          options: fieldType === "Dropdown" ? options : [],
        },
      });
      toast({
        title: "Field updated successfully",
        description: `The ${name} field has been updated`,
        duration: 3000,
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to update field",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Failed to edit contact field:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasChanges =
    name !== field.name ||
    fieldType !== field.fieldType ||
    mandatory !== field.mandatory ||
    JSON.stringify(options) !== JSON.stringify(field.options || []);

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
          <Select
            value={fieldType}
            onValueChange={(value) => setFieldType(value as any)}
            disabled={field.fieldType !== fieldType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              {(["Text", "Number", "Date", "Dropdown"] as const).map((type) => (
                <SelectItem key={type} value={type}>
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
          {field.fieldType !== fieldType && (
            <p className="text-xs text-muted-foreground mt-1">
              Changing field type is not supported to prevent data loss. Create a new field instead.
            </p>
          )}
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
            <Label htmlFor="option-input">Manage Options</Label>
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

            {options.length > 0 ? (
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground mb-2">Current Options</Label>
                <ScrollArea className="h-24 rounded-md border p-2">
                  <div className="flex flex-wrap gap-2">
                    {options.map((option, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="px-2.5 py-1"
                      >
                        {option}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              className="ml-1 text-muted-foreground hover:text-destructive"
                            >
                              ×
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Option</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove the "{option}" option? Any data using this option will need to be updated manually.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveOption(idx)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 border rounded-md bg-background/50">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-5 w-5 mx-auto mb-1" />
                  <p>No options available. Add at least one option.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
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
    </form>
  );
}