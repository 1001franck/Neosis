/**
 * SERVER CHANNELS SIDEBAR COMPONENT
 * Sidebar affichant les channels d'un serveur (240px width)
 * Version refactored avec hook pour la logique
 * 
 * Responsabilités:
 * - Orchestrer l'affichage entre mode normal et collapsed
 * - Délègue la logique au hook useServerChannelsSidebarState
 * - Afficher le header du serveur avec menu
 * - Lister les channels par catégories (TEXT/VOICE)
 */

'use client';

import { memo, useState } from 'react';
import { Channel, ChannelType, ChannelCategory } from '@domain/channels/types';
import { Server } from '@domain/servers/types';
import type { MemberRole } from '@domain/members/types';
import { ChannelItem } from './ChannelItem';
import { ServerChannelsSidebarCollapsed } from './ServerChannelsSidebarCollapsed';
import { useServerChannelsSidebarState } from './hooks/useServerChannelsSidebarState';
import { useResponsiveLayout } from '@presentation/contexts/ResponsiveLayoutContext';
import { MobileOverlay } from '@presentation/components/common/MobileOverlay';
import { useVoiceStore } from '@application/voice/voiceStore';
import { useMessageStore } from '@application/messages/messageStore';
import { ServerSettingsModal } from '@presentation/components/modals/ServerSettingsModal';
import { ChannelSettingsModal } from '@presentation/components/modals/ChannelSettingsModal';
import { useServerSettings } from '@application/servers/useServerSettings';
import { useChannelSettings } from '@application/channels/useChannelSettings';

// Constantes
const ICON_SIZE = 'w-4 h-4';
const ICON_SIZE_MEDIUM = 'w-5 h-5';

interface ServerChannelsSidebarProps {
  server: Server;
  channels: Channel[];
  categories: ChannelCategory[];
  activeChannelId?: string;
  currentUserRole?: MemberRole;
  onChannelClick?: (channelId: string) => void;
  onServerMenuClick?: () => void;
  onSearchClick?: () => void;
  onAddChannel?: (categoryId: string) => void;
  onLeaveServer?: () => void;
  onDeleteServer?: () => void;
  onCopyInviteCode?: () => void;
  onDeleteChannel?: (channelId: string) => void;
  onEditChannel?: (channelId: string, name: string) => void;
  onJoinVoice?: (channelId: string) => void;
}

function ServerChannelsSidebarInternal({
  server,
  channels,
  categories,
  activeChannelId,
  currentUserRole,
  onChannelClick,
  onServerMenuClick: _onServerMenuClick,
  onSearchClick,
  onAddChannel,
  onLeaveServer,
  onDeleteServer,
  onCopyInviteCode,
  onDeleteChannel: _onDeleteChannel,
  onEditChannel: _onEditChannel,
  onJoinVoice,
}: ServerChannelsSidebarProps): React.ReactElement | null {
  // Tous les hooks déclarés en premier (règle des hooks React)
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [selectedChannelForSettings, setSelectedChannelForSettings] = useState<Channel | null>(null);

  const voiceUsersByChannel = useVoiceStore((state) => state.connectedUsers);
  const voiceCountByChannel = useVoiceStore((state) => state.voiceCountByChannel);
  const getMentionCount = useMessageStore((state) => state.getMentionCount);
  const { updateServer, uploadServerImage } = useServerSettings();
  const { updateChannel } = useChannelSettings();

  const {
    isChannelSidebarOpen,
    closeAllSidebars,
    isMobile,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
  } = useResponsiveLayout();

  const sidebarState = useServerChannelsSidebarState({ channels: channels ?? [] });

  // Guard : données non disponibles
  if (!server || !channels || !categories) {
    return (
      <div className="w-60 h-full bg-card flex items-center justify-center border-r border-border">
        <p className="text-sm text-muted-foreground">Aucune donnée serveur</p>
      </div>
    );
  }

  const isOwner = currentUserRole === 'OWNER';
  const isAdminOrOwner = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';
  const {
    collapsedCategories,
    toggleCategory,
    channelsByCategory,
    getSortedCategories,
  } = sidebarState;

  const isCollapsed = isSidebarCollapsed('channels');
  const toggleCollapsed = (): void => {
    toggleSidebarCollapsed('channels');
  };

  // If no categories provided, create synthetic ones from channel types
  const syntheticCategories: ChannelCategory[] = categories.length > 0
    ? getSortedCategories(categories)
    : [
        { id: 'text-channels', name: 'Salons textuels', position: 0, serverId: server.id, isCollapsed: false },
        { id: 'voice-channels', name: 'Salons vocaux', position: 1, serverId: server.id, isCollapsed: false },
      ];

  const effectiveChannelsByCategory: Record<string, Channel[]> = categories.length > 0
    ? channelsByCategory
    : {
        'text-channels': channels.filter(c => c.type === ChannelType.TEXT || (c.type as string) === 'TEXT'),
        'voice-channels': channels.filter(c => c.type === ChannelType.VOICE || (c.type as string) === 'VOICE'),
      };

  const pinnedChannelId = (() => {
    if (categories.length > 0) {
      for (const category of syntheticCategories) {
        const firstChannel = [...(effectiveChannelsByCategory[category.id] || [])]
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name))[0];
        if (firstChannel) {
          return firstChannel.id;
        }
      }
      return undefined;
    }

    return [...channels]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name))[0]?.id;
  })();

  // Mode collapsed : afficher seulement les icônes
  if (isCollapsed) {
    return (
      <>
        <MobileOverlay isVisible={isMobile && isChannelSidebarOpen} onClick={closeAllSidebars} />
        <ServerChannelsSidebarCollapsed
          server={server}
          channels={channels}
          activeChannelId={activeChannelId}
          onChannelClick={onChannelClick}
          onExpandClick={toggleCollapsed}
          onSearchClick={onSearchClick}
        />
      </>
    );
  }

  // Mode normal : afficher la sidebar complète
  return (
    <>
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Close Button (Mobile only) */}
          {isMobile && (
            <button
              onClick={closeAllSidebars}
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors md:hidden"
              aria-label="Fermer la barre latÃ©rale"
            >
              <svg className={ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
          
          {/* Collapse Button (Desktop only) */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="RÃ©duire la barre latÃ©rale"
            title="RÃ©duire la barre latÃ©rale"
          >
            <svg className={ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"/>
            </svg>
          </button>
          
          {/* Server Status Indicator */}
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
          
          {/* Server Name */}
          <h2 className="text-base font-semibold text-foreground truncate">
            {server.name}
          </h2>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowServerMenu(!showServerMenu)}
            className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Menu du serveur"
            title="ParamÃ¨tres du serveur"
          >
            <svg className={ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>

          {/* Server Menu Dropdown */}
          {showServerMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowServerMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                {/* Copy Invite Code */}
                {onCopyInviteCode && (
                  <button
                    onClick={() => { onCopyInviteCode(); setShowServerMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <svg className={ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copier le code d&apos;invitation
                  </button>
                )}

                {/* Server Settings (Owner only) */}
                {isOwner && (
                  <button
                    onClick={() => { setShowServerSettings(true); setShowServerMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <svg className={ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                    </svg>
                    Paramètres du serveur
                  </button>
                )}

                {/* Delete Server (Owner only) */}
                {isOwner && onDeleteServer && (
                  <button
                    onClick={() => { onDeleteServer(); setShowServerMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <svg className={ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Supprimer le serveur
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="px-2 py-2 flex items-center gap-2 border-b border-border">
        {/* Search */}
        <button
          onClick={onSearchClick}
          className="flex-1 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
          aria-label="Rechercher"
          title="Rechercher des messages"
        >
          <svg className={`${ICON_SIZE_MEDIUM} mx-auto`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"/>
          </svg>
        </button>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
        {syntheticCategories.map((category) => {
          const categoryChannels = effectiveChannelsByCategory[category.id] || [];
          if (categoryChannels.length === 0) return null;
          const isCategoryCollapsed = collapsedCategories.has(category.id);

          return (
            <div key={category.id} className="mb-4">
              {/* Category Header */}
              <div className="w-full flex items-center gap-1 px-2 py-1 group">
                {/* Chevron - clickable */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-1 flex-1"
                  aria-label={isCategoryCollapsed ? `DÃ©plier ${category.name}` : `Replier ${category.name}`}
                >
                  <svg 
                    className={`w-3 h-3 text-muted-foreground transition-transform ${
                      isCategoryCollapsed ? '' : 'rotate-90'
                    }`}
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.4 18L8 16.6L12.6 12L8 7.4L9.4 6L15.4 12L9.4 18Z"/>
                  </svg>

                  {/* Category Name */}
                  <span className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">
                    {category.name}
                  </span>
                </button>

                {/* Add Channel Button - Only for Admin/Owner */}
                {isAdminOrOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChannel?.(category.id);
                    }}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-all"
                    aria-label="Ajouter un salon"
                    title={`Ajouter un salon Ã  ${category.name}`}
                  >
                    <svg className={ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Channels */}
              {!isCategoryCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {[...categoryChannels]
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name))
                    .map((channel) => (
                      <ChannelItem
                        key={channel.id}
                        id={channel.id}
                        name={channel.name}
                        type={channel.type}
                        isActive={channel.id === activeChannelId}
                        isPinned={channel.id === pinnedChannelId}
                        mentionCount={getMentionCount(channel.id)}
                        connectedUsers={voiceCountByChannel.get(channel.id) ?? voiceUsersByChannel.get(channel.id)?.length ?? 0}
                        onClick={onChannelClick}
                        onJoinVoice={onJoinVoice}
                        onSettings={isAdminOrOwner ? () => {
                          setSelectedChannelForSettings(channel);
                        } : undefined}
                      />
                    ))}
                </div>
              )}
            </div>
          );  
        })}
      </div>

      {/* Leave Server Button (hidden for Owner - Owner cannot leave their own server) */}
      {!isOwner && onLeaveServer && (
        <div className="px-2 py-2 border-t border-border">
          <button
            onClick={onLeaveServer}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition-colors"
            aria-label="Quitter le serveur"
          >
            <svg className={ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Quitter le serveur
          </button>
        </div>
      )}

      {/* Server Settings Modal */}
      {showServerSettings && (
        <ServerSettingsModal
          server={server}
          isOwner={isOwner}
          onClose={() => setShowServerSettings(false)}
          onSave={async (data) => {
            // Upload l'image d'abord si elle existe
            if (data.imageFile) {
              await uploadServerImage(server.id, data.imageFile);
            }

            // Mettre à jour le serveur avec les autres données (sans imageUrl)
            const { imageFile: _imageFile, ...updateData } = data;
            await updateServer(server.id, {
              ...updateData,
            });
          }}
        />
      )}

      {/* Channel Settings Modal */}
      {selectedChannelForSettings && (
        <ChannelSettingsModal
          channel={selectedChannelForSettings}
          canManage={isAdminOrOwner}
          onClose={() => setSelectedChannelForSettings(null)}
          onSave={async (data) => {
            await updateChannel(selectedChannelForSettings.id, data);
          }}
        />
      )}
    </>
  );
}

// Export mémoïsé pour optimiser les re-renders
export const ServerChannelsSidebar = memo(ServerChannelsSidebarInternal);
ServerChannelsSidebar.displayName = 'ServerChannelsSidebar';
