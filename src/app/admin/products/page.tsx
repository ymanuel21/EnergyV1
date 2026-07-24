export const dynamic = "force-dynamic";

import Link from 'next/link';
import { getProducts, getBrandsForSelect, getCategoriesForSelect } from './actions';

export default async function ProductsPage() {
  const [products, brands, categories] = await Promise.all([
    getProducts(),
    getBrandsForSelect(),
    getCategoriesForSelect(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + Tambah Produk
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{(p as any).brand?.name ?? '-'}</td>
                <td className="px-4 py-3 text-gray-700">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-gray-500">{p.stock}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="text-brand-600 hover:underline text-xs">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
