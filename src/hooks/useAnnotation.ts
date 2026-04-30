'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export type ToolType = 'pen' | 'highlighter' | 'eraser' | 'text';

export function useAnnotation() {
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<string>('#6C63FF');
  const [lineWidth, setLineWidth] = useState<number>(3);

  const saveAnnotations = async (canvasData: Record<string, unknown>, materialId: string) => {
    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, data: canvasData }),
      });

      if (res.ok) {
        toast.success('Annotations saved successfully');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to save annotations');
      }
    } catch (err) {
      toast.error('Network error while saving annotations');
    }
  };

  return {
    activeTool,
    setActiveTool,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    saveAnnotations,
  };
}
