/**
 * MEDIA CONTEXT MENU HOOK
 * Gère le context menu pour les médias avec actions (download, copy, open, delete)
 */

import React, { useState, useCallback } from 'react';
import { useToast } from '@presentation/components/toast/ToastProvider';
import type { ContextMenuItem } from '@presentation/components/common';
import type { ChannelMedia } from '../types';

interface ContextMenuState {
  x: number;
  y: number;
  mediaId: string;
}

interface UseMediaContextMenuReturn {
  contextMenu: ContextMenuState | null;
  setContextMenu: (state: ContextMenuState | null) => void;
  handleContextMenu: (e: React.MouseEvent, mediaId: string) => void;
  getContextMenuItems: (mediaId: string) => ContextMenuItem[];
}

export function useMediaContextMenu(filteredMedia: ChannelMedia[]): UseMediaContextMenuReturn {
  const { toast } = useToast();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  /**
   * Ouvrir le context menu à la position du clic
   */
  const handleContextMenu = useCallback((e: React.MouseEvent, mediaId: string): void => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      mediaId
    });
  }, []);

  /**
   * Exécuter une action du context menu
   */
  const handleContextMenuAction = useCallback((action: string, mediaId: string) => {
    const media = filteredMedia.find(m => m.id === mediaId);
    if (!media) return;

    switch (action) {
      case 'open':
        window.open(media.url, '_blank', 'noopener,noreferrer');
        toast.info('Ouvert dans un nouvel onglet', 2000);
        break;

      case 'download':
        const link = document.createElement('a');
        link.href = media.url;
        link.download = media.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`"${media.name}" téléchargé !`, 3000);
        break;
      
      case 'copy':
        navigator.clipboard.writeText(media.url).then(() => {
          toast.success('Lien copié dans le presse-papier', 2000);
        }).catch(() => {
          toast.error('Échec de la copie du lien', 3000);
        });
        break;
      
      case 'delete':
        toast.warning('Fonctionnalité de suppression à venir', 3000);
        break;
    }
  }, [filteredMedia, toast]);

  /**
   * Générer les items du context menu avec icônes SVG
   */
  const getContextMenuItems = useCallback((mediaId: string): ContextMenuItem[] => {
    return [
      {
        id: 'open',
        label: 'Ouvrir dans un nouvel onglet',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        ),
        onClick: () => handleContextMenuAction('open', mediaId),
      },
      {
        id: 'download',
        label: 'Télécharger',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        ),
        onClick: () => handleContextMenuAction('download', mediaId),
      },
      {
        id: 'copy',
        label: 'Copier le lien',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
        ),
        onClick: () => handleContextMenuAction('copy', mediaId),
      },
      {
        id: 'divider',
        label: '',
        divider: true,
        onClick: () => {},
      },
      {
        id: 'delete',
        label: 'Supprimer',
        danger: true,
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        ),
        onClick: () => handleContextMenuAction('delete', mediaId),
      },
    ];
  }, [handleContextMenuAction]);

  return {
    contextMenu,
    setContextMenu,
    handleContextMenu,
    getContextMenuItems,
  };
}

