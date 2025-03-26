
import React, { useState, useEffect } from 'react';
import { User, Upload, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const ProfileImageUpload = () => {
  const { profile, uploadAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Ensure avatar URL is updated when profile changes
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    setIsUploading(true);
    try {
      const newAvatarUrl = await uploadAvatar(file);
      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
        toast.success('Profile image updated');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setPreviewUrl(null);
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 relative mb-4">
        {previewUrl ? (
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={previewUrl} alt="Preview" className="object-cover" />
              <AvatarFallback>
                <User className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleCancelPreview}
              className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ) : (
          <Avatar className="w-24 h-24">
            {avatarUrl ? (
              <AvatarImage 
                src={avatarUrl} 
                alt={profile?.full_name || 'User'} 
                className="object-cover"
                onError={() => console.log('Avatar failed to load:', avatarUrl)} 
              />
            ) : null}
            <AvatarFallback className="bg-muted">
              <User className="h-12 w-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        )}

        <label
          htmlFor="profile-image-upload"
          className="absolute bottom-0 right-0 bg-rentmate-orange text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-rentmate-orange/90 transition-colors"
        >
          <Upload className="h-4 w-4" />
        </label>
        <input
          id="profile-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-rentmate-orange border-t-transparent rounded-full animate-spin"></div>
          Uploading...
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
