/**
 * CHANNEL INFO SIDEBAR COMPONENT
 * Sidebar droite - Composant orchestrateur
 * 
 * Architecture refactorisée:
 * - ChannelInfoHeader: Header avec close button
 * - ChannelTabs: Navigation entre tabs
 * - MediaTabContent: Contenu complet du tab Media
 * - LinksList/FilesList: Contenu des autres tabs
 * - MediaLightbox: Modal zoom
 * - ContextMenu: Menu actions rapides
 */

'use client';

import { useCallback, useMemo, memo } from 'react';
import { Channel } from '@domain/channels/types';
import { MediaLightbox } from '@presentation/components/media';
import { ContextMenu } from '@presentation/components/common';
import { ChannelInfoHeader } from './ChannelInfoHeader';
import { ChannelTabs } from './ChannelTabs';
import { MediaTabContent } from './MediaTabContent';
import { LinksList } from './LinksList';
import { FilesList } from './FilesList';
import { useChannelSidebarState } from './hooks/useChannelSidebarState';
import { useMediaContextMenu } from './hooks/useMediaContextMenu';
import { useFilteredMedia } from '@presentation/hooks/useFilteredMedia';
import { filterBySearch } from './utils';
import type { ChannelMedia, ChannelLink, TabType } from './types';

interface ChannelInfoSidebarProps {
  channel: Channel;
  media?: ChannelMedia[];
  links?: ChannelLink[];
  files?: ChannelMedia[];
  onClose?: () => void;
  onLoadMore?: (tab: TabType) => Promise<void>;
  hasMore?: boolean;
}

/**
 * Composant ChannelInfoSidebar - Orchestrateur principal
 * Délègue les responsabilités aux sous-composants spécialisés
 */
const ChannelInfoSidebarComponent = ({
  channel,
  media = [],
  links = [],
  files = [],
  onClose,
  onLoadMore,
  hasMore = false,
}: ChannelInfoSidebarProps): React.ReactElement | null => {
  // ==================== RESPONSIVE LAYOUT ====================

  // ==================== CUSTOM HOOKS ====================
  const sidebarState = useChannelSidebarState();
  
  // Calculer les médias filtrés avec useFilteredMedia hook (memoized)
  const filteredMedia = useFilteredMedia(media, {
    searchQuery: sidebarState.searchQuery,
    filter: sidebarState.mediaFilter,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const contextMenuManager = useMediaContextMenu(filteredMedia);
  const { contextMenu, setContextMenu, handleContextMenu, getContextMenuItems } = contextMenuManager;

  // Filtrer les autres contenus avec useMemo
  const filteredLinks = useMemo(() => 
    filterBySearch(links, sidebarState.searchQuery),
    [links, sidebarState.searchQuery]
  );
  
  const filteredFiles = useMemo(() => 
    filterBySearch(files, sidebarState.searchQuery),
    [files, sidebarState.searchQuery]
  );

  // ==================== HANDLERS ====================
  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || sidebarState.isLoading || !hasMore) return;
    sidebarState.setIsLoading(true);
    try {
      await onLoadMore(sidebarState.activeTab);
    } finally {
      sidebarState.setIsLoading(false);
    }
  }, [onLoadMore, sidebarState, hasMore]);

  const handleNextMedia = (): void => {
    if (sidebarState.lightboxIndex < filteredMedia.length - 1) {
      sidebarState.nextMedia();
    }
  };

  const handlePreviousMedia = (): void => {
    sidebarState.previousMedia(filteredMedia.length - 1);
  };

  // ==================== RENDER ====================
  return (
    <>
      {/* Header */}
      <ChannelInfoHeader
        channelName={channel.name}
        onClose={onClose}
      />

      {/* Tabs */}
      <ChannelTabs
        activeTab={sidebarState.activeTab}
        mediaCount={media.length}
        linksCount={links.length}
        filesCount={files.length}
        onTabChange={sidebarState.handleTabChange}
      />

      {/* Tab Content */}
      {sidebarState.activeTab === 'media' && (
        <MediaTabContent
          media={{
            items: media,
            searchQuery: sidebarState.searchQuery,
            filter: sidebarState.mediaFilter,
            showUploadZone: sidebarState.showUploadZone
          }}
          loading={{
            isLoading: sidebarState.isLoading,
            hasMore
          }}
          callbacks={{
            onSearchChange: sidebarState.setSearchQuery,
            onFilterChange: sidebarState.setMediaFilter,
            onUploadZoneToggle: sidebarState.setShowUploadZone,
            onMediaClick: sidebarState.openLightbox,
            onContextMenu: handleContextMenu,
            onLoadMore: handleLoadMore
          }}
        />
      )}

      {sidebarState.activeTab === 'links' && (
        <div className="flex-1 overflow-y-auto p-4">
          <LinksList links={filteredLinks} searchQuery={sidebarState.searchQuery} />
        </div>
      )}

      {sidebarState.activeTab === 'files' && (
        <div className="flex-1 overflow-y-auto p-4">
          <FilesList files={filteredFiles} searchQuery={sidebarState.searchQuery} />
        </div>
      )}

      {/* Lightbox */}
      <MediaLightbox
        media={filteredMedia}
        currentIndex={sidebarState.lightboxIndex}
        isOpen={sidebarState.lightboxOpen}
        onClose={sidebarState.closeLightbox}
        onNext={handleNextMedia}
        onPrevious={handlePreviousMedia}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems(contextMenu.mediaId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

export const ChannelInfoSidebar = memo(ChannelInfoSidebarComponent);
