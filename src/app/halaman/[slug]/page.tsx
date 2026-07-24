import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { staticPages } from '@/lib/data/static-pages';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return staticPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = staticPages.find((p) => p.slug === slug);
  if (!page) return { title: 'Halaman Tidak Ditemukan' };

  return {
    title: page.title,
    alternates: { canonical: `/halaman/${slug}` },
  };
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  const page = staticPages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: page.title }]} />

      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
        <div className="prose mt-6 max-w-none text-gray-700">
          {page.content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) {
              return <h1 key={i} className="mt-0 mb-4 text-2xl font-bold text-gray-900">{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={i} className="mt-8 mb-3 text-xl font-semibold text-gray-900">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('- **')) {
              const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
              if (match) {
                return <p key={i} className="ml-4 text-gray-600"><strong>{match[1]}:</strong> {match[2]}</p>;
              }
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4 text-gray-600">{line.replace('- ', '')}</li>;
            }
            if (line.trim() === '') return <br key={i} />;
            if (line.match(/^\d\./)) {
              return <p key={i} className="font-medium text-gray-800 mt-4">{line}</p>;
            }
            return <p key={i} className="text-gray-600 leading-relaxed">{line}</p>;
          })}
        </div>
      </article>
    </Container>
  );
}
