'use client';

import { useTransition } from 'react';
import { useToast } from '@/app/admin/AdminToastProvider';

interface SettingsClientWrapperProps {
  handleSave: (data: FormData) => Promise<void>;
  children: React.ReactNode;
}

export function SettingsClientWrapper({ handleSave, children }: SettingsClientWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await handleSave(formData);
        showToast('✓ Pengaturan berhasil disimpan', 'success');
      } catch {
        showToast('✕ Gagal menyimpan pengaturan', 'error');
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      {children}
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={isPending} className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  );
}
