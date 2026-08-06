'use client';

import { ImageUpload } from '@/app/admin/ImageUpload';
import { MultiImageUpload } from '@/app/admin/MultiImageUpload';

interface ProjectMediaPanelProps {
  coverImage: string;
  onCoverImageChange: (value: string) => void;
  images: string[];
  onImagesChange: (value: string[]) => void;
}

/**
 * Controlled media panel for project cover + gallery.
 * Uses shared ImageUpload (cover) and MultiImageUpload (gallery)
 * — both support local file upload, URL fallback, Media Library link.
 */
export function ProjectMediaPanel({
  coverImage,
  onCoverImageChange,
  images,
  onImagesChange,
}: ProjectMediaPanelProps) {
  return (
    <div className="space-y-8">
      {/* Cover Image — single upload */}
      <div>
        <ImageUpload
          label="Cover Image (Hero)"
          value={coverImage}
          onChange={onCoverImageChange}
        />
        <p className="mt-1 text-xs text-muted">
          Gambar utama yang tampil di halaman proyek dan daftar proyek.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Gallery Images — multi upload */}
      <div>
        <MultiImageUpload
          label="Gallery Images"
          value={images}
          onChange={onImagesChange}
        />
        <p className="mt-1 text-xs text-muted">
          Upload atau pilih beberapa gambar. Gambar pertama adalah utama. Geser untuk mengurutkan.
        </p>
      </div>
    </div>
  );
}
