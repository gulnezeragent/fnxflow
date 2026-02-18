import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PhysioFlow',
  description: 'Physiotherapy exercise management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
