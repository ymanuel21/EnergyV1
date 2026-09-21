'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULTS, type SiteSettings } from '@/lib/site';

/**
 * Provides site settings (loaded server-side from the DB via `loadSiteFromDb`)
 * to client components, so they don't fall back to the hardcoded DEFAULTS.
 */
const SiteContext = createContext<SiteSettings>(DEFAULTS);

export function SiteProvider({ settings, children }: { settings: SiteSettings; children: ReactNode }) {
  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteSettings {
  return useContext(SiteContext);
}
