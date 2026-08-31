'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';

/**
 * PC image import for the Media Library.
 * Reuses the existing /api/upload endpoint (multipart → assets table → /api/asset/<id>).
 * On success it refreshes the media list so the new image appears.
 */
export function MediaUploadButton() {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      showToast(`✓ Gambar berhasil diunggah (${url})`, 'success');
      router.refresh();
    } catch {
      showToast('✕ Gagal mengunggah gambar. Periksa file dan koneksi Anda.', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50"
      >
        {uploading ? 'Mengupload...' : '⬆ Upload Image'}
      </button>
    </>
  );
}
