import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

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
              background: '#FFFFFF',
              border: '1px solid rgba(108, 99, 255, 0.12)',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(108, 99, 255, 0.12)',
              color: '#2D2B55',
              fontFamily: "'Inter', sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
