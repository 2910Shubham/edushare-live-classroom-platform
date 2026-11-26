'use client';

import { useState } from 'react';
import { Wand2, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export function SpellCheckPanel() {
  const [text, setText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setCorrectedText('');

    try {
      const res = await fetch('/api/ai/spell-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        setCorrectedText(data.corrected);
      } else {
        toast.error('Failed to check spelling');
      }
    } catch (err) {
      toast.error('Network error during spell check');
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="clay-btn clay-btn-sm"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          borderRadius: 999,
          zIndex: 50,
        }}
      >
        <Wand2 size={18} />
        AI Assistant
      </button>
    );
  }

  return (
    <div
      className="clay clay-modal"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 330,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 50,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          background: '#f6f3ff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(124, 108, 255, 0.12)',
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--clay-ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wand2 size={18} color="var(--clay-purple-dark)" />
          AI Spell Check
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close AI Spell Check"
          style={{
            background: '#ffffff',
            border: 'none',
            borderRadius: 10,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--clay-ink-soft)',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here to check spelling and grammar before sharing..."
          className="clay-inset"
          style={{
            width: '100%',
            height: 100,
            padding: 12,
            resize: 'none',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            marginBottom: 16,
          }}
        />

        <button
          type="button"
          onClick={handleCheck}
          disabled={!text.trim() || isChecking}
          className="clay-btn clay-btn-sm"
          style={{ width: '100%' }}
        >
          {isChecking ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Checking...
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Check Text
            </>
          )}
        </button>

        {correctedText && (
          <div style={{ marginTop: 18 }} className="animate-fadeInUp">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#06453f', fontSize: 13, fontWeight: 700 }}>
              <CheckCircle2 size={16} color="var(--clay-teal-dark)" />
              Corrected Text
            </div>
            <div className="clay-row" style={{ padding: 12, background: '#e7fbf7', borderColor: 'rgba(20, 169, 154, 0.3)', fontSize: 14, color: 'var(--clay-ink)', lineHeight: 1.5 }}>
              {correctedText}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(correctedText);
                toast.success('Copied to clipboard');
              }}
              className="clay-btn clay-btn-ghost clay-btn-sm"
              style={{ width: '100%', marginTop: 12 }}
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
