/**
 * CHAT AREA COMPONENT
 * Zone principale de chat - Composant orchestrateur
 * 
 * Architecture refactorisée:
 * - ChatHeader: Header avec status et actions
 * - MessageList: Liste de messages avec styles adaptatifs
 * - ChatInput: Zone de saisie avec emoji picker
 * - TypingIndicator: Indicateur de frappe
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList, type Message } from './MessageList';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ChannelSearchModal } from './ChannelSearchModal';
import type { UserStatus } from '@shared/constants/app';

export type { Message };

interface ChatRecipient {
  name: string;
  avatar?: string;
  status?: UserStatus;
}

interface ChatCallbacks {
  onSendMessage?: (content: string, attachmentIds?: string[]) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string, scope?: 'me' | 'everyone') => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onMessageClick?: (messageId: string) => void;
}

interface ChatUIState {
  showChannelInfo?: boolean;
  showMembers?: boolean;
  showFriends?: boolean;
  onToggleChannelInfo?: () => void;
  onToggleMembers?: () => void;
  onToggleFriends?: () => void;
}

interface ChatAreaProps {
  channelId?: string;
  recipient?: ChatRecipient;
  serverName?: string;
  serverAvatar?: string;
  messages?: Message[];
  typingUsernames?: string[];
  currentUserId?: string;
  callbacks?: ChatCallbacks;
  ui?: ChatUIState;
  isLoading?: boolean;
  error?: string;
  isChannel?: boolean;
  canModerate?: boolean;
  searchOpen?: boolean;
  onSearchOpen?: () => void;
  onSearchClose?: () => void;
}

/**
 * Composant ChatArea - Orchestrateur principal
 * Délègue les responsabilités aux sous-composants spécialisés
 */
export function ChatArea({
  channelId,
  recipient,
  serverName,
  serverAvatar,
  messages = [],
  typingUsernames = [],
  currentUserId,
  callbacks,
  ui,
  isLoading = false,
  error,
  isChannel = false,
  canModerate = false,
  searchOpen,
  onSearchOpen,
  onSearchClose,
}: ChatAreaProps): React.ReactNode {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [internalSearchOpen, setInternalSearchOpen] = useState(false);

  const handleSearchClick = useCallback(() => {
    if (onSearchOpen) {
      onSearchOpen();
    } else {
      setInternalSearchOpen(true);
    }
  }, [onSearchOpen]);

  const handleSearchClose = useCallback(() => {
    if (onSearchClose) {
      onSearchClose();
    } else {
      setInternalSearchOpen(false);
    }
  }, [onSearchClose]);

  const isSearchOpen = searchOpen ?? internalSearchOpen;

  const handleMessageClick = useCallback((messageId: string) => {
    callbacks?.onMessageClick?.(messageId);
  }, [callbacks]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      {recipient && (
        <ChatHeader
          recipientName={recipient.name}
          recipientAvatar={recipient.avatar}
          recipientStatus={recipient.status}
          serverName={serverName}
          serverAvatar={serverAvatar}
          isChannel={isChannel}
          showChannelInfo={ui?.showChannelInfo}
          showMembers={ui?.showMembers}
          showFriends={ui?.showFriends}
          onToggleChannelInfo={ui?.onToggleChannelInfo}
          onToggleMembers={ui?.onToggleMembers}
          onToggleFriends={ui?.onToggleFriends}
          onSearchClick={handleSearchClick}
        />
      )}

      {/* Search Modal */}
      {channelId && recipient && (
        <ChannelSearchModal
          isOpen={isSearchOpen}
          onClose={handleSearchClose}
          channelId={channelId}
          channelName={recipient.name}
          messages={messages}
          onMessageClick={handleMessageClick}
        />
      )}

      {/* Messages List */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isChannel={isChannel}
        canModerate={canModerate}
        hoveredMessageId={hoveredMessageId}
        onHoverMessage={setHoveredMessageId}
        onAddReaction={callbacks?.onAddReaction}
        onRemoveReaction={callbacks?.onRemoveReaction}
        onEditMessage={callbacks?.onEditMessage}
        onDeleteMessage={callbacks?.onDeleteMessage}
      />

      {/* Typing Indicator */}
      {typingUsernames.length > 0 && (
        <TypingIndicator usernames={typingUsernames} />
      )}

      {/* Message Input */}
      <ChatInput
        recipientName={recipient?.name}
        channelId={channelId}
        onSendMessage={(content, attachments) => {
          const ids = attachments?.map(a => a.id);
          callbacks?.onSendMessage?.(content, ids);
        }}
        onTypingStart={callbacks?.onTypingStart}
        onTypingStop={callbacks?.onTypingStop}
      />
    </div>
  );
}
