import { Fragment } from 'react';
import { parseDescription, type DescriptionBlock } from '@lib/description';

interface ProductDescriptionProps {
  text?: string | null;
  /**
   * 'page' (default) = the product detail page styling: flat blocks, no section headings
   *   (byte-identical to the original renderer).
   * 'card' = compact card/preview styling: sections with <h4> titles, tighter list spacing.
   */
  variant?: 'page' | 'card';
}

/**
 * Renders a plain-text product description into structured React elements:
 *  - blank lines separate paragraphs (and sections)
 *  - consecutive lines starting with "- ", "• " or "* " become a bullet list
 *  - single newlines inside a paragraph are preserved as <br />
 *  - a title line introducing a bullet list becomes a section heading
 * No HTML is ever injected (safe by construction — no dangerouslySetInnerHTML).
 */
export function ProductDescription({ text, variant = 'page' }: ProductDescriptionProps) {
  if (!text || !text.trim()) return null;

  const blocks = parseDescription(text);

  const renderBlock = (block: DescriptionBlock, i: number) => {
    if (block.type === 'list') {
      return (
        <ul
          key={i}
          className={variant === 'card'
            ? 'mt-1 list-disc space-y-1 pl-5'
            : 'mb-3 list-disc space-y-1 pl-5'}
        >
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    }

    const lineText = block.type === 'heading' ? block.text : null;

    // Page variant: a heading is rendered exactly like the paragraph it used to be,
    // so the product detail page output is unchanged.
    if (variant === 'page') {
      if (block.type === 'heading') {
        return (
          <p key={i} className="mb-3">
            {block.text}
          </p>
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
    }

    // Card variant
    if (block.type === 'heading') {
      return (
        <h4 key={i} className="font-medium text-primary">
          {lineText}
        </h4>
      );
    }
    return (
      <p key={i} className="mt-1">
        {block.lines.map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </p>
    );
  };

  // Card variant groups blocks into sections so each section is visually separated.
  if (variant === 'card') {
    const sections: { heading?: string; blocks: DescriptionBlock[] }[] = [];
    for (const block of blocks) {
      if (block.type === 'heading') {
        sections.push({ heading: block.text, blocks: [] });
      } else {
        if (!sections.length) sections.push({ blocks: [] });
        sections[sections.length - 1].blocks.push(block);
      }
    }
    return (
      <>
        {sections.map((section, i) => (
          <section key={i} className={i === 0 ? '' : 'mt-3'}>
            {section.heading && <h4 className="font-medium text-primary">{section.heading}</h4>}
            {section.blocks.map(renderBlock)}
          </section>
        ))}
      </>
    );
  }

  return <>{blocks.map(renderBlock)}</>;
}
