'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function CreateClassroomButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), subject: subject.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create classroom');
      }

      toast.success('Classroom created!');
      setName('');
      setSubject('');
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(108, 99, 255, 0.15)',
    background: '#FAFAFE',
    fontSize: 15,
    color: '#2D2B55',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14 }}
      >
        <Plus size={16} />
        Create
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scaleIn"
            style={{ background: '#FFFFFF', borderRadius: 20, padding: '32px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(108,99,255,0.2)' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2D2B55', marginBottom: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Create Classroom
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#2D2B55', marginBottom: 6 }}>
                  Classroom Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Physics 101"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.15)'; }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#2D2B55', marginBottom: 6 }}>
                  Subject (optional)
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Science"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.15)'; }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(108,99,255,0.15)', background: '#FFF', color: '#5A5880', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
