/**
 * MEDIA TAB CONTENT COMPONENT
 * Contenu du tab Media avec upload, filtres et vues
 * 
 * Responsabilités:
 * - Afficher la zone d'upload
 * - Gérer toolbar et filtres
 * - Afficher grid/list view
 * - Infinite scroll
 */

'use client';

import { useRef, useEffect, useCallback, memo } from 'react';
import { MediaUploadZone } from '@presentation/components/media';
import { SearchBar } from './SearchBar';
import { MediaFilters } from './MediaFilters';
import { MediaToolbar } from './MediaToolbar';
import { MediaGridView } from './MediaGridView';
import { MediaListView } from './MediaListView';
import { useMediaManager } from './hooks/useMediaManager';
import { useMediaContextMenu } from './hooks/useMediaContextMenu';
import { useFilteredMedia } from '@presentation/hooks/useFilteredMedia';
import type { ChannelMedia, MediaFilter } from './types';

interface MediaConfig {
  items: ChannelMedia[];
  searchQuery: string;
  filter: MediaFilter;
  showUploadZone: boolean;
}

interface LoadingState {
  isLoading: boolean;
  hasMore: boolean;
}

interface MediaCallbacks {
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: MediaFilter) => void;
  onUploadZoneToggle: (show: boolean) => void;
  onMediaClick: (index: number) => void;
  onContextMenu: (e: React.MouseEvent, mediaId: string) => void;
  onLoadMore: () => Promise<void>;
}

interface MediaTabContentProps {
  media: MediaConfig;
  loading: LoadingState;
  callbacks: MediaCallbacks;
}

const MediaTabContentComponent = ({
  media,
  loading,
  callbacks
}: MediaTabContentProps): React.ReactElement => {
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Media manager hook
  const mediaManager = useMediaManager({ initialMedia: media.items });

  // Calculer les médias filtrés avec memoization
  const filteredMedia = useFilteredMedia(mediaManager.allMedia, {
    searchQuery: media.searchQuery,
    filter: media.filter,
    sortBy: mediaManager.sortBy,
    sortOrder: mediaManager.sortOrder
  });

  // Context menu hook
  const contextMenuManager = useMediaContextMenu(filteredMedia);
  const { handleContextMenu } = contextMenuManager;

  // ==================== INFINITE SCROLL ====================
  const handleLoadMore = useCallback(async () => {
    if (!loading.isLoading && loading.hasMore) {
      await callbacks.onLoadMore();
    }
  }, [loading.isLoading, loading.hasMore, callbacks]);

  useEffect(() => {
    if (!observerTarget.current || !loading.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [handleLoadMore, loading.hasMore]);

  // ==================== RENDER ====================
  return (
    <>
      {/* ========== TOOLBAR & FILTERS ========== */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        {filteredMedia.length > 0 && !media.showUploadZone && (
          <MediaToolbar
            isSelectionMode={mediaManager.isSelectionMode}
            selectedCount={mediaManager.selectedMediaIds.size}
            sortBy={mediaManager.sortBy}
            sortOrder={mediaManager.sortOrder}
            viewMode={mediaManager.viewMode}
            onUploadClick={() => callbacks.onUploadZoneToggle(true)}
            onToggleSelection={mediaManager.toggleSelectionMode}
            onSelectAll={() => mediaManager.selectAllMedia(filteredMedia)}
            onDeselectAll={mediaManager.deselectAllMedia}
            onBulkDownload={() => mediaManager.handleBulkDownload(filteredMedia)}
            onBulkDelete={mediaManager.handleBulkDelete}
            onSortByChange={mediaManager.setSortBy}
            onSortOrderToggle={mediaManager.toggleSortOrder}
            onViewModeChange={mediaManager.setViewMode}
          />
        )}

        {filteredMedia.length === 0 && !media.showUploadZone && (
          <button
            onClick={() => callbacks.onUploadZoneToggle(true)}
            className="w-full px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
            </svg>
            Téléverser des médias
          </button>
        )}

        <SearchBar
          value={media.searchQuery}
          onChange={callbacks.onSearchChange}
          placeholder="Rechercher des médias..."
        />

        {!media.showUploadZone && (
          <MediaFilters
            activeFilter={media.filter}
            onFilterChange={callbacks.onFilterChange}
          />
        )}
      </div>

      {/* ========== CONTENT AREA ========== */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="animate-fadeIn">
          {/* Upload Zone */}
          {media.showUploadZone && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Téléverser des médias</h3>
                <button
                  onClick={() => callbacks.onUploadZoneToggle(false)}
                  className="text-[#b9bbbe] hover:text-white transition-colors"
                  aria-label="Fermer la zone de tÃ©lÃ©versement"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                  </svg>
                </button>
              </div>
              <MediaUploadZone 
                onUpload={mediaManager.handleUpload}
                maxSizeBytes={10 * 1024 * 1024}
                maxFiles={10}
              />
            </div>
          )}

          {/* Media Grid/List View */}
          {filteredMedia.length > 0 ? (
            mediaManager.viewMode === 'grid' ? (
              <div className="grid grid-cols-3 gap-2">
                <MediaGridView
                  media={filteredMedia}
                  isSelectionMode={mediaManager.isSelectionMode}
                  selectedIds={mediaManager.selectedMediaIds}
                  onMediaClick={callbacks.onMediaClick}
                  onToggleSelection={mediaManager.toggleMediaSelection}
                  onContextMenu={handleContextMenu}
                />
              </div>
            ) : (
              <MediaListView
                media={filteredMedia}
                isSelectionMode={mediaManager.isSelectionMode}
                selectedIds={mediaManager.selectedMediaIds}
                onMediaClick={callbacks.onMediaClick}
                onToggleSelection={mediaManager.toggleMediaSelection}
                onContextMenu={handleContextMenu}
                onDownload={(id) => {
                  const mediaItem = filteredMedia.find((m: ChannelMedia) => m.id === id);
                  if (mediaItem) {
                    const link = document.createElement('a');
                    link.href = mediaItem.url;
                    link.download = mediaItem.name;
                    link.click();
                  }
                }}
              />
            )
          ) : (
            !media.showUploadZone && (
              <div className="text-center py-8 text-muted-foreground">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <p className="text-sm">Aucun média pour le moment</p>
              </div>
            )
          )}

          {/* Loading Spinner */}
          {loading.isLoading && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Infinite Scroll Target */}
          <div ref={observerTarget} className="h-4" />
        </div>
      </div>
    </>
  );
};

export const MediaTabContent = memo(MediaTabContentComponent);
