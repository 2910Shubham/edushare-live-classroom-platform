'use client';

import { BellOff, BellRing } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <button
      id="push-notification-toggle"
      type="button"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      title={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
      className={isSubscribed ? 'clay-btn clay-btn-teal clay-btn-sm' : 'clay-btn clay-btn-ghost clay-btn-sm'}
      style={{
        cursor: isLoading ? 'wait' : 'pointer',
        height: 40,
        padding: '0 16px',
        fontSize: 13,
      }}
    >
      {isLoading ? (
        <div
          style={{
            width: 16,
            height: 16,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin-slow 0.8s linear infinite',
          }}
        />
      ) : isSubscribed ? (
        <BellRing size={16} />
      ) : (
        <BellOff size={16} />
      )}
      {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
    </button>
  );
}
