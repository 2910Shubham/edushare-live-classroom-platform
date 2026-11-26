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
    padding: '13px 16px',
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="clay-btn clay-btn-sm"
      >
        <Plus size={16} />
        Create
      </button>

      {open && (
        <div
          className="clay-modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-classroom-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="clay clay-lg clay-modal"
            style={{ maxWidth: 440, width: '100%' }}
          >
            <h2
              id="create-classroom-title"
              style={{ fontSize: 22, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 22, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Create Classroom
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label
                  htmlFor="classroom-name-input"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--clay-ink)', marginBottom: 8 }}
                >
                  Classroom Name *
                </label>
                <input
                  id="classroom-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Physics 101"
                  required
                  className="clay-inset"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label
                  htmlFor="classroom-subject-input"
                  style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--clay-ink)', marginBottom: 8 }}
                >
                  Subject (optional)
                </label>
                <input
                  id="classroom-subject-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Science"
                  className="clay-inset"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
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
                  className="clay-btn clay-btn-sm"
                  style={{ flex: 1 }}
                >
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
