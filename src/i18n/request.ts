/**
 * Per-request i18n configuration.
 *
 * The locale comes from a cookie rather than the URL, so no route, link or sitemap entry changes
 * and the existing Indonesian URLs stay exactly as they are. Reading it here means the server
 * renders the right language on the first pass, so there is no flash of the wrong language.
 *
 * Missing-key policy (documented in docs/i18n/IMPLEMENTATION.md):
 *   requested locale → source language (Indonesian) → the key itself
 * so a gap degrades to the client's own wording rather than to a blank label, and in development
 * it is logged loudly so mixed-language UI cannot ship silently.
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, localeCookieName, parseLocale } from './config';
import idMessages from '../../messages/id.json';

/** Read a dotted key out of a nested message object. */
function lookup(messages: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let node: unknown = messages;
  for (const part of parts) {
    if (!node || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = parseLocale(store.get(localeCookieName)?.value);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,

    /**
     * Surface translation gaps instead of ignoring them: in development a missing key is a hard
     * signal, in production it stays non-fatal but is still logged for triage.
     */
    onError(error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[i18n] ${error.message}`);
      } else {
        console.warn(`[i18n] ${error.message}`);
      }
    },

    /** Fall back to the source language, then to the key name. */
    getMessageFallback({ key, namespace }) {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      if (defaultLocale !== undefined) {
        const source = lookup(idMessages, fullKey);
        if (source) return source;
      }
      return fullKey;
    },
  };
});
