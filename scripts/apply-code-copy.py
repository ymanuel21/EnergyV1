#!/usr/bin/env python3
"""
Apply the English code-copy dictionary to customer-facing source files.

Why whole-value replacement
---------------------------
The first version of this script replaced *phrases*, longest first. That is unsafe: a short key
such as "Terbaru" also occurs inside "Terbarukan", so "Energi Terbarukan" became "Energi
Newestkan". It also produced half-translated sentences when a phrase key matched inside a longer
sentence that had no key of its own.

This version replaces only *complete* values, anchored by the delimiters that surround them in
source — `'…'`, `"…"`, `` `…` `` and JSX text `>…<`. A key therefore has to be the entire string
literal or the entire JSX text node to match, which makes partial-sentence corruption impossible.
Anything not covered by a key stays fully Indonesian rather than half-translated, and a residue
scan (see `--residue`) lists what is left.

Scope: everything under src/ EXCEPT admin tooling and dev scripts. Those are internal tools used
by Indonesian-speaking staff and are deliberately left in Indonesian.

Run:
  python3 scripts/apply-code-copy.py            # apply
  python3 scripts/apply-code-copy.py --check    # report only
  python3 scripts/apply-code-copy.py --residue  # list Indonesian left in customer-facing files
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, 'src')
DICT_PATH = os.path.join(REPO, 'docs', 'i18n', 'code-copy.en.json')

# Admin-facing files that happen to live outside src/app/admin. They are templates and copy shown
# to staff inside the CMS, never to customers, so they stay in Indonesian.
ALWAYS_EXCLUDE = (
    'src/lib/static-page-templates.ts',
    'src/lib/module-registry.ts',
    'src/lib/admin-search.ts',
)
EXCLUDE_PREFIXES = (
    'src/app/admin/',
    'src/app/api/admin/',
    'src/components/admin/',
    'src/scripts/',
)

# Indonesian function words used only to *report* residue, never to rewrite anything.
INDONESIAN = set("""
dan atau dengan untuk dari pada yang tidak sampai bisa dapat adalah ini itu serta per juta ribu
harga garansi tahun bulan hari listrik daya berat ukuran kapasitas suhu tingkat cocok sistem
kebutuhan jenis tipe baterai kabel operasi meter derajat persen kurang lebih atas bawah luar dalam
tanpa semua unit dimensi panjang lebar tinggi tebal bahan material warna standar masa kirim
pengiriman retur pembayaran pesanan produk layanan kontak alamat telepon privasi ketentuan kebijakan
panduan cara hitung hemat tagihan biaya kedua ketiga pemakaian penghematan dilengkapi hanya juga
sudah belum akan harus wajib bila jika ketika saat setelah sebelum melalui terhadap maupun anda kami
kita mereka saya tambah hapus simpan batal cari masuk daftar keranjang belanja bandingkan perbandingan
testimoni artikel proyek halaman beranda selanjutnya sebelumnya tampilkan lihat detail stok kondisi
ongkir pesan sukses gagal kosong pilih lainnya bekas diskon unggulan terbaru populer surya panel pompa
rangka mounting inverter perlindungan pemasangan pengisian pelepasan masukan keluaran nominal maksimum
minimum rentang jumlah modul pengguna akun ubah tanggal waktu nomor resi ekspedisi kualitas terjangkau
berkualitas aman mudah cepat lama besar kecil murah mahal tahan awet silahkan harap mohon terima kasih
selamat datang kembali lanjutkan subtotal pajak termasuk diatas dibawah penawaran kategori tentang
ganti lengkapi informasi perusahaan dikonfirmasi sales termurah dikirim bantuan hubungi memuat
menampilkan barang jadwal jaminan mitra logistik transaksi faktur catatan dibuat disimpan diubah
dihapus pembelian penawaran serupa sesuai dipilih
""".split())

# Indonesian words that are proper nouns, place names or retained industry terms — reported
# separately so a reviewer can confirm them instead of hunting false positives.
ALLOWED = set("""
plts pln ebtplaza bezvolt deye huawei longi sungrow ecoflow jinko growatt luna fusion iSolarCloud
jawa bali sumatera sumatra kalimantan sulawesi papua maluku yogyakarta jakarta bandung tangerang
surabaya garut kupang lembang cikarang manyar kapuk penjaringan masjid hidayah pemkab dinas pt
nusantara teknologi hidroponik ubud wamena smk negeri pratama modernland poris elektronik cahaya
seasonal design digital retail studio
""".split())


def is_public(path: str) -> bool:
    if not path.endswith(('.ts', '.tsx')):
        return False
    rel = os.path.relpath(path, REPO)
    if rel in ALWAYS_EXCLUDE:
        return False
    return not rel.startswith(EXCLUDE_PREFIXES)


def public_files() -> list[str]:
    out = []
    for dirpath, dirnames, filenames in os.walk(SRC):
        dirnames[:] = [d for d in dirnames if d != 'node_modules']
        for fn in filenames:
            p = os.path.join(dirpath, fn)
            if is_public(p):
                out.append(p)
    return out


def load_map() -> dict[str, str]:
    with open(DICT_PATH, encoding='utf-8') as fh:
        return json.load(fh)['map']


def apply_to_text(text: str, mapping: dict[str, str]) -> tuple[str, int]:
    """Replace complete anchored values, longest first.

    Two shapes are supported:

    * quoted values — ``'…'``, ``"…"`` and ``…`` — so a string literal must be the *entire*
      literal to match; and
    * JSX text — either ``>…<`` on one line, or a whole line whose stripped content is the key,
      which is how a JSX text node with a nested element is usually written (its text sits on
      its own line between the tags, with indentation).
    """
    hits = 0
    for key in sorted(mapping, key=len, reverse=True):
        val = mapping[key]
        for delim in ("'", '"', '`'):
            needle = f'{delim}{key}{delim}'
            if needle in text:
                hits += text.count(needle)
                text = text.replace(needle, f'{delim}{val}{delim}')
        needle = f'>{key}<'
        if needle in text:
            hits += text.count(needle)
            text = text.replace(needle, f'>{val}<')
    # Line-anchored JSX text nodes: keep indentation, swap the text. Re-split here so this pass
    # sees the edits the value pass above already made (it must not discard them).
    lines = text.split('\n')
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped in mapping:
            indent = line[: len(line) - len(line.lstrip())]
            lines[i] = f'{indent}{mapping[stripped]}'
            hits += 1
    return '\n'.join(lines), hits


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='report only, do not write')
    ap.add_argument('--residue', action='store_true', help='list remaining Indonesian, do not write')
    args = ap.parse_args()

    mapping = load_map()
    changed: list[tuple[str, int]] = []
    residue: list[tuple[str, int, str, list[str]]] = []

    for path in public_files():
        with open(path, encoding='utf-8') as fh:
            original = fh.read()

        if args.residue:
            for i, line in enumerate(original.split('\n'), 1):
                s = line.strip()
                if s.startswith(('import ', 'from ', '//', '/*', '*')) or not s:
                    continue
                toks = set(re.findall(r'[A-Za-zÀ-ÿ]+', line.lower()))
                hits = sorted((toks & INDONESIAN) - ALLOWED)
                if hits:
                    residue.append((os.path.relpath(path, REPO), i, s[:130], hits))
            continue

        updated, hits = apply_to_text(original, mapping)
        if hits and updated != original:
            changed.append((os.path.relpath(path, REPO), hits))
            if not args.check:
                with open(path, 'w', encoding='utf-8') as fh:
                    fh.write(updated)

    if args.residue:
        print(f"residue lines: {len(residue)}")
        for rel, i, line, hits in residue:
            print(f"{rel}:{i}\n   {line}\n   hits={hits}")
        return 0

    changed.sort(key=lambda x: -x[1])
    total = sum(h for _, h in changed)
    print(f"{'would change' if args.check else 'changed'} {len(changed)} files, {total} replacements")
    for rel, hits in changed:
        print(f"  {hits:4d}  {rel}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
