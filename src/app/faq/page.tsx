import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Accordion } from '@ui/Accordion';
import { getAllFaqs } from '@/lib/api/faq';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FAQ (Bantuan)',
  description: 'Pertanyaan yang sering diajukan tentang EBTPlaza — pengiriman, pembayaran, garansi, dan lainnya.',
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const faqItems = await getAllFaqs();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Bantuan' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">FAQ (Bantuan)</h1>
        <p className="mt-1 text-sm text-gray-500">Pertanyaan yang sering diajukan</p>
      </div>

      <div className="mt-6 max-w-2xl">
        {faqItems.length === 0 ? (
          <p className="text-sm text-muted">Belum ada FAQ.</p>
        ) : (
          faqItems.map((item, i) => (
            <Accordion key={i} title={item.question}>
              <p>{item.answer}</p>
            </Accordion>
          ))
        )}
      </div>

      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Masih ada pertanyaan?</h2>
        <p className="mt-1 text-sm text-gray-900">
          Hubungi kami via WhatsApp atau email.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
          >
            WhatsApp
          </a>
          <Link
            href="/permintaan-penawaran"
            className="rounded-lg border border-gray-800 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Ajukan Pertanyaan
          </Link>
        </div>
      </div>
    </Container>
  );
}
