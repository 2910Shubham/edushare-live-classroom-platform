'use client';

import dynamic from 'next/dynamic';
import { useSmartBoard } from '@/hooks/useSmartBoard';
import { useAnnotation } from '@/hooks/useAnnotation';
import { AnnotationToolbar } from '../teacher/AnnotationToolbar';

// Dynamically import components that rely on browser APIs (fabric, canvas, etc.)
const PDFViewer = dynamic(() => import('./PDFViewer').then(mod => mod.PDFViewer), { ssr: false });
const AnnotationCanvas = dynamic(() => import('./AnnotationCanvas').then(mod => mod.AnnotationCanvas), { ssr: false });
import { Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SmartBoardProps {
  classroomId: string;
  role: 'TEACHER' | 'STUDENT';
}

export function SmartBoard({ classroomId, role }: SmartBoardProps) {
  const { activeMaterial, socket, isConnected, studentCount } = useSmartBoard(classroomId, role);
  const [currentPage, setCurrentPage] = useState(1);
  const [canvasRef, setCanvasRef] = useState<any>(null);

  const {
    activeTool,
    setActiveTool,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    saveAnnotations,
  } = useAnnotation();

  // Listen to remote page changes
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    const handlePageChange = (data: { classroomId: string; page: number }) => {
      if (data.classroomId === classroomId) {
        setCurrentPage(data.page);
      }
    };
    
    socket.on('board:pageChange', handlePageChange);
    return () => {
      socket.off('board:pageChange', handlePageChange);
    };
  }, [socket, isConnected, classroomId]);

  const handleLocalPageChange = (page: number) => {
    setCurrentPage(page);
    if (role === 'TEACHER' && socket && isConnected) {
      socket.emit('board:pageChange', { classroomId, page });
    }
  };

  const handleClear = () => {
    if (socket && isConnected) {
      socket.emit('annotation:clear', { classroomId });
    }
    if (canvasRef) {
      canvasRef.clear();
    }
  };

  const handleSave = () => {
    if (canvasRef && activeMaterial) {
      saveAnnotations(canvasRef.toJSON(), activeMaterial.id);
    }
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        minHeight: '600px',
        background: '#FFFFFF',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(108, 99, 255, 0.08)',
        border: '1px solid rgba(108, 99, 255, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Grid background */}
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none', zIndex: 0 }} />

      {/* Top Indicators */}
      <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 20, pointerEvents: 'none' }}>
        {role === 'TEACHER' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            backdropFilter: 'blur(8px)',
            padding: '6px 12px', 
            borderRadius: 999, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid rgba(108,99,255,0.1)'
          }}>
            <Users size={14} color="#6C63FF" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2D2B55' }}>
              {studentCount} live
            </span>
          </div>
        )}
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div 
            style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              background: isConnected ? '#43E8D8' : '#FFB347',
              boxShadow: `0 0 0 3px ${isConnected ? 'rgba(67,232,216,0.2)' : 'rgba(255,179,71,0.2)'}`
            }} 
          />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#A8A6C8' }}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {role === 'TEACHER' && isConnected && (
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

      {/* Content Area */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {!activeMaterial ? (
          <div style={{ textAlign: 'center', animation: 'float 6s ease-in-out infinite alternate' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(108,99,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Sparkles size={32} color="#6C63FF" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#2D2B55', marginBottom: 8 }}>
              Board is empty
            </h3>
            <p style={{ color: '#A8A6C8', fontSize: 14 }}>
              {role === 'TEACHER' ? 'Select a material to share it with the class.' : 'Waiting for teacher to share something...'}
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {activeMaterial.type === 'PDF' && (
              <PDFViewer 
                url={activeMaterial.fileUrl} 
                readOnly={role === 'STUDENT'} 
                currentPage={currentPage}
                onPageChange={handleLocalPageChange}
              />
            )}
            
            {activeMaterial.type === 'IMAGE' && (
              <img 
                src={activeMaterial.fileUrl} 
                alt={activeMaterial.title}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(108,99,255,0.1)'
                }} 
              />
            )}
            
            {/* PPT or TEXT fallback */}
            {['PPT', 'TEXT'].includes(activeMaterial.type) && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2D2B55', marginBottom: 8 }}>{activeMaterial.title}</h3>
                <p style={{ color: '#A8A6C8' }}>This file type must be downloaded to view.</p>
                <a href={activeMaterial.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>
                  Download File
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Annotation Layer */}
      {isConnected && (
        <AnnotationCanvas 
          classroomId={classroomId} 
          socket={socket} 
          isTeacher={role === 'TEACHER'}
          onCanvasReady={(canvas) => setCanvasRef(canvas)}
          activeTool={activeTool}
          color={color}
          lineWidth={lineWidth}
        />
      )}
    </div>
  );
}
