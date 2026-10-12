import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { SearchBar } from '@components/forms/SearchBar';

export const metadata: Metadata = {
  title: 'Page Not Found (404)',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: '404' }]} />

      <div className="mx-auto max-w-md">
        <p className="text-6xl font-extrabold text-gray-200">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          The page you are looking for may have been moved, or it is no longer available.
        </p>

        <div className="mt-6">
          <SearchBar />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/">
            <Button variant="primary" className="w-full">
              Back to Home
            </Button>
          </Link>
          <Link href="/produk">
            <Button variant="outline" className="w-full">
              All Products
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost" className="w-full">
              Help
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
