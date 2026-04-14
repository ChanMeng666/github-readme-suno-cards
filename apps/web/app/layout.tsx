'use client';

import type { ReactNode } from 'react';
import { Footer } from '../components/Footer.js';
import { Navbar } from '../components/Navbar.js';
import { ThemeProvider } from '../components/ThemeProvider.js';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>github-readme-suno-cards</title>
        <meta
          name="description"
          content="Display your Suno AI-generated music as dynamic cards in your GitHub README."
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
