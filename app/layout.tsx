import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/app/components/Sidebar';

export const metadata: Metadata = {
  title: 'Sponsy Bot – Sponsor Outreach Platform',
  description:
    'AI-powered human-in-the-loop sponsor outreach management for hackathons.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
