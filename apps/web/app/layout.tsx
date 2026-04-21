import { Fraunces, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { Footer } from '../components/Footer.js';
import { Navbar } from '../components/Navbar.js';
import { ThemeProvider } from '../components/ThemeProvider.js';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans-var',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display-var',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-var',
  display: 'swap',
});

export const metadata = {
  title: 'Suno Cards — Dynamic Music Cards for GitHub README',
  description: 'Display your Suno AI-generated music as dynamic cards in your GitHub README.',
  icons: { icon: '/logo.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
