import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { SearchBar } from '@components/forms/SearchBar';

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations();
  return { title: tr('meta.not-found.tsx.title'), robots: { index: false, follow: true } };
}

export default async function NotFound() {
  const tr = await getTranslations();
  return (
    <Container className="py-20 text-center">
      <Breadcrumb items={[{ label: tr('common.home'), href: '/' }, { label: '404' }]} />

      <div className="mx-auto max-w-md">
        <p className="text-6xl font-extrabold text-gray-200">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {tr('notFound.heading')}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {tr('notFound.description')}
        </p>

        <div className="mt-6">
          <SearchBar />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/">
            <Button variant="primary" className="w-full">
              {tr('notFound.backHome')}
            </Button>
          </Link>
          <Link href="/produk">
            <Button variant="outline" className="w-full">
              {tr('catalog.allProducts')}
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost" className="w-full">
              {tr('notFound.help')}
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
