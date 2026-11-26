'use client';

import React from 'react';

type Variant = 'teacher' | 'student' | 'auth' | 'default';

interface PageBackgroundProps {
  variant?: Variant;
}

const BLOB_PRESETS: Record<
  Variant,
  Array<{
    colorClass: string;
    size: number;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    delay: string;
    duration: string;
    hideOnMobile?: boolean;
  }>
> = {
  auth: [
    { colorClass: 'clay-blob-pink', size: 120, top: '7%', left: '6%', delay: '0s', duration: '7s' },
    { colorClass: 'clay-blob-teal', size: 96, top: '14%', right: '8%', delay: '1.2s', duration: '8s' },
    { colorClass: 'clay-blob-yellow', size: 74, top: '42%', left: '4%', delay: '2.4s', duration: '6.5s', hideOnMobile: true },
    { colorClass: 'clay-blob-purple', size: 140, bottom: '10%', right: '7%', delay: '0.8s', duration: '7.5s' },
    { colorClass: 'clay-blob-teal', size: 64, bottom: '18%', left: '12%', delay: '3.1s', duration: '7s' },
    { colorClass: 'clay-blob-yellow', size: 54, top: '28%', right: '18%', delay: '1.8s', duration: '8.2s', hideOnMobile: true },
    { colorClass: 'clay-blob-pink', size: 58, bottom: '36%', right: '4%', delay: '4s', duration: '6.8s', hideOnMobile: true },
  ],
  teacher: [
    { colorClass: 'clay-blob-purple', size: 128, top: '8%', right: '6%', delay: '0s', duration: '7.2s' },
    { colorClass: 'clay-blob-pink', size: 84, top: '26%', left: '4%', delay: '1.5s', duration: '7.8s', hideOnMobile: true },
    { colorClass: 'clay-blob-yellow', size: 72, bottom: '16%', right: '12%', delay: '2.2s', duration: '6.6s' },
    { colorClass: 'clay-blob-teal', size: 104, bottom: '10%', left: '8%', delay: '0.7s', duration: '8s' },
    { colorClass: 'clay-blob-pink', size: 56, top: '52%', right: '4%', delay: '3.4s', duration: '7s', hideOnMobile: true },
    { colorClass: 'clay-blob-purple', size: 48, top: '12%', left: '34%', delay: '2.8s', duration: '6.8s', hideOnMobile: true },
  ],
  student: [
    { colorClass: 'clay-blob-teal', size: 128, top: '8%', right: '7%', delay: '0s', duration: '7.4s' },
    { colorClass: 'clay-blob-yellow', size: 82, top: '28%', left: '5%', delay: '1.4s', duration: '7.2s', hideOnMobile: true },
    { colorClass: 'clay-blob-pink', size: 96, bottom: '12%', left: '8%', delay: '2.1s', duration: '8s' },
    { colorClass: 'clay-blob-purple', size: 76, bottom: '18%', right: '10%', delay: '0.9s', duration: '6.9s' },
    { colorClass: 'clay-blob-teal', size: 52, top: '54%', right: '4%', delay: '3.2s', duration: '7.5s', hideOnMobile: true },
    { colorClass: 'clay-blob-yellow', size: 48, top: '14%', left: '32%', delay: '2.6s', duration: '6.5s', hideOnMobile: true },
  ],
  default: [
    { colorClass: 'clay-blob-purple', size: 120, top: '8%', right: '8%', delay: '0s', duration: '7s' },
    { colorClass: 'clay-blob-teal', size: 88, top: '24%', left: '6%', delay: '1.3s', duration: '7.5s' },
    { colorClass: 'clay-blob-pink', size: 96, bottom: '12%', right: '10%', delay: '2.5s', duration: '8s' },
    { colorClass: 'clay-blob-yellow', size: 68, bottom: '20%', left: '10%', delay: '0.8s', duration: '6.8s' },
    { colorClass: 'clay-blob-purple', size: 52, top: '50%', right: '4%', delay: '3.1s', duration: '7.2s', hideOnMobile: true },
    { colorClass: 'clay-blob-pink', size: 46, top: '14%', left: '36%', delay: '1.9s', duration: '6.6s', hideOnMobile: true },
  ],
};

export function PageBackground({ variant = 'default' }: PageBackgroundProps) {
  const blobs = BLOB_PRESETS[variant];

  return (
    <div className="page-bg" aria-hidden="true">
      {blobs.map((blob, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`clay-blob ${blob.colorClass}${blob.hideOnMobile ? ' clay-blob-hide-mobile' : ''}`}
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            bottom: blob.bottom,
            left: blob.left,
            right: blob.right,
            animationDelay: blob.delay,
            animationDuration: blob.duration,
            opacity: 0.72,
          }}
        />
      ))}
    </div>
  );
}
