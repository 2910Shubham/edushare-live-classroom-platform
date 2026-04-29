'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Users,
  Home,
  Library,
  Monitor,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NotificationBell } from './NotificationBell';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
];

const teacherLinks = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/upload', label: 'Upload', icon: Upload },
];

const studentLinks = [
  { href: '/student', label: 'Dashboard', icon: Home },
  { href: '/student/library', label: 'Library', icon: Library },
];

export function DashboardNav({ role }: { role: 'ADMIN' | 'TEACHER' | 'STUDENT' }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = role === 'ADMIN' ? adminLinks : role === 'TEACHER' ? teacherLinks : studentLinks;
  const userName = session?.user?.name || 'User';
  const userImage = session?.user?.image;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 240,
          background: '#FFFFFF',
          borderRight: '1px solid rgba(108,99,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
          padding: '24px 16px',
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, paddingLeft: 8 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#6C63FF" />
            <path d="M8 22V10l8 6-8 6z" fill="white" />
            <path d="M16 22V10l8 6-8 6z" fill="white" opacity="0.6" />
          </svg>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#2D2B55',
            }}
          >
            EduShare
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1 }}>
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  marginBottom: 4,
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 15,
                  color: isActive ? '#6C63FF' : '#5A5880',
                  background: isActive ? 'rgba(108,99,255,0.08)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div
          style={{
            borderTop: '1px solid rgba(108,99,255,0.08)',
            paddingTop: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingLeft: 8 }}>
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                style={{ width: 36, height: 36, borderRadius: '50%' }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: role === 'ADMIN' ? 'rgba(255,107,157,0.1)' : role === 'TEACHER' ? 'rgba(108,99,255,0.1)' : 'rgba(67,232,216,0.1)',
                  color: role === 'ADMIN' ? '#FF6B9D' : role === 'TEACHER' ? '#6C63FF' : '#0CA89A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2D2B55',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName}
              </p>
              <span className={role === 'ADMIN' ? 'badge-teacher' : role === 'TEACHER' ? 'badge-teacher' : 'badge-student'}>
                {role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Teacher' : 'Student'}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: 'none',
              color: '#A8A6C8',
              cursor: 'pointer',
              width: '100%',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,107,157,0.08)';
              e.currentTarget.style.color = '#FF6B9D';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#A8A6C8';
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(108,99,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 40,
        }}
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          {mobileOpen ? <X size={24} color="#2D2B55" /> : <Menu size={24} color="#2D2B55" />}
        </button>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#6C63FF',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          EduShare
        </span>
        <NotificationBell />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 35,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 260,
              background: '#FFFFFF',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: 32, paddingLeft: 8 }}>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#6C63FF',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                EduShare
              </span>
            </div>
            <nav style={{ flex: 1 }}>
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      marginBottom: 4,
                      textDecoration: 'none',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 15,
                      color: isActive ? '#6C63FF' : '#5A5880',
                      background: isActive ? 'rgba(108,99,255,0.08)' : 'transparent',
                    }}
                  >
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: 'rgba(255,107,157,0.08)',
                color: '#FF6B9D',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop Top Bar */}
      <div
        className="hidden md:flex"
        style={{
          position: 'fixed',
          top: 0,
          left: 240,
          right: 0,
          height: 64,
          background: 'rgba(248,247,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(108,99,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 32px',
          zIndex: 20,
          gap: 16,
        }}
      >
        <NotificationBell />
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            style={{ width: 36, height: 36, borderRadius: '50%' }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: role === 'ADMIN' ? 'rgba(255,107,157,0.1)' : role === 'TEACHER' ? 'rgba(108,99,255,0.1)' : 'rgba(67,232,216,0.1)',
              color: role === 'ADMIN' ? '#FF6B9D' : role === 'TEACHER' ? '#6C63FF' : '#0CA89A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </>
  );
}
