'use client';

import dynamic from 'next/dynamic';
import { useSmartBoard } from '@/hooks/useSmartBoard';
import { useAnnotation } from '@/hooks/useAnnotation';
import { AnnotationToolbar } from '../teacher/AnnotationToolbar';
import { Sparkles, Maximize2, Minimize2, Palette, Link2, X, Loader2 } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Material } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DocumentViewer } from './DocumentViewer';

const AnnotationCanvas = dynamic(
  () => import('./AnnotationCanvas').then((mod) => mod.AnnotationCanvas),
  { ssr: false }
);

const BOARD_COLORS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Cream', value: '#FFF8E7' },
  { label: 'Light Green', value: '#E8F5E9' },
  { label: 'Light Blue', value: '#E3F2FD' },
  { label: 'Light Purple', value: '#F3E5F5' },
  { label: 'Dark', value: '#1E1E2E' },
  { label: 'Chalkboard', value: '#2D4A3E' },
  { label: 'Blackboard', value: '#1A1A2E' },
];

interface SmartBoardProps {
  classroomId: string;
  role: 'TEACHER' | 'STUDENT';
}

interface BoardImageState {
  material: Material;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  zIndex: number;
}

export function SmartBoard({ classroomId, role }: SmartBoardProps) {
  const {
    boardImages,
    addImageToBoard,
    removeImageFromBoard,
    clearBoard,
    backgroundColor,
    setBackgroundColor,
  } = useSmartBoard(classroomId, role);

  const [isMaximized, setIsMaximized] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [canvasRef, setCanvasRef] = useState<any>(null);
  const [imageStates, setImageStates] = useState<BoardImageState[]>([]);
  const [dragState, setDragState] = useState<{
    id: string;
    type: 'move' | 'resize';
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<Material | null>(null);
  const [documentViewerMaterial, setDocumentViewerMaterial] = useState<Material | null>(null);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [annotationActive, setAnnotationActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const boardRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const nextZIndex = useRef(10);
  const urlImageCounter = useRef(1);

  const {
    activeTool,
    setActiveTool,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    saveAnnotations,
  } = useAnnotation();

  // When annotation mode is active, images shouldn't be interactive
  const isAnnotating = annotationActive;

  // Sync boardImages → imageStates (add new, remove deleted)
  useEffect(() => {
    setImageStates((prev) => {
      const existing = new Set(prev.map((s) => s.material.id));
      const newStates = [...prev];

      for (const mat of boardImages) {
        if (!existing.has(mat.id)) {
          newStates.push({
            material: mat,
            x: 50 + Math.random() * 100,
            y: 50 + Math.random() * 100,
            width: 300,
            height: 200,
            naturalWidth: 300,
            naturalHeight: 200,
            zIndex: nextZIndex.current++,
          });
        }
      }

      const activeIds = new Set(boardImages.map((m) => m.id));
      return newStates.filter((s) => activeIds.has(s.material.id));
    });
  }, [boardImages]);

  const bringToFront = useCallback((id: string) => {
    setImageStates((prev) =>
      prev.map((s) =>
        s.material.id === id ? { ...s, zIndex: nextZIndex.current++ } : s
      )
    );
  }, []);

  // Pointer handlers for drag/resize (mouse + touch + pen)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, id: string, type: 'move' | 'resize') => {
      if (isAnnotating) return;
      e.preventDefault();
      e.stopPropagation();
      const img = imageStates.find((s) => s.material.id === id);
      if (!img) return;
      bringToFront(id);
      setSelectedImageId(id);

      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}

      setDragState({
        id,
        type,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        origX: img.x,
        origY: img.y,
        origW: img.width,
        origH: img.height,
      });
    },
    [imageStates, bringToFront, isAnnotating]
  );

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== dragState.pointerId) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;

      setImageStates((prev) =>
        prev.map((s) => {
          if (s.material.id !== dragState.id) return s;
          if (dragState.type === 'move') {
            return { ...s, x: dragState.origX + dx, y: dragState.origY + dy };
          } else {
            const newW = Math.max(80, dragState.origW + dx);
            const newH = Math.max(60, dragState.origH + dy);
            return { ...s, width: newW, height: newH };
          }
        })
      );
    };

    const endDrag = (e: PointerEvent) => {
      if (e.pointerId !== dragState.pointerId) return;
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [dragState]);

  const handleClear = () => {
    if (canvasRef) {
      canvasRef.clear();
    }
  };

  const handleSave = () => {
    if (canvasRef) {
      // Export canvas as data URL for download
      const dataUrl = canvasRef.toDataURL({ format: 'png', quality: 1 });
      const link = document.createElement('a');
      link.download = `smartboard-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const isDarkBg = ['#1E1E2E', '#2D4A3E', '#1A1A2E'].includes(backgroundColor);

  // Determine grid pattern color based on bg
  const gridColor = isDarkBg ? 'rgba(255,255,255,0.06)' : 'rgba(108, 99, 255, 0.05)';

  const toggleAnnotation = useCallback(() => {
    setAnnotationActive((prev) => !prev);
    if (!annotationActive) {
      setSelectedImageId(null);
    }
  }, [annotationActive]);

  // Handle clicking empty area to deselect
  const handleBoardClick = useCallback(
    (e: React.MouseEvent) => {
      if (isAnnotating) return;
      if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('board-content')) {
        setSelectedImageId(null);
      }
    },
    [isAnnotating]
  );

  // Listen for materials being sent to / removed from the board via sidebar
  useEffect(() => {
    const handleLocalSet = (e: Event) => {
      const customEvent = e as CustomEvent<Material>;
      if (customEvent.detail) {
        addImageToBoard(customEvent.detail);
      }
    };
    const handleLocalRemove = (e: Event) => {
      const customEvent = e as CustomEvent<Material>;
      if (customEvent.detail) {
        removeImageFromBoard(customEvent.detail.id);
        setSelectedImageId(null);
      }
    };
    window.addEventListener('local:setMaterial', handleLocalSet);
    window.addEventListener('local:removeMaterial', handleLocalRemove);
    return () => {
      window.removeEventListener('local:setMaterial', handleLocalSet);
      window.removeEventListener('local:removeMaterial', handleLocalRemove);
    };
  }, [addImageToBoard, removeImageFromBoard]);

  // Auto-focus URL input when popover opens
  useEffect(() => {
    if (showUrlInput && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [showUrlInput]);

  // Add image from URL
  const handleAddImageFromUrl = useCallback(() => {
    const trimmed = urlValue.trim();
    if (!trimmed) {
      setUrlError('Please enter a URL');
      return;
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      setUrlError('Please enter a valid HTTP/HTTPS URL');
      return;
    }

    setUrlLoading(true);
    setUrlError('');

    // Load the image to validate it and get natural dimensions
    const img = new Image();

    img.onload = () => {
      // Create a pseudo-Material for the URL image
      const pseudoMaterial: Material = {
        id: `url-image-${Date.now()}-${urlImageCounter.current++}`,
        classroomId,
        uploadedById: 'url-import',
        title: parsedUrl.hostname + parsedUrl.pathname.split('/').pop()?.substring(0, 20) || 'Web Image',
        type: 'IMAGE',
        fileUrl: trimmed,
        createdAt: new Date(),
      };

      addImageToBoard(pseudoMaterial);

      // Set natural dimensions in imageStates after a tick
      setTimeout(() => {
        setImageStates((prev) =>
          prev.map((s) =>
            s.material.id === pseudoMaterial.id
              ? {
                  ...s,
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                  width: Math.min(400, img.naturalWidth),
                  height: Math.min(400, img.naturalHeight),
                }
              : s
          )
        );
      }, 50);

      setUrlValue('');
      setUrlLoading(false);
      setShowUrlInput(false);
    };

    img.onerror = () => {
      setUrlError('Could not load image. Check the URL or try a different one.');
      setUrlLoading(false);
    };

    // Set a timeout for slow loads
    const timeout = setTimeout(() => {
      if (urlLoading) {
        setUrlError('Image took too long to load. Try again.');
        setUrlLoading(false);
      }
    }, 15000);

    img.src = trimmed;

    return () => clearTimeout(timeout);
  }, [urlValue, classroomId, addImageToBoard, urlLoading]);

  return (
    <div
      ref={boardRef}
      style={{
        position: isMaximized ? 'fixed' : 'relative',
        top: isMaximized ? 0 : undefined,
        left: isMaximized ? 0 : undefined,
        right: isMaximized ? 0 : undefined,
        bottom: isMaximized ? 0 : undefined,
        width: isMaximized ? '100vw' : '100%',
        height: isMaximized ? '100vh' : '100%',
        minHeight: isMaximized ? undefined : '600px',
        background: backgroundColor,
        borderRadius: isMaximized ? 0 : 24,
        boxShadow: isMaximized ? 'none' : '0 8px 40px rgba(108, 99, 255, 0.08)',
        border: isMaximized ? 'none' : '1px solid rgba(108, 99, 255, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isMaximized ? 9999 : 'auto',
        transition: 'background-color 0.3s ease',
      }}
      onClick={handleBoardClick}
    >
      {/* Grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top bar controls */}
      <div
        className="board-topbar"
        style={{
          position: 'absolute',
          top: 12,
          left: 80,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 25,
          pointerEvents: 'none',
        }}
      >
        {/* Left: Annotation toggle & board info */}
        <div className="board-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
          {/* Add Image from URL button */}
          {role === 'TEACHER' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowUrlInput(!showUrlInput);
                  setUrlError('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: showUrlInput
                    ? 'linear-gradient(135deg, #43E8D8, #36D5C5)'
                    : isDarkBg
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(255,255,255,0.9)',
                  color: showUrlInput ? 'white' : isDarkBg ? '#E0E0FF' : '#2D2B55',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  boxShadow: showUrlInput
                    ? '0 4px 12px rgba(67,232,216,0.3)'
                    : '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                }}
                title="Add image from URL"
              >
                <Link2 size={14} /> URL
              </button>

              {/* URL Input Popover */}
              {showUrlInput && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 8,
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(108,99,255,0.1)',
                    minWidth: 340,
                    zIndex: 100,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2D2B55' }}>Add Image from URL</span>
                    <button
                      onClick={() => { setShowUrlInput(false); setUrlError(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex' }}
                    >
                      <X size={16} color="#A8A6C8" />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      ref={urlInputRef}
                      type="url"
                      placeholder="https://example.com/image.png"
                      value={urlValue}
                      onChange={(e) => { setUrlValue(e.target.value); setUrlError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddImageFromUrl(); }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: urlError ? '1.5px solid #FF4757' : '1.5px solid rgba(108,99,255,0.15)',
                        fontSize: 13,
                        outline: 'none',
                        background: 'rgba(108,99,255,0.03)',
                        color: '#2D2B55',
                        transition: 'border-color 0.2s',
                      }}
                    />
                    <button
                      onClick={handleAddImageFromUrl}
                      disabled={urlLoading}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        border: 'none',
                        background: urlLoading ? '#A8A6C8' : 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
                        color: 'white',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: urlLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(108,99,255,0.25)',
                      }}
                    >
                      {urlLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                      {urlLoading ? 'Loading...' : 'Add'}
                    </button>
                  </div>
                  {urlError && (
                    <p style={{ color: '#FF4757', fontSize: 12, marginTop: 8, fontWeight: 500 }}>{urlError}</p>
                  )}
                  <p style={{ color: '#A8A6C8', fontSize: 11, marginTop: 8 }}>
                    Paste any public image URL. Supports PNG, JPG, GIF, WebP, SVG.
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggleAnnotation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              background: annotationActive
                ? 'linear-gradient(135deg, #6C63FF, #8B5CF6)'
                : isDarkBg
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.9)',
              color: annotationActive ? 'white' : isDarkBg ? '#E0E0FF' : '#2D2B55',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: annotationActive
                ? '0 4px 12px rgba(108,99,255,0.3)'
                : '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}
          >
            ✏️ {annotationActive ? 'Drawing Mode' : 'Draw'}
          </button>
          {imageStates.length > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: isDarkBg ? 'rgba(255,255,255,0.5)' : '#A8A6C8',
                padding: '4px 10px',
                borderRadius: 999,
                background: isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
              }}
            >
              {imageStates.length} image{imageStates.length !== 1 ? 's' : ''} on board
            </span>
          )}
        </div>

        {/* Right: Controls */}
        <div className="board-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
          {/* Background color picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: `2px solid ${isDarkBg ? 'rgba(255,255,255,0.2)' : 'rgba(108,99,255,0.15)'}`,
                background: backgroundColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
              }}
              title="Board Background Color"
            >
              <Palette size={16} color={isDarkBg ? '#E0E0FF' : '#6C63FF'} />
            </button>

            {showColorPicker && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 16,
                  padding: 12,
                  boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(108,99,255,0.1)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                  minWidth: 200,
                  zIndex: 100,
                }}
              >
                {BOARD_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setBackgroundColor(c.value);
                      setShowColorPicker(false);
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: c.value,
                      border:
                        backgroundColor === c.value
                          ? '3px solid #6C63FF'
                          : c.value === '#FFFFFF'
                          ? '1px solid #ddd'
                          : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow:
                        backgroundColor === c.value
                          ? '0 0 0 3px rgba(108,99,255,0.2)'
                          : '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Maximize / Minimize */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: 'none',
              background: isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
            title={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? (
              <Minimize2 size={16} color={isDarkBg ? '#E0E0FF' : '#6C63FF'} />
            ) : (
              <Maximize2 size={16} color={isDarkBg ? '#E0E0FF' : '#6C63FF'} />
            )}
          </button>
        </div>
      </div>

      {/* Annotation Toolbar (left side) */}
      {role === 'TEACHER' && annotationActive && (
        <AnnotationToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          color={color}
          setColor={setColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          onClear={handleClear}
          onSave={handleSave}
        />
      )}

      {/* Content Area — images on the board */}
      <div
        className="board-content"
        style={{
          position: 'relative',
          zIndex: 5,
          flex: 1,
          overflow: 'hidden',
          padding: 0,
        }}
        onClick={handleBoardClick}
      >
        {/* Annotation Layer — always on top when active, INSIDE content area so it covers images */}
        {role === 'TEACHER' && annotationActive && (
          <AnnotationCanvas
            classroomId={classroomId}
            isTeacher={role === 'TEACHER'}
            onCanvasReady={(canvas: any) => setCanvasRef(canvas)}
            activeTool={activeTool}
            color={color}
            lineWidth={lineWidth}
          />
        )}
        {imageStates.length === 0 && !annotationActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ textAlign: 'center', animation: 'float 6s ease-in-out infinite alternate' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: isDarkBg ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Sparkles size={32} color={isDarkBg ? '#A8A6FF' : '#6C63FF'} />
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDarkBg ? '#E0E0FF' : '#2D2B55',
                  marginBottom: 8,
                }}
              >
                Board is empty
              </h3>
              <p style={{ color: isDarkBg ? 'rgba(255,255,255,0.4)' : '#A8A6C8', fontSize: 14 }}>
                {role === 'TEACHER'
                  ? 'Click a material from the sidebar to add it to the board.'
                  : 'Waiting for teacher to share something...'}
              </p>
            </div>
          </div>
        )}

        {/* Draggable / Resizable Images */}
        {imageStates.map((imgState) => {
          const isSelected = selectedImageId === imgState.material.id && !isAnnotating;
          return (
            <div
              key={imgState.material.id}
              style={{
                position: 'absolute',
                left: imgState.x,
                top: imgState.y,
                width: imgState.width,
                height: imgState.height,
                zIndex: imgState.zIndex,
                border: isSelected ? '2px solid #6C63FF' : '1px solid transparent',
                borderRadius: 8,
                overflow: 'hidden',
                cursor: isAnnotating ? 'default' : dragState?.id === imgState.material.id ? 'grabbing' : 'grab',
                boxShadow: isSelected
                  ? '0 0 0 3px rgba(108,99,255,0.2), 0 8px 24px rgba(0,0,0,0.15)'
                  : '0 4px 16px rgba(0,0,0,0.1)',
                transition: dragState?.id === imgState.material.id ? 'none' : 'box-shadow 0.2s, border 0.2s',
                userSelect: 'none',
                touchAction: isAnnotating ? 'auto' : 'none',
                pointerEvents: isAnnotating ? 'none' : 'auto',
              }}
              onPointerDown={(e) => handlePointerDown(e, imgState.material.id, 'move')}
              onClick={(e) => {
                e.stopPropagation();
                if (!isAnnotating) {
                  setSelectedImageId(imgState.material.id);
                  bringToFront(imgState.material.id);
                }
              }}
            >
              {imgState.material.type === 'IMAGE' ? (
                <img
                  src={imgState.material.fileUrl}
                  alt={imgState.material.title}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: isDarkBg ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentViewerMaterial(imgState.material);
                    setIsDocumentViewerOpen(true);
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(108,99,255,0.04)',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(108,99,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(108,99,255,0.04)';
                  }}
                >
                  <span style={{ fontSize: 32 }}>📄</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isDarkBg ? '#E0E0FF' : '#2D2B55',
                      textAlign: 'center',
                      padding: '0 8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}
                  >
                    {imgState.material.title}
                  </span>
                  {/* Click hint */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(108,99,255,0.9)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 500,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    className="document-hint"
                  >
                    Click to open
                  </div>
                </div>
              )}

              {/* Resize handle */}
              {isSelected && (
                <>
                  <div
                    onPointerDown={(e) => handlePointerDown(e, imgState.material.id, 'resize')}
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: 20,
                      height: 20,
                      cursor: 'nwse-resize',
                      background: 'linear-gradient(135deg, transparent 50%, #6C63FF 50%)',
                      borderRadius: '0 0 6px 0',
                      touchAction: 'none',
                    }}
                  />
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImageFromBoard(imgState.material.id);
                      setSelectedImageId(null);
                      // Notify sidebar to uncheck this material
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('local:materialRemovedFromBoard', { detail: imgState.material })
                        );
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#FF4757',
                      color: 'white',
                      border: '2px solid white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: 1,
                      boxShadow: '0 2px 8px rgba(255,71,87,0.4)',
                    }}
                    title="Remove from board"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Universal Document Viewer */}
      <DocumentViewer
        material={documentViewerMaterial}
        isOpen={isDocumentViewerOpen}
        onClose={() => {
          setIsDocumentViewerOpen(false);
          setDocumentViewerMaterial(null);
        }}
      />

      {/* CSS for hover effects */}
      <style jsx>{`
        div:hover .document-hint {
          opacity: 1 !important;
        }
      `}</style>

    </div>
  );
}
