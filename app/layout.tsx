import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinanceFlow — Pelacak Keuangan Pribadi',
  description: 'Lacak pemasukan, pengeluaran, dan tujuan keuangan Anda dengan dasbor yang bersih dan modern.',
  verification: {
    google: 'hP_yq6pm9Uk4gfno5XRC9oBZIq2Z943dP2RMxABgn-E',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
