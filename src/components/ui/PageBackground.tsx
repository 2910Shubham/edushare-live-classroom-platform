'use client';

import React from 'react';

type Variant = 'teacher' | 'student' | 'auth' | 'default';

interface PageBackgroundProps {
  variant?: Variant;
}

const COLORS = {
  teacher: {
    primary: '#6C63FF',
    secondary: '#FF6B9D',
    tertiary: '#8B5CF6',
  },
  student: {
    primary: '#43E8D8',
    secondary: '#36D5C5',
    tertiary: '#6C63FF',
  },
  auth: {
    primary: '#6C63FF',
    secondary: '#FF6B9D',
    tertiary: '#43E8D8',
  },
  default: {
    primary: '#6C63FF',
    secondary: '#43E8D8',
    tertiary: '#FFB347',
  },
};

export function PageBackground({ variant = 'default' }: PageBackgroundProps) {
  const colors = COLORS[variant];

  return (
    <div className="page-bg">
      {/* Large circle ring */}
      <svg
        style={{
          position: 'absolute',
          top: '8%',
          right: '12%',
          width: 180,
          height: 180,
          opacity: 0.06,
          animation: 'float 8s ease-in-out infinite alternate',
          animationDelay: '0s',
          willChange: 'transform',
        }}
        viewBox="0 0 180 180"
      >
        <circle cx="90" cy="90" r="80" fill="none" stroke={colors.primary} strokeWidth="3" />
      </svg>

      {/* Star polygon */}
      <svg
        style={{
          position: 'absolute',
          top: '25%',
          left: '8%',
          width: 40,
          height: 40,
          opacity: 0.08,
          animation: 'spin-slow 25s linear infinite',
          animationDelay: '1.5s',
          willChange: 'transform',
        }}
        viewBox="0 0 40 40"
      >
        <polygon
          points="20,2 25,15 38,15 27,24 31,37 20,29 9,37 13,24 2,15 15,15"
          fill={colors.secondary}
        />
      </svg>

      {/* Rounded square rotated */}
      <svg
        style={{
          position: 'absolute',
          top: '60%',
          right: '25%',
          width: 60,
          height: 60,
          opacity: 0.07,
          animation: 'float 10s ease-in-out infinite alternate',
          animationDelay: '3s',
          willChange: 'transform',
        }}
        viewBox="0 0 60 60"
      >
        <rect
          x="10"
          y="10"
          width="40"
          height="40"
          rx="8"
          fill={colors.primary}
          transform="rotate(45 30 30)"
        />
      </svg>

      {/* Wavy line */}
      <svg
        style={{
          position: 'absolute',
          top: '40%',
          left: '15%',
          width: 200,
          height: 40,
          opacity: 0.05,
          animation: 'drift 12s ease-in-out infinite alternate',
          animationDelay: '4.5s',
          willChange: 'transform',
        }}
        viewBox="0 0 200 40"
      >
        <path
          d="M0 20 Q25 0 50 20 T100 20 T150 20 T200 20"
          fill="none"
          stroke={colors.tertiary}
          strokeWidth="2.5"
        />
      </svg>

      {/* Small filled circles cluster */}
      <svg
        style={{
          position: 'absolute',
          top: '15%',
          left: '55%',
          width: 20,
          height: 20,
          opacity: 0.10,
          animation: 'float 6s ease-in-out infinite alternate',
          animationDelay: '6s',
          willChange: 'transform',
        }}
        viewBox="0 0 20 20"
      >
        <circle cx="10" cy="10" r="10" fill={colors.secondary} />
      </svg>

      {/* Triangle */}
      <svg
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: 50,
          height: 50,
          opacity: 0.06,
          animation: 'float 7s ease-in-out infinite alternate',
          animationDelay: '2s',
          willChange: 'transform',
        }}
        viewBox="0 0 50 50"
      >
        <polygon points="25,5 45,45 5,45" fill="none" stroke={colors.primary} strokeWidth="2" />
      </svg>

      {/* Large ring bottom left */}
      <svg
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: 120,
          height: 120,
          opacity: 0.04,
          animation: 'spin-slow 40s linear infinite',
          animationDelay: '0s',
          willChange: 'transform',
        }}
        viewBox="0 0 120 120"
      >
        <circle cx="60" cy="60" r="50" fill="none" stroke={colors.tertiary} strokeWidth="2" />
      </svg>

      {/* Dotted circle */}
      <svg
        style={{
          position: 'absolute',
          top: '70%',
          right: '8%',
          width: 80,
          height: 80,
          opacity: 0.06,
          animation: 'drift 9s ease-in-out infinite alternate',
          animationDelay: '5s',
          willChange: 'transform',
        }}
        viewBox="0 0 80 80"
      >
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      </svg>

      {/* Small star */}
      <svg
        style={{
          position: 'absolute',
          top: '50%',
          left: '40%',
          width: 24,
          height: 24,
          opacity: 0.08,
          animation: 'spin-slow 30s linear infinite',
          animationDelay: '3.5s',
          willChange: 'transform',
        }}
        viewBox="0 0 24 24"
      >
        <polygon
          points="12,1 15,9 23,9 17,14 19,23 12,18 5,23 7,14 1,9 9,9"
          fill={colors.primary}
        />
      </svg>

      {/* Plus / Cross */}
      <svg
        style={{
          position: 'absolute',
          top: '35%',
          right: '40%',
          width: 30,
          height: 30,
          opacity: 0.07,
          animation: 'float 11s ease-in-out infinite alternate',
          animationDelay: '7s',
          willChange: 'transform',
        }}
        viewBox="0 0 30 30"
      >
        <line x1="15" y1="5" x2="15" y2="25" stroke={colors.tertiary} strokeWidth="3" strokeLinecap="round" />
        <line x1="5" y1="15" x2="25" y2="15" stroke={colors.tertiary} strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* Diamond shape */}
      <svg
        style={{
          position: 'absolute',
          bottom: '35%',
          right: '55%',
          width: 35,
          height: 35,
          opacity: 0.06,
          animation: 'drift 10s ease-in-out infinite alternate',
          animationDelay: '8s',
          willChange: 'transform',
        }}
        viewBox="0 0 35 35"
      >
        <polygon points="17.5,2 33,17.5 17.5,33 2,17.5" fill="none" stroke={colors.secondary} strokeWidth="2" />
      </svg>

      {/* Extra small circles for auth variant */}
      {variant === 'auth' && (
        <>
          <svg
            style={{
              position: 'absolute',
              top: '80%',
              left: '30%',
              width: 14,
              height: 14,
              opacity: 0.12,
              animation: 'float 5s ease-in-out infinite alternate',
              animationDelay: '1s',
              willChange: 'transform',
            }}
            viewBox="0 0 14 14"
          >
            <circle cx="7" cy="7" r="7" fill="#FFB347" />
          </svg>
          <svg
            style={{
              position: 'absolute',
              top: '5%',
              left: '35%',
              width: 16,
              height: 16,
              opacity: 0.10,
              animation: 'drift 7s ease-in-out infinite alternate',
              animationDelay: '9s',
              willChange: 'transform',
            }}
            viewBox="0 0 16 16"
          >
            <circle cx="8" cy="8" r="8" fill="#43E8D8" />
          </svg>
        </>
      )}
    </div>
  );
}
