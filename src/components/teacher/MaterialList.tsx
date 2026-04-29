'use client';

import { Material } from '@/types';
import { Share2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useState } from 'react';

export function MaterialList({ initialMaterials, classroomId }: { initialMaterials: Material[], classroomId: string }) {
  const { socket, isConnected } = useSocket();
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);

  const setMaterial = (material: Material) => {
    setActiveMaterialId(material.id);
    if (socket && isConnected) {
      socket.emit('board:setMaterial', { classroomId, material });
    }
  };

  return (
    <div className="edu-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2B55', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Share2 size={18} color="#6C63FF" />
        Shared Materials
      </h3>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {materials.length === 0 ? (
          <p style={{ color: '#A8A6C8', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            No materials shared yet. Upload a file above to share it with the class.
          </p>
        ) : (
          materials.map((material) => (
            <div 
              key={material.id}
              style={{
                padding: 12,
                background: activeMaterialId === material.id ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.03)',
                borderRadius: 12,
                border: `1px solid ${activeMaterialId === material.id ? 'rgba(108,99,255,0.3)' : 'rgba(108,99,255,0.08)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: activeMaterialId === material.id ? 'translateX(4px)' : 'translateX(0)'
              }}
              onMouseEnter={(e) => {
                if (activeMaterialId !== material.id) {
                  e.currentTarget.style.background = 'rgba(108,99,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMaterialId !== material.id) {
                  e.currentTarget.style.background = 'rgba(108,99,255,0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
              onClick={() => setMaterial(material)}
            >
              <p style={{ fontWeight: 600, fontSize: 14, color: activeMaterialId === material.id ? '#6C63FF' : '#2D2B55', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {material.title}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A8A6C8' }}>
                <span className={activeMaterialId === material.id ? 'badge-subject' : ''} style={{ padding: activeMaterialId === material.id ? '2px 6px' : 0 }}>
                  {material.type}
                </span>
                <span>{new Date(material.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
