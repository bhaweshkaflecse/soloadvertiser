import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solo Advertiser — Admin Panel',
  description: 'Administration panel for Solo Advertiser platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
