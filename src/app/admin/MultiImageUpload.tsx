'use client';

import { useState, useRef } from 'react';

interface MultiImageUploadProps {
  name?: string;
  label?: string;
  defaultValue?: string[];
  className?: string;
}

export function MultiImageUpload({ name = 'images', label = 'Gambar Produk', defaultValue = [], className = '' }: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (res.ok) {
          const { url } = await res.json();
          newUrls.push(url);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }

    setImages(prev => [...prev, ...newUrls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= images.length) return;
    setImages(prev => {
      const copy = [...prev];
      [copy[index], copy[newIdx]] = [copy[newIdx], copy[index]];
      return copy;
    });
  }

  // Serialize images as JSON string array for the form
  const imagesJson = JSON.stringify(images);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Gallery */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative group rounded-lg border border-gray-200 overflow-hidden">
            <img
              src={url}
              alt={`Product image ${i + 1}`}
              className="h-24 w-full object-cover"
            />
            {/* Badges */}
            <div className="absolute top-1 left-1 flex gap-1">
              {i === 0 && (
                <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Utama
                </span>
              )}
            </div>
            {/* Hover controls */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(i, -1)}
                  className="rounded bg-white/90 p-1 text-xs hover:bg-white"
                  title="Pindah ke kiri"
                >
                  ←
                </button>
              )}
              {i < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(i, 1)}
                  className="rounded bg-white/90 p-1 text-xs hover:bg-white"
                  title="Pindah ke kanan"
                >
                  →
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="rounded bg-red-500 p-1 text-xs text-white hover:bg-red-600"
                title="Hapus"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
        >
          <span className="text-center text-xs">
            {uploading ? 'Mengupload...' : '+ Tambah\nGambar'}
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {/* Hidden input submits the JSON array */}
      <input type="hidden" name={name} value={imagesJson} />
    </div>
  );
}
