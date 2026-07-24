import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { SearchBar } from '@components/forms/SearchBar';

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan (404)',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: '404' }]} />

      <div className="mx-auto max-w-md">
        <p className="text-6xl font-extrabold text-brand-200">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.
        </p>

        <div className="mt-6">
          <SearchBar />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/">
            <Button variant="primary" className="w-full">
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/produk">
            <Button variant="outline" className="w-full">
              Semua Produk
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost" className="w-full">
              Bantuan
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
