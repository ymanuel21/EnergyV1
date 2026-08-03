# EnergyV1 QA Methodology — Updated 2026-08-03

## Core Principle: End-to-End Verification

Every CMS feature must be verified through the complete pipeline:

```
Admin Action → Database → API/Data Layer → Renderer → Public UI
```

A test is NOT complete if it stops at any intermediate stage.

## Architectural Checks (before functional testing)

### HOMEPAGE-ARCH-001: Rendering pipeline integrity

Verify every homepage section type has exactly one rendering path:

```
CMS Section → sections.map(renderSection) → SectionRegistry → Renderer
```

No standalone renderers outside this pipeline. Checks:
- [ ] Zero components rendered outside `sections.map()`
- [ ] Zero components that fetch their own data instead of using `contextData`
- [ ] Zero separate `findPublic()` calls that duplicate CMS-managed content
- [ ] Zero hardcoded JSX blocks after the section loop
- [ ] Static grep for `<Renderer` outside the loop

### HOMEPAGE-ARCH-002: Single source of truth

- [ ] Each section type appears exactly once in `section-registry.tsx`
- [ ] Each section type has exactly one renderer component
- [ ] No section type rendered via both section-registry AND standalone JSX

## Functional Regression Tests

### HOMEPAGE-REG-001: Section order persistence
"Move every section type to every position, verify public DOM order matches admin order after each move."
- [ ] Admin reorder → Public DOM order check
- [ ] Automation: Yes (Playwright: section card text order assertion)

### HOMEPAGE-REG-002: Single render path audit  
"Verify exactly one `<Renderer>` invocation per section type. Zero standalone blocks."
- [ ] Static grep check
- [ ] Automation: Yes (AST/code scan)

### HOMEPAGE-REG-003: Remove section → public hidden
"Disable/unpublish a section in admin, verify it's gone from public page."
- [ ] Admin toggle → Public DOM absence

### HOMEPAGE-REG-004: End-to-end rendering consistency
For every homepage section:
1. Change order
2. Save
3. Publish
4. Refresh public homepage
5. Verify: position, visibility, content, no duplicates

## Bug Categories Detected

| Category | Detection Method | Example |
|----------|-----------------|---------|
| Standalone renderer | ARCH-001 | Testimonials block after loop |
| Bypassed pipeline | ARCH-001 | Direct findPublic() outside contextData |
| Order not rendering | REG-001 | sortOrder changed, public shows old order |
| Duplicate render | ARCH-002 | Both section-registry AND standalone JSX |

## Postmortem: Testimonials Ordering Bug (2026-08-03)

**Root cause of QA miss:** Tested admin state (sortOrder changed ✓) but never verified public rendering order.

**Fix:** Added REG-001, ARCH-001, ARCH-002 to checklist.

**Lesson:** Never stop at "sortOrder changed in DB." Always verify "Does the page actually show the new order?"
