import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';

export const metadata: Metadata = {
  title: 'EduShare — Live Classroom Platform',
  description:
    'The classroom of the future. Real-time smart boards, AI-powered notes, and live collaboration for teachers and students.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--clay-surface)',
              border: '1px solid rgba(255, 255, 255, 0.75)',
              borderRadius: '24px',
              boxShadow:
                '12px 16px 32px rgba(124, 108, 255, 0.18), 4px 6px 12px rgba(43, 42, 85, 0.08), inset -6px -6px 12px rgba(124, 108, 255, 0.08), inset 6px 6px 12px rgba(255, 255, 255, 0.95)',
              color: 'var(--clay-ink)',
              fontFamily: "'Inter', sans-serif",
            },
          }}
        />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
