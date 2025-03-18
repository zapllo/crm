'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Note {
    text?: string;
    audioLink?: string;
    createdBy: string;
    timestamp: string;
}

export default function NotesSection({ leadId }: { leadId: string }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     const fetchNotes = async () => {
    //         try {
    //             const response = await axios.get(`/api/leads/notes?leadId=${leadId}`);
    //             setNotes(response.data);
    //         } catch (error) {
    //             console.error('Error fetching notes:', error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchNotes();
    // }, [leadId]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            const response = await axios.post('/api/leads/notes', {
                leadId,
                text: newNote,
                createdBy: 'Rohit Jain', // Replace with dynamic user data
            });
            setNotes((prev) => [...prev, response.data.note]);
            setNewNote('');
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    // if (isLoading) {
    //     return <p>Loading notes...</p>;
    // }

    return (
        <div className="notes-section">
            <div className="mb-4">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add Notes..."
                    className="w-full p-2 border rounded bg-transparent text-white"
                />
                <button
                    onClick={handleAddNote}
                    className="mt-2 bg-[#017A5B] text-white px-4 py-2 rounded hover:bg-[#016244]"
                >
                    Save
                </button>
            </div>

            {notes?.map((note, index) => (
                <div key={index} className="p-4 mb-4 bg-[#0b0d29] rounded shadow-md border">
                    <p className="text-sm text-gray-400">{new Date(note.timestamp).toLocaleString()}</p>
                    <p className="text-white">{note.text}</p>
                    {note.audioLink && (
                        <audio controls className="mt-2">
                            <source src={note.audioLink} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    )}
                </div>
            ))}
        </div>
    );
}
