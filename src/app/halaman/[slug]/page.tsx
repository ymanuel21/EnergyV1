import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { getPageBySlug } from '@/lib/api/static-pages';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function RenderContent({ content }: { content: string }) {
  // Convert paragraph spacing attributes to inline styles
  let html = content.replace(
    / lineheight="([^"]*)"( spaceafter="([^"]*)")?/g,
    (_, lh, __, sa) => {
      const styles: string[] = [];
      if (lh) styles.push(`line-height: ${lh}`);
      if (sa) styles.push(`margin-bottom: ${sa}px`);
      return styles.length ? ` style="${styles.join('; ')}"` : '';
    }
  );

  // Render as HTML (Tiptap output) or Markdown (legacy)
  if (html.trim().startsWith('<')) {
    return <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <div className="prose prose-sm sm:prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{html}</ReactMarkdown>
    </div>
  );
}

export const revalidate = 3600;

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: 'Halaman Tidak Ditemukan' };
  return { title: page.title, description: page.description, alternates: { canonical: `/halaman/${slug}` } };
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: page.title }]} />
      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">{page.title}</h1>
        <RenderContent content={page.content} />
      </article>
    </Container>
  );
}
