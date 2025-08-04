'use client';
import { useState, useRef } from 'react';
import { 
  FileText, Upload, X, File as FileIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileUploaded: (fileUrls: string[]) => void;
  existingFiles?: string[];
  onRemoveExisting?: (fileUrl: string) => void;
}

const FileUploader = ({ 
  onFileUploaded, 
  existingFiles = [], 
  onRemoveExisting 
}: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      // Simulating upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 100);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Failed to upload files');
      }
      
      const data = await response.json();
      setUploadProgress(100);
      
      if (data.fileUrls && data.fileUrls.length > 0) {
        onFileUploaded(data.fileUrls);
        toast({
          title: "Success",
          description: "Files uploaded successfully",
        });
      }
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveFile = (fileUrl: string) => {
    if (onRemoveExisting) {
      onRemoveExisting(fileUrl);
    }
  };
  
  const getFileName = (url: string) => {
    // Extract filename from URL
    const parts = url.split('/');
    return parts[parts.length - 1];
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md">File Attachments</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Existing files list */}
        {existingFiles.length > 0 && (
          <ul className="space-y-2 mb-4">
            {existingFiles.map((file, index) => (
              <li key={index} className="flex items-center p-2 bg-secondary/20 rounded-md">
                <FileIcon className="h-4 w-4 mr-2" />
                <a 
                  href={file} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-sm hover:underline"
                >
                  {getFileName(file)}
                </a>
                {onRemoveExisting && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveFile(file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        
        {/* Upload progress */}
        {isUploading && (
          <div className="mb-4">
            <Progress 
              value={uploadProgress} 
              className="h-2 mb-2" 
            />
            <p className="text-xs text-center">
              {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
            </p>
          </div>
        )}
        
        {/* Upload button */}
        <div className="flex justify-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;