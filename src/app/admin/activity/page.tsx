export const dynamic = 'force-dynamic';

import { getActivityLog } from '@/lib/admin-core';

export default async function ActivityPage() {
  const logs = await getActivityLog(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Activity Log</h1>
      <p className="text-sm text-muted mb-6">{logs.length} recent actions</p>
      <div className="space-y-1">
        {logs.length === 0 && <p className="text-sm text-muted">No activity yet.</p>}
        {logs.map((l: any) => (
          <div key={l.id} className="flex items-center gap-3 rounded border border-border bg-card px-4 py-2">
            <span className="text-xs text-muted w-20">{new Date(l.createdAt).toLocaleString('id-ID')}</span>
            <span className="text-xs font-medium text-primary w-16">{l.action}</span>
            <span className="text-xs text-muted flex-1">{l.entity} {l.entityName ? `"${l.entityName}"` : ''}</span>
            {l.userName && <span className="text-xs text-muted/60">{l.userName}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
