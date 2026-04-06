/**
 * HOOK: useChatLogic
 * Encapsule toute la logique métier du chat
 * 
 * Responsabilités:
 * - Gérer les messages (load, send, edit, delete)
 * - Gérer les réactions
 * - Gérer les typing indicators
 * - Convertir domain → presentation
 * - Fournir des handlers prêts à l'emploi
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useMessages } from '@application/messages/useMessages';
import { useMessageStore } from '@application/messages/messageStore';
import { useAuthContext } from '@application/auth/AuthContext';
import { useReadConfirmation } from '@application/messages/useReadConfirmation';
import { logger } from '@shared/utils/logger';
import { socketEmitters } from '@infrastructure/websocket/emitters';
import type { Message as DomainMessage } from '@domain/messages/types';
import type { Message as PresentationMessage } from '../MessageList';

interface UseChatLogicParams {
  channelId: string;
}

interface UseChatLogicReturn {
  // State
  messages: PresentationMessage[];
  typingUsernames: string[];
  isLoading: boolean;
  error: string | undefined;
  currentUserId: string | null;

  // Handlers
  handleSendMessage: (content: string) => Promise<void>;
  handleAddReaction: (messageId: string, emoji: string) => void;
  handleRemoveReaction: (messageId: string, emoji: string) => void;
  handleEditMessage: (messageId: string, newContent: string) => Promise<void>;
  handleDeleteMessage: (messageId: string, scope?: 'me' | 'everyone') => Promise<void>;
  handleTypingStart: () => void;
  handleTypingStop: () => void;
}

/**
 * Convertir un message domain en message presentation
 */
function convertToPresentationMessage(
  msg: DomainMessage,
  currentUserId: string | null
): PresentationMessage {
  return {
    id: msg.id,
    userId: msg.authorId,
    username: msg.author?.username || 'Unknown User',
    avatar: msg.author?.avatar,
    content: msg.content,
    timestamp: new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    createdAt: new Date(msg.createdAt),
    reactions: msg.reactions,
    status: msg.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'deleted',
    isCurrentUser: currentUserId ? msg.authorId === currentUserId : false,
    deletedBy: msg.deletedBy,
    deletedByUserId: msg.deletedByUserId,
    deletedByRole: msg.deletedByRole,
    attachments: msg.attachments,
  };
}

/**
 * Hook principal pour la logique du chat
 */
export function useChatLogic({ channelId }: UseChatLogicParams): UseChatLogicReturn {
  // === HOOKS ===
  const { messages, isLoading, error, loadMessages, sendMessage, editMessage, deleteMessage } = useMessages();
  const { userId: currentUserId } = useAuthContext();
  const typingUsers = useMessageStore((state) => state.getTypingUsers(channelId));

  // === READ CONFIRMATION ===
  useReadConfirmation(channelId, messages);

  // === EFFECTS ===
  /**
   * Charger les messages au montage et quand le channel change
   */
  useEffect(() => {
    logger.info('Loading messages for channel', { channelId });
    loadMessages(channelId).catch((err) => {
      logger.error('Failed to load messages', { error: err.message, channelId });
    });
  }, [channelId, loadMessages]);

  // === HANDLERS ===
  /**
   * Envoyer un message
   */
  const handleSendMessage = useCallback(async (content: string): Promise<void> => {
    try {
      await sendMessage({
        channelId,
        content
      });
    } catch (err) {
      logger.error('Failed to send message', { error: (err as Error).message });
    }
  }, [channelId, sendMessage]);

  /**
   * Ajouter une réaction
   * TODO: Le backend ne supporte pas encore les réactions via socket
   */
  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    logger.debug('Adding reaction (not yet supported by backend)', { messageId, emoji });
  }, []);

  /**
   * Retirer une réaction
   * TODO: Le backend ne supporte pas encore les réactions via socket
   */
  const handleRemoveReaction = useCallback((messageId: string, emoji: string) => {
    logger.debug('Removing reaction (not yet supported by backend)', { messageId, emoji });
  }, []);

  /**
   * Éditer un message
   */
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      logger.debug('Editing message', { messageId });
      await editMessage(channelId, messageId, { content: newContent });
    } catch (err) {
      logger.error('Failed to edit message', { error: (err as Error).message, messageId });
    }
  }, [channelId, editMessage]);

  /**
   * Supprimer un message
   */
  const handleDeleteMessage = useCallback(async (messageId: string, scope?: 'me' | 'everyone') => {
    try {
      logger.debug('Deleting message', { messageId, scope });
      await deleteMessage(channelId, messageId, scope);
    } catch (err) {
      logger.error('Failed to delete message', { error: (err as Error).message, messageId });
    }
  }, [channelId, deleteMessage]);

  /**
   * Gérer le typing indicator
   */
  const handleTypingStart = useCallback(() => {
    socketEmitters.typingStarted(channelId);
  }, [channelId]);

  const handleTypingStop = useCallback(() => {
    socketEmitters.typingStopped(channelId);
  }, [channelId]);

  // === DATA CONVERSION ===
  const presentationMessages = useMemo(
    () => messages.map(msg => convertToPresentationMessage(msg, currentUserId)),
    [messages, currentUserId]
  );

  const typingUsernames = useMemo(
    () => typingUsers.map(u => u.username),
    [typingUsers]
  );

  return {
    messages: presentationMessages,
    typingUsernames,
    isLoading,
    error: error || undefined,
    currentUserId,
    handleSendMessage,
    handleAddReaction,
    handleRemoveReaction,
    handleEditMessage,
    handleDeleteMessage,
    handleTypingStart,
    handleTypingStop,
  };
}
