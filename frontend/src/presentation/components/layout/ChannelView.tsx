/**
 * CHANNEL VIEW LAYOUT COMPONENT
 * Layout complet pour l'affichage d'un channel avec navbar et sidebars
 * 
 * Structure complète:
 * - ServerSidebar (72px) - Navigation serveurs (desktop only)
 * - ServerChannelsSidebar (240px) - Liste des channels (responsive)
 * - ChatArea (flex-1) - Zone de discussion
 * - MembersSidebar (240px) - Membres (responsive, optionnel)
 * - ChannelInfoSidebar (340px) - Info channel (responsive, optionnel)
 * 
 * Responsabilités:
 * - Composer tous les composants de la vue channel
 * - Utiliser ResponsiveSidebar pour une gestion unifiée
 * - Coordonner la navigation
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ResponsiveSidebar } from '@presentation/components/common/ResponsiveSidebar';
import { ServerSidebar } from './ServerSidebar';
import { ServerChannelsSidebar } from '@presentation/components/channels/ServerChannelsSidebar';
import { ChatArea } from '@presentation/components/chat/ChatArea';
import { ServerMessageSearchModal } from '@presentation/components/chat/ServerMessageSearchModal';
import { MembersSidebar } from '@presentation/components/members/MembersSidebar';
import { ChannelInfoSidebar } from '@presentation/components/channels/ChannelInfoSidebar';
import { DirectMessagesPanel } from '@presentation/components/layout/DirectMessagesPanel';
import { useResponsiveLayout } from '@presentation/contexts/ResponsiveLayoutContext';
import type { Server } from '@domain/servers/types';
import type { Channel, ChannelCategory } from '@domain/channels/types';
import type { Member, Role, MemberRole } from '@domain/members/types';
import type { Message } from '@presentation/components/chat/MessageList';
import type { ChannelMedia, ChannelLink } from '@presentation/components/channels/types';

interface ChannelViewServer {
  current: Server;
  all?: Server[];
  activeServerId?: string;
}

interface ChannelViewChannels {
  list: Channel[];
  categories: ChannelCategory[];
  activeChannelId: string;
  media?: ChannelMedia[];
  links?: ChannelLink[];
  files?: ChannelMedia[];
}

interface ChannelViewMembers {
  list?: Member[];
  roles?: Role[];
  currentUserRole?: MemberRole;
  bannedUserIds?: Set<string>;
}

interface ChannelViewCallbacks {
  onChannelClick?: (channelId: string) => void;
  onServerClick?: (serverId: string) => void;
  onServerMenuClick?: () => void;
  onSendMessage?: (content: string, attachmentIds?: string[]) => void;
  onMemberClick?: (memberId: string) => void;
  onLeaveServer?: () => void;
  onAddChannel?: (categoryId: string) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string, scope?: 'me' | 'everyone') => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onChangeRole?: (memberId: string, role: MemberRole) => void;
  onTransferOwnership?: (memberId: string) => void;
  onDeleteServer?: () => void;
  onCopyInviteCode?: () => void;
  onDeleteChannel?: (channelId: string) => void;
  onEditChannel?: (channelId: string, name: string) => void;
  onJoinVoice?: (channelId: string) => void;
  onKickMember?: (memberId: string) => void;
  onBanMember?: (memberId: string, durationHours?: number | null, reason?: string) => void;
  onCreateServer?: () => void;
  onJoinServer?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

interface ChannelViewUser {
  username: string;
  avatar?: string;
  customStatus?: string;
  statusEmoji?: string;
}

interface BanInfo {
  expiresAt?: string | null;
  reason?: string | null;
}

interface ChannelViewProps {
  server: ChannelViewServer;
  channels: ChannelViewChannels;
  members: ChannelViewMembers;
  messages?: Message[];
  typingUsernames?: string[];
  currentUserId?: string;
  callbacks?: ChannelViewCallbacks;
  user?: ChannelViewUser;
  banInfo?: BanInfo;
}

/**
 * ChannelView - Layout complet pour la vue d'un channel
 * 
 * Architecture Discord-like avec:
 * 1. ServerSidebar (gauche) - 72px (desktop only)
 * 2. ServerChannelsSidebar - 240px (responsive)
 * 3. ChatArea - flex-1 avec navbar en haut
 * 4. MembersSidebar (droite) - 240px (responsive)
 * 5. ChannelInfoSidebar (droite) - 340px (responsive)
 */
export function ChannelView({
  server,
  channels,
  members,
  messages,
  typingUsernames,
  currentUserId,
  callbacks,
  user,
  banInfo,
}: ChannelViewProps): React.ReactElement {
  
  // Use responsive layout context
  const {
    isMobile,
    isSidebarOpen,
    toggleSidebar,
    isSidebarCollapsed,
  } = useResponsiveLayout();

  // Local UI state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isServerSearchOpen, setIsServerSearchOpen] = useState(false);

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleServerSearchOpen = useCallback(() => {
    setIsServerSearchOpen(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleServerSearchClose = useCallback(() => {
    setIsServerSearchOpen(false);
  }, []);

  const handleServerSearchResultClick = useCallback((channelId: string) => {
    callbacks?.onChannelClick?.(channelId);
    setIsServerSearchOpen(false);
  }, [callbacks]);

  // Trouver le channel actif
  const activeChannel = channels.list.find(ch => ch.id === channels.activeChannelId);

  /**
   * Toggle members sidebar
   * On mobile, ferme channel info si on ouvre members
   */
  const handleToggleMembers = (): void => {
    if (isMobile && !isSidebarOpen('members') && isSidebarOpen('channel-info')) {
      toggleSidebar('channel-info');
    }
    toggleSidebar('members');
  };

  /**
   * Toggle channel info sidebar
   * On mobile, ferme members si on ouvre channel info
   */
  const handleToggleChannelInfo = (): void => {
    if (isMobile && !isSidebarOpen('channel-info') && isSidebarOpen('members')) {
      toggleSidebar('members');
    }
    if (isMobile && !isSidebarOpen('channel-info') && isSidebarOpen('friends')) {
      toggleSidebar('friends');
    }
    toggleSidebar('channel-info');
  };

  /**
   * Toggle friends sidebar
   * On mobile, ferme les autres sidebars de droite
   */
  const handleToggleFriends = (): void => {
    if (isMobile && !isSidebarOpen('friends') && isSidebarOpen('members')) {
      toggleSidebar('members');
    }
    if (isMobile && !isSidebarOpen('friends') && isSidebarOpen('channel-info')) {
      toggleSidebar('channel-info');
    }
    toggleSidebar('friends');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Server Sidebar - 72px, always visible on desktop */}
      <ResponsiveSidebar id="server" position="left" width="w-[72px]" showOnDesktop={true} className="bg-secondary py-3 gap-2">
        <ServerSidebar 
          servers={server.all}
          activeServerId={server.activeServerId || server.current.id}
          onServerClick={callbacks?.onServerClick}
          onCreateServer={callbacks?.onCreateServer}
          onJoinServer={callbacks?.onJoinServer}
          onSettings={callbacks?.onSettings}
          onLogout={callbacks?.onLogout}
          user={user}
        />
      </ResponsiveSidebar>

      {/* Server Channels Sidebar - 240px, responsive */}
      <ResponsiveSidebar id="channels" position="left" width={isSidebarCollapsed('channels') ? 'w-[72px]' : 'w-60'}>
        <ServerChannelsSidebar
          server={server.current}
          channels={channels.list}
          categories={channels.categories}
          activeChannelId={channels.activeChannelId}
          currentUserRole={members.currentUserRole}
          onChannelClick={callbacks?.onChannelClick}
          onServerMenuClick={callbacks?.onServerMenuClick}
          onSearchClick={handleServerSearchOpen}
          onLeaveServer={callbacks?.onLeaveServer}
          onAddChannel={callbacks?.onAddChannel}
          onDeleteServer={callbacks?.onDeleteServer}
          onCopyInviteCode={callbacks?.onCopyInviteCode}
          onDeleteChannel={callbacks?.onDeleteChannel}
          onEditChannel={callbacks?.onEditChannel}
          onJoinVoice={callbacks?.onJoinVoice}
        />
      </ResponsiveSidebar>

      {/* Chat Area - Flex-1 */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background/35 backdrop-blur-[1px]">
        <ChatArea
          messages={messages || []}
          typingUsernames={typingUsernames}
          currentUserId={currentUserId}
          channelId={channels.activeChannelId}
          serverName={server.current.name}
          serverAvatar={server.current.imageUrl || server.current.icon}
          recipient={{
            name: activeChannel?.name || 'channel',
            avatar: undefined,
            status: undefined,
          }}
          isChannel={true}
          canModerate={members.currentUserRole === 'OWNER' || members.currentUserRole === 'ADMIN'}
          searchOpen={isSearchOpen}
          onSearchOpen={handleSearchOpen}
          onSearchClose={handleSearchClose}
          banInfo={banInfo}
          callbacks={{
            onSendMessage: callbacks?.onSendMessage || (() => {}),
            onEditMessage: callbacks?.onEditMessage,
            onDeleteMessage: callbacks?.onDeleteMessage,
            onAddReaction: callbacks?.onAddReaction,
            onRemoveReaction: callbacks?.onRemoveReaction,
            onTypingStart: callbacks?.onTypingStart,
            onTypingStop: callbacks?.onTypingStop,
          }}
          ui={{
            showMembers: isSidebarOpen('members'),
            showChannelInfo: isSidebarOpen('channel-info'),
            showFriends: isSidebarOpen('friends'),
            onToggleMembers: handleToggleMembers,
            onToggleChannelInfo: handleToggleChannelInfo,
            onToggleFriends: handleToggleFriends,
          }}
        />

        <ServerMessageSearchModal
          isOpen={isServerSearchOpen}
          onClose={handleServerSearchClose}
          serverId={server.current.id}
          channels={channels.list}
          onResultClick={(channelId) => handleServerSearchResultClick(channelId)}
        />
      </div>

      {/* Members Sidebar - 240px, responsive */}
      <ResponsiveSidebar id="members" position="right" width="w-60" showOnDesktop={false}>
        <MembersSidebar
          members={members.list || []}
          roles={members.roles}
          currentUserRole={members.currentUserRole}
          bannedUserIds={members.bannedUserIds}
          serverId={server.current.id}
          onMemberClick={callbacks?.onMemberClick}
          onChangeRole={callbacks?.onChangeRole}
          onTransferOwnership={callbacks?.onTransferOwnership}
          onKickMember={callbacks?.onKickMember}
          onBanMember={callbacks?.onBanMember}
        />
      </ResponsiveSidebar>

      {/* Channel Info Sidebar - 340px, responsive */}
      <ResponsiveSidebar id="channel-info" position="right" width="w-[340px]" showOnDesktop={false}>
        {activeChannel ? (
          <ChannelInfoSidebar
            channel={activeChannel}
            media={channels.media || []}
            links={channels.links || []}
            files={channels.files || []}
            onClose={handleToggleChannelInfo}
          />
        ) : (
          <div className="h-full bg-card border-l border-border flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Aucun channel sÃ©lectionnÃ©</p>
          </div>
        )}
      </ResponsiveSidebar>

      {/* Friends Sidebar - 280px, responsive */}
      <ResponsiveSidebar id="friends" position="right" width="w-72" showOnDesktop={false}>
        <DirectMessagesPanel activeView="friends" />
      </ResponsiveSidebar>
    </div>
  );
}
