'use client';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AudioRecorder from './AudioRecorder';
import FileUploader from './FileUploader';
import LinkManager from './LinkManager';
import { Button } from './ui/button';
import { File, Link, Music, X } from 'lucide-react';

interface Link {
    url: string;
    title: string;
}

interface MediaAttachmentsProps {
    initialFiles?: string[];
    initialAudioRecordings?: string[];
    initialLinks?: Link[];
    onFilesChange: (files: string[]) => void;
    onAudioRecordingsChange: (audioRecordings: string[]) => void;
    onLinksChange: (links: Link[]) => void;
}

const MediaAttachments = ({
    initialFiles = [],
    initialAudioRecordings = [],
    initialLinks = [],
    onFilesChange,
    onAudioRecordingsChange,
    onLinksChange
}: MediaAttachmentsProps) => {
    const [files, setFiles] = useState<string[]>(initialFiles);
    const [audioRecordings, setAudioRecordings] = useState<string[]>(initialAudioRecordings);
    const [links, setLinks] = useState<Link[]>(initialLinks);

    useEffect(() => {
        setFiles(initialFiles);
        setAudioRecordings(initialAudioRecordings);
        setLinks(initialLinks);
    }, [initialFiles, initialAudioRecordings, initialLinks]);

    const handleFileUploaded = (newFileUrls: string[]) => {
        const updatedFiles = [...files, ...newFileUrls];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const handleRemoveFile = (fileUrl: string) => {
        const updatedFiles = files.filter(url => url !== fileUrl);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const handleAudioSaved = (audioUrl: string) => {
        const updatedAudioRecordings = [...audioRecordings, audioUrl];
        setAudioRecordings(updatedAudioRecordings);
        onAudioRecordingsChange(updatedAudioRecordings);
    };

    const handleRemoveAudio = (audioUrl: string) => {
        const updatedAudioRecordings = audioRecordings.filter(url => url !== audioUrl);
        setAudioRecordings(updatedAudioRecordings);
        onAudioRecordingsChange(updatedAudioRecordings);
    };

    const handleLinksChange = (updatedLinks: Link[]) => {
        setLinks(updatedLinks);
        onLinksChange(updatedLinks);
    };

    return (
        <div className="mt-4">  
            <Tabs defaultValue="files">
                <TabsList className="grid gap-2 bg-accent grid-cols-3 mb-4">
                    <TabsTrigger className='border-none' value="files">
                        <File className='h-4' /> Files</TabsTrigger>
                    <TabsTrigger className='border-none' value="audio">
                        <Music className='h-4' /> Audio</TabsTrigger>
                    <TabsTrigger className='border-none' value="links">
                        <Link className='h-4' /> Links</TabsTrigger>
                </TabsList>

                <TabsContent value="files">
                    <FileUploader
                        onFileUploaded={handleFileUploaded}
                        existingFiles={files}
                        onRemoveExisting={handleRemoveFile}
                    />
                </TabsContent>

                <TabsContent value="audio">
                    <div className="space-y-4">
                        <AudioRecorder onAudioSaved={handleAudioSaved} />

                        {audioRecordings.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium mb-2">Saved Recordings</h3>
                                <ul className="space-y-2">
                                    {audioRecordings.map((url, index) => (
                                        <li key={index} className="flex items-center p-2 bg-secondary/20 rounded-md">
                                            <audio controls className="h-8 w-full mr-2">
                                                <source src={url} />
                                                Your browser does not support the audio element.
                                            </audio>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 ml-2"
                                                onClick={() => handleRemoveAudio(url)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="links">
                    <LinkManager links={links} onChange={handleLinksChange} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MediaAttachments;
