'use client';

import { Download, FileText, Presentation } from 'lucide-react';
import type { MaterialType } from '@/types';
import { trackButton } from '@/lib/analytics';
import { MaterialPreviewOverlay, type PreviewMaterial } from '@/components/material/MaterialPreviewOverlay';
import { useState } from 'react';

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
  const [selected, setSelected] = useState<PreviewMaterial | null>(null);

  const openPreview = (m: ClientMaterial) => {
    setSelected({
      id: m.id,
      title: m.title,
      type: m.type,
      fileUrl: m.fileUrl,
      createdAt: m.createdAt,
      mimeType: m.mimeType,
    });
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

      <MaterialPreviewOverlay
        material={selected}
        onClose={() => setSelected(null)}
        analyticsSource="student"
      />
    </>
  );
}
