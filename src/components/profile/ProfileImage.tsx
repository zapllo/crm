"use client";

import { useState } from "react";
import { useUserContext } from "@/contexts/userContext";
import axios from "axios";
// import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, Upload, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProfileImageProps {
  profileImage?: string;
  name: string;
  email: string;
}

export function ProfileImage({ profileImage, name, email }: ProfileImageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { fetchUser } = useUserContext();

  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n?.[0] || "")
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
    //   toast.error("Image is too large. Maximum size is 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
    //   toast.error("Only image files are allowed");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelected = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    return interval;
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    
    setIsUploading(true);
    const progressInterval = simulateProgress();
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("files", imageFile);
      
      // Upload image to S3
      const uploadResponse = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      
      const imageUrl = uploadResponse.data.fileUrls[0];
      
      if (!imageUrl) {
        throw new Error("Failed to get uploaded image URL");
      }
      
      // Update user profile with the new image URL
      await axios.post("/api/user/upload-profile-image", {
        imageUrl,
      });
      
      // Complete progress bar
      setUploadProgress(100);
      
      // Refresh user data
      await fetchUser();
      
    //   toast.success("Profile image updated successfully");
      
      // Close dialog after a short delay
      setTimeout(() => {
        setIsDialogOpen(false);
        setImageFile(null);
        setImagePreview(null);
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error(error);
    //   toast.error("Failed to update profile image");
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative group">
        <Avatar className="h-32 w-32 border shadow-sm">
          <AvatarImage src={profileImage || ''} alt={name} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 text-gray-900 hover:bg-white"
              >
                <Camera className="h-4 w-4 mr-1" />
                Change
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] z-[100]">
              <DialogHeader>
                <DialogTitle>Change Profile Picture</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {imagePreview ? (
                  <div className="relative flex justify-center">
                    <div className="relative h-40 w-40 rounded-full overflow-hidden border">
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    {!isUploading && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute -top-2 -right-2 rounded-full h-8 w-8 bg-destructive text-destructive-foreground"
                        onClick={clearSelected}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors",
                      dragActive ? "border-primary bg-muted/50" : "border-muted-foreground/25"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="font-medium">Drag & drop an image here</p>
                      <p className="text-sm text-muted-foreground mb-2">PNG, JPG, GIF up to 5MB</p>
                      <Label 
                        htmlFor="profilePicture" 
                        className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Select Image
                      </Label>
                      <Input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
                
                {imageFile && !isUploading && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleUpload}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="mt-4 space-y-1">
        <h3 className="font-medium text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}