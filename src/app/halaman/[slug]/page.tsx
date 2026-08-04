import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { getPageBySlug } from '@/lib/api/static-pages';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function RenderContent({ content }: { content: string }) {
  if (content.trim().startsWith('<')) {
    // Backward-compat: convert legacy HTML attrs → inline styles.
    // Handles both old format (<p lineHeight="2" spaceAfter="32">)
    // and new format (<p style="line-height:2; margin-bottom:32px">).
    const html = content.replace(
      /<p\b([^>]*?)>/g,
      (match, attrs) => {
        const lh = attrs.match(/lineHeight="([^"]*)"/i)?.[1];
        const sa = attrs.match(/spaceAfter="([^"]*)"/i)?.[1];
        if (!lh && !sa) return match;
        const parts: string[] = [];
        if (lh) parts.push(`line-height: ${lh}`);
        if (sa) parts.push(`margin-bottom: ${sa}px`);
        const clean = attrs.replace(/\s*lineHeight="[^"]*"/g, '').replace(/\s*spaceAfter="[^"]*"/g, '');
        return `<p${clean} style="${parts.join('; ')}">`;
      }
    );
    return <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <div className="prose prose-sm sm:prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
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
