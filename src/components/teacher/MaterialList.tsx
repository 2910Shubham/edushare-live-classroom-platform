'use client';

import { Material } from '@/types';
import { Share2, Image, FileText, Presentation, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { trackBoard, trackButton } from '@/lib/analytics';

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
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<Material | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
          void trackBoard('board_remove_material', classroomId, material.title);
          window.dispatchEvent(
            new CustomEvent('local:removeMaterial', { detail: material })
          );
        } else {
          void trackBoard('board_add_material', classroomId, material.title);
          window.dispatchEvent(
            new CustomEvent('local:setMaterial', { detail: material })
          );
        }
      }, 0);

      return next;
    });
  }, [classroomId]);

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

  const handleDelete = useCallback(async (material: Material) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/materials/${material.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Delete API Error:', error);
        
        // Show detailed error for debugging
        if (error.debug) {
          throw new Error(`${error.error} (Debug: User ID: ${error.debug.currentUserId}, Teacher ID: ${error.debug.classroomTeacherId})`);
        } else {
          throw new Error(error.error || 'Failed to delete material');
        }
      }

      const result = await response.json();
      console.log('Delete result:', result);

      // Remove from local state
      setMaterials(prev => prev.filter(m => m.id !== material.id));
      
      // Remove from addedIds if it was on the board
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(material.id);
        return next;
      });

      // Dispatch event to remove from SmartBoard if it was displayed
      window.dispatchEvent(
        new CustomEvent('local:removeMaterial', { detail: material })
      );

      console.log(`Successfully deleted material: ${material.title}`);
    } catch (error) {
      console.error('Error deleting material:', error);
      alert(`Failed to delete material: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
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
      className="clay clay-md"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--clay-ink)',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Share2 size={18} color="var(--clay-purple-dark)" />
        Shared Materials
      </h3>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {materials.length === 0 ? (
          <p
            style={{
              color: 'var(--clay-ink-soft)',
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
                className="clay-row"
                style={{
                  padding: 12,
                  background: isAdded ? '#e3fbf6' : '#faf8ff',
                  borderColor: isAdded ? 'rgba(20, 169, 154, 0.45)' : undefined,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
                onClick={() => toggleOnBoard(material)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: isAdded ? '#06453f' : 'var(--clay-ink)',
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
                      color: isAdded ? '#0b6e64' : 'var(--clay-ink-soft)',
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isAdded && (
                    <CheckCircle2
                      size={18}
                      color="var(--clay-teal-dark)"
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void trackButton('material_delete_click', material.title, { classroomId });
                      setDeleteConfirm(material);
                    }}
                    aria-label={`Delete ${material.title}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      border: 'none',
                      backgroundColor: '#ffebf0',
                      color: '#b4233c',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      flexShrink: 0,
                    }}
                    title="Delete material"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          className="clay-modal-backdrop"
          style={{ zIndex: 1000 }}
          onClick={() => !isDeleting && setDeleteConfirm(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-material-title"
        >
          <div
            className="clay clay-lg clay-modal"
            style={{ maxWidth: 420, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div
                className="clay-icon clay-icon-pink"
                style={{ width: 48, height: 48, borderRadius: '50%' }}
                aria-hidden="true"
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 id="delete-material-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--clay-ink)' }}>
                  Delete Material
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--clay-ink-soft)' }}>
                  Are you sure you want to delete &ldquo;{deleteConfirm.title}&rdquo;?
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--clay-ink-soft)', lineHeight: 1.55 }}>
                This action cannot be undone. The material will be permanently deleted from both the platform and Cloudinary storage.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => !isDeleting && setDeleteConfirm(null)}
                disabled={isDeleting}
                className="clay-btn clay-btn-ghost clay-btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="clay-btn clay-btn-pink clay-btn-sm"
              >
                {isDeleting ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add spinner animation styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
