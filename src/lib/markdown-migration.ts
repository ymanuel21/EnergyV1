/**
 * Data migration: Markdown → HTML
 *
 * Converts legacy Markdown content to clean semantic HTML.
 * Strips all Markdown syntax prefixes (##, -, >, ---, **, etc.)
 */

export function markdownToHtml(md: string): string {
  if (!md) return '';
  if (md.trim().startsWith('<') && !md.includes('## ') && !md.includes('<p>- ')) {
    // Already HTML without Markdown artifacts
    return md;
  }

  const lines = md.split('\n');
  const result: string[] = [];
  let inList: boolean = false;
  let inBlockquote: boolean = false;

  function closeList() {
    if (inList) { result.push('</ul>'); inList = false; }
  }
  function closeBlockquote() {
    if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false; }
  }

  for (const raw of lines) {
    let line = raw.trim();
    if (!line) { closeList(); closeBlockquote(); result.push('<br/>'); continue; }

    // Headings — strip ## markers
    if (/^#{1,4}\s/.test(line)) {
      closeList(); closeBlockquote();
      const level = line.match(/^(#{1,4})/)?.[1].length || 1;
      const text = line.replace(/^#{1,4}\s*/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      result.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Unordered list — strip - markers, convert to <li>
    if (/^[-*]\s/.test(line)) {
      closeBlockquote();
      if (!inList) { result.push('<ul>'); inList = true; }
      const text = line.replace(/^[-*]\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      result.push(`<li>${text}</li>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      closeBlockquote();
      if (!inList) { result.push('<ol>'); inList = true; }
      const text = line.replace(/^\d+\.\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      result.push(`<li>${text}</li>`);
      continue;
    }

    // Blockquote — strip >
    if (/^>\s/.test(line)) {
      closeList();
      if (!inBlockquote) { result.push('<blockquote>'); inBlockquote = true; }
      const text = line.replace(/^>\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      result.push(`<p>${text}</p>`);
      continue;
    }

    // Horizontal rule
    if (/^---\s*$/.test(line)) {
      closeList(); closeBlockquote();
      result.push('<hr>');
      continue;
    }

    // Paragraph
    closeList(); closeBlockquote();
    const text = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    result.push(`<p>${text}</p>`);
  }

  closeList();
  closeBlockquote();
  return result.join('\n');
}
