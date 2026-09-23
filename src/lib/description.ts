export type DescriptionBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; items: string[] };

// A line is a bullet only when a '-', '•' or '*' sits at the very start of the line
// followed by whitespace. This leaves mid-word hyphens (e.g. "SUN2000-5KTL"),
// hyphenated compounds and markdown-ish "**bold**" untouched.
const BULLET_RE = /^[-•*]\s+(.*)$/;

// A short line is only treated as a SECTION TITLE when it is immediately followed by a
// bullet group AND does not look like content. Guards (all needed against the real data):
//  - too long to be a title (real titles are <= 60 chars)
//  - ends with sentence punctuation ("Spesifikasi teknis:" is a lead-in, not a title)
//  - looks like "Key: value" (e.g. "Garansi Resmi: 5 tahun garansi produk" is content)
const HEADING_MAX_LEN = 60;
const TERMINAL_PUNCT_RE = /[.:;,!?]$/;
const KEY_VALUE_RE = /^[^:]{1,40}:\s+\S/;

/** True when a standalone line may be promoted to a section heading. */
export function isHeadingCandidate(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > HEADING_MAX_LEN) return false;
  if (BULLET_RE.test(t)) return false;
  if (TERMINAL_PUNCT_RE.test(t)) return false;
  if (KEY_VALUE_RE.test(t)) return false;
  return true;
}

/**
 * Converts a plain-text product description into structured blocks:
 *  - blank lines separate paragraphs
 *  - consecutive lines starting with "- ", "• " or "* " become a bullet list
 *  - single newlines inside a paragraph are preserved as separate lines
 *  - a one-line paragraph immediately followed by a bullet list, that reads like a title,
 *    becomes a heading block (section title)
 */
export function parseDescription(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  const lines = text.split(/\r?\n/);
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'paragraph', lines: para });
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'list', items: list });
      list = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const bullet = line.match(BULLET_RE);
    if (bullet) {
      flushPara();
      list.push(bullet[1]);
    } else if (line === '') {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  // Promote eligible one-line paragraphs that introduce a bullet list into headings.
  for (let i = 0; i < blocks.length - 1; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];
    if (block.type === 'paragraph' && block.lines.length === 1 && next.type === 'list'
      && isHeadingCandidate(block.lines[0])) {
      blocks[i] = { type: 'heading', text: block.lines[0] };
    }
  }

  return blocks;
}
