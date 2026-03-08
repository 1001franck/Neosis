/**
 * MESSAGE ATTACHMENTS COMPONENT
 * Affiche les pièces jointes d'un message (images, vidéos, fichiers)
 * 
 * Responsabilités:
 * - Preview d'images avec lightbox
 * - Player vidéo inline
 * - Liens de téléchargement pour les fichiers
 */

'use client';

import { useState, memo } from 'react';
import type { Attachment } from '@domain/messages/types';

interface MessageAttachmentsProps {
  attachments: Attachment[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageAttachmentsComponent({ attachments }: MessageAttachmentsProps): React.ReactElement | null {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => a.mimeType.startsWith('image/'));
  const videos = attachments.filter((a) => a.mimeType.startsWith('video/'));
  const audios = attachments.filter((a) => a.mimeType.startsWith('audio/'));
  const files = attachments.filter(
    (a) => !a.mimeType.startsWith('image/') && !a.mimeType.startsWith('video/') && !a.mimeType.startsWith('audio/')
  );

  return (
    <>
      {/* Images Grid */}
      {images.length > 0 && (
        <div className={`mt-1 flex flex-wrap gap-1 ${images.length === 1 ? '' : 'max-w-md'}`}>
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setLightboxUrl(img.url)}
              className="block rounded-md overflow-hidden hover:opacity-90 transition-opacity"
            >
              <img
                src={img.url}
                alt={img.name}
                className="max-w-xs max-h-64 object-cover rounded-md"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Videos */}
      {videos.map((vid) => (
        <div key={vid.id} className="mt-1 max-w-md">
          <video
            src={vid.url}
            controls
            preload="metadata"
            className="rounded-md max-h-64 w-full"
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
          <p className="text-xs text-muted-foreground mt-0.5">{vid.name}</p>
        </div>
      ))}

      {/* Audio */}
      {audios.map((aud) => (
        <div key={aud.id} className="mt-1 max-w-sm">
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <audio src={aud.url} controls preload="metadata" className="h-8 flex-1" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{aud.name}</p>
        </div>
      ))}

      {/* Files */}
      {files.map((file) => (
        <a
          key={file.id}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          download={file.name}
          className="mt-1 flex items-center gap-3 bg-secondary/50 hover:bg-secondary/70 rounded-lg p-3 max-w-sm transition-colors"
        >
          <svg className="w-8 h-8 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-primary font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      ))}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightboxUrl(null)}
            aria-label="Fermer"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxUrl}
            alt="AperÃ§u"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export const MessageAttachments = memo(MessageAttachmentsComponent);
