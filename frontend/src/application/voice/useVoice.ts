/**
 * APPLICATION - USE VOICE HOOK
 * Hook React personnalisé pour gérer les voice channels
 *
 * Responsabilités :
 * - Interface simple pour rejoindre/quitter un voice channel
 * - Gestion du WebRTC client
 * - Synchronisation avec le store Zustand
 * - Gestion des erreurs
 */

import { useCallback, useEffect, useRef } from 'react';
import { useVoiceStore } from './voiceStore';
import { VoiceClient } from '@infrastructure/webrtc/VoiceClient';
import { socketEmitters } from '@infrastructure/websocket/emitters';
import { logger } from '@shared/utils/logger';
import { useAuthStore } from '@application/auth/authStore';

/**
 * Hook personnalisé pour le voice
 *
 * @example
 * const { joinVoiceChannel, leaveVoiceChannel, toggleMute, isConnected } = useVoice();
 *
 * // Rejoindre un voice channel
 * await joinVoiceChannel('channel-id-123');
 *
 * // Toggle mute
 * toggleMute();
 *
 * // Quitter
 * await leaveVoiceChannel();
 */
export function useVoice() {
  // Référence au client WebRTC (persistante entre les renders)
  const voiceClientRef = useRef<VoiceClient | null>(null);

  // État depuis le store Zustand
  const {
    isConnected,
    connectedChannelId,
    isMuted,
    isDeafened,
    isConnecting,
    error,
    connectedUsers,
    setConnected,
    setDisconnected,
    setConnecting,
    setMuted,
    setDeafened,
    setError,
  } = useVoiceStore();

  /**
   * Rejoindre un voice channel
   */
  const joinVoiceChannel = useCallback(async (channelId: string) => {
    try {
      setConnecting(true);
      setError(null);

      logger.info('🎤 Joining voice channel', { channelId });

      // 1. Créer le client WebRTC si nécessaire
      if (!voiceClientRef.current) {
        voiceClientRef.current = new VoiceClient();
      }

      // 2. Initialiser l'audio (demander accès au micro)
      await voiceClientRef.current.initializeAudio();

      // 3. Informer le backend via Socket.IO
      socketEmitters.joinVoiceChannel(channelId);

      // 4. Mettre à jour le store (le serveur confirmera via 'voice:user_joined')
      setConnected(channelId);

      logger.info(' Joined voice channel successfully', { channelId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join voice channel';
      logger.error('❌ Failed to join voice channel', err);
      setError(message);
      setConnecting(false);
      throw err;
    }
  }, [setConnected, setConnecting, setError]);

  /**
   * Quitter le voice channel
   */
  const leaveVoiceChannel = useCallback(async () => {
    try {
      logger.info('🚪 Leaving voice channel');

      const currentChannelId = useVoiceStore.getState().connectedChannelId;
      const currentUserId = useAuthStore.getState().user?.id;

      // 1. Informer le backend via Socket.IO
      socketEmitters.leaveVoiceChannel();

      // 2. Nettoyer le client WebRTC
      if (voiceClientRef.current) {
        voiceClientRef.current.cleanup();
        voiceClientRef.current = null;
      }

      // 2.5 Nettoyer le compteur local immédiatement
      if (currentChannelId && currentUserId) {
        useVoiceStore.getState().removeUser(currentChannelId, currentUserId);
      }

      // 3. Mettre à jour le store
      setDisconnected();

      logger.info(' Left voice channel successfully');
    } catch (err) {
      logger.error('❌ Failed to leave voice channel', err);
      throw err;
    }
  }, [setDisconnected]);

  /**
   * Toggle mute (activer/désactiver le micro)
   */
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;

    // 1. Appliquer localement (WebRTC)
    if (voiceClientRef.current) {
      voiceClientRef.current.setMuted(newMuted);
    }

    // 2. Mettre à jour le store
    setMuted(newMuted);

    // 3. Informer le backend (pour que les autres voient l'icône mute)
    socketEmitters.updateVoiceState(newMuted, isDeafened);

    logger.info(`🎤 Microphone ${newMuted ? 'muted' : 'unmuted'}`);
  }, [isMuted, isDeafened, setMuted]);

  /**
   * Toggle deafen (activer/désactiver le son)
   */
  const toggleDeafen = useCallback(() => {
    const newDeafened = !isDeafened;

    // 1. Appliquer localement (WebRTC)
    if (voiceClientRef.current) {
      voiceClientRef.current.setDeafened(newDeafened);
    }

    // 2. Mettre à jour le store (deafen implique mute)
    setDeafened(newDeafened);

    // 3. Informer le backend
    socketEmitters.updateVoiceState(newDeafened ? true : isMuted, newDeafened);

    logger.info(`🔇 Audio ${newDeafened ? 'deafened' : 'undeafened'}`);
  }, [isDeafened, isMuted, setDeafened]);

  /**
   * Créer une connexion WebRTC avec un autre utilisateur
   * (Appelé quand un autre utilisateur rejoint le channel)
   */
  const connectToPeer = useCallback(async (userId: string) => {
    if (voiceClientRef.current && isConnected) {
      try {
        logger.info('🔗 Connecting to peer', { userId });
        await voiceClientRef.current.createPeerConnection(userId, true);
      } catch (err) {
        logger.error('Failed to connect to peer', err);
      }
    }
  }, [isConnected]);

  /**
   * Cleanup automatique quand le composant est démonté
   */
  useEffect(() => {
    return () => {
      if (voiceClientRef.current) {
        voiceClientRef.current.cleanup();
        voiceClientRef.current = null;
      }
    };
  }, []);

  /**
   * Quand on reçoit la liste des utilisateurs du channel,
   * créer des connexions WebRTC avec chacun
   */
  useEffect(() => {
    if (isConnected && connectedChannelId) {
      const users = connectedUsers.get(connectedChannelId) || [];

      // Créer des connexions avec tous les utilisateurs déjà présents
      users.forEach(user => {
        // Ne pas créer de connexion avec soi-même
        // (userId sera filtré côté VoiceClient si besoin)
        connectToPeer(user.userId);
      });
    }
  }, [isConnected, connectedChannelId, connectedUsers, connectToPeer]);

  return {
    // État
    isConnected,
    connectedChannelId,
    isMuted,
    isDeafened,
    isConnecting,
    error,
    connectedUsers: connectedChannelId ? connectedUsers.get(connectedChannelId) || [] : [],

    // Actions
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
  };
}
