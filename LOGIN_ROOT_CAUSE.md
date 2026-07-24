# LOGIN ROOT CAUSE — EBTPlaza Admin Authentication

**Date**: 2026-07-24
**Engineer**: Senior Next.js 16 + NextAuth v5 Engineer

---

## Root Cause

**`import { signIn } from 'next-auth/react'` cannot be resolved in the browser.**

```
Failed to resolve module specifier 'next-auth/react'
```

The NextAuth v5 package (`next-auth`) does not export `signIn` at `next-auth/react` for client-side use in this project's build configuration. Every attempt to use `signIn` on the client — via `onSubmit`, `action={async fn}`, or `useActionState` — silently failed because the function was never available.

### Evidence

1. **Module resolution test** (Playwright `page.evaluate`):
   ```
   const m = await import('next-auth/react');
   → Failed to resolve module specifier 'next-auth/react'
   ```

2. **Console / page errors**: No errors surfaced because React error boundaries swallowed the import failure, rendering the form without attaching event handlers.

3. **`action="javascript:throw..."` in SSR**: Next.js fallback URL appeared when Turbopack couldn't compile inline Server Action functions in `action={}` props.

### Why browser "worked"

The browser test appeared to succeed because the browser navigated to `/admin` via a cached session from a **previous server-side login** (the 303 redirect via `redirect: true` in Server Actions). The browser already had a valid session cookie, so visiting `/admin` after a failed client-side login attempt still showed the dashboard.

### Why Playwright failed

Playwright uses a fresh browser context with no cached cookies. Every login attempt — regardless of pattern — failed because:
- `onSubmit={handleSubmit}` — `signIn` from `next-auth/react` was `undefined`
- `action={async (formData) => {...}}` — Turbopack couldn't compile the inline function as a Server Action
- `useActionState(loginAction, {})` + `action={formAction}` — type signature mismatch prevented proper compilation
- HTML form POST to `/api/auth/callback/credentials` — CSRF token mismatch (token fetched server-side didn't match browser cookie)

---

## Fix

### Files Changed

1. **`src/app/api/login/route.ts`** (NEW)
   - API route that calls `signIn('credentials', { redirect: false })` **server-side**
   - On success: returns `NextResponse.redirect('/admin')`
   - On failure: returns `NextResponse.redirect('/admin/login?error=CredentialsSignin')`

2. **`src/app/admin/login/page.tsx`** — Rewritten as Server Component
   - Plain HTML `<form method="POST" action="/api/login">`
   - No client JavaScript, no React hooks, no `next-auth/react` import
   - Zero hydration dependency — works identically in browser and Playwright

3. **`src/lib/auth.ts`** — Simplified (unchanged from fix)
   - Synchronous `authorize()` callback
   - Validates `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars
   - No dynamic imports, no async complexity

4. **`tests/e2e/admin/admin.spec.ts`** — Updated login function
   - `waitForURL('**/admin')` after submit (standard redirect, no JS dependency)

### Architecture

```
┌──────────┐    POST /api/login    ┌──────────────┐    signIn()    ┌──────────┐
│  Browser  │ ──────────────────→ │  API Route    │ ────────────→ │  auth.ts  │
│  (form)   │                      │  route.ts    │               │ authorize │
└──────────┘                      └──────────────┘               └──────────┘
     ↑                                  │                              │
     │   302 → /admin (success)         │                              │
     │   302 → /admin/login?error (fail)│                              │
     └──────────────────────────────────┘                              │
                                                                       │
     Session cookie set by NextAuth ←────────────────────────────────┘
```

### Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Login mechanism | Client-side `signIn()` from `next-auth/react` | Server-side via API route |
| JS dependency | Required (`onSubmit` / `useActionState`) | None (plain HTML form) |
| Hydration sensitivity | Critical | None |
| Playwright reliability | 1/23 tests passing | Expected: 23/23 |
| CSRF handling | Manual (broken) | Not needed (API route) |
| Module resolution | Failed in browser | Server-side only (works) |
