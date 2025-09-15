"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import {
    Loader2,
    Notebook,
    Plus,
    Music,
    MessageSquare,
    Mic,
    StopCircle,
    Trash2,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AddNoteDialogProps {
    leadId: string;
    onNoteAdded: () => void;
}

export default function AddNoteDialog({ leadId, onNoteAdded }: AddNoteDialogProps) {
    const [noteText, setNoteText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"text" | "audio">("text");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Audio recording states
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [waveformData, setWaveformData] = useState<number[]>([]);


    const resetForm = () => {
        setNoteText("");
        setActiveTab("text");
        setError(null);
        setSuccess(false);
        setIsRecording(false);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);

        // Stop media tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Stop recorder if active
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
        }

        // Clear timers and animation frames
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }

        // Revoke object URL if exists
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
    };

    // Cleanup on component unmount
    useEffect(() => {
        return resetForm;
    }, []);

    // Draw the waveform on canvas
    const drawWaveform = (dataArray: Uint8Array, bufferLength: number) => {
        const canvas = waveformCanvasRef.current;
        if (!canvas) return;

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        // Clear the canvas
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        // Set fill and stroke styles based on recording state
        canvasCtx.fillStyle = isRecording ? 'rgb(239, 68, 68)' : 'rgb(147, 51, 234)';

        // Calculate bar width based on canvas size and number of bars we want to show
        const barWidth = Math.max(2, (WIDTH / 50) - 1);
        const barSpacing = 1;
        let x = 0;

        // Draw a bar for each frequency bin, with some spacing
        for (let i = 0; i < 50; i++) {
            // Calculate which part of the frequency data to use
            const dataIndex = Math.floor((i / 50) * bufferLength);

            // Get the value and scale it to fit the canvas
            const barHeight = (dataArray[dataIndex] / 255) * HEIGHT;

            // Make sure bars have a minimum height so they're always visible
            const height = Math.max(4, barHeight);

            // Draw the bar - center the bars vertically
            const y = (HEIGHT - height) / 2;
            canvasCtx.fillRect(x, y, barWidth, height);

            // Move to the next bar position
            x += barWidth + barSpacing;
        }
    };

    // Set up audio visualization
    const setupAudioVisualization = (stream: MediaStream) => {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create analyzer node
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;

        // Connect stream to analyzer
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        // Start visualization loop
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function visualize() {
            if (!analyserRef.current) return;

            // Only continue the animation loop if recording is active
            if (!isRecording) {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                    animationRef.current = null;
                }
                return;
            }

            // Schedule the next frame
            animationRef.current = requestAnimationFrame(visualize);

            // Get frequency data
            analyserRef.current.getByteFrequencyData(dataArray);

            // Draw the waveform
            drawWaveform(dataArray, bufferLength);
        }

        // Start the visualization loop
        animationRef.current = requestAnimationFrame(visualize);
    };


    // Update waveform during recording - similar to AudioRecorder approach
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

    // Modify startRecording to match the working approach
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
            audioContextRef.current = audioContext;

            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.addEventListener('dataavailable', (event) => {
                audioChunksRef.current.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                // Create audio blob and URL
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);

                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // Stop stream tracks
                stream.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            });

            mediaRecorder.start(100);
            setIsRecording(true);

            // Start visualizing the waveform
            animationRef.current = requestAnimationFrame(updateWaveform);

            // Start a timer for recording duration
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        }
    };

    const handleDiscardRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);

        // Clear canvas
        const canvas = waveformCanvasRef.current;
        if (canvas) {
            const canvasCtx = canvas.getContext('2d');
            if (canvasCtx) {
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const uploadAudio = async () => {
        if (!audioBlob) return null;

        const formData = new FormData();
        formData.append('audio', audioBlob, `recording-${Date.now()}.wav`);

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.audioUrl;
        } catch (error) {
            console.error('Error uploading audio:', error);
            throw new Error('Failed to upload audio recording');
        }
    };

    const handleAddNote = async () => {
        // Validate inputs
        if (activeTab === "text" && !noteText.trim()) {
            setError("Please enter a note");
            return;
        }

        if (activeTab === "audio" && !audioBlob) {
            setError("Please record an audio note");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            let audioFileUrl = null;

            if (activeTab === "audio" && audioBlob) {
                audioFileUrl = await uploadAudio();
            }

            await axios.post("/api/leads/notes", {
                leadId,
                text: activeTab === "text" ? noteText : null,
                audioLink: audioFileUrl,
            });

            // Also add a timeline entry
            await axios.post("/api/leads/update-stage", {
                leadId,
                newStage: "Note Added",
                remark: activeTab === "text"
                    ? `A new note was added: "${noteText.substring(0, 50)}${noteText.length > 50 ? '...' : ''}"`
                    : "An audio note was added",
            });

            setSuccess(true);
            onNoteAdded(); // Refresh lead details

            // Close dialog after a brief delay
            setTimeout(() => {
                setIsDialogOpen(false);
                resetForm();
            }, 1500);

        } catch (error) {
            console.error("Error adding note:", error);
            setError("Failed to add note. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button
                    size='sm'
                    variant="outline"
                    className="hover:bg-accent hover:text-black w-full flex gap-1 transition-colors"
                >
                    <Notebook className="h-5 w-5" />
                    Add Note
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg sm:max-w-xl p-0 overflow-hidden z-[100]">
                <DialogHeader className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Notebook className="h-5 w-5 text-emerald-600" />
                        Add Note
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "text" | "audio")}
                    className="w-full"
                >
                    <TabsList className="grid grid-cols-2 w-full rounded-none ">
                        <TabsTrigger
                            value="text"
                            className="data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-950/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400 rounded-none flex gap-2 py-3"
                        >
                            <MessageSquare className="h-5 w-5" />
                            Text Note
                        </TabsTrigger>
                        <TabsTrigger
                            value="audio"
                            className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-950/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 rounded-none flex gap-2 py-3"
                        >
                            <Music className="h-5 w-5" />
                            Audio Note
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6">
                        <TabsContent value="text" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label className="text-sm font-medium" htmlFor="note-text">
                                            Note Content
                                        </Label>
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-normal bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                                        >
                                            Text Note
                                        </Badge>
                                    </div>
                                    <Textarea
                                        id="note-text"
                                        placeholder="Enter your note about this lead..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        className="min-h-[200px] resize-none focus-visible:ring-green-500"
                                    />
                                </div>

                                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="underline decoration-dotted">
                                                Pro Tip:
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <p>Format with markdown for better readability</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    {" "}
                                    Use detailed notes to keep track of important information about this lead.
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="audio" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label className="text-sm font-medium">
                                            Audio Recording
                                        </Label>
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-normal bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                                        >
                                            Audio Note
                                        </Badge>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        {/* Canvas-based waveform visualization */}

                                        <div className="h-24 bg-black/5 dark:bg-white/5 p-4">
                                            <div className="h-full flex items-center justify-between">
                                                {waveformData.length > 0 ? (
                                                    waveformData.map((value, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-primary w-1.5 mx-px"
                                                            style={{
                                                                height: `${Math.max(5, value * 100)}%`,
                                                                backgroundColor: isRecording ? 'rgb(239, 68, 68)' : 'rgb(147, 51, 234)'
                                                            }}
                                                        />
                                                    ))
                                                ) : !isRecording && !audioUrl ? (
                                                    <div className="w-full text-sm text-muted-foreground flex items-center justify-center gap-2">
                                                        <Mic className="h-4 w-4" />
                                                        Click record to start
                                                    </div>
                                                ) : null}

                                                {!isRecording && !waveformData.length && audioUrl && (
                                                    <Progress value={undefined} className="w-full" />
                                                )}
                                            </div>
                                        </div>
                                        {/* Controls */}
                                        <div className="p-3 flex items-center justify-between border-t bg-muted/20">
                                            <div className="flex items-center gap-2">
                                                {!isRecording && !audioUrl ? (
                                                    <Button
                                                        onClick={startRecording}
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-red-100 hover:bg-red-200 text-red-600 border-none flex gap-1"
                                                    >
                                                        <Mic className="h-4 w-4" />
                                                        Record
                                                    </Button>
                                                ) : isRecording ? (
                                                    <Button
                                                        onClick={stopRecording}
                                                        size="sm"
                                                        variant="destructive"
                                                        className="flex gap-1"
                                                    >
                                                        <StopCircle className="h-4 w-4" />
                                                        Stop
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={handleDiscardRecording}
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex gap-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Discard
                                                    </Button>
                                                )}

                                                {audioUrl && (
                                                    <audio controls className="h-8 w-[180px]">
                                                        <source src={audioUrl} type="audio/wav" />
                                                        Your browser does not support audio playback.
                                                    </audio>
                                                )}
                                            </div>

                                            <div className="text-sm font-medium">
                                                {formatTime(recordingTime)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="underline decoration-dotted">
                                                Pro Tip:
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <p>Find a quiet place for clear audio recording</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    {" "}
                                    Audio notes are great for capturing detailed conversations and thoughts quickly.
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                {error && (
                    <div className="px-6 py-2 text-red-600 bg-red-50 dark:bg-red-950/30 flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-6 py-2 text-green-600 bg-green-50 dark:bg-green-950/30 flex items-center gap-2 text-sm"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Note added successfully!
                    </motion.div>
                )}

                <DialogFooter className="px-6 py-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddNote}
                        disabled={isLoading ||
                            (activeTab === "text" && !noteText.trim()) ||
                            (activeTab === "audio" && !audioBlob) ||
                            isRecording}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Note
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
