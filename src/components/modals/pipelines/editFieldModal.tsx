'use client';

import { useState } from 'react';
import axios from 'axios';

interface EditFieldFormProps {
    pipelineId: string | undefined;
    field: {
        name: string;
        type: 'Text' | 'Date' | 'Number' | 'MultiSelect';
        options?: string[];
    };
    onClose: () => void;
    onUpdate: () => void; // Callback to refresh the pipeline list
}

export default function EditFieldForm({ pipelineId, field, onClose, onUpdate }: EditFieldFormProps) {
    const [name, setName] = useState(field.name);
    const [type, setType] = useState(field.type);
    const [options, setOptions] = useState(field.options || []);
    const [optionInput, setOptionInput] = useState('');

    const handleAddOption = () => {
        if (optionInput.trim()) {
            setOptions((prev) => [...prev, optionInput.trim()]);
            setOptionInput('');
        }
    };

    const handleRemoveOption = (index: number) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pipelineId) return alert("Please select a pipeline.");

        try {
            // PATCH request to update pipeline custom fields
            const response = await axios.patch(`/api/pipelines/${pipelineId}`, {
                customFields: [
                    ...options, // Include the customFields data
                    { name, type, options: type === "MultiSelect" ? options : undefined },
                ],
            });

            if (response.status === 200) {
                onUpdate();
                onClose();
            }
        } catch (error) {
            console.error("Failed to add custom field:", error);
            alert("Failed to add custom field. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Edit Custom Field</h2>
            <div>
                <label className="text-sm text-gray-400">Field Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded bg-transparent text-white  outline-none border  focus:ring-2 focus:ring-[#815bf5]"
                    required
                />
            </div>
            <div>
                <label className="text-sm text-gray-400">Field Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Text' | 'Date' | 'Number' | 'MultiSelect')}
                    className="w-full p-2 rounded bg-[#0b0d29] text-white border outline-none focus:ring-2 focus:ring-[#815bf5]"
                >
                    <option value="Text">Text</option>
                    <option value="Date">Date</option>
                    <option value="Number">Number</option>
                    <option value="MultiSelect">MultiSelect</option>
                </select>
            </div>
            {type === 'MultiSelect' && (
                <div>
                    <label className="text-sm text-gray-400">Options</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={optionInput}
                            onChange={(e) => setOptionInput(e.target.value)}
                            className="flex-grow p-2 rounded bg-transparent  text-white outline-none border  focus:ring-2 focus:ring-[#815bf5]"
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
                                    onClick={() => handleRemoveOption(index)}
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
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="ml-2 px-4 py-2 bg-[#815bf5] text-white rounded hover:bg-[#5f31e9]"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
}
