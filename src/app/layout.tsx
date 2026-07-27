import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TopBar } from '@components/layout/TopBar';
import { Header } from '@components/layout/Header';
import { Footer } from '@components/layout/Footer';
import { FloatingWhatsApp } from '@components/layout/FloatingWhatsApp';
import { SkipToContent } from '@components/layout/SkipToContent';
import { CartProvider } from '@providers/CartProvider';
import { WishlistProvider } from '@providers/WishlistProvider';
import { CompareProvider } from '@providers/CompareProvider';
import { ToastProvider } from '@providers/ToastProvider';
import { SITE_CONFIG } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s — ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  openGraph: {
    type: SITE_CONFIG.og.type,
    siteName: SITE_CONFIG.og.siteName,
    locale: SITE_CONFIG.og.locale,
  },
  twitter: {
    card: SITE_CONFIG.og.twitterCard,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-gray-900 antialiased">
        <SkipToContent />
        <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <TopBar />
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
      </body>
    </html>
  );
}
