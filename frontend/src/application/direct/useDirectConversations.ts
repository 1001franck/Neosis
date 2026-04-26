import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DirectConversation } from '@domain/direct/types';
import { directApi } from '@infrastructure/api/direct.api';
import { logger } from '@shared/utils/logger';
import { useDirectMessageStore } from './directMessageStore';

export function useDirectConversations() {
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestTimestamps = useDirectMessageStore((state) => state.latestConversationTimestamps);
  const lastMessages = useDirectMessageStore((state) => state.lastMessageByConversation);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await directApi.listConversations();
      setConversations(data);
    } catch (err) {
      logger.error('Failed to load direct conversations', err);
      setError('Impossible de charger les conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations().catch(() => {});
  }, [loadConversations]);

  // Fusionner les timestamps temps réel (envoi/réception) avec les données chargées
  const conversationsWithLatestTime = useMemo(() =>
    conversations
      .map((conv) => ({
        ...conv,
        updatedAt: latestTimestamps.get(conv.id) ?? conv.updatedAt,
        lastMessage: lastMessages.get(conv.id) ?? conv.lastMessage,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [conversations, latestTimestamps, lastMessages]
  );

  return {
    conversations: conversationsWithLatestTime,
    isLoading,
    error,
    reload: loadConversations,
  };
}
