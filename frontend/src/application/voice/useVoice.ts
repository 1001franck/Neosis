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
import { socket } from '@infrastructure/websocket/socket';
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
   *
   * On attend la confirmation du serveur (voice:channel_users) avant d'appeler
   * setConnected(). Si le serveur répond voice:error, on rollback proprement.
   * Timeout de 10 s pour ne pas rester bloqué si le serveur ne répond pas.
   */
  const joinVoiceChannel = useCallback(async (channelId: string) => {
    try {
      setConnecting(true);
      setError(null);

      logger.info('🎤 Joining voice channel', { channelId });

      // Initialiser le micro avant d'envoyer la demande
      await getVoiceClient().initializeAudio();

      // Attendre la confirmation serveur avant de mettre à jour le store
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Timeout : le serveur n\'a pas confirmé le join dans les 10 s'));
        }, 10_000);

        const cleanup = () => {
          clearTimeout(timeout);
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          socket.off('voice:channel_users', onSuccess);
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          socket.off('voice:error', onError);
        };

        const onSuccess = ({ channelId: confirmedId }: { channelId: string }) => {
          if (confirmedId !== channelId) return;
          cleanup();
          resolve();
        };

        const onError = ({ message: errMsg }: { message: string }) => {
          cleanup();
          reject(new Error(errMsg));
        };

        socket.once('voice:channel_users', onSuccess);
        socket.once('voice:error', onError);

        // Envoyer la demande après avoir posé les listeners
        socketEmitters.joinVoiceChannel(channelId);
      });

      // Le serveur a confirmé — on met à jour le store
      setConnected(channelId);

      logger.info('✅ Joined voice channel successfully', { channelId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join voice channel';
      logger.error('❌ Failed to join voice channel', err);
      // S'assurer que le micro est libéré si le join a échoué
      destroyVoiceClient();
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
   * Toggle caméra — désactive le partage d'écran si actif
   */
  const toggleCamera = useCallback(async () => {
    const newVideoEnabled = !isVideoEnabled;

    if (newVideoEnabled) {
      // Couper le partage d'écran avant d'activer la caméra
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
   * Toggle partage d'écran — désactive la caméra si active
   */
  const toggleScreenShare = useCallback(async () => {
    const newScreenSharing = !isScreenSharing;

    if (newScreenSharing) {
      // Couper la caméra avant d'activer le partage d'écran
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
   * Enregistrer le callback pour l'arrêt du screenshare via le navigateur.
   * Re-enregistré à chaque connexion car destroyVoiceClient() crée un nouveau singleton.
   */
  useEffect(() => {
    if (!isConnected) return;
    getVoiceClient().setOnScreenShareEnded(() => {
      setScreenSharing(false);
      socketEmitters.updateScreenShare(false);
      logger.info('🖥️ Screen share stopped by browser');
    });
  }, [isConnected, setScreenSharing]);

  return {
    isConnected,
    connectedChannelId,
    isMuted,
    isDeafened,
    isVideoEnabled,
    isScreenSharing,
    isConnecting,
    error,
    connectedUsers: connectedChannelId ? connectedUsers.get(connectedChannelId) || [] : [],
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    toggleScreenShare,
  };
}
