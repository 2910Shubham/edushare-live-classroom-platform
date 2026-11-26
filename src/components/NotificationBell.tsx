'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: NotificationItem) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleNewNotification = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for socket notifications if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('edushare:notification', handleNewNotification);
      return () => window.removeEventListener('edushare:notification', handleNewNotification);
    }
  }, [handleNewNotification]);

  function getRelativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'material':
        return '📄';
      case 'annotation':
        return '✏️';
      case 'notes':
        return '📝';
      case 'classroom':
        return '🏫';
      default:
        return '🔔';
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={`clay-btn clay-btn-ghost ${isShaking ? 'animate-shake' : ''}`}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          padding: 0,
          borderRadius: 14,
        }}
      >
        <Bell size={19} color="var(--clay-ink)" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: '999px',
              background: 'linear-gradient(145deg, #ff79ab, #d6336c)',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 5px',
              boxShadow: '0 2px 6px rgba(214, 51, 108, 0.35)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="clay clay-modal"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 10,
            width: 340,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: 440,
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(124, 108, 255, 0.12)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--clay-ink)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="clay-pill"
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: '4px 10px',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: 370, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: 36,
                  textAlign: 'center',
                  color: 'var(--clay-ink-soft)',
                  fontSize: 14,
                }}
              >
                <Bell size={32} color="var(--clay-ink-soft)" style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className="clay-row"
                  style={{
                    padding: '12px 14px',
                    background: n.isRead ? '#faf8ff' : '#ece8ff',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{getNotificationIcon(n.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: n.isRead ? 500 : 700,
                        color: 'var(--clay-ink)',
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--clay-ink-soft)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {n.message}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--clay-ink-soft)', marginTop: 4 }}>
                      {getRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
