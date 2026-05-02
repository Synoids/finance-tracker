import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinanceFlow — Pelacak Keuangan Pribadi',
  description: 'Lacak pemasukan, pengeluaran, dan tujuan keuangan Anda dengan dasbor yang bersih dan modern.',
  verification: {
    google: 'hP_yq6pm9Uk4gfno5XRC9oBZIq2Z943dP2RMxABgn-E',
  },
};

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="mesh-bg" />
        <NextTopLoader 
          color="#6366f1" 
          showSpinner={false} 
          shadow="0 0 10px #6366f1,0 0 5px #6366f1" 
          height={3}
        />
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
