'use client';

import { Bell, BellOff, BellRing } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <button
      id="push-notification-toggle"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      title={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
      style={{
        background: isSubscribed ? 'rgba(67,232,216,0.1)' : 'rgba(108,99,255,0.08)',
        border: `1px solid ${isSubscribed ? 'rgba(67,232,216,0.2)' : 'rgba(108,99,255,0.15)'}`,
        borderRadius: 10,
        padding: '8px 14px',
        cursor: isLoading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        fontWeight: 500,
        color: isSubscribed ? '#0CA89A' : '#6C63FF',
        transition: 'all 0.2s ease',
        opacity: isLoading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {isLoading ? (
        <div style={{
          width: 16, height: 16, border: '2px solid currentColor',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin-slow 0.8s linear infinite',
        }} />
      ) : isSubscribed ? (
        <BellRing size={16} />
      ) : (
        <BellOff size={16} />
      )}
      {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
    </button>
  );
}
