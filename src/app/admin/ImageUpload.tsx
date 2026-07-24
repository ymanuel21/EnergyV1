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
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Convert to base64 data URL — persists across devices and in DB
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setPreview('');
    setFileName('');
    setUrlValue('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleUrlSubmit() {
    if (urlValue.trim()) {
      setPreview(urlValue.trim());
      setFileName(urlValue.trim().split('/').pop() || '');
    }
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

      <div className="flex items-center gap-2 mb-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Pilih File
        </button>
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          {urlMode ? 'Sembunyikan URL' : 'Atau Masukkan URL'}
        </button>
      </div>

      {urlMode && (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="https://... atau /images/..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
          >
            Gunakan URL
          </button>
        </div>
      )}

      {/* Hidden input submits the base64 URL or external URL */}
      <input type="hidden" name={name} value={preview} />

      {fileName && (
        <p className="mt-1 text-xs text-gray-500">{fileName}</p>
      )}
    </div>
  );
}
