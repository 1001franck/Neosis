import { useCallback, useEffect, useState } from 'react';
import type { DirectMessage } from '@domain/direct/types';
import { directApi } from '@infrastructure/api/direct.api';
import { logger } from '@shared/utils/logger';

export function useDirectMessages(conversationId?: string) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await directApi.listMessages(conversationId);
      setMessages(data);
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
      const sent = await directApi.sendMessage(conversationId, content);
      setMessages((prev) => [...prev, sent]);
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
