/**
 * CHAT CONTAINER
 * Container component orchestrateur simple
 * 
 * Responsabilités:
 * - Déléguer la logique au hook useChatLogic
 * - Passer les props à ChatArea
 * 
 * Refactorisé: Toute la logique métier est dans useChatLogic
 */

'use client';

import { memo } from 'react';
import { ChatArea } from './ChatArea';
import { useChatLogic } from './hooks/useChatLogic';

interface ChatContainerProps {
  channelId: string;
  channelName: string;
  channelAvatar?: string;
  showChannelInfo?: boolean;
  showMembers?: boolean;
  onToggleChannelInfo?: () => void;
  onToggleMembers?: () => void;
}

export function ChatContainer({
  channelId,
  channelName,
  channelAvatar,
  showChannelInfo,
  showMembers,
  onToggleChannelInfo,
  onToggleMembers
}: ChatContainerProps) {
  const chatLogic = useChatLogic({ channelId });

  return (
    <ChatArea
      channelId={channelId}
      recipient={{
        name: channelName,
        avatar: channelAvatar,
        status: 'online',
      }}
      messages={chatLogic.messages}
      typingUsernames={chatLogic.typingUsernames}
      currentUserId={chatLogic.currentUserId ?? undefined}
      isLoading={chatLogic.isLoading}
      error={chatLogic.error}
      callbacks={{
        onSendMessage: chatLogic.handleSendMessage,
        onAddReaction: chatLogic.handleAddReaction,
        onRemoveReaction: chatLogic.handleRemoveReaction,
        onEditMessage: chatLogic.handleEditMessage,
        onDeleteMessage: chatLogic.handleDeleteMessage,
        onTypingStart: chatLogic.handleTypingStart,
        onTypingStop: chatLogic.handleTypingStop,
      }}
      ui={{
        showChannelInfo,
        showMembers,
        onToggleChannelInfo,
        onToggleMembers,
      }}
    />
  );
}

export const ChatContainerMemo = memo(ChatContainer);
ChatContainerMemo.displayName = 'ChatContainer';

// Export par défaut pour compatibilité
export default ChatContainerMemo;
