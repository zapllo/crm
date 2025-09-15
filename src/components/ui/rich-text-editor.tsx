"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { Button } from "./button";
import { Separator } from "./separator";
import { Input } from "./input";
import { Label } from "./label";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Upload,
  X,
  Check,
  Loader2
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "./tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  minHeight = "300px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdating = useRef(false);
  const { toast } = useToast();

  // Dialog states
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && !isUpdating.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  // Handle content change
  const handleInput = useCallback(() => {
    if (editorRef.current && !isUpdating.current) {
      isUpdating.current = true;
      const content = editorRef.current.innerHTML;
      onChange(content);
      setTimeout(() => {
        isUpdating.current = false;
      }, 0);
    }
  }, [onChange]);

  // Execute formatting command
  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // Insert HTML at cursor position with proper focus handling
  const insertHtmlAtCursor = useCallback((html: string) => {
    // Ensure editor has focus
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Create a document fragment from the HTML
        const template = document.createElement('template');
        template.innerHTML = html;
        const fragment = template.content;
        
        // Insert the fragment
        range.insertNode(fragment);
        
        // Move cursor after inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback: append to end of editor
        editorRef.current.innerHTML += html;
      }
      
      // Force update
      handleInput();
      
      // Small delay to ensure DOM is updated, then scroll to view
      setTimeout(() => {
        if (editorRef.current) {
          const images = editorRef.current.querySelectorAll('img:last-of-type');
          if (images.length > 0) {
            images[images.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [handleInput]);

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.fileUrls && result.fileUrls.length > 0) {
        return result.fileUrls[0];
      }
      throw new Error('No file URL returned');
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle direct image upload (upload and insert immediately)
  const handleDirectImageUpload = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change for direct upload
  const onDirectImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, JPEG, GIF, etc.).",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }

      const uploadedUrl = await handleFileUpload([file]);
      if (uploadedUrl) {
        // Create proper email-friendly image HTML
        const imageHtml = `
          <div style="text-align: center; margin: 16px 0;">
            <img 
              src="${uploadedUrl}" 
              alt="${file.name.replace(/\.[^/.]+$/, "")}" 
              style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: inline-block;"
              onload="this.style.display='inline-block'"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            />
            <div style="display: none; padding: 20px; background: #f0f0f0; border-radius: 8px; color: #666;">
              Image failed to load: ${uploadedUrl}
            </div>
          </div>
        `;
        
        insertHtmlAtCursor(imageHtml);
        
        toast({
          title: "Image uploaded successfully",
          description: "The image has been inserted into your template.",
        });
      }
    }
    // Reset file input
    event.target.value = '';
  };

  // Handle image upload for dialog (shows dialog after upload)
  const handleImageUploadForDialog = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select an image file.",
            variant: "destructive"
          });
          return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select an image smaller than 10MB.",
            variant: "destructive"
          });
          return;
        }

        const uploadedUrl = await handleFileUpload([file]);
        if (uploadedUrl) {
          setImageUrl(uploadedUrl);
          setImageAlt(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension for alt text
        }
      }
    };
    
    input.click();
  };

  // Insert link
  const insertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    setLinkText(selectedText);
    setLinkUrl("");
    setShowLinkDialog(true);
  };

  // Confirm link insertion
  const confirmLinkInsertion = () => {
    if (!linkUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL.",
        variant: "destructive"
      });
      return;
    }

    let finalUrl = linkUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${linkText.trim() || finalUrl}</a>`;
    
    if (linkText && window.getSelection()?.toString()) {
      // Replace selected text with link
      executeCommand('insertHTML', linkHtml);
    } else {
      // Insert link at cursor
      insertHtmlAtCursor(linkHtml);
    }

    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
    editorRef.current?.focus();
  };

  // Show image dialog
  const showImageInsertDialog = () => {
    setImageUrl("");
    setImageAlt("");
    setShowImageDialog(true);
  };

  // Confirm image insertion
  const confirmImageInsertion = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Image URL required",
        description: "Please enter a valid image URL or upload an image.",
        variant: "destructive"
      });
      return;
    }

    let finalUrl = imageUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('data:')) {
      finalUrl = 'https://' + finalUrl;
    }

    const imageHtml = `
      <div style="text-align: center; margin: 16px 0;">
        <img 
          src="${finalUrl}" 
          alt="${imageAlt.trim()}" 
          style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: inline-block;"
          onload="this.style.display='inline-block'"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        />
        <div style="display: none; padding: 20px; background: #f0f0f0; border-radius: 8px; color: #666;">
          Image failed to load: ${finalUrl}
        </div>
      </div>
    `;
    insertHtmlAtCursor(imageHtml);

    setShowImageDialog(false);
    setImageUrl("");
    setImageAlt("");
    editorRef.current?.focus();
  };

  // Change font size
  const changeFontSize = useCallback((size: string) => {
    executeCommand("fontSize", size);
  }, [executeCommand]);

  // Change text color
  const changeTextColor = useCallback((color: string) => {
    executeCommand("foreColor", color);
  }, [executeCommand]);

  const toolbarButtons = [
    {
      icon: Bold,
      command: "bold",
      tooltip: "Bold (Ctrl+B)"
    },
    {
      icon: Italic,
      command: "italic",
      tooltip: "Italic (Ctrl+I)"
    },
    {
      icon: Underline,
      command: "underline",
      tooltip: "Underline (Ctrl+U)"
    },
    {
      icon: Strikethrough,
      command: "strikeThrough",
      tooltip: "Strikethrough"
    }
  ];

  const alignmentButtons = [
    {
      icon: AlignLeft,
      command: "justifyLeft",
      tooltip: "Align Left"
    },
    {
      icon: AlignCenter,
      command: "justifyCenter",
      tooltip: "Align Center"
    },
    {
      icon: AlignRight,
      command: "justifyRight",
      tooltip: "Align Right"
    }
  ];

  const listButtons = [
    {
      icon: List,
      command: "insertUnorderedList",
      tooltip: "Bullet List"
    },
    {
      icon: ListOrdered,
      command: "insertOrderedList",
      tooltip: "Numbered List"
    }
  ];

  const textColors = [
    "#000000", "#333333", "#666666", "#999999",
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
    "#FF00FF", "#00FFFF", "#FFA500", "#800080"
  ];

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-", className)}>
      {/* Hidden file input for direct image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onDirectImageFileChange}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border-b p-2 sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-1">
          {/* Font Size */}
          <Select onValueChange={changeFontSize}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              <SelectItem value="1">Small</SelectItem>
              <SelectItem value="3">Normal</SelectItem>
              <SelectItem value="4">Medium</SelectItem>
              <SelectItem value="5">Large</SelectItem>
              <SelectItem value="6">X-Large</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Formatting */}
          <TooltipProvider>
            {toolbarButtons.map((button) => (
              <Tooltip key={button.command}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => executeCommand(button.command)}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{button.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Color */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex">
                  {textColors.map((color) => (
                    <button
                      key={color}
                      className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 mx-0.5 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => changeTextColor(color)}
                    />
                  ))}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text Color</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <TooltipProvider>
            {alignmentButtons.map((button) => (
              <Tooltip key={button.command}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => executeCommand(button.command)}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{button.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <TooltipProvider>
            {listButtons.map((button) => (
              <Tooltip key={button.command}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => executeCommand(button.command)}
                  >
                    <button.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{button.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Link */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={insertLink}
                >
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert Link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Image Dialog */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={showImageInsertDialog}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert Image URL</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Upload Image Directly */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleDirectImageUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload & Insert Image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Editor with proper image styling */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert overflow-auto"
        style={{ 
          minHeight,
          maxHeight: '500px'
        }}
        data-placeholder={placeholder}
      />

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmLinkInsertion()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text (optional)</Label>
              <Input
                id="link-text"
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmLinkInsertion()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmLinkInsertion}>
              <Check className="h-4 w-4 mr-2" />
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text (optional)</Label>
              <Input
                id="image-alt"
                placeholder="Description of image"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Or upload an image:</p>
              <Button
                variant="outline"
                onClick={handleImageUploadForDialog}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image File
                  </>
                )}
              </Button>
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="border rounded-lg p-2 bg-gray-50">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <div className="flex justify-center">
                  <img 
                    src={imageUrl} 
                    alt={imageAlt || "Preview"} 
                    className="max-w-full h-auto max-h-32 object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const errorDiv = target.nextElementSibling as HTMLElement;
                      if (errorDiv) {
                        errorDiv.style.display = 'block';
                        errorDiv.innerHTML = 'Failed to load image';
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmImageInsertion} disabled={!imageUrl.trim()}>
              <Check className="h-4 w-4 mr-2" />
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Styles */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #;
          pointer-events: none;
          font-style: italic;
        }
        
        [contenteditable] img {
          max-width: 100% !important;
          height: auto !important;
          display: inline-block !important;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin: 8px 0;
        }
        
        [contenteditable] div[style*="text-align: center"] {
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
}