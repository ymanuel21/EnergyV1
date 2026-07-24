'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  name?: string;
  label?: string;
  defaultValue?: string;
  className?: string;
}

export function ImageUpload({ name = 'image', label = 'Gambar', defaultValue = '', className = '' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(defaultValue);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }

  function handleRemove() {
    setPreview('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {preview ? (
        <div className="relative mb-2 inline-block">
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
            aria-label="Hapus gambar"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-2 flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-500 hover:text-brand-500"
        >
          <span className="text-center text-xs">Klik untuk{'\n'}upload</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden input that submits the URL */}
      <input type="hidden" name={name} value={preview} />

      {fileName && (
        <p className="mt-1 text-xs text-gray-500">{fileName}</p>
      )}
    </div>
  );
}
