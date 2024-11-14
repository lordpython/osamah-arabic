import { Metadata } from 'next';

import '@/styles/globals.css';

import { Inter } from 'next/font/google';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import Navigation from '@/components/shared/Navigation';
import { AppProvider } from '@/providers/AppProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Logistics Management System',
  description: 'HR, Accounting, and CEO Monitoring System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-gray-50 ${inter.className}`}>
        <Navigation />
        <ErrorBoundary>
          <AppProvider>{children}</AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
