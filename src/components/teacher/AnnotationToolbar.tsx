'use client';

import { Pencil, Highlighter, Eraser, Type, Trash2, Save } from 'lucide-react';
import { ToolType } from '@/hooks/useAnnotation';

interface AnnotationToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  onClear: () => void;
  onSave: () => void;
}

const PALETTE = [
  '#7c6cff', // Clay Purple
  '#ff8fc4', // Clay Pink
  '#3fe0cf', // Clay Teal
  '#ffd479', // Clay Yellow
  '#4b3fd1',
  '#14a99a',
  '#2b2a55', // Clay Ink
  '#ffffff', // White
];

export function AnnotationToolbar({
  activeTool,
  setActiveTool,
  color,
  setColor,
  lineWidth,
  setLineWidth,
  onClear,
  onSave,
}: AnnotationToolbarProps) {
  const ToolButton = ({ tool, icon: Icon }: { tool: ToolType; icon: any }) => (
    <button
      type="button"
      onClick={() => setActiveTool(tool)}
      aria-label={`Tool: ${tool}`}
      aria-pressed={activeTool === tool}
      className={activeTool === tool ? 'clay-inset' : undefined}
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        border: 'none',
        background: activeTool === tool ? '#ebe6ff' : 'transparent',
        color: activeTool === tool ? 'var(--clay-purple-dark)' : 'var(--clay-ink-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.18s ease, color 0.18s ease',
      }}
      title={`Tool: ${tool}`}
    >
      <Icon size={20} />
    </button>
  );

  return (
    <div
      className="clay clay-sm"
      style={{
        position: 'absolute',
        left: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: 24,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        zIndex: 20,
      }}
    >
      {/* Tools */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <ToolButton tool="pen" icon={Pencil} />
        <ToolButton tool="highlighter" icon={Highlighter} />
        <ToolButton tool="eraser" icon={Eraser} />
        <ToolButton tool="text" icon={Type} />
      </div>

      <div style={{ height: 1, background: 'rgba(124, 108, 255, 0.14)' }} />

      {/* Colors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '0 4px' }}>
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            style={{
              width: 17,
              height: 17,
              borderRadius: '50%',
              background: c,
              border: c === '#ffffff' ? '1px solid var(--clay-ink-soft)' : 'none',
              cursor: 'pointer',
              boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : '0 2px 4px rgba(43,42,85,0.12)',
              transition: 'transform 0.15s ease',
            }}
          />
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(124, 108, 255, 0.14)' }} />

      {/* Line Width */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {[1, 3, 5].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setLineWidth(w)}
            aria-label={`Stroke width ${w}`}
            className={lineWidth === w ? 'clay-inset' : undefined}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: lineWidth === w ? '#ebe6ff' : 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: w * 2, height: w * 2, borderRadius: '50%', background: lineWidth === w ? 'var(--clay-purple-dark)' : 'var(--clay-ink-soft)' }} />
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(124, 108, 255, 0.14)' }} />

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear all annotations"
          className="clay-btn clay-btn-pink"
          style={{ width: 42, height: 42, padding: 0, borderRadius: 14 }}
          title="Clear All"
        >
          <Trash2 size={18} />
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-label="Save annotations"
          className="clay-btn"
          style={{ width: 42, height: 42, padding: 0, borderRadius: 14 }}
          title="Save Annotations"
        >
          <Save size={18} />
        </button>
      </div>
    </div>
  );
}
