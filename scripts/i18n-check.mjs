#!/usr/bin/env node
/**
 * i18n quality gate.
 *
 * Checks required by the localization architecture requirement:
 *   1. key parity across locales
 *   2. missing keys and unused keys
 *   3. hardcoded user-facing strings in UI components (with documented exceptions)
 *   4. interpolation variables match between locales
 *
 * Usage: npm run i18n:check        (exit 1 on failure, so CI can gate on it)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LOCALES = ['id', 'en'];
const SOURCE = 'id';

/** Files allowed to contain literal UI copy, with the reason. */
const HARDCODE_EXCEPTIONS = [
  { match: /^src\/lib\/validations\.ts$/, why: 'admin-only Zod messages (internal CMS, stays Indonesian)' },
  { match: /^src\/lib\/product-errors\.ts$/, why: 'admin-only error copy' },
  { match: /^src\/components\/admin\//, why: 'admin UI is not localized' },
  { match: /^src\/app\/admin\//, why: 'admin UI is not localized' },
  { match: /^src\/lib\/data\//, why: 'offline CMS dataset; localized by the content overlay' },
  { match: /^src\/lib\/i18n\//, why: 'the content overlay itself' },
  { match: /^src\/scripts\//, why: 'developer tooling' },
  { match: /^messages\//, why: 'translation catalogues' },
];

const errors = [];
const warnings = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === '.next' || name === '.git') continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out[key] = String(v);
  }
  return out;
}

const messages = {};
for (const locale of LOCALES) {
  messages[locale] = flatten(JSON.parse(readFileSync(join(ROOT, `messages/${locale}.json`), 'utf8')));
}

// --- 1 & 2: parity, missing, unused ---------------------------------------------------------
const sourceKeys = new Set(Object.keys(messages[SOURCE]));
const allSourceText = walk(join(ROOT, 'src')).filter((f) => /\.(ts|tsx)$/.test(f))
  .map((f) => readFileSync(f, 'utf8')).join('\n');

for (const locale of LOCALES) {
  const keys = new Set(Object.keys(messages[locale]));
  for (const key of sourceKeys) if (!keys.has(key)) errors.push(`[parity] ${locale} is missing key "${key}"`);
  for (const key of keys) if (!sourceKeys.has(key)) errors.push(`[parity] ${locale} has extra key "${key}"`);
}

for (const key of sourceKeys) {
  const leaf = key.split('.').pop();
  // a key is "used" if its leaf appears in source (translators are namespaced by area or root-scoped)
  if (!new RegExp(`['"\`]${key}['"\`]`).test(allSourceText) && !new RegExp(`\\.${leaf}['"\`]`).test(allSourceText)) {
    warnings.push(`[unused] no source file references "${key}"`);
  }
}

// --- 4: interpolation variables -----------------------------------------------------------------
const VAR = /\{(\w+)/g;
for (const key of sourceKeys) {
  const src = [...messages[SOURCE][key].matchAll(VAR)].map((m) => m[1]).sort();
  for (const locale of LOCALES) {
    if (locale === SOURCE) continue;
    const other = [...(messages[locale][key] ?? '').matchAll(VAR)].map((m) => m[1]).sort();
    if (src.join(',') !== other.join(',')) {
      errors.push(`[interpolation] "${key}": ${SOURCE} has [${src}] but ${locale} has [${other}]`);
    }
  }
}

// --- 3: hardcoded user-facing strings ------------------------------------------------------------
// .tsx for JSX copy, and .ts for module-level label constants (which is where the earlier revision
// of this gate missed a whole class of strings).
const UI_FILES = walk(join(ROOT, 'src')).filter((f) => /\.(tsx|ts)$/.test(f));
const INDONESIAN_MARKERS = /\b(dan|atau|yang|untuk|dari|dengan|tidak|sudah|belum|kembali|hapus|cari|tambah|batal|simpan|pilih|kirim|harga|stok|produk|keranjang)\b/i;

/** User-facing copy in an attribute, as JSX text, or as a labelled field in a module constant. */
const SUSPECT = /(aria-label|placeholder|title|alt|label)\s*=\s*"([^"]{4,})"|>\s*([A-Z][A-Za-z .,!?%&'()–-]{6,})\s*<|\b(label|title|subtitle|description|placeholder|heading)\s*:\s*'([A-Z][^'\n]{4,})'/g;

/** Strings that are structural rather than copy: paths, classes, ids, codes, URLs. */
function isStructural(text) {
  if (/^[a-z0-9-]+$/.test(text)) return true;                 // slug / id / token
  if (/^[/#]/.test(text)) return true;                        // path or anchor
  if (/^(https?:|mailto:|tel:)/.test(text)) return true;
  if (/^(px|rem|flex|grid|block|inline|absolute|relative|hidden)\b/.test(text)) return true;
  if (/\b(text|bg|border|rounded|hover|focus|md|lg|sm|xl):/.test(text)) return true;
  if (/^[A-Z0-9 _-]{2,}$/.test(text) && !text.includes(' ')) return true;   // CONSTANT_CASE
  if (/^[A-Z][a-z]+([A-Z][a-z]+)+$/.test(text)) return true;  // PascalCase component / type name
  if (/^%s|^\$\{|^\{\{/.test(text)) return true;
  return false;
}

for (const file of UI_FILES) {
  const rel = relative(ROOT, file);
  if (HARDCODE_EXCEPTIONS.some((e) => e.match.test(rel))) continue;
  const text = readFileSync(file, 'utf8');
  // strip comments so commented-out copy is not reported
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  let m;
  while ((m = SUSPECT.exec(stripped)) !== null) {
    const candidate = (m[2] ?? m[3] ?? m[5] ?? '').trim();
    if (!candidate || candidate.length < 5) continue;
    if (isStructural(candidate)) continue;
    if (!candidate.includes(' ') && !INDONESIAN_MARKERS.test(candidate)) continue;
    const line = stripped.slice(0, m.index).split('\n').length;
    const lang = INDONESIAN_MARKERS.test(candidate) ? 'id' : 'en';
    warnings.push(`[hardcoded:${lang}] ${rel}:${line} "${candidate.slice(0, 52)}"`);
  }
}

// --- report ---------------------------------------------------------------------------------------
const byRule = (list) => list.reduce((acc, x) => {
  const rule = x.slice(1, x.indexOf(']'));
  acc[rule] = (acc[rule] ?? 0) + 1;
  return acc;
}, {});

console.log(`i18n gate — locales: ${LOCALES.join(', ')} (source: ${SOURCE})`);
console.log(`keys: ${sourceKeys.size}`);
console.log(`errors: ${errors.length}`, byRule(errors));
console.log(`warnings: ${warnings.length}`, byRule(warnings));
if (errors.length) { console.log('\nERRORS'); errors.forEach((e) => console.log('  ' + e)); }
const hardcoded = warnings.filter((w) => w.startsWith('[hardcoded'));
const unused = warnings.filter((w) => w.startsWith('[unused'));
if (hardcoded.length) {
  console.log(`\nHARDCODED USER-FACING STRINGS (${hardcoded.length}) — migrate to messages/*.json`);
  hardcoded.forEach((w) => console.log('  ' + w));
}
if (unused.length && process.env.I18N_VERBOSE) {
  console.log(`\nUNUSED KEYS (${unused.length}) — not yet referenced by any component`);
  unused.forEach((w) => console.log('  ' + w));
} else if (unused.length) {
  console.log(`\nunused keys: ${unused.length} (I18N_VERBOSE=1 to list; these are the migration backlog)`);
}

process.exit(errors.length ? 1 : 0);
