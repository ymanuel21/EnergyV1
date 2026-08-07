import Link from 'next/link';

interface ParsedMessage {
  customerType: string | null;
  company: string | null;
  position: string | null;
  projectName: string | null;
  location: string | null;
  targetDate: string | null;
  needsInstallation: boolean;
  notes: string | null;
  items: Array<{ name: string; quantity: number; notes?: string }>;
  /** True if the parser successfully extracted structured data */
  parsed: boolean;
}

function parseMessage(message: string): ParsedMessage {
  const empty = (): ParsedMessage => ({
    customerType: null, company: null, position: null,
    projectName: null, location: null, targetDate: null,
    needsInstallation: false, notes: null, items: [], parsed: false,
  });

  if (!message?.trim()) return empty();

  const lines = message.split('\n');
  const result: ParsedMessage = {
    customerType: null,
    company: null,
    position: null,
    projectName: null,
    location: null,
    targetDate: null,
    needsInstallation: false,
    notes: null,
    items: [],
    parsed: false,
  };

  let inItems = false;
  let foundHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('---')) {
      inItems = true;
      continue;
    }

    if (inItems) {
      const match = trimmed.match(/^\d+\.\s+(.+?)\s+[—–-]\s+Qty:\s*(\d+)(?:\s*\((.+)\))?$/);
      if (match) {
        result.items.push({
          name: match[1].trim(),
          quantity: parseInt(match[2]) || 1,
          notes: match[3]?.trim(),
        });
        result.parsed = true;
      }
      continue;
    }

    if (trimmed.startsWith('Jenis Customer:')) {
      const val = trimmed.replace('Jenis Customer:', '').trim();
      result.customerType = (val.includes('Business') || val.includes('Corporate')) ? 'BUSINESS' : 'RESIDENTIAL';
      foundHeader = true;
    } else if (trimmed.startsWith('Perusahaan:')) {
      result.company = trimmed.replace('Perusahaan:', '').trim() || null;
      foundHeader = true;
    } else if (trimmed.startsWith('Jabatan:')) {
      result.position = trimmed.replace('Jabatan:', '').trim() || null;
      foundHeader = true;
    } else if (trimmed.startsWith('Nama Proyek:')) {
      result.projectName = trimmed.replace('Nama Proyek:', '').trim() || null;
      foundHeader = true;
    } else if (trimmed.startsWith('Lokasi:')) {
      result.location = trimmed.replace('Lokasi:', '').trim() || null;
      foundHeader = true;
    } else if (trimmed.startsWith('Target:')) {
      result.targetDate = trimmed.replace('Target:', '').trim() || null;
      foundHeader = true;
    } else if (trimmed.startsWith('Butuh jasa instalasi:')) {
      result.needsInstallation = trimmed.toLowerCase().includes('ya');
      foundHeader = true;
    } else if (trimmed.startsWith('Catatan:')) {
      result.notes = trimmed.replace('Catatan:', '').trim() || null;
      foundHeader = true;
    }
  }

  result.parsed = foundHeader || result.items.length > 0;
  return result;
}

interface RequestMessageProps {
  message: string;
}

export function RequestMessage({ message }: RequestMessageProps) {
  if (!message) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-primary mb-3">Request Details</h2>
        <p className="text-sm text-muted">No detailed request information provided.</p>
      </div>
    );
  }

  // Wrap parsing in try/catch — never crash
  let parsed: ParsedMessage;
  try {
    parsed = parseMessage(message);
  } catch {
    // Fallback: render raw message if parsing throws
    return (
      <div>
        <h2 className="text-sm font-semibold text-primary mb-3">Request Details</h2>
        <p className="text-sm text-muted whitespace-pre-wrap">{message}</p>
      </div>
    );
  }

  // Fallback: if no structured data was extracted, show raw message
  if (!parsed.parsed) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-primary mb-3">Request Details</h2>
        <p className="text-sm text-muted whitespace-pre-wrap">{message}</p>
      </div>
    );
  }

  const totalQty = parsed.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-primary">Request Details</h2>

      {/* Customer Type */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">Customer Type</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            parsed.customerType === 'BUSINESS'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            {parsed.customerType === 'BUSINESS' ? '🏢 Business' : '🏠 Residential'}
          </span>
        </div>

        {(parsed.projectName || parsed.location || parsed.targetDate || parsed.company || parsed.position) && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm border-t border-border pt-3">
            {parsed.company && <div><span className="text-xs text-muted">Company</span><p className="font-medium text-primary">{parsed.company}</p></div>}
            {parsed.position && <div><span className="text-xs text-muted">Position</span><p className="font-medium text-primary">{parsed.position}</p></div>}
            {parsed.projectName && <div><span className="text-xs text-muted">Project Name</span><p className="font-medium text-primary">{parsed.projectName}</p></div>}
            {parsed.location && <div><span className="text-xs text-muted">Location</span><p className="font-medium text-primary">{parsed.location}</p></div>}
            {parsed.targetDate && <div><span className="text-xs text-muted">Target Date</span><p className="font-medium text-primary">{parsed.targetDate}</p></div>}
            {parsed.needsInstallation && <div><span className="text-xs text-muted">Installation</span><p className="font-medium text-green-600">Required</p></div>}
          </div>
        )}
      </div>

      {parsed.items.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface/30">
            <h3 className="text-xs font-semibold text-primary">
              Requested Products ({parsed.items.length} item{parsed.items.length > 1 ? 's' : ''})
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/20">
                <th className="p-3 text-left text-xs font-medium text-muted w-10">#</th>
                <th className="p-3 text-left text-xs font-medium text-muted">Product</th>
                <th className="p-3 text-center text-xs font-medium text-muted w-20">Qty</th>
                <th className="p-3 text-left text-xs font-medium text-muted hidden sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {parsed.items.map((item, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0">
                  <td className="p-3 text-xs text-muted">{i + 1}</td>
                  <td className="p-3">
                    <Link href={`/admin/products?search=${encodeURIComponent(item.name)}`} className="text-primary hover:underline text-sm font-medium">
                      {item.name}
                    </Link>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-primary">{item.quantity}</span>
                  </td>
                  <td className="p-3 text-xs text-muted hidden sm:table-cell">{item.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-border bg-surface/10 text-xs text-muted">
            Total: {parsed.items.length} product{parsed.items.length > 1 ? 's' : ''} · {totalQty} unit{totalQty > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {parsed.notes && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted mb-2">Customer Notes</h3>
          <p className="text-sm text-primary whitespace-pre-wrap">{parsed.notes}</p>
        </div>
      )}
    </div>
  );
}
