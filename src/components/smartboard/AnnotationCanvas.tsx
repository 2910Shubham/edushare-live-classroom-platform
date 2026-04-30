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

    // When a path is created by the eraser brush, mark it with
    // globalCompositeOperation = 'destination-out' so it visually
    // cuts through all previously drawn content — just like a real eraser.
    // This only removes the exact pixels under the eraser stroke.
    canvas.on('path:created', (e: any) => {
      if (activeToolRef.current === 'eraser' && e.path) {
        e.path.globalCompositeOperation = 'destination-out';
        e.path.selectable = false;
        e.path.evented = false;
        canvas.renderAll();
      }
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
      }
    } else if (activeTool === 'eraser') {
      // Eraser uses drawing mode with a special brush.
      // The path:created handler above applies 'destination-out'
      // composite operation so it cuts through existing annotations
      // pixel-by-pixel — only erasing the exact portion dragged over.
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='${lineWidth * 5 + 4}' height='${lineWidth * 5 + 4}' viewBox='0 0 ${lineWidth * 5 + 4} ${lineWidth * 5 + 4}'><circle cx='${(lineWidth * 5 + 4) / 2}' cy='${(lineWidth * 5 + 4) / 2}' r='${(lineWidth * 5) / 2}' fill='none' stroke='%236C63FF' stroke-width='1.5' stroke-dasharray='3,2'/></svg>`
      )}") ${(lineWidth * 5 + 4) / 2} ${(lineWidth * 5 + 4) / 2}, crosshair`;
      if (fabricCanvas.freeDrawingBrush) {
        // Color doesn't matter visually since we use destination-out,
        // but it needs to be opaque for the composite op to work
        fabricCanvas.freeDrawingBrush.color = 'rgba(0,0,0,1)';
        fabricCanvas.freeDrawingBrush.width = lineWidth * 5;
      }
    } else {
      // text, rectangle, circle tools
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'crosshair';
      fabricCanvas.hoverCursor = 'crosshair';
    }
  }, [fabricCanvas, activeTool, color, lineWidth, isTeacher]);

  // Handle Object Creation Tools (Rect, Circle, Text)
  useEffect(() => {
    if (!fabricCanvas || !isTeacher) return;

    const handleCanvasClick = (options: fabric.IEvent) => {
      if (
        activeTool === 'pen' ||
        activeTool === 'highlighter' ||
        activeTool === 'eraser'
      )
        return;
      if (!options.pointer) return;

      if (activeTool === 'text') {
        const text = new fabric.IText('Text', {
          left: options.pointer.x,
          top: options.pointer.y,
          fontFamily: 'Inter',
          fill: color,
          fontSize: 24 * (lineWidth / 3),
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
      } else if (activeTool === 'rectangle') {
        const rect = new fabric.Rect({
          left: options.pointer.x,
          top: options.pointer.y,
          fill: 'transparent',
          stroke: color,
          strokeWidth: lineWidth,
          width: 100,
          height: 100,
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
      } else if (activeTool === 'circle') {
        const circle = new fabric.Circle({
          left: options.pointer.x,
          top: options.pointer.y,
          fill: 'transparent',
          stroke: color,
          strokeWidth: lineWidth,
          radius: 50,
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
      }
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
