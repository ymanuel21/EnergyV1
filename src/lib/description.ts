export type DescriptionBlock =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; items: string[] };

// A line is a bullet only when a '-' or '•' sits at the very start of the line
// followed by whitespace. This leaves mid-word hyphens (e.g. "SUN2000-5KTL")
// and hyphenated compounds untouched.
const BULLET_RE = /^[-•]\s+(.*)$/;

/**
 * Converts a plain-text product description into structured blocks:
 *  - blank lines separate paragraphs
 *  - consecutive lines starting with "- " or "• " become a bullet list
 *  - single newlines inside a paragraph are preserved as separate lines
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
  return blocks;
}
