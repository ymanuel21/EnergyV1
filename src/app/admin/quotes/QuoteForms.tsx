'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';

interface FollowUpFormProps {
  quoteId: string;
  handleAddNote: (formData: FormData) => Promise<void>;
}

export function FollowUpForm({ quoteId, handleAddNote }: FollowUpFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || loading) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set('id', quoteId);
      fd.set('note', note);
      await handleAddNote(fd);
      showToast('✓ Catatan berhasil ditambahkan', 'success');
      setNote('');
      router.refresh();
    } catch {
      showToast('✕ Gagal menambahkan catatan', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add follow-up note..."
        className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:border-primary outline-none bg-card"
      />
      <button
        type="submit"
        disabled={loading || !note.trim()}
        className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover disabled:opacity-50 inline-flex items-center gap-1.5"
      >
        {loading && (
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}

interface NotesFormProps {
  quoteId: string;
  defaultValue: string;
  handleUpdateNotes: (formData: FormData) => Promise<void>;
}

export function NotesForm({ quoteId, defaultValue, handleUpdateNotes }: NotesFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(defaultValue);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set('id', quoteId);
      fd.set('notes', notes);
      await handleUpdateNotes(fd);
      showToast('✓ Notes berhasil disimpan', 'success');
      router.refresh();
    } catch {
      showToast('✕ Gagal menyimpan notes', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none bg-card resize-y mb-2"
        placeholder="Internal notes about this lead..."
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface disabled:opacity-50 inline-flex items-center gap-1.5"
      >
        {loading && (
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Saving...' : 'Save Notes'}
      </button>
    </form>
  );
}
