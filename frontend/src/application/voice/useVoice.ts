/**
 * APPLICATION - USE VOICE HOOK
 * Hook React personnalisé pour gérer les voice channels
 *
 * ⚠️ Le VoiceClient est un SINGLETON (getVoiceClient/destroyVoiceClient)
 * partagé entre tous les composants qui appellent useVoice().
 * Avant, chaque composant avait son propre voiceClientRef null, donc
 * les appels à toggleMute/toggleDeafen/leaveVoiceChannel depuis VoiceMiniPanel
 * ne faisaient rien sur le vrai stream audio.
 */

import { useCallback, useEffect } from 'react';
import { useVoiceStore } from './voiceStore';
import { getVoiceClient, destroyVoiceClient } from '@infrastructure/webrtc/VoiceClient';
import { socketEmitters } from '@infrastructure/websocket/emitters';
import { logger } from '@shared/utils/logger';
import { useAuthStore } from '@application/auth/authStore';

export function useVoice() {
  const {
    isConnected,
    connectedChannelId,
    isMuted,
    isDeafened,
    isVideoEnabled,
    isScreenSharing,
    isConnecting,
    error,
    connectedUsers,
    setConnected,
    setDisconnected,
    setConnecting,
    setMuted,
    setDeafened,
    setVideoEnabled,
    setScreenSharing,
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

      // Initialiser l'audio via le singleton partagé
      await getVoiceClient().initializeAudio();

      // Informer le backend via Socket.IO
      socketEmitters.joinVoiceChannel(channelId);

      // Mettre à jour le store
      setConnected(channelId);

      logger.info('✅ Joined voice channel successfully', { channelId });
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

      // 1. Informer le backend
      socketEmitters.leaveVoiceChannel();

      // 2. Détruire le singleton WebRTC (libère le micro + coupe tous les streams)
      destroyVoiceClient();

      // 3. Retirer l'utilisateur local du store immédiatement
      if (currentChannelId && currentUserId) {
        useVoiceStore.getState().removeUser(currentChannelId, currentUserId);
      }

      // 4. Mettre à jour le store
      setDisconnected();

      logger.info('✅ Left voice channel successfully');
    } catch (err) {
      logger.error('❌ Failed to leave voice channel', err);
      throw err;
    }
  }, [setDisconnected]);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;

    // Agit sur le singleton partagé — fonctionne quel que soit le composant appelant
    getVoiceClient().setMuted(newMuted);
    setMuted(newMuted);
    socketEmitters.updateVoiceState(newMuted, isDeafened);

    logger.info(`🎤 Microphone ${newMuted ? 'muted' : 'unmuted'}`);
  }, [isMuted, isDeafened, setMuted]);

  /**
   * Toggle deafen
   */
  const toggleDeafen = useCallback(() => {
    const newDeafened = !isDeafened;

    // setDeafened coupe aussi le micro ET mute tous les audio elements des peers
    getVoiceClient().setDeafened(newDeafened);
    setDeafened(newDeafened);
    socketEmitters.updateVoiceState(newDeafened ? true : isMuted, newDeafened);

    logger.info(`🔇 Audio ${newDeafened ? 'deafened' : 'undeafened'}`);
  }, [isDeafened, isMuted, setDeafened]);

  /**
   * Toggle caméra (mutuellement exclusif avec le screenshare)
   */
  const toggleCamera = useCallback(async () => {
    const newVideoEnabled = !isVideoEnabled;

    if (newVideoEnabled) {
      // Désactiver le screenshare si actif (règle métier : exclusion mutuelle)
      if (isScreenSharing) {
        getVoiceClient().disableScreenShare();
        setScreenSharing(false);
        socketEmitters.updateScreenShare(false);
      }
      await getVoiceClient().enableCamera();
    } else {
      getVoiceClient().disableCamera();
    }

    setVideoEnabled(newVideoEnabled);
    socketEmitters.updateVideoState(newVideoEnabled);
    logger.info(`📹 Camera ${newVideoEnabled ? 'enabled' : 'disabled'}`);
  }, [isVideoEnabled, isScreenSharing, setVideoEnabled, setScreenSharing]);

  /**
   * Toggle partage d'écran (mutuellement exclusif avec la caméra)
   */
  const toggleScreenShare = useCallback(async () => {
    const newScreenSharing = !isScreenSharing;

    if (newScreenSharing) {
      // Désactiver la caméra si active (règle métier : exclusion mutuelle)
      if (isVideoEnabled) {
        getVoiceClient().disableCamera();
        setVideoEnabled(false);
        socketEmitters.updateVideoState(false);
      }
      await getVoiceClient().enableScreenShare();
    } else {
      getVoiceClient().disableScreenShare();
    }

    setScreenSharing(newScreenSharing);
    socketEmitters.updateScreenShare(newScreenSharing);
    logger.info(`🖥️ Screen share ${newScreenSharing ? 'enabled' : 'disabled'}`);
  }, [isScreenSharing, isVideoEnabled, setScreenSharing, setVideoEnabled]);

  /**
   * Enregistrer le callback pour l'arrêt du screenshare via le navigateur
   */
  useEffect(() => {
    getVoiceClient().setOnScreenShareEnded(() => {
      setScreenSharing(false);
      socketEmitters.updateScreenShare(false);
      logger.info('🖥️ Screen share stopped by browser');
    });
  }, [setScreenSharing]);

  /**
   * Créer une connexion WebRTC avec un pair
   */
  const connectToPeer = useCallback(async (userId: string) => {
    if (isConnected) {
      try {
        logger.info('🔗 Connecting to peer', { userId });
        await getVoiceClient().createPeerConnection(userId, true);
      } catch (err) {
        logger.error('Failed to connect to peer', err);
      }
    }
  }, [isConnected]);

  /**
   * Connexion automatique aux pairs déjà présents dans le channel
   */
  useEffect(() => {
    if (isConnected && connectedChannelId) {
      const users = connectedUsers.get(connectedChannelId) || [];
      users.forEach(user => {
        connectToPeer(user.userId);
      });
    }
  }, [isConnected, connectedChannelId, connectedUsers, connectToPeer]);

  return {
    isConnected,
    connectedChannelId,
    isMuted,
    isDeafened,
    isConnecting,
    error,
    connectedUsers: connectedChannelId ? connectedUsers.get(connectedChannelId) || [] : [],
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
  };
}
