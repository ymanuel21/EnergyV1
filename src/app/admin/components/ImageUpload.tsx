'use client';

import { useState } from 'react';

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (url: string) => void;
}

export function ImageUpload({ currentImage, onUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState(currentImage);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPreview(url);
        onUpload(url);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div>
      {preview && <img src={preview} alt="Preview" className="mb-2 h-32 w-32 rounded-lg object-cover" />}
      <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500" />
      <input type="hidden" name="image" value={preview ?? ''} />
    </div>
  );
}
