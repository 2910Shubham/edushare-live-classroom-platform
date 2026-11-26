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
        type="button"
        onClick={() => setOpen(true)}
        className="clay-btn clay-btn-teal clay-btn-sm"
      >
        <Plus size={variant === 'empty' ? 16 : 18} />
        Join Classroom
      </button>

      {open && (
        <div
          className="clay-modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-classroom-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="clay clay-lg clay-modal"
            style={{ maxWidth: 410, width: '100%' }}
          >
            <h2
              id="join-classroom-title"
              style={{ fontSize: 22, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Join a Classroom
            </h2>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 14, marginBottom: 22 }}>
              Enter the 6-character code from your teacher
            </p>
            <form onSubmit={handleJoin}>
              <label htmlFor="join-code-input" className="sr-only">
                6-character classroom join code
              </label>
              <input
                id="join-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={6}
                required
                className="clay-inset"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: 24,
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'center',
                  letterSpacing: 8,
                  fontWeight: 700,
                }}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="clay-btn clay-btn-ghost clay-btn-sm"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="clay-btn clay-btn-teal clay-btn-sm"
                  style={{ flex: 1 }}
                >
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
