'use client';

import { Material } from '@/types';
import { Share2, Image, FileText, Presentation, CheckCircle2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

// Stable date formatter that won't cause hydration mismatch
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

export function MaterialList({
  initialMaterials,
  classroomId,
}: {
  initialMaterials: Material[];
  classroomId: string;
}) {
  const [materials] = useState<Material[]>(initialMaterials);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const toggleOnBoard = useCallback((material: Material) => {
    setAddedIds((prev) => {
      const next = new Set(prev);
      const shouldRemove = next.has(material.id);

      if (shouldRemove) {
        next.delete(material.id);
      } else {
        next.add(material.id);
      }

      // Defer event dispatch to avoid setState-during-render warning.
      // The CustomEvent is synchronous and would trigger SmartBoard's
      // setBoardImages during this component's render cycle.
      setTimeout(() => {
        if (shouldRemove) {
          window.dispatchEvent(
            new CustomEvent('local:removeMaterial', { detail: material })
          );
        } else {
          window.dispatchEvent(
            new CustomEvent('local:setMaterial', { detail: material })
          );
        }
      }, 0);

      return next;
    });
  }, []);

  // Listen for external removals (e.g. from the board's X button)
  useEffect(() => {
    const handleExternalRemove = (e: Event) => {
      const customEvent = e as CustomEvent<Material>;
      if (customEvent.detail) {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(customEvent.detail.id);
          return next;
        });
      }
    };
    window.addEventListener('local:materialRemovedFromBoard', handleExternalRemove);
    return () => {
      window.removeEventListener('local:materialRemovedFromBoard', handleExternalRemove);
    };
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image size={14} />;
      case 'PDF':
        return <FileText size={14} />;
      case 'PPT':
        return <Presentation size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  return (
    <div
      className="edu-card"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#2D2B55',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Share2 size={18} color="#6C63FF" />
        Shared Materials
      </h3>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {materials.length === 0 ? (
          <p
            style={{
              color: '#A8A6C8',
              fontSize: 14,
              textAlign: 'center',
              padding: '20px 0',
            }}
          >
            No materials shared yet. Upload a file above to share it with the
            class.
          </p>
        ) : (
          materials.map((material) => {
            const isAdded = addedIds.has(material.id);
            return (
              <div
                key={material.id}
                style={{
                  padding: 12,
                  background: isAdded
                    ? 'rgba(67,232,216,0.08)'
                    : 'rgba(108,99,255,0.03)',
                  borderRadius: 12,
                  border: `1px solid ${
                    isAdded
                      ? 'rgba(67,232,216,0.3)'
                      : 'rgba(108,99,255,0.08)'
                  }`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
                onMouseEnter={(e) => {
                  if (!isAdded) {
                    e.currentTarget.style.background =
                      'rgba(108,99,255,0.08)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdded) {
                    e.currentTarget.style.background =
                      'rgba(108,99,255,0.03)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
                onClick={() => toggleOnBoard(material)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: isAdded ? '#0CA89A' : '#2D2B55',
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {material.title}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: '#A8A6C8',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {getTypeIcon(material.type)}
                      {material.type}
                    </span>
                    <span>
                      {formatDate(material.createdAt)}
                    </span>
                  </div>
                </div>

                {isAdded && (
                  <CheckCircle2
                    size={18}
                    color="#43E8D8"
                    style={{ flexShrink: 0 }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
