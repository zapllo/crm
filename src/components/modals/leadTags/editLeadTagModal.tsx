'use client';

import { useState } from "react";
import axios from "axios";

interface EditTagModalProps {
    tag: { _id: string; name: string; color: string };
    onClose: () => void;
    onUpdate: () => void;
}

const colors = [
    "#FF0000", "#FF8000", "#FFD700", "#008000", "#00BFFF", "#0000FF",
    "#800080", "#FF69B4", "#8B4513", "#808000", "#00FF7F", "#4682B4",
    "#6A5ACD", "#000000",
];

export default function EditTagModal({ tag, onClose, onUpdate }: EditTagModalProps) {
    const [name, setName] = useState(tag.name);
    const [color, setColor] = useState(tag.color);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.patch(`/api/tags/${tag._id}`, { name, color });
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update tag:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Edit Tag</h2>
            <div>
                <label className="text-sm text-gray-400">Tag Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded  text-white border border-gray-600"
                    required
                />
            </div>
            <div>
                <label className="text-sm text-gray-400">Select Color</label>
                <div className="grid grid-cols-8 gap-2 space-x-2 mt-2">
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
                    Update Tag
                </button>
            </div>
        </form>
    );
}
