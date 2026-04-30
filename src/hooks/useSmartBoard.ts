'use client';

import { useState, useCallback } from 'react';
import { Material } from '@/types';

export function useSmartBoard(classroomId: string, role: 'TEACHER' | 'STUDENT') {
  const [boardImages, setBoardImages] = useState<Material[]>([]);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');

  const addImageToBoard = useCallback((material: Material) => {
    setBoardImages((prev) => {
      // Don't add duplicates
      if (prev.some((m) => m.id === material.id)) return prev;
      return [...prev, material];
    });
  }, []);

  const removeImageFromBoard = useCallback((materialId: string) => {
    setBoardImages((prev) => prev.filter((m) => m.id !== materialId));
  }, []);

  const clearBoard = useCallback(() => {
    setBoardImages([]);
  }, []);

  return {
    boardImages,
    setBoardImages,
    addImageToBoard,
    removeImageFromBoard,
    clearBoard,
    backgroundColor,
    setBackgroundColor,
  };
}
