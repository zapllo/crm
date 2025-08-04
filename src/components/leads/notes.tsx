'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

// Icons
import {
    Loader2,
    StickyNote,
    Send,
    ChevronDown,
    MessageSquare,
    PlayCircle,
    MoreHorizontal,
    Plus,
    Music,
    User,
    Mic,
    Square,
    Play,
    Pause,
    Trash2
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

interface Note {
    _id: string;
    text?: string;
    audioLink?: string;
    createdBy: string;
    createdByName?: string;
    profileImage?: string;
    timestamp: string;
}

export default function NotesSection({ leadId }: { leadId: string }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState<string>('');
    const [audioLink, setAudioLink] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAudioInput, setShowAudioInput] = useState(false);
    const [showRecorder, setShowRecorder] = useState(false);

    // Audio recording states
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [waveformData, setWaveformData] = useState<number[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    // Refs for audio recording
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        fetchNotes();

        // Initialize the audio element
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', () => {
            setIsPlaying(false);
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', () => {
                    setIsPlaying(false);
                });
                audioRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [leadId]);

    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/leads/notes?leadId=${leadId}`);
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Update waveform during recording
    const updateWaveform = () => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Reduce the data to a manageable size for display
            const reducedData: number[] = [];
            const bucketSize = Math.floor(dataArray.length / 30);

            for (let i = 0; i < 30; i++) {
                let sum = 0;
                for (let j = 0; j < bucketSize; j++) {
                    sum += dataArray[i * bucketSize + j] / 255;
                }
                reducedData.push(sum / bucketSize);
            }

            setWaveformData(reducedData);
            animationRef.current = requestAnimationFrame(updateWaveform);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new AudioContext();
            const mediaStreamSource = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            mediaStreamSource.connect(analyser);
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            audioChunksRef.current = [];
            mediaRecorder.addEventListener('dataavailable', (event) => {
                audioChunksRef.current.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);

                if (audioRef.current) {
                    audioRef.current.src = audioUrl;
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Upload the audio recording
                uploadAudioRecording(audioBlob);
            });

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start visualizing the waveform
            animationRef.current = requestAnimationFrame(updateWaveform);

            // Start a timer to track recording duration
            const startTime = Date.now();
            const timerInterval = setInterval(() => {
                setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);

            // Store the interval ID to clear it later
            mediaRecorder.addEventListener('stop', () => {
                clearInterval(timerInterval);
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                    animationRef.current = null;
                }
            });

        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const discardRecording = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        setAudioURL(null);
        setIsPlaying(false);
        setWaveformData([]);
    };

    const uploadAudioRecording = async (audioBlob: Blob) => {
        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('audio', audioBlob, `recording-${Date.now()}.wav`);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload audio recording');
            }

            const data = await response.json();

            if (data.audioUrl) {
                setAudioLink(data.audioUrl);
            }

        } catch (error) {
            console.error('Error uploading audio:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAddNote = async () => {
        if (!newNote.trim() && !audioLink.trim()) return;

        try {
            setIsSaving(true);

            const response = await axios.post('/api/leads/notes', {
                leadId,
                text: newNote.trim(),
                audioLink: audioLink.trim(),
            });

            // Also add a timeline entry
            await axios.post("/api/leads/update-stage", {
                leadId,
                newStage: "Note Added",
                remark: newNote.trim()
                    ? `A new note was added: "${newNote.trim().substring(0, 50)}${newNote.trim().length > 50 ? '...' : ''}"`
                    : "An audio note was added",
            });

            setNotes((prev) => [response.data.note, ...prev]);
            setNewNote('');
            setAudioLink('');
            setShowAudioInput(false);
            setShowRecorder(false);
            setAudioURL(null);
            setWaveformData([]);

        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Add this function to handle the delete functionality
    const handleDeleteNote = async () => {
        if (!noteToDelete) return;

        try {
            setIsDeleting(true);

            // Call the API to delete the note
            await axios.delete(`/api/leads/notes?leadId=${leadId}&noteId=${noteToDelete}`);

            // Remove the note from state
            setNotes(prev => prev.filter(note => note._id !== noteToDelete));

            // Close dialog
            setDeleteDialogOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            console.error('Error deleting note:', error);
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <div className="space-y-6 bg-card">
            <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <StickyNote className="h-5 w-5 text-amber-500" />
                            <h3 className="font-semibold text-lg">Notes</h3>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200">
                            {isLoading ? '...' : notes.length} {notes.length === 1 ? 'note' : 'notes'}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Add Note Section */}
                    <div className="mb-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarFallback className="bg-blue-600 text-white">
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note about this lead..."
                                    className="min-h-24 resize-none border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500"
                                />

                                <AnimatePresence>
                                    {showAudioInput && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="pt-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Music className="h-4 w-4 text-purple-500" />
                                                <Input
                                                    value={audioLink}
                                                    onChange={(e) => setAudioLink(e.target.value)}
                                                    placeholder="Paste audio recording URL..."
                                                    className="flex-1"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Audio Recorder */}
                                <AnimatePresence>
                                    {showRecorder && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="pt-2"
                                        >
                                            <Card className="border-purple-100 dark:border-purple-900">
                                                <CardHeader className="py-2 px-4 bg-purple-50 dark:bg-purple-900/20 flex flex-row items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Music className="h-4 w-4 text-purple-500" />
                                                        <span className="font-medium text-sm">Audio Recording</span>
                                                    </div>
                                                    {recordingTime > 0 && !isRecording && (
                                                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                                            {formatTime(recordingTime)}
                                                        </Badge>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="p-4">
                                                    {/* Waveform visualization */}
                                                    {(isRecording || audioURL) && (
                                                        <div className="h-16 my-2 bg-secondary/20 rounded-md p-2">
                                                            <div className="h-full flex items-center justify-between">
                                                                {waveformData.map((value, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="bg-purple-500 w-1.5 mx-px"
                                                                        style={{ height: `${Math.max(5, value * 100)}%` }}
                                                                    />
                                                                ))}
                                                                {!isRecording && !waveformData.length && audioURL && (
                                                                    <Progress value={undefined} className="w-full" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Recording controls */}
                                                    <div className="flex justify-center space-x-3 mt-3">
                                                        {!audioURL ? (
                                                            <Button
                                                                onClick={isRecording ? stopRecording : startRecording}
                                                                variant={isRecording ? "destructive" : "secondary"}
                                                                size="sm"
                                                                className="w-full"
                                                            >
                                                                {isRecording ? (
                                                                    <>
                                                                        <Square className="h-4 w-4 mr-2" />
                                                                        Stop Recording {formatTime(recordingTime)}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Mic className="h-4 w-4 mr-2" />
                                                                        Start Recording
                                                                    </>
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={togglePlayback}
                                                                >
                                                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                                    {isPlaying ? " Pause" : " Play"}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={discardRecording}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                                    Discard
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {isUploading && (
                                                        <div className="mt-2 text-sm text-center flex items-center justify-center gap-2">
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Uploading recording...
                                                        </div>
                                                    )}

                                                    {audioLink && !isUploading && (
                                                        <div className="mt-3 text-sm text-center text-green-600">
                                                            Recording uploaded successfully!
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowAudioInput(!showAudioInput);
                                                            if (showRecorder) setShowRecorder(false);
                                                        }}
                                                        className={cn(
                                                            "h-8 gap-1",
                                                            showAudioInput && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                                                        )}
                                                    >
                                                        <Music className="h-3.5 w-3.5" />
                                                        {showAudioInput ? 'Hide Audio URL' : 'Add Audio URL'}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Add an audio recording link
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowRecorder(!showRecorder);
                                                            if (showAudioInput) setShowAudioInput(false);
                                                        }}
                                                        className={cn(
                                                            "h-8 gap-1",
                                                            showRecorder && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                                        )}
                                                    >
                                                        <Mic className="h-3.5 w-3.5" />
                                                        {showRecorder ? 'Hide Recorder' : 'Record Audio'}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Record audio directly
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    <Button
                                        onClick={handleAddNote}
                                        disabled={isSaving || (!newNote.trim() && !audioLink.trim()) || isRecording}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-1.5"
                                        size="sm"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Add Note
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Delete Confirmation Dialog */}
<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
    <DialogContent className="sm:max-w-[425px] z-[100]">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Delete Note
            </DialogTitle>
            <DialogDescription>
                Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
            <Button
                variant="outline"
                onClick={() => {
                    setDeleteDialogOpen(false);
                    setNoteToDelete(null);
                }}
            >
                Cancel
            </Button>
            <Button
                variant="destructive"
                onClick={handleDeleteNote}
                disabled={isDeleting}
                className="gap-2"
            >
                {isDeleting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                    </>
                ) : (
                    <>
                        <Trash2 className="h-4 w-4" />
                        Delete Note
                    </>
                )}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

                    {/* Notes List */}
                    <ScrollArea className=" pr-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-5 w-32" />
                                                <Skeleton className="h-5 w-24" />
                                            </div>
                                            <Skeleton className="h-20 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                                <StickyNote className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                <h3 className="font-medium text-lg mb-1">No notes yet</h3>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                                    Notes help you keep track of important information about this lead.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => document.querySelector('textarea')?.focus()}
                                    className="gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Your First Note
                                </Button>
                            </div>
                        ) : (
                            <AnimatePresence>
                                <div className="space-y-4">
                                    {notes.map((note, index) => (
                                        <motion.div
                                            key={note._id || index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Card className="shadow-sm overflow-hidden">
                                                <CardContent className="p-4 pb-3">
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="h-8 w-8 mt-1">
                                                            {note.profileImage ? (
                                                                <AvatarImage src={note.profileImage} alt={note.createdByName || 'User'} />
                                                            ) : (
                                                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                                                    {note.createdByName ? note.createdByName.charAt(0) : 'U'}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>

                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <h4 className="font-medium text-sm">
                                                                    {note.createdByName || 'Unknown User'}
                                                                </h4>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                                                                    </span>
                                                                    <DropdownMenu>

                                                                        <DropdownMenuTrigger
                                                                            className="text-red-600 cursor-pointer"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                setNoteToDelete(note._id);
                                                                                setDeleteDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            
                                                                        </DropdownMenuTrigger>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>

                                                            {note.text && (
                                                                <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                                                            )}

                                                            {note.audioLink && (
                                                                <div className="mt-3 bg-muted/30 rounded-md p-3">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <PlayCircle className="h-4 w-4 text-purple-500" />
                                                                        <span className="text-xs font-medium">Audio Recording</span>
                                                                    </div>
                                                                    <audio controls className="w-full h-8">
                                                                        <source src={note.audioLink} type="audio/mpeg" />
                                                                        Your browser does not support the audio element.
                                                                    </audio>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="px-4 py-2 bg-muted/20 border-t flex justify-end">
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(new Date(note.timestamp), "MMM d, yyyy 'at' h:mm a")}
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
