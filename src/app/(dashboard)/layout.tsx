import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/DashboardNav';
import { Providers } from '@/components/Providers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as Record<string, unknown>).role as 'ADMIN' | 'TEACHER' | 'STUDENT';

  return (
    <Providers>
      <div style={{ minHeight: '100vh', background: 'var(--clay-bg)' }}>
        <DashboardNav role={role} />
        {/* Main content area */}
        <main
          style={{
            marginLeft: 252,
            paddingTop: 80,
            minHeight: '100vh',
            position: 'relative',
          }}
          className="dashboard-main"
        >
          <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
            {children}
          </div>
        </main>

        <style>{`
          @media (max-width: 768px) {
            .dashboard-main {
              margin-left: 0 !important;
              padding-top: 76px !important;
            }
            .dashboard-main > div {
              padding: 16px !important;
            }
            .hidden {
              display: none !important;
            }
          }
          @media (min-width: 769px) {
            .md\\:flex {
              display: flex !important;
            }
            .md\\:hidden {
              display: none !important;
            }
          }
          @media (max-width: 768px) {
            .md\\:flex {
              display: none !important;
            }
            .md\\:hidden {
              display: flex !important;
            }
          }
        `}</style>
      </div>
    </Providers>
  );
}
