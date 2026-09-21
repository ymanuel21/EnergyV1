import { Fragment } from 'react';
import { parseDescription } from '@lib/description';

interface ProductDescriptionProps {
  text?: string | null;
}

/**
 * Renders a plain-text product description into structured React elements:
 *  - blank lines separate paragraphs
 *  - consecutive lines starting with "- " or "• " become a bullet list
 *  - single newlines inside a paragraph are preserved as <br />
 * No HTML is ever injected (safe by construction).
 */
export function ProductDescription({ text }: ProductDescriptionProps) {
  if (!text || !text.trim()) return null;

  const blocks = parseDescription(text);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'list') {
          return (
            <ul key={i} className="mb-3 list-disc space-y-1 pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mb-3">
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
