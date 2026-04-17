/**
 * HOOK: useFileUpload
 * Logique réutilisable pour upload de fichiers avec preview
 * 
 * Responsabilités:
 * - Gestion drag & drop
 * - Validation de fichiers
 * - Previews avec ObjectURL
 * - État d'upload
 */

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@presentation/components/toast/ToastProvider';
import { formatFileSize } from '@shared/utils/format';
import { logger } from '@shared/utils/logger';

export interface FilePreview {
  file: File;
  url: string;
  id: string;
}

interface UseFileUploadOptions {
  acceptedTypes: string[];
  maxSizeBytes: number;
  maxFiles: number;
  onUpload: (files: File[]) => Promise<void>;
}

interface UseFileUploadReturn {
  // State
  isDragging: boolean;
  previews: FilePreview[];
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  
  // Actions
  handleFiles: (files: FileList | null) => void;
  removePreview: (id: string) => void;
  clearPreviews: () => void;
  handleUpload: () => Promise<void>;
  
  // Drag handlers
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

/**
 * Valider un fichier
 */
function validateFile(
  file: File,
  acceptedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (!acceptedTypes.includes(file.type)) {
    return { valid: false, error: `Type de fichier non accepté: ${file.type}` };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Fichier trop volumineux: ${formatFileSize(file.size)} (max: ${formatFileSize(maxSize)})` 
    };
  }
  
  return { valid: true };
}

/**
 * Hook pour gérer l'upload de fichiers avec preview
 */
export function useFileUpload({
  acceptedTypes,
  maxSizeBytes,
  maxFiles,
  onUpload,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Créer les previews des fichiers
   */
  const createPreviews = useCallback((files: File[]): void => {
    const newPreviews: FilePreview[] = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(2)
    }));
    
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  /**
   * Nettoyer les previews
   */
  const clearPreviews = useCallback((): void => {
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviews([]);
  }, [previews]);

  /**
   * Retirer une preview
   */
  const removePreview = useCallback((id: string): void => {
    setPreviews(prev => {
      const preview = prev.find(p => p.id === id);
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
      return prev.filter(p => p.id !== id);
    });
  }, []);

  /**
   * Gérer les fichiers sélectionnés
   */
  const handleFiles = useCallback((files: FileList | null): void => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Vérifier le nombre max
    if (previews.length + fileArray.length > maxFiles) {
      toast.error(`Vous ne pouvez pas uploader plus de ${maxFiles} fichiers`, 3000);
      return;
    }
    
    // Valider chaque fichier
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      const validation = validateFile(file, acceptedTypes, maxSizeBytes);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(validation.error || 'Fichier invalide', 3000);
      }
    }
    
    if (validFiles.length > 0) {
      createPreviews(validFiles);
      toast.success(`${validFiles.length} fichier(s) ajouté(s)`, 2000);
    }
  }, [previews.length, maxFiles, acceptedTypes, maxSizeBytes, createPreviews, toast]);

  /**
   * Drag & Drop handlers
   */
  const handleDragEnter = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  /**
   * Upload les fichiers
   */
  const handleUpload = async (): Promise<void> => {
    if (previews.length === 0) return;
    
    setIsUploading(true);
    try {
      const files = previews.map(p => p.file);
      await onUpload(files);
      toast.success('Fichiers uploadés avec succès !', 3000);
      clearPreviews();
    } catch (error) {
      toast.error('Erreur lors de l\'upload', 3000);
      logger.error('Upload failed', { error });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    // State
    isDragging,
    previews,
    isUploading,
    fileInputRef,
    
    // Actions
    handleFiles,
    removePreview,
    clearPreviews,
    handleUpload,
    
    // Drag handlers
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
