/**
 * MEDIA GRID VIEW COMPONENT
 * Vue grille pour les médias avec support de sélection multiple
 */

'use client';

import React from 'react';
import type { ChannelMedia } from './types';

interface MediaGridViewProps {
  media: ChannelMedia[];
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onMediaClick: (index: number) => void;
  onToggleSelection: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

export function MediaGridView({
  media,
  isSelectionMode,
  selectedIds,
  onMediaClick,
  onToggleSelection,
  onContextMenu,
}: MediaGridViewProps): React.ReactElement {
  if (media.length === 0) {
    return (
      <div className="col-span-3 text-center py-12">
        <div className="text-muted-foreground text-sm">Aucun média pour le moment</div>
      </div>
    );
  }

  return (
    <>
      {media.map((item, index) => (
        <div key={item.id} className="relative group">
          {/* Checkbox overlay */}
          {isSelectionMode && (
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => onToggleSelection(item.id)}
                className="w-5 h-5 rounded border-2 border-white bg-black/50 checked:bg-primary checked:border-primary cursor-pointer transition-colors"
              />
            </div>
          )}
          
          <button
            onClick={() => isSelectionMode ? onToggleSelection(item.id) : onMediaClick(index)}
            onContextMenu={(e) => onContextMenu(e, item.id)}
            className="aspect-square w-full rounded overflow-hidden bg-secondary transition-smooth hover-scale relative"
          >
            {item.type === 'video' ? (
              <div className="relative w-full h-full">
                <img
                  src={item.thumbnail || item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
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
        </div>
      ))}
    </>
  );
};
