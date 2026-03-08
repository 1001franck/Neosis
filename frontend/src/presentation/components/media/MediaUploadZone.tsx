/**
 * MEDIA UPLOAD ZONE COMPONENT
 * Zone de drag & drop pour upload de fichiers
 * 
 * Responsabilités:
 * - UI de la zone de drop
 * - Affichage des previews
 * - Délègue la logique au hook useFileUpload
 */

'use client';

import { memo } from 'react';
import { useFileUpload } from './hooks/useFileUpload';
import { formatFileSize } from '@shared/utils/format';
import { 
  DEFAULT_ACCEPTED_TYPES, 
  DEFAULT_MAX_SIZE, 
  DEFAULT_MAX_FILES 
} from '@shared/constants/upload';
import { BACKGROUND_COLORS } from '@shared/constants/app';

interface MediaUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  maxFiles?: number;
}

const MediaUploadZoneComponent = ({
  onUpload,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  maxFiles = DEFAULT_MAX_FILES
}: MediaUploadZoneProps): React.ReactElement => {
  const {
    isDragging,
    previews,
    isUploading,
    fileInputRef,
    handleFiles,
    removePreview,
    clearPreviews,
    handleUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useFileUpload({
    acceptedTypes,
    maxSizeBytes,
    maxFiles,
    onUpload,
  });

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-primary bg-primary/10 scale-105'
            : `border-[${BACKGROUND_COLORS.MUTED}] hover:border-primary hover:bg-card`
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <svg
          className={`w-16 h-16 mx-auto mb-4 transition-colors ${
            isDragging ? 'text-primary' : 'text-muted-foreground'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        
        <p className="text-white font-medium mb-1">
          {isDragging ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers'}
        </p>
        <p className="text-sm text-muted-foreground">
          ou cliquez pour sélectionner
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Max {maxFiles} fichiers • {formatFileSize(maxSizeBytes)} max par fichier
        </p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground font-medium">
              {previews.length} fichier(s) sélectionné(s)
            </p>
            <button
              onClick={clearPreviews}
              className="text-xs text-[#f23f42] hover:text-[#f04747] transition-colors"
            >
              Tout supprimer
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview) => (
              <div key={preview.id} className="relative group">
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  className="w-full aspect-square object-cover rounded"
                />
                <button
                  onClick={() => removePreview(preview.id)}
                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                  <p className="text-xs text-white truncate">{preview.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(preview.file.size)}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
          >
            {isUploading ? 'Upload en cours...' : `Uploader ${previews.length} fichier(s)`}
          </button>
        </div>
      )}
    </div>
  );
};

export const MediaUploadZone = memo(MediaUploadZoneComponent);

