
import React, { useState } from 'react';
import { User, Upload, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const ProfileImageUpload = () => {
  const { profile, uploadAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast.success('Profile image updated');
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
            <img
              src={previewUrl}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover"
            />
            <button
              onClick={handleCancelPreview}
              className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
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
