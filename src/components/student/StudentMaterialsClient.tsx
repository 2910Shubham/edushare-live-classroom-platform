'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, Image as ImageIcon, Maximize2, Minimize2, Presentation, X, ZoomIn, ZoomOut } from 'lucide-react';
import { DocumentViewer } from '@/components/smartboard/DocumentViewer';
import type { MaterialType } from '@/types';

type ClientMaterial = {
  id: string;
  title: string;
  type: MaterialType;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
};

function formatDate(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

export function StudentMaterialsClient({ materials }: { materials: ClientMaterial[] }) {
  const [selected, setSelected] = useState<ClientMaterial | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageMax, setImageMax] = useState(false);
  const APP_TOPBAR_OFFSET_PX = 64;

  const isImage = selected?.type === 'IMAGE';

  const documentViewerMaterial = useMemo(() => {
    if (!selected || selected.type === 'IMAGE') return null;
    return {
      ...selected,
      classroomId: 'client',
      uploadedById: 'client',
      createdAt: new Date(selected.createdAt),
    } as any;
  }, [selected]);

  const openPreview = (m: ClientMaterial) => {
    setSelected(m);
    setImageZoom(1);
    setImageMax(false);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {materials.length === 0 ? (
          <p style={{ color: '#A8A6C8', fontSize: 15 }}>No materials have been uploaded yet.</p>
        ) : (
          materials.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => openPreview(m)}
              style={{
                padding: 16,
                border: '1px solid rgba(108,99,255,0.1)',
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                <div
                  aria-hidden
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    border: '1px solid rgba(108,99,255,0.12)',
                    background: 'rgba(108,99,255,0.04)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {m.type === 'IMAGE' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.fileUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : m.type === 'PDF' ? (
                    <FileText size={20} color="#6C63FF" />
                  ) : (
                    <Presentation size={20} color="#FFB347" />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                <h3 style={{ fontWeight: 700, color: '#2D2B55', fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.title}
                </h3>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 13, color: '#5A5880', flexWrap: 'wrap' }}>
                    <span className="badge-subject">{m.type}</span>
                    <span style={{ whiteSpace: 'nowrap' }}>{formatDate(m.createdAt)}</span>
                  </div>
              </div>
              </div>
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: '1px solid rgba(108,99,255,0.15)',
                  background: 'white',
                  fontWeight: 700,
                  color: '#2D2B55',
                  flexShrink: 0,
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
                title="Open / download"
              >
                <Download size={16} />
              </a>
            </button>
          ))
        )}
      </div>

      {/* Preview overlay */}
      {selected && isImage && (
        <div
          className="student-material-preview-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 20000,
            display: 'flex',
            alignItems: imageMax ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: imageMax ? 0 : 10,
          }}
          onPointerDown={(e) => {
            // Only close when tapping the backdrop (prevents "tap-through" reopening)
            if (e.target === e.currentTarget) {
              setImageMax(false);
              setSelected(null);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`student-material-preview-card ${imageMax ? 'is-max' : ''}`}
            style={{
              width: imageMax ? '100vw' : '92vw',
              height: imageMax
                ? `calc(100vh - env(safe-area-inset-top, 0px) - ${APP_TOPBAR_OFFSET_PX}px)`
                : '88vh',
              maxWidth: imageMax ? '100vw' : 1200,
              background: 'white',
              borderRadius: imageMax ? 0 : 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: imageMax ? 'none' : '0 25px 50px rgba(0,0,0,0.25)',
              marginTop: imageMax
                ? `calc(env(safe-area-inset-top, 0px) + ${APP_TOPBAR_OFFSET_PX}px)`
                : 0,
            }}
          >
            <div
              className="student-material-preview-header"
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid #e5e7eb',
                background: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
              }}
            >
              <div
                className="student-material-preview-titleRow"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#1f2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selected.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.type}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <a
                    href={selected.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="student-material-preview-openBtn"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(108,99,255,0.2)',
                      background: 'white',
                      fontWeight: 800,
                      color: '#2D2B55',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Download size={16} />
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImageMax((v) => !v);
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: '1px solid #d1d5db',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={imageMax ? 'Minimize' : 'Maximize'}
                  >
                    {imageMax ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImageMax(false);
                      setSelected(null);
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: 'none',
                      background: '#ef4444',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div
                className="student-material-preview-controlsRow"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 2,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <button
                  type="button"
                  onClick={() => setImageZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <div
                  style={{
                    minWidth: 64,
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#374151',
                    flexShrink: 0,
                  }}
                >
                  {Math.round(imageZoom * 100)}%
                </div>
                <button
                  type="button"
                  onClick={() => setImageZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageZoom(1);
                  }}
                  style={{
                    height: 36,
                    padding: '0 10px',
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 900,
                    color: '#374151',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                  title="Reset zoom"
                >
                  Reset
                </button>
            </div>
            </div>

            <div
              className="student-material-preview-body"
              style={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                background: '#f3f4f6',
              }}
            >
              <div
                style={{
                  padding: 12,
                  minHeight: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <img
                  src={selected.fileUrl}
                  alt={selected.title}
                  style={{
                    transform: `scale(${imageZoom})`,
                    transformOrigin: 'top center',
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 12,
                    background: 'white',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document preview uses existing viewer */}
      {selected && !isImage && (
        <DocumentViewer
          material={documentViewerMaterial}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
        />
      )}

      <style jsx>{`
        /* Make the card feel larger on phones, with safe-area padding */
        @media (max-width: 520px) {
          .student-material-preview-overlay {
            padding: 0;
          }
          /* Only force fullscreen layout when maximized */
          .student-material-preview-card.is-max {
            width: 100vw !important;
            height: calc(100vh - env(safe-area-inset-top, 0px) - 64px) !important;
            max-width: 100vw !important;
            border-radius: 0 !important;
            margin-top: calc(env(safe-area-inset-top, 0px) + 64px) !important;
          }
          .student-material-preview-openBtn {
            padding: 8px 10px !important;
          }
        }
      `}</style>
    </>
  );
}

