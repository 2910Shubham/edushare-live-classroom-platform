'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Presentation, X, ZoomIn, ZoomOut } from 'lucide-react';
import { DocumentViewer } from '@/components/smartboard/DocumentViewer';
import type { MaterialType } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { trackFeature, trackButton } from '@/lib/analytics';

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
  const APP_TOPBAR_OFFSET_PX = 64;

  const isImage = selected?.type === 'IMAGE';
  const isPreviewOpen = !!selected;

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
    void trackFeature('material_preview_open', m.title, {
      metadata: { type: m.type, materialId: m.id },
    });
  };

  // Deterministic state whenever a new item opens
  useEffect(() => {
    if (!selected) return;
    setImageZoom(1);
  }, [selected?.id]);

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
                onClick={(e) => {
                  e.stopPropagation();
                  void trackButton('material_download', m.title, {
                    metadata: { materialId: m.id, type: m.type },
                  });
                }}
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
      <Dialog
        open={isPreviewOpen && isImage}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="student-image-preview-dialog"
        >
          {selected && isImage && (
            <div className="student-image-preview">
              <div className="student-image-preview__header">
                <div className="student-image-preview__title">
                  <div className="student-image-preview__name">{selected.title}</div>
                  <div className="student-image-preview__meta">{selected.type}</div>
                </div>
                <div className="student-image-preview__actions">
                  <a
                    href={selected.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="student-image-preview__open"
                    onClick={(e) => e.stopPropagation()}
                    title="Open / download"
                  >
                    <Download size={16} />
                    <span className="student-image-preview__openText">Open</span>
                  </a>
                  <button
                    type="button"
                    className="student-image-preview__closeBtn"
                    onClick={() => {
                      setSelected(null);
                    }}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="student-image-preview__controls">
                <button
                  type="button"
                  className="student-image-preview__iconBtn"
                  onClick={() => setImageZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <div className="student-image-preview__zoom">{Math.round(imageZoom * 100)}%</div>
                <button
                  type="button"
                  className="student-image-preview__iconBtn"
                  onClick={() => setImageZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))}
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  className="student-image-preview__reset"
                  onClick={() => setImageZoom(1)}
                  title="Reset zoom"
                >
                  Reset
                </button>
              </div>

              <div className="student-image-preview__body">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.fileUrl}
                  alt={selected.title}
                  className="student-image-preview__img"
                  style={{
                    transform: `scale(${imageZoom})`,
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document preview uses existing viewer */}
      {selected && !isImage && (
        <DocumentViewer
          material={documentViewerMaterial}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
        />
      )}

      <style jsx>{`
        :global(.student-image-preview-dialog) {
          width: calc(100vw - 20px) !important;
          max-width: 1100px !important;
          height: 86vh !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        .student-image-preview {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 16px;
          overflow: hidden;
        }

        .student-image-preview__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .student-image-preview__title {
          min-width: 0;
        }
        .student-image-preview__name {
          font-size: 14px;
          font-weight: 800;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 58vw;
        }
        .student-image-preview__meta {
          font-size: 12px;
          color: #6b7280;
        }

        .student-image-preview__actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .student-image-preview__open {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(108, 99, 255, 0.2);
          background: white;
          color: #2d2b55;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .student-image-preview__iconBtn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .student-image-preview__closeBtn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: #ef4444;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .student-image-preview__controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #ffffff;
          border-bottom: 1px solid #f0f1f4;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .student-image-preview__zoom {
          min-width: 64px;
          text-align: center;
          font-size: 12px;
          font-weight: 900;
          color: #374151;
          flex-shrink: 0;
        }

        .student-image-preview__reset {
          height: 36px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 900;
          color: #374151;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .student-image-preview__body {
          flex: 1;
          min-height: 0;
          overflow: auto;
          background: #f3f4f6;
          padding: 12px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .student-image-preview__img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          background: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
          transform-origin: top center;
        }

        @media (max-width: 520px) {
          :global(.student-image-preview-dialog) {
            width: 100vw !important;
            max-width: 100vw !important;
            height: calc(100vh - env(safe-area-inset-top, 0px) - ${APP_TOPBAR_OFFSET_PX}px) !important;
            margin-top: calc(env(safe-area-inset-top, 0px) + ${APP_TOPBAR_OFFSET_PX}px) !important;
            border-radius: 0 !important;
          }
          .student-image-preview {
            border-radius: 0;
          }
          .student-image-preview__openText {
            display: none;
          }
          .student-image-preview__name {
            max-width: 52vw;
          }
        }
      `}</style>
    </>
  );
}

