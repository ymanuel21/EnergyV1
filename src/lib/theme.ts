// Design tokens for EBTPlaza theme
// Single source of truth for all visual styling
// Admin-editable via /admin/appearance (coming in Phase 1)

export const theme = {
  colors: {
    primary: '#111827',      // gray-900 — buttons, links, headings
    secondary: '#374151',    // gray-700 — focus rings, accents
    accent: '#10B981',       // emerald-500 — decorative blurs, highlights
    background: '#FFFFFF',   // white — page background
    surface: '#F8FAFC',      // slate-50 — card backgrounds, sections
    muted: '#9CA3AF',        // gray-400 — secondary text, borders
    border: '#E5E7EB',       // gray-200 — card borders, dividers
    dark: '#111827',         // gray-900 — dark sections (CTA, footer)
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    heading: {
      weight: 300,           // font-light
      tracking: '-0.025em',  // tracking-tight
      lineHeight: 1.2,
    },
    body: {
      size: '0.875rem',      // text-sm
      weight: 400,
      lineHeight: 1.6,
    },
  },
  radius: {
    sm: '0.5rem',            // rounded-lg
    md: '0.75rem',           // rounded-xl
    lg: '1.5rem',            // rounded-3xl
    full: '9999px',          // rounded-full (buttons)
  },
  spacing: {
    container: '64rem',      // max-w-5xl
    section: '8rem',         // py-32
    card: '1.5rem',          // p-6
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
  animation: {
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export type Theme = typeof theme;
