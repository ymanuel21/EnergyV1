export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  author: string;
  date: string;
  readTime: number;
}

export const articles: Article[] = [
  {
    slug: 'panduan-memilih-panel-surya',
    title: 'Panduan Memilih Panel Surya untuk Rumah',
    excerpt: 'Pelajari cara memilih panel surya yang tepat: monocrystalline vs polycrystalline, ukuran daya, garansi, dan kompatibilitas inverter.',
    content: `Memilih panel surya yang tepat adalah langkah pertama menuju kemandirian energi. Berikut panduan lengkapnya.

## 1. Tipe Panel Surya

### Monocrystalline
- Efisiensi tinggi (18-22%)
- Warna hitam seragam
- Performa baik di cuaca panas
- Harga lebih mahal
- Cocok untuk atap terbatas

### Polycrystalline
- Efisiensi sedang (15-17%)
- Warna kebiruan
- Harga lebih terjangkau
- Cocok untuk lahan luas

## 2. Ukuran Daya (Watt Peak)

Untuk rumah tangga, hitung kebutuhan:
- Rumah kecil (900 VA): 1.000-2.000 Wp
- Rumah menengah (1.300-2.200 VA): 2.000-4.000 Wp
- Rumah besar (>3.500 VA): 4.000-10.000 Wp

## 3. Garansi

Panel surya berkualitas memiliki:
- Garansi produk: 10-12 tahun
- Garansi performa: 25 tahun (minimal 80% output)

## 4. Kompatibilitas Inverter

Pastikan total daya panel tidak melebihi kapasitas inverter. Idealnya 80-120% dari rating inverter.`,
    category: 'Panduan',
    author: 'Tim Energi.Click',
    date: '2025-12-15',
    readTime: 5,
  },
  {
    slug: 'jenis-jenis-inverter',
    title: 'Jenis-Jenis Inverter: On-Grid, Off-Grid, dan Hybrid',
    excerpt: 'Memahami perbedaan inverter on-grid, off-grid, dan hybrid untuk sistem PLTS Anda.',
    content: `Inverter adalah otak dari sistem PLTS. Inilah perbedaan ketiga jenis utamanya.

## On-Grid (Grid-Tie)
- Terhubung ke jaringan PLN
- Kelebihan daya dijual ke PLN (net metering)
- Tidak bisa beroperasi saat listrik padam
- Paling ekonomis
- Cocok untuk: Rumah perkotaan dengan listrik stabil

## Off-Grid
- Tidak terhubung ke PLN
- Membutuhkan baterai
- Beroperasi mandiri 24/7
- Biaya lebih tinggi (baterai)
- Cocok untuk: Daerah terpencil, vila, pulau

## Hybrid
- Kombinasi on-grid + baterai
- Bisa export ke PLN dan simpan ke baterai
- Tetap beroperasi saat listrik padam
- Investasi tertinggi, fleksibilitas maksimal
- Cocok untuk: Rumah yang ingin backup power`,
    category: 'Panduan',
    author: 'Tim Energi.Click',
    date: '2025-11-20',
    readTime: 4,
  },
  {
    slug: 'cara-menghitung-tagihan-listrik-setelah-pasang-plts',
    title: 'Cara Menghitung Penghematan Tagihan Listrik Setelah Pasang PLTS',
    excerpt: 'Simulasi sederhana menghitung berapa banyak tagihan listrik yang bisa dihemat dengan panel surya.',
    content: `Banyak yang bertanya: "Berapa sih hematnya setelah pasang PLTS?" Mari kita hitung.

## Asumsi
- Daya listrik: 1.300 VA
- Pemakaian bulanan: 400 kWh
- Tarif listrik: Rp 1.444/kWh
- Sistem PLTS: 2.000 Wp (on-grid)
- Produksi harian rata-rata: 8 kWh
- Produksi bulanan: 240 kWh

## Perhitungan

**Sebelum PLTS:**
400 kWh × Rp 1.444 = Rp 577.600/bulan

**Setelah PLTS:**
- Konsumsi dari PLN: 400 - 240 = 160 kWh
- Tagihan PLN: 160 × Rp 1.444 = Rp 231.040
- **Penghematan: Rp 346.560/bulan**
- **Penghematan: Rp 4.158.720/tahun**

## ROI (Return on Investment)

Dengan biaya sistem ~Rp 20 juta:
- ROI = Rp 20.000.000 ÷ Rp 4.158.720 = ~4,8 tahun
- Setelah 5 tahun, listrik GRATIS untuk 20+ tahun berikutnya`,
    category: 'Edukasi',
    author: 'Tim Energi.Click',
    date: '2025-10-05',
    readTime: 6,
  },
  {
    slug: 'perawatan-panel-surya',
    title: '5 Tips Perawatan Panel Surya agar Awet 25+ Tahun',
    excerpt: 'Tips praktis merawat panel surya: pembersihan, inspeksi visual, monitoring performa, dan perlindungan.',
    content: `Panel surya dirancang untuk bertahan 25+ tahun. Dengan perawatan yang tepat, Anda bisa memaksimalkan investasi.

## 1. Pembersihan Berkala
- Bersihkan debu dan kotoran setiap 3-6 bulan
- Gunakan air bersih dan kain lembut
- JANGAN gunakan sabun atau bahan kimia
- Waktu terbaik: pagi hari saat panel masih dingin

## 2. Inspeksi Visual
- Periksa retak atau kerusakan fisik setiap 6 bulan
- Cek kabel dan konektor dari korosi
- Pastikan mounting masih kokoh

## 3. Monitoring Performa
- Gunakan aplikasi monitoring inverter
- Catat produksi harian
- Penurunan >10% dari normal = tanda masalah

## 4. Perlindungan dari Hama
- Pasang bird mesh untuk mencegah sarang burung
- Periksa kabel dari gigitan tikus

## 5. Servis Profesional
- Panggil teknisi setiap 5 tahun untuk inspeksi menyeluruh
- Termasuk pengecekan grounding dan sistem proteksi`,
    category: 'Tips',
    author: 'Tim Energi.Click',
    date: '2025-09-18',
    readTime: 4,
  },
];
