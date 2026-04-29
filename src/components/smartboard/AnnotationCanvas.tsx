'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Socket } from 'socket.io-client';
import { ToolType } from '@/hooks/useAnnotation';

interface AnnotationCanvasProps {
  classroomId: string;
  socket: Socket | null;
  isTeacher: boolean;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  activeTool?: ToolType;
  color?: string;
  lineWidth?: number;
}

export function AnnotationCanvas({
  classroomId,
  socket,
  isTeacher,
  onCanvasReady,
  activeTool = 'pen',
  color = '#6C63FF',
  lineWidth = 3,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: isTeacher && activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser',
      selection: isTeacher,
      backgroundColor: 'transparent',
    });

    const resizeCanvas = () => {
      const parent = canvasRef.current?.parentElement;
      if (parent) {
        canvas.setWidth(parent.clientWidth);
        canvas.setHeight(parent.clientHeight);
        canvas.renderAll();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    setFabricCanvas(canvas);
    if (onCanvasReady) onCanvasReady(canvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher]);

  // Update Drawing Mode & Brush Settings
  useEffect(() => {
    if (!fabricCanvas || !isTeacher) return;

    if (activeTool === 'pen') {
      fabricCanvas.isDrawingMode = true;
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = color;
        fabricCanvas.freeDrawingBrush.width = lineWidth;
      }
    } else if (activeTool === 'highlighter') {
      fabricCanvas.isDrawingMode = true;
      if (fabricCanvas.freeDrawingBrush) {
        // Semi-transparent color for highlighter
        const hexToRgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r},${g},${b},0.3)`;
        };
        fabricCanvas.freeDrawingBrush.color = color.startsWith('#') ? hexToRgb(color) : color;
        fabricCanvas.freeDrawingBrush.width = lineWidth * 3;
      }
    } else if (activeTool === 'eraser') {
      fabricCanvas.isDrawingMode = true;
      // Eraser brush config (requires specific plugin or workaround in fabric.js)
      // Since basic fabric.js doesn't have an eraser natively that deletes lines, we simulate by drawing white or global composite
      // A common workaround is a thick white line for whiteboards, but since background is transparent...
      // We will rely on object selection deletion for eraser tool if possible, but let's implement a white brush for now.
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = '#FFFFFF';
        fabricCanvas.freeDrawingBrush.width = lineWidth * 5;
      }
    } else {
      fabricCanvas.isDrawingMode = false;
    }
  }, [fabricCanvas, activeTool, color, lineWidth, isTeacher]);

  // Handle Socket Events & Broadcasting
  useEffect(() => {
    if (!socket || !fabricCanvas) return;

    const handlePathCreated = (e: any) => {
      if (isTeacher && e.path) {
        socket.emit('annotation:stroke', { classroomId, path: e.path.toJSON() });
      }
    };

    const handleObjectAdded = (e: any) => {
      // Broadcast non-path objects (rects, circles, text)
      if (isTeacher && e.target && e.target.type !== 'path') {
        socket.emit('annotation:stroke', { classroomId, path: e.target.toJSON() });
      }
    };

    const handleRemoteStroke = (data: { classroomId: string; path: any }) => {
      if (data.classroomId === classroomId && !isTeacher) {
        fabric.util.enlivenObjects([data.path], (objects: fabric.Object[]) => {
          objects.forEach((obj) => {
            fabricCanvas.add(obj);
          });
          fabricCanvas.renderAll();
        }, "fabric");
      }
    };

    const handleClear = (data: { classroomId: string }) => {
      if (data.classroomId === classroomId) {
        fabricCanvas.clear();
      }
    };

    if (isTeacher) {
      fabricCanvas.on('path:created', handlePathCreated);
      fabricCanvas.on('object:added', handleObjectAdded);
    }

    socket.on('annotation:stroke', handleRemoteStroke);
    socket.on('annotation:clear', handleClear);

    return () => {
      if (isTeacher) {
        fabricCanvas.off('path:created', handlePathCreated);
        fabricCanvas.off('object:added', handleObjectAdded);
      }
      socket.off('annotation:stroke', handleRemoteStroke);
      socket.off('annotation:clear', handleClear);
    };
  }, [socket, fabricCanvas, classroomId, isTeacher]);

  // Handle Object Creation Tools (Rect, Circle, Text)
  useEffect(() => {
    if (!fabricCanvas || !isTeacher) return;

    const handleCanvasClick = (options: fabric.IEvent<MouseEvent>) => {
      if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') return;
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
  }, [fabricCanvas, activeTool, color, lineWidth, isTeacher, onCanvasReady]); // Need a way to set active tool back if needed, but skipping for now or passing it as a callback

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: isTeacher ? 'auto' : 'none' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
