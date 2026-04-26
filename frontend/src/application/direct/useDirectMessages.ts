import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DirectMessage } from '@domain/direct/types';
import { directApi } from '@infrastructure/api/direct.api';
import { logger } from '@shared/utils/logger';
import { useDirectMessageStore } from './directMessageStore';

// Tableau vide stable pour éviter les nouvelles références à chaque rendu
const EMPTY_MESSAGES: DirectMessage[] = [];

export function useDirectMessages(conversationId?: string) {
  const [initialMessages, setInitialMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Messages reçus en temps réel via WebSocket
  // On utilise EMPTY_MESSAGES comme fallback stable pour éviter les boucles infinies
  const incomingMessages = useDirectMessageStore(
    (state) => (conversationId ? state.messagesByConversation.get(conversationId) ?? EMPTY_MESSAGES : EMPTY_MESSAGES)
  );

  // Fusionner les messages REST + socket sans doublons
  const messages = useMemo(() => {
    const ids = new Set(initialMessages.map((m) => m.id));
    const newOnes = incomingMessages.filter((m) => !ids.has(m.id));
    return [...initialMessages, ...newOnes].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [initialMessages, incomingMessages]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await directApi.listMessages(conversationId);
      setInitialMessages(data);
    } catch (err) {
      logger.error('Failed to load direct messages', err);
      setError('Impossible de charger les messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return;
      try {
        const sent = await directApi.sendMessage(conversationId, content);
        setInitialMessages((prev) => [...prev, sent]);
        useDirectMessageStore.getState().setConversationTimestamp(conversationId, sent.createdAt);
        useDirectMessageStore.getState().setLastMessage(conversationId, {
          content: sent.content,
          senderId: sent.senderId,
          createdAt: sent.createdAt,
        });
      } catch (err) {
        logger.error('Échec de l\'envoi du message', err);
        setError('Impossible d\'envoyer le message');
      }
    },
    [conversationId]
  );

  useEffect(() => {
    loadMessages().catch(() => {});
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    sendMessage,
  };
}
