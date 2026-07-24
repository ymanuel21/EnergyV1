import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TopBar } from '@components/layout/TopBar';
import { Header } from '@components/layout/Header';
import { CategoryNav } from '@components/layout/CategoryNav';
import { Footer } from '@components/layout/Footer';
import { FloatingWhatsApp } from '@components/layout/FloatingWhatsApp';
import { SkipToContent } from '@components/layout/SkipToContent';
import { CartProvider } from '@providers/CartProvider';
import { WishlistProvider } from '@providers/WishlistProvider';
import { CompareProvider } from '@providers/CompareProvider';
import { ToastProvider } from '@providers/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://energi.click'),
  title: {
    default: 'EBTPlaza — Energi Terbarukan, Harga Terjangkau!',
    template: '%s — EBTPlaza',
  },
  description:
    'Pusat produk energi terbarukan: panel surya, inverter, baterai lithium, paket PLTS, dan kebutuhan proyek.',
  openGraph: {
    type: 'website',
    siteName: 'EBTPlaza',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <CategoryNav />
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
