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
  '#6C63FF', // Primary
  '#FF6B9D', // Secondary
  '#43E8D8', // Accent
  '#FFB347', // Warm
  '#8B5CF6',
  '#36D5C5',
  '#2D2B55', // Black/Dark
  '#FFFFFF', // White
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
      onClick={() => setActiveTool(tool)}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: 'none',
        background: activeTool === tool ? 'rgba(108,99,255,0.1)' : 'transparent',
        color: activeTool === tool ? '#6C63FF' : '#5A5880',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      title={`Tool: ${tool}`}
    >
      <Icon size={20} />
    </button>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(108, 99, 255, 0.15)',
        border: '1px solid rgba(108, 99, 255, 0.1)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
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

      <div style={{ height: 1, background: 'rgba(108,99,255,0.1)' }} />

      {/* Colors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '0 4px' }}>
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: c,
              border: c === '#FFFFFF' ? '1px solid #A8A6C8' : 'none',
              cursor: 'pointer',
              boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(108,99,255,0.1)' }} />

      {/* Line Width */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {[1, 3, 5].map((w) => (
          <button
            key={w}
            onClick={() => setLineWidth(w)}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: lineWidth === w ? 'rgba(108,99,255,0.1)' : 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: w * 2, height: w * 2, borderRadius: '50%', background: lineWidth === w ? '#6C63FF' : '#5A5880' }} />
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(108,99,255,0.1)' }} />

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onClear}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: 'none',
            background: 'rgba(255,71,87,0.1)',
            color: '#FF4757',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Clear All"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={onSave}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
          }}
          title="Save Annotations"
        >
          <Save size={20} />
        </button>
      </div>
    </div>
  );
}
