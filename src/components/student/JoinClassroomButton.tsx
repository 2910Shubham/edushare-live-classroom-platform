'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { trackFeature } from '@/lib/analytics';

export function JoinClassroomButton({ variant = 'default' }: { variant?: 'default' | 'empty' }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      toast.error('Please enter a valid 6-character code');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/classroom', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join');
      }

      toast.success('Joined classroom!');
      void trackFeature('classroom_join', code.trim().toUpperCase());
      setCode('');
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-accent"
        style={{
          display: variant === 'empty' ? 'inline-flex' : 'flex',
          alignItems: 'center',
          gap: 8,
          padding: variant === 'empty' ? '10px 20px' : '10px 20px',
          fontSize: 15,
        }}
      >
        <Plus size={variant === 'empty' ? 16 : 18} />
        Join Classroom
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scaleIn"
            style={{ background: '#FFFFFF', borderRadius: 20, padding: '32px', maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(67,232,216,0.2)' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2D2B55', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Join a Classroom
            </h2>
            <p style={{ color: '#5A5880', fontSize: 14, marginBottom: 24 }}>
              Enter the 6-character code from your teacher
            </p>
            <form onSubmit={handleJoin}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={6}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 12,
                  border: '2px solid rgba(67,232,216,0.3)',
                  background: '#FAFFFE',
                  fontSize: 24,
                  color: '#2D2B55',
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'center',
                  letterSpacing: 8,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: 700,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#43E8D8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(67,232,216,0.3)'; }}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(67,232,216,0.2)', background: '#FFF', color: '#5A5880', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-accent" style={{ flex: 1, padding: '12px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
