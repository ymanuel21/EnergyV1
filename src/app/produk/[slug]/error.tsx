'use client';

import { useEffect } from 'react';
import { Container } from '@ui/Container';
import { Button } from '@ui/Button';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <Container className="py-20 text-center">
      <h2 className="text-lg font-semibold text-gray-900">Terjadi kesalahan</h2>
      <p className="mt-2 text-sm text-gray-500">Gagal memuat halaman produk. Silakan coba lagi.</p>
      <Button variant="outline" className="mt-6" onClick={reset}>
        Coba lagi
      </Button>
    </Container>
  );
}
