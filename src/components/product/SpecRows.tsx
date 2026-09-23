import { Fragment } from 'react';

/** The shape the PDP receives from `Product.specifications` (JSON). */
export interface SpecRowLike {
  key?: string | null;
  label?: string | null;
  value?: string | null;
}

/**
 * Renders the specification rows for the product detail page.
 *
 * A row may be a full pair (`{ key, value }`) or a **value-only** row (`{ key: '', value }`)
 * — the admin "Paste & Parse" tool produces value-only rows for bullet lines that have no
 * label (e.g. the "Kesesuaian Sistem" sentences). Those render as a plain bullet / a cell
 * spanning both columns, so no stray ": value" ever appears.
 *
 * Both components render the same markup as before for rows that DO have a label.
 */

/** The "Keunggulan" bullet list (replaces the whole `<ul>`). */
export function SpecList({ specs }: { specs?: SpecRowLike[] | null }) {
  const rows = specs || [];
  return (
    <ul>
      {rows.map((spec, i) => {
        const label = spec.key || spec.label;
        return (
          <li key={`${label || 'spec'}-${i}`}>
            {label ? (
              <>
                <strong>{label}:</strong> {spec.value}
              </>
            ) : (
              spec.value
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The "Spesifikasi" table body rows (use inside the existing `<table><tbody>`). */
export function SpecTableRows({ specs }: { specs?: SpecRowLike[] | null }) {
  const rows = specs || [];
  return (
    <>
      {rows.map((spec, i) => {
        const label = spec.key || spec.label;
        return (
          <tr key={`${label || 'spec'}-${i}`} className="border-b border-gray-100">
            {label ? (
              <Fragment>
                <td className="py-2 pr-4 font-medium text-gray-700">{label}</td>
                <td className="py-2 text-gray-600">{spec.value}</td>
              </Fragment>
            ) : (
              <td className="py-2 text-gray-600" colSpan={2}>
                {spec.value}
              </td>
            )}
          </tr>
        );
      })}
    </>
  );
}
