import React, { useState, useRef } from 'react';
import { CameraIcon, XIcon, UploadIcon, AlertCircleIcon } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageSelected: (file: File) => Promise<void>;
  isLoading?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageSelected,
  isLoading = false,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadProgress(0);

    if (!acceptedFormats.includes(file.type)) {
      setError(`Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploadProgress(10);
      await onImageSelected(file);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreviewUrl(null);
    }
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
          {displayImage ? (
            <img
              src={displayImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <CameraIcon size={40} className="text-gray-400" />
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Click to upload image"
        >
          <UploadIcon size={24} className="text-white" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      <div className="flex flex-col items-center space-y-2 w-full">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          icon={<UploadIcon size={16} />}
        >
          {isLoading ? 'Uploading...' : 'Choose Photo'}
        </Button>

        {previewUrl && !isLoading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearPreview}
            icon={<XIcon size={16} />}
          >
            Clear
          </Button>
        )}
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="w-full flex items-start space-x-2 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircleIcon size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Supported formats: JPG, PNG, WebP
        <br />
        Maximum file size: {maxSizeMB}MB
      </p>
    </div>
  );
};

export default ImageUpload;
