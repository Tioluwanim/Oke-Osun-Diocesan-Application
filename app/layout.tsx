import type { Metadata } from 'next';
import { Cinzel, Poppins } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Diocese of Oke-Osun',
    template: '%s | Diocese of Oke-Osun',
  },
  description:
    'The official website of the Diocese of Oke-Osun, Church of Nigeria (Anglican Communion) — sermons, news, events, programs, and giving.',
  metadataBase: new URL('https://okeosundiocese.org'),
  openGraph: {
    title: 'Diocese of Oke-Osun',
    description:
      'The official website of the Diocese of Oke-Osun, Church of Nigeria (Anglican Communion).',
    siteName: 'Diocese of Oke-Osun',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-navy"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="min-h-screen overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
