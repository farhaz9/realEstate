
'use client';

import { useState, useRef } from 'react';
import { useImageKit } from '@/imagekit/provider';
import { IKUpload } from 'imagekitio-react';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}

export function ImageUploader({ value, onChange, folder = 'other' }: ImageUploaderProps) {
  const imageKit = useImageKit();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const uploaderRef = useRef<HTMLInputElement>(null);

  const handleUploadSuccess = (res: any) => {
    const newUrls = [...value, res.url];
    onChange(newUrls);
    setIsUploading(false);
    toast({
      title: 'Image Uploaded',
      description: `${res.name} has been successfully uploaded.`,
      variant: 'success',
    });
  };

  const handleUploadError = (err: any) => {
    console.error("Upload Error:", err);
    setIsUploading(false);
    toast({
      title: 'Upload Failed',
      description: 'There was an error uploading your image.',
      variant: 'destructive',
    });
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const newUrls = value.filter(url => url !== urlToRemove);
    onChange(newUrls);
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square group">
            <Image
              src={url}
              alt="Uploaded property image"
              fill
              className="object-cover rounded-md border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div
          className="relative aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer"
          onClick={() => uploaderRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="mt-2 text-sm">Uploading...</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8" />
              <p className="mt-2 text-sm text-center">Click to upload</p>
            </>
          )}
        </div>
      </div>
      
      {imageKit && (
        <div style={{ display: 'none' }}>
          <IKUpload
            imageKit={imageKit}
            folder={`/${folder}`}
            onUploadStart={() => setIsUploading(true)}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            inputRef={uploaderRef}
          />
        </div>
      )}
    </div>
  );
}
