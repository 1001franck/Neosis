/**
 * APPLICATION - SERVERS HOOK
 * Hook personnalisé pour utiliser les serveurs
 *
 * Responsabilités:
 * - Encapsuler la logique métier des serveurs
 * - Gérer les appels API au serveur
 * - Fournir une interface simple aux composants
 */

import { useCallback } from 'react';
import { useServerStore } from './serverStore';
import type { ServerStoreState } from './serverStore';
import { serverService } from './serverService';
import type { Server, CreateServerRequest, UpdateServerRequest } from '@domain/servers/types';
import { logger } from '@shared/utils/logger';

/**
 * Hook principal pour la gestion des serveurs
 * Utilisé dans tous les composants liés aux serveurs
 *
 * @example
 * const { servers, isLoading, error, getServers, createServer } = useServers();
 */
export function useServers() {
  // === STATE SELECTORS ===
  const servers = useServerStore((state: ServerStoreState) => state.servers);
  const currentServer = useServerStore((state: ServerStoreState) => state.currentServer);
  const isLoading = useServerStore((state: ServerStoreState) => state.isLoading);
  const error = useServerStore((state: ServerStoreState) => state.error);

  // === STORE ACTIONS ===
  const setServers = useServerStore((state: ServerStoreState) => state.setServers);
  const setCurrentServer = useServerStore((state: ServerStoreState) => state.setCurrentServer);
  const setLoading = useServerStore((state: ServerStoreState) => state.setLoading);
  const setError = useServerStore((state: ServerStoreState) => state.setError);

  /**
   * Récupérer la liste de tous les serveurs
   */
  const getServers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Fetching servers');
      const data = await serverService.getServers();
      setServers(data);
      logger.info('Servers fetched successfully', { count: data.length });
    } catch (err) {
      logger.error('Failed to fetch servers', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch servers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setServers, setLoading, setError]);

  /**
   * Récupérer un serveur spécifique
   */
  const getServer = useCallback(
    async (serverId: string) => {
      try {
        setLoading(true);
        setError(null);
        logger.info('Fetching server', { serverId });
        const data = await serverService.getServer(serverId);
        setCurrentServer(data);
        logger.info('Server fetched successfully', { serverId });
        return data;
      } catch (err) {
        logger.error('Failed to fetch server', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch server');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentServer, setLoading, setError]
  );

  /**
   * Créer un nouveau serveur
   */
  const createServer = useCallback(
    async (request: CreateServerRequest): Promise<Server> => {
      try {
        setLoading(true);
        setError(null);
        logger.info('Creating server', { name: request.name });
        const data = await serverService.createServer(request);
        setServers([...servers, data]);
        logger.info('Server created successfully', { serverId: data.id });
        return data;
      } catch (err) {
        logger.error('Failed to create server', err);
        setError(err instanceof Error ? err.message : 'Failed to create server');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [servers, setServers, setLoading, setError]
  );

  /**
   * Mettre à jour un serveur
   */
  const updateServer = useCallback(
    async (serverId: string, request: UpdateServerRequest): Promise<Server> => {
      try {
        setLoading(true);
        setError(null);
        logger.info('Updating server', { serverId });
        const data = await serverService.updateServer(serverId, request);
        setServers(servers.map((s) => (s.id === serverId ? data : s)));
        if (currentServer?.id === serverId) {
          setCurrentServer({ ...currentServer, ...data });
        }
        logger.info('Server updated successfully', { serverId });
        return data;
      } catch (err) {
        logger.error('Failed to update server', err);
        setError(err instanceof Error ? err.message : 'Failed to update server');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [servers, currentServer, setServers, setCurrentServer, setLoading, setError]
  );

  /**
   * Supprimer un serveur
   */
  const deleteServer = useCallback(
    async (serverId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        logger.info('Deleting server', { serverId });
        await serverService.deleteServer(serverId);
        setServers(servers.filter((s) => s.id !== serverId));
        if (currentServer?.id === serverId) {
          setCurrentServer(null);
        }
        logger.info('Server deleted successfully', { serverId });
      } catch (err) {
        logger.error('Failed to delete server', err);
        setError(err instanceof Error ? err.message : 'Failed to delete server');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [servers, currentServer, setServers, setCurrentServer, setLoading, setError]
  );

  /**
   * Rejoindre un serveur
   */
  const joinServer = useCallback(
    async (inviteCode: string): Promise<Server> => {
      try {
        setLoading(true);
        setError(null);
        logger.info('Joining server', { inviteCode });
        const data = await serverService.joinServer(inviteCode);
        setServers([...servers, data]);
        logger.info('Server joined successfully', { serverId: data.id });
        return data;
      } catch (err) {
        logger.error('Failed to join server', err);
        setError(err instanceof Error ? err.message : 'Failed to join server');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [servers, setServers, setLoading, setError]
  );

  /**
   * Quitter un serveur
   */
  const leaveServer = useCallback(
    async (serverId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        logger.info('Leaving server', { serverId });
        await serverService.leaveServer(serverId);
        setServers(servers.filter((s) => s.id !== serverId));
        if (currentServer?.id === serverId) {
          setCurrentServer(null);
        }
        logger.info('Server left successfully', { serverId });
      } catch (err) {
        logger.error('Failed to leave server', err);
        setError(err instanceof Error ? err.message : 'Failed to leave server');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [servers, currentServer, setServers, setCurrentServer, setLoading, setError]
  );

  return {
    servers,
    currentServer,
    isLoading,
    error,
    getServers,
    getServer,
    createServer,
    updateServer,
    deleteServer,
    joinServer,
    leaveServer,
  };
}
