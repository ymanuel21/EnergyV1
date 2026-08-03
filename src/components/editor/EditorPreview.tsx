'use client';

interface EditorPreviewProps {
  html: string;
  title?: string;
}

export function EditorPreview({ html, title }: EditorPreviewProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-surface/50">
        <span className="text-xs font-medium text-muted">Preview</span>
      </div>
      <div className="p-6">
        <article className="mx-auto max-w-3xl">
          {title && <h1 className="text-2xl font-bold text-primary sm:text-3xl mb-6">{title}</h1>}
          <div
            className="prose prose-sm sm:prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </div>
  );
}
