/**
 * MEDIA LIST VIEW COMPONENT
 * Vue liste pour les médias avec informations détaillées
 */

'use client';

import React from 'react';
import type { ChannelMedia } from './types';

interface MediaListViewProps {
  media: ChannelMedia[];
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onMediaClick: (index: number) => void;
  onToggleSelection: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onDownload: (id: string) => void;
}

export function MediaListView({
  media,
  isSelectionMode,
  selectedIds,
  onMediaClick,
  onToggleSelection,
  onContextMenu,
  onDownload,
}: MediaListViewProps): React.ReactElement {
  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-sm">Aucun média pour le moment</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {media.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-2 rounded bg-card hover:bg-background transition-colors group"
        >
          {/* Checkbox */}
          {isSelectionMode && (
            <input
              type="checkbox"
              checked={selectedIds.has(item.id)}
              onChange={() => onToggleSelection(item.id)}
              className="w-5 h-5 rounded border-2 border-[#b9bbbe] bg-secondary checked:bg-primary checked:border-primary cursor-pointer transition-colors"
            />
          )}
          
          {/* Thumbnail */}
          <button
            onClick={() => isSelectionMode ? onToggleSelection(item.id) : onMediaClick(index)}
            onContextMenu={(e) => onContextMenu(e, item.id)}
            className="w-12 h-12 rounded overflow-hidden bg-secondary flex-shrink-0 relative"
          >
            {item.type === 'video' ? (
              <div className="relative w-full h-full">
                <img
                  src={item.thumbnail || item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            ) : (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            )}
          </button>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{item.name}</div>
            <div className="text-xs text-muted-foreground">
              {item.uploadedBy} • {item.uploadedAt.toLocaleDateString()}
            </div>
          </div>
          
          {/* Actions */}
          <button
            onClick={() => onDownload(item.id)}
            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-foreground transition-all"
            aria-label="TÃ©lÃ©charger"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
