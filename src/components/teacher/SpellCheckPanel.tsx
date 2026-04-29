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
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 999,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 8px 32px rgba(108, 99, 255, 0.3)',
          cursor: 'pointer',
          zIndex: 50,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Wand2 size={18} />
        AI Assistant
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 320,
        background: '#FFFFFF',
        borderRadius: 20,
        boxShadow: '0 12px 48px rgba(108, 99, 255, 0.2)',
        border: '1px solid rgba(108, 99, 255, 0.1)',
        zIndex: 50,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="animate-scaleIn"
    >
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(108,99,255,0.05) 0%, rgba(67,232,216,0.05) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(108,99,255,0.05)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2B55', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wand2 size={18} color="#6C63FF" />
          AI Spell Check
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A6C8' }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here to check spelling and grammar before sharing..."
          style={{
            width: '100%',
            height: 100,
            padding: 12,
            borderRadius: 12,
            border: '1px solid rgba(108,99,255,0.2)',
            outline: 'none',
            resize: 'none',
            fontSize: 14,
            color: '#2D2B55',
            fontFamily: "'Inter', sans-serif",
            marginBottom: 16,
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(108,99,255,0.2)'}
        />

        <button
          onClick={handleCheck}
          disabled={!text.trim() || isChecking}
          className="btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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
          <div style={{ marginTop: 20, animation: 'fadeInUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#0CA89A', fontSize: 13, fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              Corrected Text
            </div>
            <div style={{ padding: 12, background: 'rgba(67,232,216,0.05)', borderRadius: 12, border: '1px solid rgba(67,232,216,0.2)', fontSize: 14, color: '#2D2B55', lineHeight: 1.5 }}>
              {correctedText}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(correctedText);
                toast.success('Copied to clipboard');
              }}
              className="btn-secondary"
              style={{ width: '100%', marginTop: 12, padding: '8px 16px', fontSize: 13 }}
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
