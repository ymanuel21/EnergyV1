'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoPickerProps {
  value?: string;
  onChange?: (url: string) => void;
}

/**
 * Video picker for HomepageBuilder CMS.
 * Supports file upload via /api/upload + URL paste fallback.
 * Controlled mode: pass `value` + `onChange`.
 */
export function VideoPicker({ value = '', onChange }: VideoPickerProps) {
  const [preview, setPreview] = useState<string>(value);
  const [fileName, setFileName] = useState('');
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  function emit(url: string) {
    setPreview(url);
    onChange?.(url);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      emit(url);
      setPreview(url);
    } catch (err) {
      console.error('Video upload error:', err);
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
    <div>
      {/* Preview */}
      {preview ? (
        <div className="relative mb-2">
          <video
            src={preview}
            muted
            controls
            className="w-full max-h-40 rounded-lg border object-cover bg-black"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
            aria-label="Remove video"
          >
            ✕
          </button>
          {fileName && <p className="mt-1 text-[10px] text-muted truncate">{fileName}</p>}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-2 flex h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border text-muted hover:border-primary/40 hover:text-primary transition"
        >
          <span className="text-center text-xs">🎬 Upload or choose video</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2 mb-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
        >
          {urlMode ? 'Hide URL' : 'Or Paste URL'}
        </button>
      </div>

      {/* URL paste mode */}
      {urlMode && (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="/files/video.mp4 or https://..."
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleUrlSubmit(); } }}
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs focus:border-primary outline-none bg-card"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover"
          >
            Use URL
          </button>
        </div>
      )}
    </div>
  );
}
