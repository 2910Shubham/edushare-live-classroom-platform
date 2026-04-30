'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { ToolType } from '@/hooks/useAnnotation';

interface AnnotationCanvasProps {
  classroomId: string;
  isTeacher: boolean;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  activeTool?: ToolType;
  color?: string;
  lineWidth?: number;
}

export function AnnotationCanvas({
  classroomId,
  isTeacher,
  onCanvasReady,
  activeTool = 'pen',
  color = '#6C63FF',
  lineWidth = 3,
}: AnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const activeToolRef = useRef<ToolType>(activeTool);
  const isErasingRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: false,
      selection: false,
      backgroundColor: 'transparent',
    });

    const resizeCanvas = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        canvas.setWidth(w);
        canvas.setHeight(h);
        canvas.renderAll();
      }
    };

    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(container);

    resizeCanvas();
    const rafId = requestAnimationFrame(() => {
      resizeCanvas();
    });

    setFabricCanvas(canvas);
    if (onCanvasReady) onCanvasReady(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher]);

  // Update Drawing Mode & Brush Settings based on active tool
  useEffect(() => {
    if (!fabricCanvas || !isTeacher) return;

    if (activeTool === 'pen') {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = color;
        fabricCanvas.freeDrawingBrush.width = lineWidth;
        // Reset any globalCompositeOperation override from eraser mode
        const brush = fabricCanvas.freeDrawingBrush as any;
        if (brush._origSetBrushStyles) {
          brush._setBrushStyles = brush._origSetBrushStyles;
          delete brush._origSetBrushStyles;
        }
      }
    } else if (activeTool === 'highlighter') {
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
      if (fabricCanvas.freeDrawingBrush) {
        const hexToRgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r},${g},${b},0.3)`;
        };
        fabricCanvas.freeDrawingBrush.color = color.startsWith('#')
          ? hexToRgb(color)
          : color;
        fabricCanvas.freeDrawingBrush.width = lineWidth * 3;
        const brush = fabricCanvas.freeDrawingBrush as any;
        if (brush._origSetBrushStyles) {
          brush._setBrushStyles = brush._origSetBrushStyles;
          delete brush._origSetBrushStyles;
        }
      }
    } else if (activeTool === 'eraser') {
      // Eraser: use drawing mode but override the brush to render with
      // globalCompositeOperation 'destination-out'. This makes the stroke
      // invisible on the top canvas (no black) and erases annotations
      // on the main canvas where dragged — pixel by pixel.
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = false;

      // Custom eraser cursor — dashed circle showing eraser size
      const eraserSize = lineWidth * 5 + 4;
      fabricCanvas.freeDrawingCursor = `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='${eraserSize}' height='${eraserSize}' viewBox='0 0 ${eraserSize} ${eraserSize}'><circle cx='${eraserSize / 2}' cy='${eraserSize / 2}' r='${(eraserSize - 4) / 2}' fill='rgba(108,99,255,0.08)' stroke='%236C63FF' stroke-width='1.5' stroke-dasharray='3,2'/></svg>`
      )}") ${eraserSize / 2} ${eraserSize / 2}, crosshair`;

      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = 'rgba(0,0,0,1)';
        fabricCanvas.freeDrawingBrush.width = lineWidth * 5;

        // Override _setBrushStyles to set destination-out on the context
        // so the stroke is transparent DURING drawing (no black flash)
        const brush = fabricCanvas.freeDrawingBrush as any;
        if (!brush._origSetBrushStyles) {
          brush._origSetBrushStyles = brush._setBrushStyles;
        }
        brush._setBrushStyles = function (ctx: CanvasRenderingContext2D) {
          brush._origSetBrushStyles.call(this, ctx);
          ctx.globalCompositeOperation = 'destination-out';
        };
      }
    } else {
      // text tool
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
      fabricCanvas.hoverCursor = 'crosshair';
    }
  }, [fabricCanvas, activeTool, color, lineWidth, isTeacher]);

  // Mark eraser paths with destination-out on the final path object
  useEffect(() => {
    if (!fabricCanvas) return;

    const handlePathCreated = (e: any) => {
      if (activeToolRef.current === 'eraser' && e.path) {
        e.path.globalCompositeOperation = 'destination-out';
        e.path.selectable = false;
        e.path.evented = false;
        fabricCanvas.renderAll();
      }
    };

    fabricCanvas.on('path:created', handlePathCreated);
    return () => {
      fabricCanvas.off('path:created', handlePathCreated);
    };
  }, [fabricCanvas]);

  // Handle Text tool (click to add text)
  useEffect(() => {
    if (!fabricCanvas || !isTeacher) return;

    const handleCanvasClick = (options: fabric.IEvent) => {
      if (activeTool !== 'text') return;
      if (!options.pointer) return;

      const text = new fabric.IText('Text', {
        left: options.pointer.x,
        top: options.pointer.y,
        fontFamily: 'Inter',
        fill: color,
        fontSize: 24 * (lineWidth / 3),
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    };

    fabricCanvas.on('mouse:down', handleCanvasClick);
    return () => {
      fabricCanvas.off('mouse:down', handleCanvasClick);
    };
  }, [fabricCanvas, activeTool, color, lineWidth, isTeacher]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1000,
        pointerEvents: isTeacher ? 'auto' : 'none',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
