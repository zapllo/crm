"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface UnsplashImage {
  id: string;
  urls: { regular: string; small: string; thumb: string };
  user: { name: string };
  alt_description: string;
}

interface FormCoverImageProps {
  coverImage: string | null;
  onImageChange: (imageUrl: string | null) => void;
}

export default function FormCoverImage({ coverImage, onImageChange }: FormCoverImageProps) {
  const [dragging, setDragging] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDialogOpen && activeTab === 'unsplash' && unsplashImages.length === 0 && !loadingFeatured) {
      fetchFeaturedImages();
    }
  }, [isDialogOpen, activeTab]);

  const fetchFeaturedImages = async () => {
    try {
      setLoadingFeatured(true);
      // Using default search terms that would return professional images good for form covers
      const response = await axios.get('/api/unsplash/search?query=minimal+background');

      if (response.data && response.data.results) {
        setUnsplashImages(response.data.results);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching featured Unsplash images:', error);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File is too large. Please select an image under 10MB.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append('files', file);

        const response = await axios.post('/api/upload', formData);
        if (response.data.fileUrls && response.data.fileUrls.length > 0) {
          onImageChange(response.data.fileUrls[0]);
        } else {
          handleFileAsDataURL(file);
        }
      } catch (error) {
        console.error('Error uploading to server:', error);
        // Fallback to client-side handling
        handleFileAsDataURL(file);
      }
    }
  };

  const handleFileAsDataURL = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      onImageChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
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
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File is too large. Please select an image under 10MB.");
        return;
      }

      const formData = new FormData();
      formData.append('files', file);

      axios.post('/api/upload', formData)
        .then(response => {
          if (response.data.fileUrls && response.data.fileUrls.length > 0) {
            onImageChange(response.data.fileUrls[0]);
          } else {
            handleFileAsDataURL(file);
          }
        })
        .catch(error => {
          console.error('Error uploading to server:', error);
          handleFileAsDataURL(file);
        });
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'unsplash' && unsplashImages.length === 0 && !loadingFeatured) {
      fetchFeaturedImages();
    }
  };

  const searchUnsplash = async () => {
    if (!searchQuery.trim()) {
      fetchFeaturedImages();
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`/api/unsplash/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.data && response.data.results) {
        setUnsplashImages(response.data.results);
      } else {
        console.error('Unexpected response format:', response.data);
        setUnsplashImages([]);
      }
    } catch (error) {
      console.error('Error searching Unsplash:', error);
      setUnsplashImages([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectUnsplashImage = (imageUrl: string) => {
    onImageChange(imageUrl);
    setIsDialogOpen(false);
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
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 hover:bg-background"
              onClick={() => setIsDialogOpen(true)}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full bg-background/80 hover:bg-background"
              onClick={removeImage}
            >
              <X className="h-4 w-4 text-black dark:text-white" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="flex flex-col items-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Add Cover Image</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click to add an image from your device or Unsplash
            </p>
            <input
              ref={fileInputRef}
              id="cover-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] z-[100]">
          <DialogHeader>
            <DialogTitle>Choose Cover Image</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid bg-accent  w-full grid-cols-2">
              <TabsTrigger className='border-none' value="upload">Upload</TabsTrigger>
              <TabsTrigger className='border-none' value="unsplash">Unsplash</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="py-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drag & Drop</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drop an image here, or click to browse
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select from device
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="unsplash" className="py-4">
              <div className="flex mb-4 gap-4">
                <Input
                  placeholder="Search for images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUnsplash()}
                  className="flex-grow mr-2"
                />
                <Button onClick={searchUnsplash} disabled={isSearching || loadingFeatured}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 max-h-[400px] overflow-y-auto">
                {unsplashImages.length > 0 &&
                  unsplashImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative cursor-pointer rounded-md overflow-hidden hover:opacity-90 transition-opacity"
                      onClick={() => selectUnsplashImage(image.urls.regular)}
                    >
                      <img
                        src={image.urls.small}
                        alt={image.alt_description || 'Unsplash image'}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                        {image.user.name}
                      </div>
                    </div>
                  ))
                }

                {unsplashImages.length === 0 && (loadingFeatured || isSearching) && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                      Loading images...
                    </div>
                  </div>
                )}

                {unsplashImages.length === 0 && !loadingFeatured && !isSearching && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No images found. Try another search term.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
