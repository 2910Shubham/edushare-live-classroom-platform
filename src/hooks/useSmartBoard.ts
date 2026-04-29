'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { Material } from '@/types';
import { toast } from 'sonner';

export function useSmartBoard(classroomId: string, role: 'TEACHER' | 'STUDENT') {
  const { socket, isConnected } = useSocket();
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join room
    socket.emit('join:classroom', { classroomId, role });

    // Listeners
    socket.on('board:setMaterial', (data: { classroomId: string; material: Material }) => {
      if (data.classroomId === classroomId) {
        setActiveMaterial(data.material);
        if (role === 'STUDENT') {
          toast.info('Teacher changed the board material');
        }
      }
    });

    socket.on('material:new', (material: Material) => {
      if (material.classroomId === classroomId && role === 'STUDENT') {
        toast.success(`New material uploaded: ${material.title}`);
      }
    });

    socket.on('presence:update', (data: { classroomId: string; count: number }) => {
      if (data.classroomId === classroomId) {
        setStudentCount(data.count);
      }
    });

    return () => {
      socket.off('board:setMaterial');
      socket.off('material:new');
      socket.off('presence:update');
    };
  }, [socket, isConnected, classroomId, role]);

  return { activeMaterial, setActiveMaterial, socket, isConnected, studentCount };
}
