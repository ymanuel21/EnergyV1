'use client';

import { useEffect } from 'react';

const DEFAULTS: Record<string, string> = {
  theme_primary: '#111827',
  theme_primary_hover: '#1F2937',
  theme_surface: '#F8FAFC',
  theme_card: '#FFFFFF',
  theme_muted: '#6B7280',
  theme_border: '#E5E7EB',
  theme_accent: '#10B981',
  theme_dark_bg: '#111827',
  theme_radius_sm: '0.5rem',
  theme_radius_md: '0.75rem',
  theme_radius_lg: '1.5rem',
  theme_radius_full: '9999px',
  theme_container: '64rem',
  theme_heading_weight: '300',
  theme_shadow_card: '0 1px 3px rgba(0,0,0,0.08)',
  theme_shadow_lg: '0 10px 25px rgba(0,0,0,0.08)',
};

const CSS_VAR_MAP: Record<string, string> = {
  theme_primary: '--ebt-primary',
  theme_primary_hover: '--ebt-primary-hover',
  theme_surface: '--ebt-surface',
  theme_card: '--ebt-card',
  theme_muted: '--ebt-muted',
  theme_border: '--ebt-border',
  theme_accent: '--ebt-accent',
  theme_dark_bg: '--ebt-dark-bg',
  theme_radius_sm: '--ebt-radius-sm',
  theme_radius_md: '--ebt-radius-md',
  theme_radius_lg: '--ebt-radius-lg',
  theme_radius_full: '--ebt-radius-full',
  theme_container: '--ebt-container',
  theme_heading_weight: '--ebt-heading-weight',
  theme_shadow_card: '--ebt-shadow-card',
  theme_shadow_lg: '--ebt-shadow-lg',
};

export function ThemeProvider({ settings }: { settings: Record<string, string> }) {
  useEffect(() => {
    const root = document.documentElement;
    for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
      root.style.setProperty(cssVar, settings[key] || DEFAULTS[key] || '');
    }
  }, [settings]);

  return null;
}
