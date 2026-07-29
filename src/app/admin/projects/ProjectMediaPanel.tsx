'use client';

import { useState } from 'react';
import { ImageGallery } from '@/app/admin/products/ImageGallery';

export function ProjectMediaPanel({ defaultCoverImage, defaultImages }: { defaultCoverImage: string; defaultImages: string[] }) {
  const [cover, setCover] = useState(defaultCoverImage);
  const [gallery, setGallery] = useState<string[]>(defaultImages || []);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-primary mb-1">Cover Image</label>
        <ImageGallery images={cover ? [cover] : []} onChange={(imgs) => setCover(imgs[0] || '')} />
        <input type="hidden" name="coverImage" value={cover} />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-1">Gallery</label>
        <ImageGallery images={gallery} onChange={setGallery} />
        <input type="hidden" name="images" value={JSON.stringify(gallery)} />
      </div>
    </div>
  );
}
