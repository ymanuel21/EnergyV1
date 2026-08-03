'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownToolbar } from './MarkdownToolbar';
import { TEMPLATES } from '@/lib/static-page-templates';

export function MarkdownPreview({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [template, setTemplate] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertAtCursor(md: string) {
    const ta = textareaRef.current;
    if (!ta) { setContent(content + md); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setContent(content.substring(0, start) + md + content.substring(end));
    // Restore cursor position after React re-render
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + md.length, start + md.length);
    }, 0);
  }

  function loadTemplate() {
    if (!template) return;
    const tpl = TEMPLATES.find((t) => t.id === template);
    if (!tpl) return;
    if (content.trim() && content !== initialContent) {
      if (!confirm('Konten yang ada akan diganti. Lanjutkan?')) return;
    }
    setContent(tpl.markdown);
  }

  return (
    <div>
      {/* Template Selector */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <select value={template} onChange={(e) => setTemplate(e.target.value)}
          className="rounded border border-border px-2 py-1 text-xs text-muted bg-card">
          <option value="">-- Select Template --</option>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button type="button" onClick={loadTemplate}
          disabled={!template}
          className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-30 transition">
          Load Template
        </button>
        <span className="text-xs text-muted ml-2">Select a template to get started</span>
      </div>

      {/* Toolbar */}
      <MarkdownToolbar onInsert={insertAtCursor} />

      {/* Editor + Preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-primary mb-1">Content (Markdown)</label>
          <textarea ref={textareaRef} name="content" value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20} className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono resize-y" />
        </div>
        <div>
          <label className="block text-xs font-medium text-primary mb-1">Preview</label>
          <div className="prose prose-sm max-w-none rounded-lg border border-border bg-card p-4 min-h-[200px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*No content yet*'}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
