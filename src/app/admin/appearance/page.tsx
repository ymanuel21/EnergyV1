export const dynamic = 'force-dynamic';

import { getAppearanceSettings, saveAppearance, resetAppearance } from './actions';
import { revalidatePath } from 'next/cache';
import { AppearanceForm } from './AppearanceForm';

export default async function AppearancePage() {
  const settings = await getAppearanceSettings();

  async function handleSave(data: FormData) {
    'use server';
    await saveAppearance(data);
    revalidatePath('/admin/appearance');
    revalidatePath('/');
  }

  async function handleReset() {
    'use server';
    await resetAppearance();
    revalidatePath('/admin/appearance');
    revalidatePath('/');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
          <p className="text-sm text-gray-500 mt-1">Customize the site&apos;s visual identity. Changes apply globally.</p>
        </div>
        <form action={handleReset} className="inline">
          <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Reset to Defaults
          </button>
        </form>
      </div>

      <AppearanceForm settings={settings} onSave={handleSave} />
    </div>
  );
}
