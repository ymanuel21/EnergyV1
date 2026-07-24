import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Accordion } from '@ui/Accordion';
import { SITE } from '@lib/constants';

export const metadata: Metadata = {
  title: 'Program Afiliasi',
  description: 'Dapatkan komisi hingga 5% dengan membagikan produk EBTPlaza. Gabung gratis, tanpa minimal penjualan.',
  alternates: { canonical: '/afiliasi' },
};

export default function AffiliatePage() {
  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Afiliator' }]} />

      {/* Hero */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white sm:p-12">
        <h1 className="text-2xl font-bold sm:text-3xl">Program Afiliasi EBTPlaza</h1>
        <p className="mt-3 max-w-lg text-brand-100">
          Bagikan produk energi terbarukan dan dapatkan komisi hingga 5% dari setiap penjualan. Gabung gratis, tanpa minimal penjualan.
        </p>
        <a
          href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Halo, saya tertarik menjadi afiliator EBTPlaza')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-medium text-white hover:bg-accent-600 transition-colors"
        >
          Daftar via WhatsApp →
        </a>
      </div>

      {/* Benefits */}
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          {
            icon: '💰',
            title: 'Komisi 2.5%–5%',
            desc: 'Komisi kompetitif untuk setiap penjualan yang berasal dari link Anda.',
          },
          {
            icon: '🔗',
            title: 'Link Unik',
            desc: 'Dapatkan link tracking khusus untuk memantau performa Anda.',
          },
          {
            icon: '📊',
            title: 'Dashboard',
            desc: 'Pantau klik, konversi, dan komisi Anda secara real-time.',
          },
        ].map((benefit) => (
          <div key={benefit.title} className="rounded-xl border border-gray-200 p-6 text-center">
            <span className="text-3xl">{benefit.icon}</span>
            <h3 className="mt-3 text-lg font-semibold text-gray-900">{benefit.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{benefit.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Cara Kerja</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { step: '1', title: 'Daftar', desc: 'Isi formulir pendaftaran via WhatsApp. Gratis!' },
            { step: '2', title: 'Bagikan', desc: 'Share link produk unik Anda di media sosial, blog, atau grup.' },
            { step: '3', title: 'Dapatkan Komisi', desc: 'Terima komisi setiap ada penjualan dari link Anda.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 rounded-lg border border-gray-200 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">FAQ Afiliator</h2>
        <div className="mt-4 max-w-2xl">
          {[
            {
              q: 'Siapa yang bisa menjadi afiliator?',
              a: 'Siapa saja! Kontraktor, konsultan energi, blogger, influencer, atau siapa pun yang ingin mendapatkan penghasilan tambahan.',
            },
            {
              q: 'Berapa komisi yang saya dapatkan?',
              a: 'Komisi berkisar 2.5% hingga 5% tergantung kategori produk. Detail komisi tercantum di dashboard afiliator.',
            },
            {
              q: 'Bagaimana cara mencairkan komisi?',
              a: 'Komisi dicairkan setiap bulan melalui transfer bank setelah mencapai minimum Rp 100.000.',
            },
            {
              q: 'Apakah ada biaya pendaftaran?',
              a: 'Tidak. Pendaftaran 100% gratis.',
            },
          ].map((faq, i) => (
            <Accordion key={i} title={faq.q}>
              <p>{faq.a}</p>
            </Accordion>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-bold text-brand-900">Siap menghasilkan passive income?</h2>
        <p className="mt-2 text-brand-700">Daftar sekarang dan mulai bagikan produk energi terbarukan.</p>
        <a
          href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Halo, saya tertarik menjadi afiliator EBTPlaza')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-medium text-white hover:bg-green-600 transition-colors"
        >
          Gabung via WhatsApp →
        </a>
      </div>
    </Container>
  );
}
