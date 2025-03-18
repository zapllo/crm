'use client';

import { useState } from "react";
import axios from "axios";

interface AddTagModalProps {
    onClose: () => void;
    onUpdate: () => void;
}

const colors = [
    "#FF0000", "#FF8000", "#FFD700", "#008000", "#00BFFF", "#0000FF",
    "#800080", "#FF69B4", "#8B4513", "#808000", "#00FF7F", "#4682B4",
    "#6A5ACD", "#000000",
];

export default function AddTagModal({ onClose, onUpdate }: AddTagModalProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !color) return alert("Name and color are required.");

        try {
            await axios.post("/api/tags", { name, color });
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to create tag:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Add Tag</h2>
            <div>
                <label className="text-sm text-gray-400">Tag Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded bg-[#0b0d29] text-white border border-gray-600"
                    required
                />
            </div>
            <div>
                <label className="text-sm text-gray-400">Select Color</label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                    {colors.map((c) => (
                        <button
                            type="button"
                            key={c}
                            className={`w-8 h-8 rounded-full ${color === c ? "ring-2 ring-white" : ""}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#815bf5] text-white rounded hover:bg-[#5f31e9]"
                >
                    Add Tag
                </button>
            </div>
        </form>
    );
}
