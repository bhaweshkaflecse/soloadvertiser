import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solo Advertiser — Admin Panel',
  description: 'Administration panel for Solo Advertiser platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
