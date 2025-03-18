'use client';

import { useState } from "react";
import axios from "axios";

interface AddFieldFormProps {
    pipelines: { _id: string; name: string }[];
    onClose: () => void;
    onUpdate: () => void;
}

export default function AddFieldForm({ pipelines, onClose, onUpdate }: AddFieldFormProps) {
    const [selectedPipelineId, setSelectedPipelineId] = useState("");
    const [name, setName] = useState("");
    const [type, setType] = useState("Text");
    const [options, setOptions] = useState<string[]>([]);
    const [optionInput, setOptionInput] = useState("");

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
            const response = await axios.patch(`/api/pipelines/${selectedPipelineId}/custom-fields`, {
                customField: {
                    name,
                    type,
                    options: type === "MultiSelect" ? options : undefined,
                },
            });

            if (response.status === 200) {
                onUpdate(); // Refresh the pipelines after successful update
                onClose(); // Close the modal
            }
        } catch (error) {
            console.error("Failed to add custom field:", error);
            alert("Failed to add custom field. Please try again.");
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Add Custom Field</h2>
            <div>
                <label className="text-sm text-gray-400">Select Pipeline</label>
                <select
                    value={selectedPipelineId}
                    onChange={(e) => setSelectedPipelineId(e.target.value)}
                    className="w-full p-2 rounded bg-[#0b0d29] outline-none text-white border  focus:ring-2 focus:ring-[#815bf5]"
                    required
                >
                    <option value="">Select a Pipeline</option>
                    {pipelines.map((pipeline) => (
                        <option key={pipeline._id} value={pipeline._id}>
                            {pipeline.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-sm text-gray-400">Field Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded bg-[#0b0d29] text-white outline-none border  focus:ring-2 focus:ring-[#815bf5]"
                    required
                />
            </div>
            <div>
                <label className="text-sm text-gray-400">Field Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 rounded bg-[#0b0d29]  text-white outline-none border  focus:ring-2 focus:ring-[#815bf5]"
                >
                    <option value="Text">Text</option>
                    <option value="Date">Date</option>
                    <option value="Number">Number</option>
                    <option value="MultiSelect">MultiSelect</option>
                </select>
            </div>
            {type === "MultiSelect" && (
                <div>
                    <label className="text-sm text-gray-400">Options</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={optionInput}
                            onChange={(e) => setOptionInput(e.target.value)}
                            className="flex-grow p-2 rounded bg-transparent text-white  outline-none border  focus:ring-2 focus:ring-[#815bf5]"
                            placeholder="Add an option"
                        />
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="px-4 py-2 bg-[#815bf5] text-white rounded hover:bg-[#5f31e9]"
                        >
                            Add
                        </button>
                    </div>
                    <div className="mt-2 space-y-1">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-white">{option}</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOptions((prev) => prev.filter((_, i) => i !== index))
                                    }
                                    className="text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#815bf5] text-white rounded hover:bg-[#5f31e9]"
                >
                    Add Field
                </button>
            </div>
        </form>
    );
}
