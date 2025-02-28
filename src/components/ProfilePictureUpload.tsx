'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';

interface ProfilePictureUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onUploadComplete: (url: string) => void;
}

export default function ProfilePictureUpload({
  userId,
  currentAvatarUrl,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate a unique ID for the file name
  const generateUniqueId = () => {
    // Use timestamp + random string as a simple unique ID
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Upload the file
    await uploadFile(file);
    
    // Clean up the object URL
    return () => URL.revokeObjectURL(objectUrl);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const supabase = createClient();
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${generateUniqueId()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);
      
      // Call the callback with the new URL
      onUploadComplete(publicUrl);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-start w-full">
      <div 
        className="relative w-full h-full rounded-full overflow-hidden border-3 border-blue-400 cursor-pointer aspect-square hover:border-blue-500 transition-all duration-300"
        onClick={triggerFileInput}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile picture"
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg 
              className="w-1/3 h-1/3 text-blue-300" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        
        {/* Edit Overlay - Show on hover or mobile tap with animation */}
        <div 
          className={`absolute inset-0 bg-blue-500 bg-opacity-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
            isHovering || isUploading ? 'bg-opacity-60 opacity-100' : 'opacity-0'
          }`}
        >
          {isUploading ? (
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg 
              className="w-10 h-10 text-white transform scale-90 transition-transform duration-300 ease-in-out hover:scale-100" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
              />
            </svg>
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {uploadError && (
        <p className="mt-2 text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
} 