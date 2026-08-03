# Static Pages CMS — UX & Markdown Audit

**Date:** 2026-08-03
**Target:** 5 static pages under `/halaman/[slug]`
**Editor:** Textarea (markdown stored, NOT parsed)
**Renderer:** Custom line-by-line `<p>` wrapper (broken)

---

## 1. EDITING EXPERIENCE

**Component:** `<textarea name="content" rows={16}>` — plain textarea, no toolbar.
**Markdown:** Stored as markdown in DB. NOT syntax-highlighted. NOT previewed.
**UX:** Non-technical editors must write raw markdown. No formatting help. No preview.
**Suitability:** NOT suitable for marketing/non-dev users.

---

## 2. ALL FIVE PAGES — VERIFIED

| Page | Loads | Title | Metadata | Content Rendered | Markdown Parsed? |
|------|:---:|:---:|:---:|:---:|:---:|
| Tentang Kami | ✅ | ✅ | ✅ | ✅ (raw) | ❌ |
| Kebijakan Pengiriman | ✅ | ✅ | ✅ | ✅ (raw) | ❌ |
| Kebijakan Retur | ✅ | ✅ | ✅ | ✅ (raw) | ❌ |
| Syarat & Ketentuan | ✅ | ✅ | ✅ | ✅ (raw) | ❌ |
| Kebijakan Privasi | ✅ | ✅ | ✅ | ✅ (raw) | ❌ |

**None parse markdown.** All 5 pages render `# Heading` as `<p># Heading</p>`.

---

## 3. RENDERING PIPELINE

```
DB (pages table) → getPageBySlug() → page.content (markdown string)
  ↓
/halaman/[slug]/page.tsx:29
  ↓
{page.content.split('\n').map((line) =>
  line.trim() === '' ? <br /> : <p>{line}</p>
)}
  ↓
HTML: every line = <p> (wrapped in <div className="prose">)
  ↓
Tailwind Typography (prose): adds margin-bottom to all <p>
  ↓
RESULT: excessive spacing, no markdown parsing
```

**Files involved:**
- `src/app/halaman/[slug]/page.tsx` — page component (lines 28-32)
- `src/lib/api/static-pages.ts` — `getPageBySlug()` DB query
- `prisma/schema.prisma` — `model StaticPage`

---

## 4. ROOT CAUSE OF EXCESSIVE SPACING

**File:** `src/app/halaman/[slug]/page.tsx:29-30`
**Line:** `{page.content.split('\\n').map((line) => line.trim() === '' ? <br /> : <p>{line}</p>)}`

1. Every non-empty line → `<p>` tag
2. `<div className="prose">` → Tailwind prose adds margin to `<p>`
3. Result: each line gets 1rem+ bottom margin → "excessive spacing"

**Evidence:** Verified in production HTML: `<p class="text-muted leading-relaxed"># Tentang Kami</p>`

**Fix:** Replace split/map renderer with `react-markdown`.

---

## 5. MARKDOWN SUPPORT AUDIT

**Parser used:** NONE — custom line-by-line `<p>` splitter
**Installed:** No `react-markdown`, `remark`, `rehype` packages
**Currently supported:** Plain text in `<p>` tags. No headings, bold, lists, links, tables,
  code blocks, blockquotes, images, or HTML.

**If react-markdown were installed (with recommended plugins):**

| Feature | Current | With react-markdown + remark-gfm |
|---------|:---:|:---:|
| `# Heading` | ❌ | ✅ `<h1>` |
| `## Heading 2` | ❌ | ✅ `<h2>` |
| `**bold**` | ❌ | ✅ `<strong>` |
| `*italic*` | ❌ | ✅ `<em>` |
| `- list` | ❌ | ✅ `<li>` |
| `[link](url)` | ❌ | ✅ `<a>` |
| `> blockquote` | ❌ | ✅ `<blockquote>` |
| Tables | ❌ | ✅ (with remark-gfm) |
| `code` | ❌ | ✅ `<code>` |

---

## 6. UX REVIEW

| User | Can Edit? | Usable? |
|------|:---:|:---:|
| Developer | ✅ | Barely (markdown in textarea) |
| Marketing team | ❌ | Need to learn markdown |
| Content editor | ❌ | No formatting toolbar |
| Non-technical user | ❌ | Can't preview, no guidance |

---

## 7. EDITOR COMPARISON

| Solution | Ease of Use | Bundle Size | Perf | Maint. | Migration | Effort |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| A. Textarea (current) | ❌ | 0 KB | ✅ | ✅ | 0 | 0 |
| B. Textarea + live preview | ⚠️ | ~5 KB | ✅ | ✅ | Low | 1h |
| C. GitHub Edit/Preview tabs | ⚠️ | ~5 KB | ✅ | ✅ | Low | 1h |
| D. Split-screen | ⚠️ | ~10 KB | ✅ | ⚠️ | Low | 2h |
| E. Tiptap | ✅ | ~200 KB | ⚠️ | ⚠️ | Content preserved | 3h |
| F. Lexical | ✅ | ~150 KB | ⚠️ | ⚠️ | Content preserved | 3h |
| G. CKEditor | ✅ | ~500 KB | ❌ | ⚠️ | Content preserved | 3h |
| H. TinyMCE | ✅ | ~400 KB | ❌ | ⚠️ | Content preserved | 3h |

---

## 8. RECOMMENDATION

**Option B: Textarea + live preview (react-markdown)**

- Install `react-markdown` + `remark-gfm`: ~25 KB gzipped
- Render a live preview below the textarea as the user types
- Existing markdown content is preserved 100% — no migration
- 1-hour implementation
- Marketing team gets formatted preview without leaving the editor
- No WYSIWYG overhead, no bundle bloat

**Why not Tiptap/Lexical/CKEditor:**
- EnergyV1's static pages are legal/factual documents, not rich media
- Markdown is the correct format (version-controllable, predictable)
- 500 KB bundle for CKEditor is not justified for 5 pages
- WYSIWYG can introduce inline styles that conflict with Tailwind prose

**Architecture:**

```
<details>
  <summary>Edit "{title}"</summary>
  <textarea name="content" value={content} onChange={...} />
  <div className="markdown-preview prose max-w-none text-muted text-sm">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
  <button>Save</button>
</details>
```

---

## 9. IMPLEMENTATION PLAN

**Phase 1 — Fix rendering (30 min)**
- `npm install react-markdown remark-gfm`
- Replace line-by-line `<p>` split in `/halaman/[slug]/page.tsx` with `<ReactMarkdown>`

**Phase 2 — Add preview to editor (30 min)**
- Add live preview panel to Static Pages CMS editor (`/admin/static-pages/page.tsx`)
- Import ReactMarkdown in client component

**Phase 3 — Polish (optional)**
- Syntax highlighting in textarea (CodeMirror or Monaco — adds 200 KB, skip for now)
- Edit/Preview tab toggle instead of always-visible preview (simpler UI)
- Auto-save debounce

**Total effort:** ~1 hour
**Risk:** None — markdown content preserved, only the renderer changes
