'use client';

import { useState, useRef, useEffect } from 'react';

interface MultiImageUploadProps {
  name?: string;
  label?: string;
  defaultValue?: string[];
  /** Controlled mode: current images */
  value?: string[];
  /** Controlled mode: called when images change */
  onChange?: (images: string[]) => void;
  /** Called when upload state changes (true = uploading, false = done) */
  onUploadingChange?: (uploading: boolean) => void;
  className?: string;
}

/**
 * Multi-image uploader with file upload, reorder, delete, preview.
 * 
 * Uncontrolled: pass `defaultValue` + `name` — uses hidden input with JSON string.
 * Controlled: pass `value` + `onChange` — calls onChange with updated array.
 */
export function MultiImageUpload({
  name = 'images',
  label = 'Gambar',
  defaultValue = [],
  value: controlledValue,
  onChange: controlledOnChange,
  onUploadingChange,
  className = '',
}: MultiImageUploadProps) {
  const isControlled = controlledOnChange !== undefined;
  const initialValue = isControlled ? (controlledValue ?? defaultValue) : defaultValue;

  const [images, setImages] = useState<string[]>(initialValue);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when controlled value changes externally
  useEffect(() => {
    if (isControlled && controlledValue !== undefined) {
      const cur = JSON.stringify(images);
      const ext = JSON.stringify(controlledValue);
      if (cur !== ext) {
        setImages(controlledValue);
      }
    }
  }, [isControlled, controlledValue]); // eslint-disable-line

  function emit(newImages: string[]) {
    setImages(newImages);
    if (isControlled) {
      controlledOnChange!(newImages);
    }
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    onUploadingChange?.(true);
    const newUrls: string[] = [];
    let failed = 0;

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (res.ok) {
          const { url } = await res.json();
          newUrls.push(url);
        } else {
          failed++;
        }
      } catch (err) {
        console.error('Upload error:', err);
        failed++;
      }
    }

    if (failed > 0) {
      setUploadError('Gambar produk gagal diunggah. Periksa file dan koneksi Anda lalu coba lagi.');
    } else {
      setUploadError(null);
    }

    emit([...images, ...newUrls]);
    setUploading(false);
    onUploadingChange?.(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index: number) {
    emit(images.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= images.length) return;
    const copy = [...images];
    [copy[index], copy[newIdx]] = [copy[newIdx], copy[index]];
    emit(copy);
  }

  function makeMain(index: number) {
    if (index === 0) return;
    const copy = [...images];
    const [item] = copy.splice(index, 1);
    copy.unshift(item);
    emit(copy);
  }

  const imagesJson = JSON.stringify(images);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-primary mb-1">{label}</label>

      {uploadError && (
        <p role="alert" className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {uploadError} <span className="text-red-400">Kode: PROD_UPLOAD_001</span>
        </p>
      )}

      {/* Gallery */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="relative group rounded-lg border border-border overflow-hidden">
            <img
              src={url}
              alt={`Image ${i + 1}`}
              className="h-24 w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Main badge / set-as-main control (always visible) */}
            <div className="absolute top-1 left-1 flex gap-1 z-10">
              {i === 0 ? (
                <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                  ★ Utama
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(i)}
                  className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-primary transition"
                  title="Jadikan gambar utama"
                >
                  Jadikan Utama
                </button>
              )}
            </div>
            {/* Hover controls */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(i, -1)}
                  className="rounded bg-card/90 p-1 text-xs hover:bg-card"
                  title="Pindah ke kiri"
                >
                  ←
                </button>
              )}
              {i < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(i, 1)}
                  className="rounded bg-card/90 p-1 text-xs hover:bg-card"
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
          className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted hover:border-gray-700 hover:text-primary disabled:opacity-50"
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

      {/* Hidden input for uncontrolled mode (form submission) */}
      {!isControlled && (
        <input type="hidden" name={name} value={imagesJson} />
      )}
    </div>
  );
}
