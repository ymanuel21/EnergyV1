'use client';

import { useState, useRef, useEffect } from 'react';
import { VIDEO_UPLOAD_LIMITS, validateVideoFile } from '@/lib/video-upload-limits';

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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  function emit(url: string) {
    setPreview(url);
    onChange?.(url);
  }

  function clearError() {
    setError(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();

    // Validate before upload
    const validationError = validateVideoFile(file);
    if (validationError) {
      setError(validationError.message);
      // Reset file input so the same file can be re-selected after fixing
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFileName(file.name);
    setUploading(true);

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errData.error || `Upload failed (${res.status})`);
      }
      const { url } = await res.json();
      emit(url);
      setPreview(url);
    } catch (err: any) {
      console.error('Video upload error:', err);
      setError(err.message || 'Upload gagal. Coba lagi.');
      setPreview('');
      setFileName('');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  }

  function handleRemove() {
    setPreview('');
    setFileName('');
    setUrlValue('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    emit('');
  }

  function handleUrlSubmit() {
    if (urlValue.trim()) {
      const url = urlValue.trim();
      setPreview(url);
      setFileName(url.split('/').pop() || '');
      setError(null);
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
          accept={VIDEO_UPLOAD_LIMITS.allowedMimeTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => { clearError(); fileInputRef.current?.click(); }}
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

      {/* Error message */}
      {error && (
        <p className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
      )}

      {/* Requirements — always visible */}
      <div className="text-[10px] text-muted leading-relaxed space-y-0.5">
        <p>
          <span className="font-medium text-primary">Format:</span>{' '}
          {VIDEO_UPLOAD_LIMITS.formatLabel}
          <span className="text-muted ml-1">(MP4 recommended for browser compatibility)</span>
        </p>
        <p>
          <span className="font-medium text-primary">Max file size:</span>{' '}
          {VIDEO_UPLOAD_LIMITS.maxSizeLabel}
        </p>
        <p>
          <span className="font-medium text-primary">Resolution:</span>{' '}
          {VIDEO_UPLOAD_LIMITS.maxResolution ?? 'No enforced limit'}
        </p>
        <p>
          <span className="font-medium text-primary">Duration:</span>{' '}
          {VIDEO_UPLOAD_LIMITS.maxDuration ? `${VIDEO_UPLOAD_LIMITS.maxDuration} seconds` : 'No enforced limit'}
        </p>
      </div>
    </div>
  );
}
