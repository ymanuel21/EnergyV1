'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AdminToastProvider } from './AdminToastProvider';
import { SessionManager } from '@/components/admin/SessionManager';
import { SessionProvider } from 'next-auth/react';
import { moduleRegistry, MODULE_GROUPS } from '@/lib/module-registry';
import { NotificationBadge } from '@/components/admin/NotificationBadge';

const sidebarModules = Object.values(moduleRegistry).filter(m => m.id !== 'dashboard');

// Group modules
const grouped: Record<string, typeof sidebarModules> = {};
for (const m of sidebarModules) {
  if (!grouped[m.group]) grouped[m.group] = [];
  grouped[m.group].push(m);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';
  if (isLogin) return <SessionProvider>{children}</SessionProvider>;

  return (
    <SessionProvider>
    <AdminToastProvider>
      <SessionManager />
      <div className="flex min-h-screen bg-surface">
        <aside className="w-56 shrink-0 border-r border-border bg-card p-4 flex flex-col">
          <Link href="/admin" className="mb-6 block text-lg font-bold text-primary">
            EBTPlaza Admin
          </Link>
          <nav className="flex-1 space-y-6 overflow-y-auto">
            {/* Dashboard */}
            <div>
              <Link
                href="/admin"
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${pathname === '/admin' ? 'bg-surface text-primary font-medium' : 'text-muted hover:bg-surface hover:text-primary'}`}
              >
                <span className="mr-2">{moduleRegistry.dashboard.icon}</span>
                {moduleRegistry.dashboard.label}
              </Link>
            </div>

            {/* Grouped modules */}
            {Object.entries(MODULE_GROUPS).filter(([k]) => grouped[k]).map(([groupKey, groupLabel]) => (
              <div key={groupKey}>
                <h3 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted/60">{groupLabel}</h3>
                <div className="space-y-0.5">
                  {(grouped[groupKey] || []).map((m) => (
                    <Link
                      key={m.route}
                      href={m.route}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${pathname.startsWith(m.route) ? 'bg-surface text-primary font-medium' : 'text-muted hover:bg-surface hover:text-primary'}`}
                    >
                      <span className="mr-2">{m.icon}</span>
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="pt-6 border-t border-border">
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/admin/login' })}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-surface"
            >
              Logout
            </button>
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
            <div className="text-sm font-medium text-muted">EBTPlaza Admin</div>
            <div className="flex items-center gap-3">
              <NotificationBadge />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminToastProvider>
    </SessionProvider>
  );
}
