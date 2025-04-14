'use client';

import { useState } from "react";
import axios from "axios";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddFieldFormProps {
    pipelines: { _id: string; name: string }[];
    onClose: () => void;
    onUpdate: () => void;
}

export default function AddFieldForm({ pipelines, onClose, onUpdate }: AddFieldFormProps) {
    const [selectedPipelineId, setSelectedPipelineId] = useState("");
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [options, setOptions] = useState<string[]>([]);
    const [optionInput, setOptionInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAddOption = () => {
        if (optionInput.trim()) {
            setOptions((prev) => [...prev, optionInput.trim()]);
            setOptionInput("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPipelineId) {
            alert("Please select a pipeline.");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.patch(`/api/pipelines/${selectedPipelineId}/custom-fields`, {
                customField: {
                    name,
                    type,
                    options: type === "MultiSelect" ? options : undefined,
                },
            });

            if (response.status === 200) {
                onUpdate();
                setIsLoading(false);
                onClose();
            }
        } catch (error) {
            console.error("Failed to add custom field:", error);
            alert("Failed to add custom field. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* <h2 className="text-lg font-semibold dark:text-white">Add Custom Field</h2> */}
            <div>
                {/* <label className="text-sm text-gray-400">Select Pipeline</label> */}
                <Select
                    value={selectedPipelineId}
                    onValueChange={(value) => setSelectedPipelineId(value)}
                    required
                >
                    <SelectTrigger className="w-full  dark:text-white border ">
                        <SelectValue placeholder="Select a Pipeline" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                        <SelectItem value="All">Select a Pipeline</SelectItem>
                        {pipelines.map((pipeline) => (
                            <SelectItem className="hover:bg-accent" key={pipeline._id} value={pipeline._id}>
                                {pipeline.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Field Name</Label>
                <Input

                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded ] dark:text-white outline-none border  "
                    required
                />
            </div>
            <div>
                {/* <label className="text-sm text-gray-400">Field Type</label> */}
                <Select
                    value={type}
                    onValueChange={(value) => setType(value)}
                >
                    <SelectTrigger className="w-full  dark:text-white border ">
                        <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                        <SelectItem className="hover:bg-accent" value="None">Select Field Type</SelectItem>

                        <SelectItem className="hover:bg-accent" value="Text">Text</SelectItem>
                        <SelectItem className="hover:bg-accent" value="Date">Date</SelectItem>
                        <SelectItem className="hover:bg-accent" value="Number">Number</SelectItem>
                        <SelectItem className="hover:bg-accent" value="MultiSelect">MultiSelect</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {type === "MultiSelect" && (
                <div>
                    {/* <label className="text-sm text-gray-400">Options</label> */}
                    <div className="flex items-center space-x-2">
                        <Input
                            type="text"
                            label="Add Option"
                            value={optionInput}
                            onChange={(e) => setOptionInput(e.target.value)}
                            className="flex-grow p-2 rounded bg-transparent dark:text-white  outline-none border  "
                            placeholder="Add an option"
                        />
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="px-4 py-2 bg-[#815bf5] text-white rounded hover:bg-primary/80 text-sm"
                        >
                            Add
                        </button>
                    </div>
                    <div className="mt-2 space-y-1">
                        {options.map((option, index) => (
                            <div key={index} className="flex border-b items-center justify-between">
                                <span className="dark:text-white text-sm">Option: {option}</span>
                                <Button
                                    type="button"
                                    variant='ghost'
                                    onClick={() =>
                                        setOptions((prev) => prev.filter((_, i) => i !== index))
                                    }
                                    className="text-red-500 h-8 w-8 rounded-full p-1 hover:underline"
                                >
                                    <X className="h-5 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#815bf5] text-white rounded hover:bg-primary/80 text-sm w-full"
                >
                    {isLoading ? <Loader2 className="text-white animate-spin h-5" /> : "Add Field"}
                </button>
            </div>
        </form>
    );
}
