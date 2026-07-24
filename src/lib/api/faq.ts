import 'server-only';
import { getPrisma } from '@/lib/db';

export interface FaqItem {
  question: string;
  answer: string;
}

const STATIC_FAQ: FaqItem[] = [
  { question: 'Bagaimana cara membeli produk di EBTPlaza?', answer: 'Pilih produk yang diinginkan, tambahkan ke keranjang, lalu lakukan checkout.' },
  { question: 'Apakah harga sudah termasuk PPN?', answer: 'Harga yang tercantum belum termasuk PPN 11%.' },
  { question: 'Berapa lama pengiriman?', answer: 'Pengiriman biasanya memakan waktu 2–7 hari kerja.' },
  { question: 'Apakah ada garansi?', answer: 'Ya, setiap produk memiliki garansi 2–12 tahun.' },
  { question: 'Apakah EBTPlaza menyediakan jasa instalasi?', answer: 'Ya, tersedia untuk wilayah Jawa-Bali.' },
  { question: 'Bagaimana cara pembayaran?', answer: 'Pembayaran melalui transfer bank (BCA, Mandiri, BRI).' },
  { question: 'Apakah bisa retur?', answer: 'Retur dapat dilakukan dalam 7 hari setelah produk diterima.' },
  { question: 'Apakah ada diskon pembelian jumlah besar?', answer: 'Ya, hubungi kami untuk penawaran khusus proyek.' },
];

export async function getAllFaqs(): Promise<FaqItem[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { question: true, answer: true } });
      if (rows.length > 0) return rows;
    }
  } catch (e) { console.error('Prisma getAllFaqs failed:', (e as Error).message); }
  return STATIC_FAQ;
}
