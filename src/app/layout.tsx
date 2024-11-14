import { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { SkipLink } from '@/components/shared/SkipLink';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Logistics Management System',
  description: 'HR, Accounting, and CEO Monitoring System',
  metadataBase: new URL('https://your-domain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <SkipLink />
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
