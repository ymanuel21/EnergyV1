/**
 * Static Page Templates Registry.
 *
 * Add new templates here — editor loads them automatically.
 * Each template provides a structured Markdown starting point.
 */

export interface StaticPageTemplate {
  id: string;
  name: string;
  description: string;
  markdown: string;
}

export const TEMPLATES: StaticPageTemplate[] = [
  {
    id: 'tentang-kami',
    name: 'Tentang Kami',
    description: 'Company profile, vision, mission, and team information',
    markdown: `# Tentang Kami

EBTPlaza adalah [deskripsi singkat perusahaan Anda].

## Visi Kami

[Tulis visi perusahaan di sini]

## Misi Kami

- [Misi pertama]
- [Misi kedua]
- [Misi ketiga]

## Tim Kami

Kami adalah tim profesional yang berdedikasi untuk menyediakan solusi energi terbarukan terbaik.

## Lokasi

Alamat:
[Alamat lengkap perusahaan]

## Kontak

- Email: info@ebtplaza.com
- Telepon: (022) 20522279
- Website: https://ebtplaza.vercel.app
`,
  },
  {
    id: 'kebijakan-pengiriman',
    name: 'Kebijakan Pengiriman',
    description: 'Shipping policy with delivery timelines and costs',
    markdown: `# Kebijakan Pengiriman

## Wilayah Pengiriman

Kami mengirim ke seluruh Indonesia melalui mitra logistik terpercaya.

## Estimasi Waktu

| Wilayah | Estimasi |
|---------|----------|
| Jawa & Bali | 2–5 hari kerja |
| Sumatera, Kalimantan, Sulawesi | 5–10 hari kerja |
| Indonesia Timur | 7–14 hari kerja |

> **Catatan:** Untuk produk berukuran besar (panel surya, baterai), pengiriman menggunakan kargo dan mungkin memerlukan waktu lebih lama.

## Biaya Pengiriman

Biaya pengiriman dihitung berdasarkan:
- Berat dan dimensi produk
- Jarak dan lokasi tujuan
- Metode pengiriman yang dipilih

Biaya akan ditampilkan saat checkout sebelum pembayaran.

## Pelacakan

Nomor resi akan dikirim melalui email setelah pesanan diproses.
`,
  },
  {
    id: 'kebijakan-retur',
    name: 'Kebijakan Retur',
    description: 'Return policy with procedures and refund terms',
    markdown: `# Kebijakan Retur

## Syarat Retur

Retur dapat diajukan dalam **7 hari** setelah produk diterima dengan ketentuan:

- Produk dalam kondisi asli dan belum digunakan
- Kemasan lengkap dan tidak rusak
- Menyertakan bukti pembelian

## Prosedur Retur

1. Hubungi kami melalui email atau WhatsApp
2. Sertakan foto produk dan kemasan
3. Tim kami akan memberikan instruksi pengembalian
4. Kirim produk ke alamat yang ditentukan

## Pengembalian Dana

- Dana dikembalikan dalam 7–14 hari kerja setelah produk diterima
- Biaya pengiriman retur ditanggung pembeli (kecuali kesalahan kami)
- Produk clearance tidak dapat diretur
`,
  },
  {
    id: 'syarat-ketentuan',
    name: 'Syarat & Ketentuan',
    description: 'Terms and conditions for using the service',
    markdown: `# Syarat & Ketentuan

Dengan menggunakan layanan EBTPlaza, Anda menyetujui syarat dan ketentuan berikut.

## 1. Umum

- Harga dapat berubah sewaktu-waktu tanpa pemberitahuan
- Stok produk tidak dapat dijamin ketersediaannya
- Kami berhak menolak pesanan karena alasan tertentu

## 2. Pemesanan

- Pesanan diproses setelah pembayaran dikonfirmasi
- Kesalahan harga akan dikonfirmasi ulang sebelum pengiriman

## 3. Pembayaran

- Pembayaran melalui transfer bank, Virtual Account, atau QRIS
- Pesanan dibatalkan jika pembayaran tidak diterima dalam 24 jam

## 4. Garansi

- Garansi produk sesuai dengan ketentuan masing-masing brand
- Kerusakan akibat kesalahan penggunaan tidak ditanggung garansi

## 5. Privasi

- Data pribadi pelanggan dilindungi sesuai Kebijakan Privasi
- Informasi tidak dibagikan kepada pihak ketiga tanpa izin
`,
  },
  {
    id: 'kebijakan-privasi',
    name: 'Kebijakan Privasi',
    description: 'Privacy policy with data collection and usage',
    markdown: `# Kebijakan Privasi

**Terakhir diperbarui:** [tanggal]

## Data yang Kami Kumpulkan

- Nama, email, dan nomor telepon (saat checkout atau RFQ)
- Alamat pengiriman
- Riwayat pesanan

## Penggunaan Data

Data Anda digunakan untuk:
- Memproses pesanan dan pengiriman
- Komunikasi terkait pesanan
- Pengiriman newsletter (jika berlangganan)

## Perlindungan Data

- Data disimpan dengan enkripsi
- Tidak dibagikan ke pihak ketiga tanpa izin
- Anda dapat meminta penghapusan data kapan saja

## Kontak

Untuk pertanyaan tentang privasi: info@ebtplaza.com
`,
  },
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Start with an empty page',
    markdown: `# [Judul Halaman]

[Tulis konten di sini.]

## [Sub-judul]

- [Poin pertama]
- [Poin kedua]
`,
  },
];
