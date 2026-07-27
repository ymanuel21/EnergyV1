export const dynamic = "force-dynamic";

import { getFaqs, createFaq, updateFaq, deleteFaq } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';

export default async function FaqPage() {
  const faqs = await getFaqs();

  async function handleCreate(data: FormData) {
    'use server';
    await createFaq({ question: data.get('question'), answer: data.get('answer'), sortOrder: 0 });
    revalidatePath('/admin/faq');
  }

  async function handleUpdate(id: number, data: FormData) {
    'use server';
    await updateFaq(id, { question: data.get('question'), answer: data.get('answer') });
    revalidatePath('/admin/faq');
  }

  async function handleDelete(id: number) {
    'use server';
    await deleteFaq(id);
    revalidatePath('/admin/faq');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
      <form action={handleCreate} className="mt-4 space-y-3 rounded-xl border bg-white p-4">
        <input name="question" placeholder="Pertanyaan" required className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea name="answer" placeholder="Jawaban" required rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <SubmitButton label="Tambah FAQ" />
      </form>
      <div className="mt-4 space-y-3">
        {faqs.map((f: any) => (
          <div key={f.id} className="rounded-xl border bg-white p-4">
            <form action={handleUpdate.bind(null, f.id)} className="space-y-3">
              <input name="question" defaultValue={f.question} className="w-full rounded-lg border px-3 py-2 text-sm font-medium" />
              <textarea name="answer" defaultValue={f.answer} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <div className="flex justify-end gap-2">
                <SubmitButton label="Simpan" loadingLabel="Menyimpan..." className="rounded-lg bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50" />
                <DeleteButton label="Hapus" itemName={f.question} onDelete={handleDelete.bind(null, f.id)} />
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
