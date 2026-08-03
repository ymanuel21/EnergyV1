'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownPreview({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <label className="block text-xs font-medium text-primary mb-1">Content (Markdown)</label>
        <textarea name="content" value={content} onChange={e => setContent(e.target.value)}
          rows={20} className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono resize-y" />
      </div>
      <div>
        <label className="block text-xs font-medium text-primary mb-1">Preview</label>
        <div className="prose prose-sm max-w-none rounded-lg border border-border bg-card p-4 min-h-[200px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
