'use client';

import React, { useState, useEffect } from 'react';
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
  User 
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Note {
    _id: string;
    text?: string;
    audioLink?: string;
    createdBy: string;
    timestamp: string;
}

export default function NotesSection({ leadId }: { leadId: string }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState<string>('');
    const [audioLink, setAudioLink] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAudioInput, setShowAudioInput] = useState(false);

    useEffect(() => {
        fetchNotes();
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
                remark: `A new note was added: "${newNote.trim()}"`,
            });
            
            setNotes((prev) => [response.data.note, ...prev]);
            setNewNote('');
            setAudioLink('');
            setShowAudioInput(false);
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setIsSaving(false);
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
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => setShowAudioInput(!showAudioInput)}
                                                        className={cn(
                                                            "h-8 gap-1", 
                                                            showAudioInput && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                                                        )}
                                                    >
                                                        <Music className="h-3.5 w-3.5" />
                                                        {showAudioInput ? 'Hide Audio' : 'Add Audio'}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Add an audio recording link
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    
                                    <Button 
                                        onClick={handleAddNote} 
                                        disabled={isSaving || (!newNote.trim() && !audioLink.trim())}
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
                    
                    {/* Notes List */}
                    <ScrollArea className="h-[calc(100vh-400px)] pr-4">
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
                                                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                                                {note.createdBy ? note.createdBy.charAt(0) : 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <h4 className="font-medium text-sm">
                                                                    {note.createdBy || 'User'}
                                                                </h4>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                                                                    </span>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem>Copy Text</DropdownMenuItem>
                                                                            <DropdownMenuItem className="text-red-600">Delete Note</DropdownMenuItem>
                                                                        </DropdownMenuContent>
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