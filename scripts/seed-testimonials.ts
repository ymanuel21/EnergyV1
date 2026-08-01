import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 });

const testimonials = [
  { name: 'Ibu Ratna', company: 'Rumah Tinggal', role: 'Ibu Rumah Tangga', quote: 'Awalnya ragu pasang PLTS. Tapi setelah 3 bulan, tagihan listrik turun dari Rp 2 juta ke Rp 400 ribu. Pemasangan rapi, teknisi profesional. Sekarang tetangga pada tanya.', rating: 5, featured: true, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
  { name: 'Bapak Hendra', company: 'Restoran Keluarga', role: 'Pemilik', quote: 'Restoran kami pakai listrik besar — kulkas, freezer, AC. Setelah pasang PLTS 10 kWp, biaya operasional turun 60%. ROI dalam 4 tahun. Pelayanan tim EBTPlaza luar biasa.', rating: 5, featured: true, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  { name: 'Pak Dodi', company: 'PT Manufaktur Presisi', role: 'Factory Manager', quote: 'Instalasi PLTS 50 kWp untuk pabrik kami selesai tepat waktu. Sudah setahun berjalan, performance stabil. Maintenance mudah. Carbon footprint turun 30 ton per tahun. Highly recommended.', rating: 5, featured: true, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face' },
  { name: 'I Wayan Sudarma', company: 'Villa Rumah Bali', role: 'Owner', quote: 'Hotel kami di Ubud pakai PLTS hybrid 20 kWp + baterai. Tamu appreciate green energy concept. Tagihan listrik turun drastis. Anak muda suka konsep eco-friendly.', rating: 5, featured: true, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
  { name: 'Kepsek Supriyadi', company: 'SMK Negeri 3', role: 'Kepala Sekolah', quote: 'PLTS di sekolah sangat membantu. Siswa belajar tentang energi terbarukan langsung dari sistem yang beroperasi. Biaya listrik sekolah turun hampir 50%. Terima kasih EBTPlaza.', rating: 4, featured: false, photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face' },
  { name: 'Dr. Anita', company: 'RS Pratama Wamena', role: 'Direktur', quote: 'PLTS off-grid 5 kWp menyelamatkan operasional klinik kami di daerah terpencil. Sebelumnya sering mati listrik, vaksin rusak. Sekarang 24 jam nyala. Terobosan luar biasa.', rating: 5, featured: false, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face' },
  { name: 'Haji Rahman', company: 'Perkebunan Sawit', role: 'Manajer Operasional', quote: 'PLTS hybrid 30 kWp di kebun kami mengurangi pemakaian genset diesel 70%. Penghematan BBM luar biasa. Lingkungan lebih bersih dan biaya operasional turun signifikan.', rating: 5, featured: false, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face' },
  { name: 'Ibu Sari', company: 'Cold Storage Surabaya', role: 'Owner', quote: 'Cold storage butuh listrik stabil 24/7. Setelah pasang PLTS + baterai, kami nggak pernah khawatir mati listrik lagi. Produk tetap segar, pelanggan puas.', rating: 4, featured: false, photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face' },
  { name: 'Bapak Ridwan', company: 'Gudang Logistik', role: 'Manager', quote: 'Gudang kami di Tangerang sekarang pakai PLTS atap 15 kWp. Tagihan turun 55%. Panel LONGi yang dipasang sangat efisien. Tim instalasi disiplin, tepat waktu.', rating: 5, featured: false, photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face' },
  { name: 'Ibu Dewi', company: 'Toko Retail Modern', role: 'Owner', quote: 'Setelah pasang PLTS 3 kWp di toko kami, penghematan langsung terasa bulan pertama. Pelanggan juga lebih suka belanja di toko yang peduli lingkungan. Win-win!', rating: 5, featured: false, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face' },
  { name: 'Pak Bambang', company: 'Bengkel Motor', role: 'Pemilik', quote: 'Simpel, nggak ribet. Dari awal konsultasi sampai selesai instalasi, semua berjalan lancar. Sekarang bengkel saya full tenaga surya. Biaya listrik cuma Rp 50 ribu/bulan.', rating: 4, featured: false, photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face' },
  { name: 'Ibu Lina', company: 'Klinik Kecantikan', role: 'Owner', quote: 'Sebagai klinik, kami butuh alat yang nyala terus. PLTS + baterai BEZVOLT solusinya. Listrik stabil, tagihan hemat. Banyak klinik lain tanya-tanya setelah lihat hasil kami.', rating: 5, featured: false, photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&h=200&fit=crop&crop=face' },
  { name: 'Pak Agus', company: 'Dinas PU Makassar', role: 'Kepala Bidang', quote: 'PJU tenaga surya untuk 50 titik di jalan protokol berfungsi sangat baik. Hemat biaya, tanpa kabel tambahan. Warga senang, kota lebih terang tanpa biaya besar.', rating: 5, featured: false, photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44617d1a?w=200&h=200&fit=crop&crop=face' },
  { name: 'Ibu Fitri', company: 'Café Organik', role: 'Founder', quote: 'Sebagai bisnis yang peduli lingkungan, PLTS rooftop adalah langkah natural. Sekarang 80% kebutuhan listrik café dari matahari. Menu kami sekarang lebih "hijau" dari sebelumnya!', rating: 5, featured: false, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face' },
  { name: 'Pak Yanto', company: 'Petani Hidroponik', role: 'Owner', quote: 'Pompa air tenaga surya mengubah cara kami bertani. Dulu andalkan genset mahal, sekarang gratis dari matahari. Hasil panen meningkat, biaya nol untuk listrik. Petani lain mulai ikut.', rating: 5, featured: false, photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face' },
];

(async () => {
  const client = await pool.connect();
  try {
    for (const t of testimonials) {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await client.query(
        `INSERT INTO testimonials (id, name, company, role, quote, rating, photo, featured, status, "sortOrder", "draftData", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'published',0,'{}',NOW())`,
        [id, t.name, t.company, t.role, t.quote, t.rating, t.photo, t.featured]
      );
    }
    const { rows } = await client.query(`SELECT count(*) FROM testimonials`);
    console.log(`Seeded ${rows[0].count} testimonials`);
  } finally {
    client.release();
    await pool.end();
  }
})();
