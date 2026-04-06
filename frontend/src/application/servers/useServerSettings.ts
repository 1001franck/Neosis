/**
 * Hook pour la gestion des parametres du serveur
 * Permet de mettre a jour le nom, la description et l'image d'un serveur
 */

import { useState } from 'react';
import { useServerStore } from './serverStore';
import { serversApi } from '@infrastructure/api/servers.api';

interface UpdateServerData {
  name?: string;
  description?: string;
  imageUrl?: string;
}

export function useServerSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateServer: updateServerInStore } = useServerStore();

  const resolveErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
      const anyErr = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      return anyErr.response?.data?.error?.message || anyErr.message || fallback;
    }
    return fallback;
  };

  const uploadServerImage = async (serverId: string, file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedServer = await serversApi.uploadServerImage(serverId, file);
      updateServerInStore(serverId, updatedServer);
      return updatedServer.imageUrl || '';
    } catch (err) {
      const errorMessage = resolveErrorMessage(err, "Erreur lors de l'upload de l'image");
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateServer = async (serverId: string, data: UpdateServerData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedServer = await serversApi.updateServer(serverId, data);
      updateServerInStore(serverId, updatedServer);
    } catch (err) {
      const errorMessage = resolveErrorMessage(err, 'Erreur lors de la mise a jour du serveur');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateServer,
    uploadServerImage,
    isLoading,
    error,
  };
}
