export const dynamic = "force-dynamic";

import { getFaqs, createFaq, updateFaq, deleteFaq, moveFaq } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';

export default async function FaqPage() {
  const faqs = await getFaqs();

  async function handleCreate(data: FormData) {
    'use server';
    await createFaq({ question: data.get('question'), answer: data.get('answer'), sortOrder: 0 });
    revalidatePath('/admin/faq');
    revalidatePath('/faq');
  }

  async function handleUpdate(id: number, data: FormData) {
    'use server';
    await updateFaq(id, { question: data.get('question'), answer: data.get('answer') });
    revalidatePath('/admin/faq');
    revalidatePath('/faq');
  }

  async function handleDelete(id: number) {
    'use server';
    await deleteFaq(id);
    revalidatePath('/admin/faq');
    revalidatePath('/faq');
  }

  async function handleMoveUp(id: number) {
    'use server';
    await moveFaq(id, 'up');
    revalidatePath('/admin/faq');
    revalidatePath('/faq');
  }

  async function handleMoveDown(id: number) {
    'use server';
    await moveFaq(id, 'down');
    revalidatePath('/admin/faq');
    revalidatePath('/faq');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">FAQ</h1>
      <form action={handleCreate} className="mt-4 space-y-3 rounded-xl border bg-card p-4">
        <input name="question" placeholder="Pertanyaan" required className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea name="answer" placeholder="Jawaban" required rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <SubmitButton label="Tambah FAQ" />
      </form>
      <div className="mt-4 space-y-3">
        {faqs.map((f: any, idx: number) => (
          <div key={f.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start gap-3">
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 pt-1 shrink-0">
                <form action={handleMoveUp.bind(null, f.id)}>
                  <button type="submit" disabled={idx === 0}
                    className="h-5 w-5 flex items-center justify-center rounded text-[10px] text-muted hover:bg-surface disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move up">▲</button>
                </form>
                <form action={handleMoveDown.bind(null, f.id)}>
                  <button type="submit" disabled={idx === faqs.length - 1}
                    className="h-5 w-5 flex items-center justify-center rounded text-[10px] text-muted hover:bg-surface disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move down">▼</button>
                </form>
              </div>

              {/* FAQ form */}
              <form action={handleUpdate.bind(null, f.id)} className="flex-1 space-y-3">
                <input name="question" defaultValue={f.question} className="w-full rounded-lg border px-3 py-2 text-sm font-medium" />
                <textarea name="answer" defaultValue={f.answer} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
                <div className="flex justify-end gap-2">
                  <SubmitButton label="Simpan" loadingLabel="Menyimpan..." className="rounded-lg bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50" />
                  <DeleteButton label="Hapus" itemName={f.question} onDelete={handleDelete.bind(null, f.id)} />
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
