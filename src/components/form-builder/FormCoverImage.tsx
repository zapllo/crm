"use client";

import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface FormCoverImageProps {
  coverImage: string | null;
  onImageChange: (imageUrl: string | null) => void;
}

export default function FormCoverImage({ coverImage, onImageChange }: FormCoverImageProps) {
  const [dragging, setDragging] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="w-full mb-4">
      {coverImage ? (
        <div className="relative w-full rounded-lg overflow-hidden" style={{ maxHeight: '240px' }}>
          <img
            src={coverImage}
            alt="Form cover"
            className="w-full object-cover"
            style={{ maxHeight: '240px' }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full bg-background/80 hover:bg-background"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Add Cover Image</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop an image, or click to browse
            </p>
            <Button variant="outline" onClick={() => document.getElementById('cover-image-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <input
              id="cover-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
}
