export const dynamic = 'force-dynamic';

import { getNavigationLinks, upsertNavLink, deleteNavLink } from './actions';
import { revalidatePath } from 'next/cache';

const GROUPS = [
  { key: 'footer_belanja', label: 'Footer — Belanja' },
  { key: 'footer_layanan', label: 'Footer — Layanan' },
  { key: 'footer_legal', label: 'Footer — Legal' },
  { key: 'mobile', label: 'Mobile Menu' },
];

export default async function NavigationPage() {
  const links = await getNavigationLinks();

  async function handleUpsert(data: FormData) {
    'use server';
    const id = data.get('id') as string;
    await upsertNavLink({
      id: (id && id !== 'undefined') ? id : undefined,
      group: data.get('group') as string,
      label: data.get('label') as string,
      href: data.get('href') as string,
      sortOrder: parseInt(data.get('sortOrder') as string) || 0,
      enabled: data.get('enabled') === 'true',
    });
    revalidatePath('/admin/navigation');
    revalidatePath('/');
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await deleteNavLink(id);
      revalidatePath('/admin/navigation');
      revalidatePath('/');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Navigation Manager</h1>
      <p className="text-sm text-muted mb-6">{links.length} links across {GROUPS.length} groups</p>

      {GROUPS.map(g => {
        const groupLinks = links.filter((l: any) => l.group === g.key);
        return (
          <div key={g.key} className="mb-8">
            <h2 className="text-sm font-semibold text-primary mb-2">{g.label}</h2>
            <div className="space-y-1">
              {groupLinks.map((l: any) => (
                <div key={l.id} className="flex items-center gap-2 rounded border border-border bg-card px-3 py-2">
                  <span className="text-xs text-muted w-8">{l.sortOrder}</span>
                  <span className="text-sm font-medium text-primary flex-1">{l.label}</span>
                  <span className="text-xs text-muted">{l.href}</span>
                  {!l.enabled && <span className="text-[10px] text-red-500">OFF</span>}
                  <form action={handleDelete} className="inline">
                    <input type="hidden" name="id" value={l.id} />
                    <button type="submit" className="text-xs text-red-500 hover:underline">✕</button>
                  </form>
                </div>
              ))}
            </div>
            <form action={handleUpsert} className="mt-2 flex gap-2">
              <input type="hidden" name="group" value={g.key} />
              <input type="hidden" name="sortOrder" value={groupLinks.length} />
              <input type="hidden" name="enabled" value="true" />
              <input name="label" placeholder="Label" required className="flex-1 rounded border border-border px-2 py-1 text-sm" />
              <input name="href" placeholder="/path" required className="flex-1 rounded border border-border px-2 py-1 text-sm" />
              <button type="submit" className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-primary-hover">Add</button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
