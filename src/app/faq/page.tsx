import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Accordion } from '@ui/Accordion';

export const metadata: Metadata = {
  title: 'FAQ (Bantuan)',
  description: 'Pertanyaan yang sering diajukan tentang EBTPlaza — pengiriman, pembayaran, garansi, dan lainnya.',
  alternates: { canonical: '/faq' },
};

const faqItems = [
  {
    q: 'Bagaimana cara membeli produk di EBTPlaza?',
    a: 'Pilih produk yang diinginkan, klik "Tambah ke Keranjang", lalu lanjutkan ke checkout. Anda akan diminta mengisi informasi pengiriman dan memilih metode pembayaran.',
  },
  {
    q: 'Metode pembayaran apa yang tersedia?',
    a: 'Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), Virtual Account, QRIS, dan COD (Bayar di Tempat) untuk wilayah tertentu.',
  },
  {
    q: 'Berapa lama pengiriman?',
    a: 'Pengiriman biasanya memakan waktu 2–7 hari kerja tergantung lokasi. Produk besar seperti panel surya mungkin memerlukan waktu lebih lama karena pengiriman kargo.',
  },
  {
    q: 'Apakah ada garansi?',
    a: 'Ya, setiap produk memiliki garansi yang berbeda-beda. Informasi garansi tercantum di halaman detail produk. Umumnya 2–12 tahun untuk panel surya dan inverter.',
  },
  {
    q: 'Bagaimana cara mengajukan permintaan penawaran (RFQ) untuk proyek?',
    a: 'Kunjungi halaman Permintaan Penawaran, isi formulir dengan detail proyek Anda, dan tim kami akan menghubungi Anda dengan penawaran harga.',
  },
  {
    q: 'Apakah EBTPlaza menyediakan jasa instalasi?',
    a: 'Kami dapat merekomendasikan mitra instalasi. Centang opsi "Membutuhkan jasa instalasi" saat mengisi formulir RFQ, dan kami akan membantu menghubungkan Anda.',
  },
  {
    q: 'Bagaimana cara menjadi afiliator?',
    a: 'Kunjungi halaman Afiliasi untuk mendaftar. Anda akan mendapatkan link unik dan komisi untuk setiap penjualan yang berasal dari link Anda.',
  },
  {
    q: 'Bagaimana kebijakan retur?',
    a: 'Retur dapat diajukan dalam 7 hari setelah produk diterima, dengan syarat produk dalam kondisi asli dan kemasan lengkap. Lihat halaman Kebijakan Retur untuk detail lengkap.',
  },
];

export default function FaqPage() {
  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Bantuan' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">FAQ (Bantuan)</h1>
        <p className="mt-1 text-sm text-gray-500">Pertanyaan yang sering diajukan</p>
      </div>

      <div className="mt-6 max-w-2xl">
        {faqItems.map((item, i) => (
          <Accordion key={i} title={item.q}>
            <p>{item.a}</p>
          </Accordion>
        ))}
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
