/**
 * Hook pour la gestion des paramètres du channel
 * Permet de mettre à jour le nom et le topic d'un channel
 */

import { useState } from 'react';
import { useChannelStore } from './channelStore';

interface UpdateChannelData {
  name?: string;
  topic?: string;
  position?: number;
}

export function useChannelSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateChannel: updateChannelInStore } = useChannelStore();

  const updateChannel = async (channelId: string, data: UpdateChannelData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du channel');
      }

      const result = await response.json();

      // Mettre à jour le store local
      if (result.data) {
        updateChannelInStore(channelId, result.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du channel';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateChannel,
    isLoading,
    error,
  };
}
