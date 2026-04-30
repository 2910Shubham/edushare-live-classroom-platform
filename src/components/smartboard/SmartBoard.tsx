'use client';

import dynamic from 'next/dynamic';
import { useSmartBoard } from '@/hooks/useSmartBoard';
import { useAnnotation } from '@/hooks/useAnnotation';
import { AnnotationToolbar } from '../teacher/AnnotationToolbar';
import { Sparkles, Maximize2, Minimize2, Palette } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Material } from '@/types';

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
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [annotationActive, setAnnotationActive] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const nextZIndex = useRef(10);

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

  // Mouse handlers for drag/resize
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string, type: 'move' | 'resize') => {
      if (isAnnotating) return;
      e.preventDefault();
      e.stopPropagation();
      const img = imageStates.find((s) => s.material.id === id);
      if (!img) return;
      bringToFront(id);
      setSelectedImageId(id);
      setDragState({
        id,
        type,
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

    const handleMouseMove = (e: MouseEvent) => {
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

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
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
                pointerEvents: isAnnotating ? 'none' : 'auto',
              }}
              onMouseDown={(e) => handleMouseDown(e, imgState.material.id, 'move')}
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
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(108,99,255,0.04)',
                    gap: 8,
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
                </div>
              )}

              {/* Resize handle */}
              {isSelected && (
                <>
                  <div
                    onMouseDown={(e) => handleMouseDown(e, imgState.material.id, 'resize')}
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: 20,
                      height: 20,
                      cursor: 'nwse-resize',
                      background: 'linear-gradient(135deg, transparent 50%, #6C63FF 50%)',
                      borderRadius: '0 0 6px 0',
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


    </div>
  );
}
