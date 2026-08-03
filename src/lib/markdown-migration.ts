/**
 * Data migration: Markdown ↔ HTML
 *
 * Static pages previously stored Markdown. Tiptap saves HTML.
 * This utility converts between formats for backward compatibility.
 *
 * Long-term: HTML is the better format for Tiptap (preserves rich
 * formatting, image dimensions, table structure). Tiptap JSON is
 * even better but requires schema changes — defer to later.
 */

/** Convert legacy Markdown to HTML (for editor prefill) */
export function markdownToHtml(md: string): string {
  if (!md) return '';
  // Simple conversion: wrap paragraphs, convert headings
  return md
    .split('\n\n')
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
      if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith('# ')) return `<h1>${block.slice(2)}</h1>`;
      if (block.startsWith('- ')) return `<ul>${block.split('\n').map(l => `<li>${l.slice(2)}</li>`).join('')}</ul>`;
      if (block.startsWith('> ')) return `<blockquote>${block.slice(2)}</blockquote>`;
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
}
