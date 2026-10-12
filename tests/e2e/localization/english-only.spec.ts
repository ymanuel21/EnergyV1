import { test, expect, type Page } from '@playwright/test';

/**
 * English-only localization guard.
 *
 * The brief requires the customer-facing site to publish no Indonesian. This suite crawls every
 * public route, reads the rendered text, and fails listing any Indonesian word it finds — so a
 * regression (a new hardcoded label, an untranslated CMS field) is caught by CI rather than by
 * the client.
 *
 * Words that are legitimately shared with English, are proper nouns, or are retained industry
 * terms (PLTS, PLN, brand names, city names) are allow-listed below and are deliberately NOT
 * treated as failures.
 */

/** Indonesian words that do not occur in ordinary English prose. */
const INDONESIAN = [
  'dan', 'atau', 'dengan', 'untuk', 'dari', 'pada', 'yang', 'tidak', 'sampai', 'bisa', 'dapat',
  'adalah', 'ini', 'itu', 'serta', 'juta', 'ribu', 'harga', 'garansi', 'tahun', 'bulan', 'hari',
  'listrik', 'berat', 'ukuran', 'kapasitas', 'suhu', 'tingkat', 'cocok', 'kebutuhan', 'jenis',
  'baterai', 'operasi', 'derajat', 'persen', 'kurang', 'lebih', 'bawah', 'tanpa', 'dimensi',
  'panjang', 'lebar', 'tinggi', 'tebal', 'bahan', 'warna', 'standar', 'pengiriman', 'retur',
  'pembayaran', 'pesanan', 'produk', 'layanan', 'kontak', 'alamat', 'telepon', 'privasi',
  'ketentuan', 'kebijakan', 'panduan', 'hitung', 'hemat', 'tagihan', 'biaya', 'kedua', 'ketiga',
  'pemakaian', 'penghematan', 'dilengkapi', 'hanya', 'juga', 'sudah', 'belum', 'akan', 'harus',
  'wajib', 'jika', 'ketika', 'setelah', 'sebelum', 'melalui', 'terhadap', 'maupun', 'anda', 'kami',
  'kita', 'mereka', 'tambah', 'hapus', 'simpan', 'batal', 'cari', 'daftar', 'keranjang', 'belanja',
  'bandingkan', 'perbandingan', 'testimoni', 'artikel', 'proyek', 'halaman', 'beranda',
  'selanjutnya', 'sebelumnya', 'tampilkan', 'stok', 'kondisi', 'ongkir', 'sukses', 'gagal',
  'kosong', 'pilih', 'lainnya', 'bekas', 'diskon', 'unggulan', 'terbaru', 'populer', 'surya',
  'pompa', 'rangka', 'pemasangan', 'pengisian', 'pelepasan', 'masukan', 'keluaran', 'rentang',
  'jumlah', 'modul', 'tanggal', 'waktu', 'nomor', 'resi', 'kualitas', 'terjangkau', 'berkualitas',
  'mudah', 'cepat', 'murah', 'mahal', 'tahan', 'awet', 'silahkan', 'harap', 'mohon', 'terima',
  'kasih', 'selamat', 'kembali', 'lanjutkan', 'subtotal', 'pajak', 'ibu', 'bapak', 'kepsek',
  'pemilik', 'direktur', 'kepala',
  // Words that slipped past the first revision of this list (found by a stricter manual sweep).
  'spesifikasi', 'pelajari', 'selengkapnya', 'instalasi', 'hasil', 'butuh', 'membutuhkan', 'jasa',
  'dipasang', 'terpasang', 'berfungsi', 'menggunakan', 'tersedia', 'dibuat', 'diperoleh', 'menjadi',
  'terbaik', 'paling', 'relevan', 'laris', 'dilihat', 'lewati', 'konten', 'kirim', 'lengkapi',
  'ganti', 'ulangi', 'nyaman', 'aman', 'asli', 'segel', 'dus', 'pesan', 'dimana',
  'kapan', 'siapa', 'berapa', 'mengapa', 'bagaimana',
];

/** Route sweep — every public page in the audit's route inventory, plus detail pages that carry
 * the heaviest content (product spec tables, project case studies, article bodies). */
const ROUTES = [
  '/',
  '/produk',
  '/produk/ja-solar-module-610wp-n-type-topcon-monocrystalline',
  '/kategori/panel-surya',
  '/kategori/baterai',
  '/brand',
  '/brand/DEYE',
  '/proyek',
  '/proyek/residential-bandung-5-4-kwp',
  '/artikel',
  '/artikel/panduan-memilih-panel-surya',
  '/faq',
  '/promo',
  '/barang-clearance',
  '/testimoni',
  '/keranjang',
  '/checkout',
  '/perbandingan',
  '/wishlist',
  '/cari?q=panel',
  '/permintaan-penawaran',
  '/halaman/tentang-kami',
  '/halaman/kebijakan-pengiriman',
  '/halaman/kebijakan-retur',
  '/halaman/syarat-ketentuan',
  '/halaman/kebijakan-privasi',
  '/tidak-ada-halaman-ini-404',
];

/** Find Indonesian words present in a block of text. */
function indonesianWords(text: string): string[] {
  const lower = text.toLowerCase();
  return INDONESIAN.filter((w) => new RegExp(`\\b${w}\\b`).test(lower));
}

async function visibleText(page: Page): Promise<string> {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ');
}

test.describe('English-only site', () => {
  test('document language and locale metadata are English', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');
    expect(ogLocale, 'og:locale should be en_US').toBe('en_US');
  });

  test('no page titles or meta descriptions contain Indonesian', async ({ page }) => {
    // One test walks every route, and the dev server compiles pages on first hit, so this needs
    // more than the default per-test budget.
    test.setTimeout(300_000);
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const title = await page.title();
      // Read the tag directly: a `locator.getAttribute` on a page that has no description tag
      // would sit and wait for the full test timeout.
      const desc = await page.evaluate(
        () => document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      );
      expect(indonesianWords(title), `Indonesian in <title> of ${route}: "${title}"`).toEqual([]);
      expect(indonesianWords(desc), `Indonesian in meta description of ${route}`).toEqual([]);
    }
  });

  for (const route of ROUTES) {
    test(`no Indonesian text is rendered on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      const text = await visibleText(page);
      const found = indonesianWords(text);
      expect(found, `Indonesian words on ${route}: ${found.join(', ')}`).toEqual([]);
    });
  }
});
