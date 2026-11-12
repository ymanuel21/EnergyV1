import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@components/layout/Header';
import { Footer } from '@components/layout/Footer';
import { FloatingWhatsApp } from '@components/layout/FloatingWhatsApp';
import { SkipToContent } from '@components/layout/SkipToContent';
import { CartProvider } from '@providers/CartProvider';
import { WishlistProvider } from '@providers/WishlistProvider';
import { CompareProvider } from '@providers/CompareProvider';
import { ToastProvider } from '@providers/ToastProvider';
import { ThemeProvider } from '@components/providers/ThemeProvider';
import { getThemeSettings } from '@/lib/api/theme';
import { SITE_CONFIG } from '@/lib/site';
import { loadSiteForLang } from '@/lib/site-server';
import { getLocale } from 'next-intl/server';
import { localeLabels, type Locale } from '@/i18n/config';
import { SiteProvider } from '@providers/SiteProvider';
import { NextIntlClientProvider } from 'next-intl';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Metadata follows the visitor's language: title, description and Open Graph locale come from
 * that language's settings, so a shared link and the browser tab match the page.
 *
 * `alternates.canonical` is deliberately NOT set here: a layout-level canonical is inherited by
 * every page that does not set its own, which made /testimoni, /proyek and /cari all declare the
 * homepage as their canonical URL. Each page sets its own canonical instead.
 *
 * `alternates.languages` is also not set: the language lives in a cookie rather than in a
 * per-language URL, so there are no separate URLs to advertise.
 */
export async function generateMetadata(): Promise<Metadata> {
  const lang = (await getLocale()) as Locale;
  const site = await loadSiteForLang(lang);
  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: localeLabels[lang].ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolved before the first byte of HTML so the page never paints in the wrong language.
  // Locale is resolved in src/i18n/request.ts from the cookie, so server output is already
  // in the right language on the first pass — no flash of the wrong language.
  const lang = (await getLocale()) as Locale;
  const themeSettings = await getThemeSettings();
  const site = await loadSiteForLang(lang);

  return (
    <html lang={localeLabels[lang].htmlLang} className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-gray-900 antialiased">
        <NextIntlClientProvider>
        <SiteProvider settings={site}>
        <ThemeProvider settings={themeSettings} />
        <SkipToContent />
        <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <Header />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
              <FloatingWhatsApp />
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
        </ToastProvider>
        </SiteProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
