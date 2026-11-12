'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { locales, localeLabels, localeCookieName, localeCookieMaxAge, type Locale } from '@/i18n/config';

/**
 * Header language selector — ID | EN.
 *
 * Rendered once in the header's action group, which exists at every breakpoint, so desktop and
 * mobile share a single control rather than duplicated markup.
 *
 * Switching writes the locale cookie and re-renders the current route on the server, so every
 * translated string (including database content) changes together with no full page reload.
 *
 * Accessibility: a labelled group of native buttons, keyboard operable, with the active language
 * exposed via `aria-pressed` and distinguished visually as well.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isSwitching, startTransition] = useTransition();
  const t = useTranslations('a11y');

  function select(next: Locale) {
    if (next === locale) return;
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=${localeCookieMaxAge}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t('languageSwitcher')}
      aria-busy={isSwitching}
      className={`flex items-center rounded-lg border border-border bg-surface/60 p-0.5 transition-opacity ${isSwitching ? 'pointer-events-none opacity-60' : ''} ${className}`}
    >
      {isSwitching && (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none"
          className="mr-1 h-3 w-3 animate-spin motion-reduce:animate-none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {isSwitching ? t('switching') : ''}
      </span>
      {locales.map((code) => {
        const isActive = code === locale;
        const label = localeLabels[code];
        return (
          <button
            key={code}
            type="button"
            lang={label.htmlLang}
            onClick={() => select(code)}
            aria-pressed={isActive}
            aria-label={label.native}
            title={label.native}
            className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-none transition-colors ${
              isActive ? 'bg-primary text-white' : 'text-muted hover:text-primary'
            }`}
          >
            {label.short}
          </button>
        );
      })}
    </div>
  );
}
