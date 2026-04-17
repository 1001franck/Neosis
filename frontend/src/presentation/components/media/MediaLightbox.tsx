/**
 * MEDIA LIGHTBOX COMPONENT
 * Modal pour afficher les images/vidéos en plein écran
 *
 * Fonctionnalités:
 * - Navigation gauche/droite avec flèches
 * - Fermeture avec ESC ou clic backdrop
 * - Actions: Download, Copier lien, Ouvrir dans nouvel onglet
 * - Affichage metadata (auteur, date, nom)
 * - Support images et vidéos
 * - Zoom et pan pour les images
 */

'use client';

import { memo, useEffect, useRef } from 'react';
import { useToast } from '@presentation/components/toast/ToastProvider';
import { useMediaZoom } from '@presentation/hooks/useMediaZoom';
import { useKeyboardNavigation } from '@presentation/hooks/useKeyboardNavigation';
import { copyToClipboard, downloadFile } from '@shared/utils/clipboard';
import { openInNewTab } from '@shared/utils/browser';
import { formatDate } from '@shared/utils/date';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  thumbnail?: string;
  name: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface MediaLightboxProps {
  media: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const MediaLightboxComponent = ({
  media,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious
}: MediaLightboxProps): React.ReactNode => {
  const currentMedia = media?.[currentIndex] ?? null;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < (media?.length ?? 0) - 1;
  const { toast } = useToast();
  const isVideo = currentMedia?.type === 'video';
  const imageRef = useRef<HTMLImageElement>(null);

  // Zoom & pan logic
  const {
    zoom,
    position,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleMouseDown,
  } = useMediaZoom();

  // Keyboard navigation
  useKeyboardNavigation({
    isActive: isOpen && !!currentMedia,
    onEscape: onClose,
    onArrowLeft: hasPrevious ? onPrevious : undefined,
    onArrowRight: hasNext ? onNext : undefined
  });

  /**
   * Bloquer le scroll du body quand lightbox ouverte
   */
  useEffect(() => {
    if (isOpen && currentMedia) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, currentMedia]);

  // Early return AFTER all hooks
  if (!isOpen || !currentMedia) return null;

  /**
   * Actions sur le média
   */
  const handleDownload = (): void => {
    downloadFile(currentMedia.url, currentMedia.name);
    toast.success(`"${currentMedia.name}" téléchargé !`, 3000);
  };

  const handleCopyLink = async (): Promise<void> => {
    const success = await copyToClipboard(currentMedia.url);
    if (success) {
      toast.success('Lien copié dans le presse-papier', 2000);
    } else {
      toast.error('Échec de la copie du lien', 3000);
    }
  };

  const handleOpenInNewTab = (): void => {
    openInNewTab(currentMedia.url);
    toast.info('Ouvert dans un nouvel onglet', 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fadeIn">
      {/* Backdrop - Click to close */}
      <button
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Fermer"
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-foreground transition-colors hover-scale"
        aria-label="Fermer"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      {hasPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-smooth hover-lift"
          aria-label="Précédent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-smooth hover-lift"
          aria-label="Suivant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Media container */}
      <div className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col animate-scaleIn">
        {/* Media content */}
        <div className="flex-1 flex items-center justify-center mb-4">
          {isVideo ? (
            <video
              src={currentMedia.url}
              controls
              autoPlay
              className="max-w-full max-h-[70vh] rounded"
            />
          ) : (
            <div className="relative overflow-hidden">
              <img
                ref={imageRef}
                src={currentMedia.url}
                alt={currentMedia.name}
                onMouseDown={handleMouseDown}
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
                className="max-w-full max-h-[70vh] object-contain rounded select-none"
              />

              {/* Zoom controls */}
              {!isVideo && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 rounded-lg p-2">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="p-2 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="RÃ©duire le zoom"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>

                  <span className="text-white text-sm font-medium min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>

                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Agrandir le zoom"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </button>

                  <button
                    onClick={handleResetZoom}
                    className="p-2 text-white hover:bg-white/20 rounded transition-colors"
                    aria-label="RÃ©initialiser le zoom"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Media info & actions */}
        <div className="bg-card rounded-lg p-4 w-full sm:min-w-[400px]">
          {/* Header with filename */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate mb-1">
                {currentMedia.name}
              </h3>
              <p className="text-muted-foreground text-sm">
                Partagé par <span className="text-white">{currentMedia.uploadedBy}</span>
                {' • '}
                {formatDate(currentMedia.uploadedAt)}
              </p>
            </div>

            {/* Counter */}
            <div className="text-muted-foreground text-sm ml-4">
              {currentIndex + 1} / {media.length}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded transition-smooth hover-lift"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM12 17L7 12L8.414 10.586L11 13.172V7H13V13.172L15.586 10.586L17 12L12 17Z" />
              </svg>
              TÃ©lÃ©charger
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-[#5c5e66] text-white rounded transition-smooth hover-lift"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
              </svg>
              Copier le lien
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-[#5c5e66] text-white rounded transition-smooth hover-lift"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" />
              </svg>
              Ouvrir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MediaLightbox = memo(MediaLightboxComponent);
