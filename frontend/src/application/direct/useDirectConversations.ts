import { useCallback, useEffect, useState } from 'react';
import type { DirectConversation } from '@domain/direct/types';
import { directApi } from '@infrastructure/api/direct.api';
import { logger } from '@shared/utils/logger';

export function useDirectConversations() {
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    conversations,
    isLoading,
    error,
    reload: loadConversations,
  };
}
