/**
 * APPLICATION - CHANNELS
 * Hook personnalisé pour gérer les canaux
 *
 * Responsabilités:
 * - Encapsuler la logique métier des canaux
 * - Combiner le store Zustand et le service
 * - Fournir une interface simple et cohérente aux composants
 */

import { useCallback } from 'react';
import { useChannelStore } from './channelStore';
import { channelService } from './channelService';
import type { Channel } from '@domain/channels/types';
import type { CreateChannelRequest, UpdateChannelRequest } from '@domain/channels/types';
import { logger } from '@shared/utils/logger';

/**
 * Hook pour gérer les canaux
 *
 * @example
 * const { channels, isLoading, createChannel } = useChannels();
 */
export function useChannels() {
  // === STATE SELECTORS ===
  const channels = useChannelStore((state) => state.channels);
  const currentChannel = useChannelStore((state) => state.currentChannel);
  const isLoading = useChannelStore((state) => state.isLoading);
  const error = useChannelStore((state) => state.error);

  // === STORE ACTIONS ===
  const setChannels = useChannelStore((state) => state.setChannels);
  const setCurrentChannel = useChannelStore((state) => state.setCurrentChannel);
  const setLoading = useChannelStore((state) => state.setLoading);
  const setError = useChannelStore((state) => state.setError);

  /**
   * Récupérer la liste des canaux d'un serveur
   */
  const listChannels = useCallback(async (serverId: string) => {
    setLoading(true);
    setError(null);
    try {
      logger.info('Fetching channels', { serverId });
      const channels = await channelService.getChannels(serverId);
      setChannels(channels);
      logger.info('Channels fetched', { serverId, count: channels.length });
      return channels;
    } catch (err) {
      const message = (err as Error).message;
      logger.error('Failed to list channels', { error: message, serverId });
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setChannels, setLoading, setError]);

  /**
   * Sélectionner un canal et charger son contenu
   */
  const selectChannel = useCallback(
    async (channelId: string) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Selecting channel', { channelId });
        const channel = await channelService.getChannel(channelId);
        setCurrentChannel(channel);
        logger.info('Channel selected', { channelId });
        return channel;
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to select channel', { error: message, channelId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentChannel, setLoading, setError]
  );

  /**
   * Créer un nouveau canal
   */
  const createChannel = useCallback(
    async (serverId: string, request: CreateChannelRequest) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Creating channel', { serverId, name: request.name });
        const channel = await channelService.createChannel(serverId, request);
        setChannels([...channels, channel]);
        logger.info('Channel created', { channelId: channel.id });
        return channel;
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to create channel', { error: message, serverId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [channels, setChannels, setLoading, setError]
  );

  /**
   * Mettre à jour un canal
   */
  const updateChannel = useCallback(
    async (channelId: string, request: UpdateChannelRequest) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Updating channel', { channelId });
        const channel = await channelService.updateChannel(channelId, request);
        setChannels(channels.map((c: Channel) => (c.id === channelId ? channel : c)));
        if (currentChannel?.id === channelId) {
          setCurrentChannel(channel);
        }
        logger.info('Channel updated', { channelId });
        return channel;
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to update channel', { error: message, channelId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [channels, currentChannel, setChannels, setCurrentChannel, setLoading, setError]
  );

  /**
   * Supprimer un canal
   */
  const deleteChannel = useCallback(
    async (channelId: string) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Deleting channel', { channelId });
        await channelService.deleteChannel(channelId);
        setChannels(channels.filter((c: Channel) => c.id !== channelId));
        if (currentChannel?.id === channelId) {
          setCurrentChannel(null);
        }
        logger.info('Channel deleted', { channelId });
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to delete channel', { error: message, channelId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [channels, currentChannel, setChannels, setCurrentChannel, setLoading, setError]
  );

  return {
    // === STATE ===
    channels,
    currentChannel,
    isLoading,
    error,

    // === ACTIONS ===
    listChannels,
    selectChannel,
    createChannel,
    updateChannel,
    deleteChannel,
  };
}
