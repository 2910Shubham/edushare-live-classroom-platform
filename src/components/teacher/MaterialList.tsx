'use client';

import { Material } from '@/types';
import { Share2, Image, FileText, Presentation, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isAdded && (
                    <CheckCircle2
                      size={18}
                      color="#43E8D8"
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(material);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
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
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !isDeleting && setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
                  Delete Material
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  Are you sure you want to delete "{deleteConfirm.title}"?
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
                This action cannot be undone. The material will be permanently deleted from both the platform and Cloudinary storage.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => !isDeleting && setDeleteConfirm(null)}
                disabled={isDeleting}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isDeleting ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isDeleting ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
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
