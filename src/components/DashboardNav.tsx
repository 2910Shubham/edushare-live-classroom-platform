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
  BarChart3,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { NotificationBell } from './NotificationBell';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/teacher', label: 'Classrooms', icon: Monitor },
  { href: '/quiz', label: 'Quiz', icon: Trophy },
  { href: '/teacher/upload', label: 'Upload', icon: Upload },
  { href: '/student', label: 'Student View', icon: BookOpen },
];

const teacherLinks = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/quiz', label: 'Quiz', icon: Trophy },
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

  const rolePillClass =
    role === 'ADMIN'
      ? 'clay-pill clay-pill-pink'
      : role === 'TEACHER'
      ? 'clay-pill'
      : 'clay-pill clay-pill-teal';

  const avatarIconClass =
    role === 'ADMIN'
      ? 'clay-icon clay-icon-sm clay-icon-pink'
      : role === 'TEACHER'
      ? 'clay-icon clay-icon-sm clay-icon-purple'
      : 'clay-icon clay-icon-sm clay-icon-teal';

  return (
    <>
      {/* Desktop Floating Clay Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 16,
          top: 16,
          bottom: 16,
          width: 224,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
          padding: '20px 14px',
        }}
        className="clay hidden md:flex"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingLeft: 6 }}>
          <div className="clay-icon clay-icon-sm clay-icon-purple" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M8 24V8l10 8-10 8z" fill="white" />
              <path d="M16 24V8l10 8-10 8z" fill="white" opacity="0.65" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--clay-ink)',
            }}
          >
            EduShare
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? 'clay-inset' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 16,
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  color: isActive ? 'var(--clay-purple-dark)' : 'var(--clay-ink-soft)',
                  background: isActive ? '#ebe6ff' : 'transparent',
                  transition: 'background-color 0.18s ease, color 0.18s ease',
                }}
              >
                <Icon size={19} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div
          style={{
            borderTop: '1px solid rgba(124, 108, 255, 0.12)',
            paddingTop: 14,
            marginTop: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingLeft: 4 }}>
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt={userName}
                className="clay-avatar-ring"
                style={{ width: 38, height: 38, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div
                className={avatarIconClass}
                style={{ width: 38, height: 38, borderRadius: '50%', fontSize: 14, fontWeight: 700 }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--clay-ink)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                }}
              >
                {userName}
              </p>
              <span className={rolePillClass} style={{ padding: '2px 10px', fontSize: 11 }}>
                {role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Teacher' : 'Student'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="clay-btn clay-btn-ghost clay-btn-sm"
            style={{ width: '100%', height: 40, fontSize: 13 }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Floating Clay Top Bar */}
      <div
        className="clay md:hidden"
        style={{
          position: 'fixed',
          top: 10,
          left: 12,
          right: 12,
          height: 56,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          zIndex: 40,
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          style={{
            background: '#ece8ff',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--clay-ink)',
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--clay-ink)',
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
          className="clay-modal-backdrop"
          style={{ justifyContent: 'flex-start', padding: 12, zIndex: 45 }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="clay clay-md clay-modal"
            style={{
              width: 264,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="clay-icon clay-icon-sm clay-icon-purple" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path d="M8 24V8l10 8-10 8z" fill="white" />
                    <path d="M16 24V8l10 8-10 8z" fill="white" opacity="0.65" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--clay-ink)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  EduShare
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                style={{
                  background: '#ece8ff',
                  border: 'none',
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--clay-ink)',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={isActive ? 'clay-inset' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 16,
                      textDecoration: 'none',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 15,
                      color: isActive ? 'var(--clay-purple-dark)' : 'var(--clay-ink-soft)',
                    }}
                  >
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="clay-btn clay-btn-pink clay-btn-sm"
              style={{ width: '100%', marginTop: 12 }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop Floating Top Bar */}
      <div
        className="clay hidden md:flex"
        style={{
          position: 'fixed',
          top: 16,
          left: 256,
          right: 24,
          height: 58,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 20px',
          zIndex: 20,
          gap: 14,
        }}
      >
        <NotificationBell />
        {userImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userImage}
            alt={userName}
            className="clay-avatar-ring"
            style={{ width: 38, height: 38, objectFit: 'cover' }}
          />
        ) : (
          <div
            className={avatarIconClass}
            style={{ width: 38, height: 38, borderRadius: '50%', fontSize: 14, fontWeight: 700 }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </>
  );
}
