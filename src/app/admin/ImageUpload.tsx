'use client';

import { useState, useRef, useEffect } from 'react';

interface ImageUploadProps {
  name?: string;
  label?: string;
  defaultValue?: string;
  /** Controlled mode: current value */
  value?: string;
  /** Controlled mode: called when value changes */
  onChange?: (url: string) => void;
  className?: string;
}

/**
 * Single image uploader with file upload + URL fallback.
 * 
 * Uncontrolled: pass `defaultValue` + `name` — uses hidden input for form submission.
 * Controlled: pass `value` + `onChange` — calls onChange with the permanent URL.
 */
export function ImageUpload({
  name = 'image',
  label = 'Gambar',
  defaultValue = '',
  value: controlledValue,
  onChange: controlledOnChange,
  className = '',
}: ImageUploadProps) {
  const isControlled = controlledOnChange !== undefined;
  const initialValue = isControlled ? (controlledValue ?? defaultValue) : defaultValue;

  const [preview, setPreview] = useState<string>(initialValue);
  const [fileName, setFileName] = useState<string>('');
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [storedUrl, setStoredUrl] = useState<string>(initialValue);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when controlled value changes externally
  useEffect(() => {
    if (isControlled && controlledValue !== undefined && controlledValue !== storedUrl) {
      setStoredUrl(controlledValue);
      setPreview(controlledValue);
    }
  }, [isControlled, controlledValue, storedUrl]);

  function emit(url: string) {
    setStoredUrl(url);
    if (isControlled) {
      controlledOnChange!(url);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      // Upload to server — stores permanently in database
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      emit(url);
      setPreview(url); // Replace blob preview with permanent URL
    } catch (err) {
      console.error('Upload error:', err);
      setPreview('');
      setFileName('');
      alert('Upload gagal. Coba lagi.');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  }

  function handleRemove() {
    setPreview('');
    setFileName('');
    setUrlValue('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    emit('');
  }

  function handleUrlSubmit() {
    if (urlValue.trim()) {
      const url = urlValue.trim();
      setPreview(url);
      setFileName(url.split('/').pop() || '');
      emit(url);
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-primary mb-1">{label}</label>

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
          className="mb-2 flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border text-muted hover:border-gray-700 hover:text-primary"
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
          disabled={uploading}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface disabled:opacity-50"
        >
          {uploading ? 'Mengupload...' : 'Pilih File'}
        </button>
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
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
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleUrlSubmit(); } }}
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900"
          >
            Gunakan URL
          </button>
        </div>
      )}

      {/* Hidden input for uncontrolled mode (form submission) */}
      {!isControlled && (
        <input type="hidden" name={name} value={storedUrl} />
      )}

      {fileName && (
        <p className="mt-1 text-xs text-muted">{fileName}</p>
      )}
    </div>
  );
}
