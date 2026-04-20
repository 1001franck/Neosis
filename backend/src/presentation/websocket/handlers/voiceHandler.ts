/**
 * PRESENTATION - VOICE SOCKET HANDLER
 * Gère les événements Socket.IO pour le voice chat
 */

import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { JoinVoiceChannelUseCase } from '../../../application/voice/usecases/JoinVoiceChannelUseCase.js';
import type { LeaveVoiceChannelUseCase } from '../../../application/voice/usecases/LeaveVoiceChannelUseCase.js';
import type { UpdateVoiceStateUseCase } from '../../../application/voice/usecases/UpdateVoiceStateUseCase.js';
import type { UpdateVideoStateUseCase } from '../../../application/voice/usecases/UpdateVideoStateUseCase.js';
import type { GetChannelVoiceUsersUseCase } from '../../../application/voice/usecases/GetChannelVoiceUsersUseCase.js';

/**
 * VoiceHandler
 *
 * Gère les événements Socket.IO pour la communication vocale :
 * - voice:join : Rejoindre un voice channel
 * - voice:leave : Quitter le voice channel
 * - voice:state : Mettre à jour l'état (mute/deafen)
 * - voice:webrtc_signal : Relayer les signaux WebRTC pour la connexion P2P
 */
export class VoiceHandler {
  constructor(
    private io: SocketIOServer,
    private joinVoiceChannelUseCase: JoinVoiceChannelUseCase,
    private leaveVoiceChannelUseCase: LeaveVoiceChannelUseCase,
    private updateVoiceStateUseCase: UpdateVoiceStateUseCase,
    private updateVideoStateUseCase: UpdateVideoStateUseCase,
    private getChannelVoiceUsersUseCase: GetChannelVoiceUsersUseCase
  ) {}

  /**
   * Enregistrer les handlers pour un socket
   */
  register(socket: Socket): void {
    // Rejoindre un voice channel
    socket.on('voice:join', async ({ channelId }) => {
      await this.handleJoin(socket, channelId);
    });

    // Quitter le voice channel
    socket.on('voice:leave', async () => {
      await this.handleLeave(socket);
    });

    // Mettre à jour l'état vocal (mute/deafen)
    socket.on('voice:state', async ({ isMuted, isDeafened }) => {
      await this.handleStateUpdate(socket, isMuted, isDeafened);
    });

    // Mettre à jour l'état vidéo (caméra) — ne touche pas isScreenSharing
    socket.on('voice:video_state', async ({ isVideoEnabled }) => {
      await this.handleVideoStateUpdate(socket, isVideoEnabled, undefined);
    });

    // Mettre à jour le partage d'écran — ne touche pas isVideoEnabled
    socket.on('voice:screen_share', async ({ isScreenSharing }) => {
      await this.handleVideoStateUpdate(socket, undefined, isScreenSharing);
    });

    // WebRTC signaling : relayer les signaux entre peers
    socket.on('voice:webrtc_signal', async ({ targetUserId, signal }) => {
      await this.handleWebRTCSignal(socket, targetUserId, signal);
    });

    // Déconnexion : quitter automatiquement le voice channel
    socket.on('disconnect', async () => {
      await this.handleDisconnect(socket);
    });
  }

  /**
   * Handler : Rejoindre un voice channel
   */
  private async handleJoin(socket: Socket, channelId: string): Promise<void> {
    try {
      const userId = socket.data.userId;
      const username = socket.data.username;

      if (!userId || !username) {
        socket.emit('voice:error', { message: 'User not authenticated' });
        return;
      }

      console.log(`[Voice] User ${username} (${userId}) joining channel ${channelId}`);

      // Use case : Rejoindre le voice channel
      const { connection, serverId } = await this.joinVoiceChannelUseCase.execute({ userId, channelId });

      // Rejoindre la room Socket.IO du channel
      await socket.join(`voice:${channelId}`);

      // Stocker le channelId et serverId dans les données du socket
      socket.data.voiceChannelId = channelId;
      socket.data.voiceServerId = serverId;

      // Notifier tous les utilisateurs du channel
      this.io.to(`voice:${channelId}`).emit('voice:user_joined', {
        userId,
        username,
        channelId,
        isMuted: connection.isMuted,
        isDeafened: connection.isDeafened,
        isVideoEnabled: connection.isVideoEnabled,
        isScreenSharing: connection.isScreenSharing
      });

      // Envoyer la liste complète des utilisateurs au nouveau venu
      const users = await this.getChannelVoiceUsersUseCase.execute({ channelId });
      socket.emit('voice:channel_users', { channelId, users });

      // Notifier tous les membres du serveur du nouveau compteur (pour la sidebar)
      this.io.to(`server:${serverId}`).emit('server:voice_update', { channelId, count: users.length });

      console.log(`[Voice] User ${username} joined channel ${channelId} successfully`);
    } catch (error: unknown) {
      console.error('[Voice] Join error:', error);
      socket.emit('voice:error', {
        message: error instanceof Error ? error.message : 'Failed to join voice channel'
      });
    }
  }

  /**
   * Handler : Quitter le voice channel
   */
  private async handleLeave(socket: Socket): Promise<void> {
    try {
      const userId = socket.data.userId;
      const channelId = socket.data.voiceChannelId;

      if (!userId) {
        socket.emit('voice:error', { message: 'User not authenticated' });
        return;
      }

      console.log(`[Voice] User ${userId} leaving channel ${channelId}`);

      const serverId = socket.data.voiceServerId;

      // Use case : Quitter le voice channel
      await this.leaveVoiceChannelUseCase.execute({ userId });

      // Quitter la room Socket.IO
      if (channelId) {
        await socket.leave(`voice:${channelId}`);

        // Notifier tous les utilisateurs du channel
        this.io.to(`voice:${channelId}`).emit('voice:user_left', {
          userId,
          channelId
        });

        // Notifier tous les membres du serveur du nouveau compteur (pour la sidebar)
        if (serverId) {
          const users = await this.getChannelVoiceUsersUseCase.execute({ channelId });
          this.io.to(`server:${serverId}`).emit('server:voice_update', { channelId, count: users.length });
        }
      }

      // Nettoyer les données du socket
      delete socket.data.voiceChannelId;
      delete socket.data.voiceServerId;

      console.log(`[Voice] User ${userId} left channel successfully`);
    } catch (error: unknown) {
      console.error('[Voice] Leave error:', error);
      socket.emit('voice:error', {
        message: error instanceof Error ? error.message : 'Failed to leave voice channel'
      });
    }
  }

  /**
   * Handler : Mettre à jour l'état vocal (mute/deafen)
   */
  private async handleStateUpdate(
    socket: Socket,
    isMuted?: boolean,
    isDeafened?: boolean
  ): Promise<void> {
    try {
      const userId = socket.data.userId;
      const channelId = socket.data.voiceChannelId;

      if (!userId) {
        socket.emit('voice:error', { message: 'User not authenticated' });
        return;
      }

      // Validation des paramètres
      if (typeof isMuted !== 'boolean' || typeof isDeafened !== 'boolean') {
        socket.emit('voice:error', { message: 'Invalid state parameters' });
        return;
      }

      console.log(`[Voice] User ${userId} updating state: muted=${isMuted}, deafened=${isDeafened}`);

      // Use case : Mettre à jour l'état
      const connection = await this.updateVoiceStateUseCase.execute({
        userId,
        isMuted,
        isDeafened
      });

      // Notifier tous les utilisateurs du channel
      if (channelId) {
        this.io.to(`voice:${channelId}`).emit('voice:user_state_changed', {
          userId,
          isMuted: connection.isMuted,
          isDeafened: connection.isDeafened,
          isVideoEnabled: connection.isVideoEnabled,
          isScreenSharing: connection.isScreenSharing
        });
      }

      console.log(`[Voice] User ${userId} state updated successfully`);
    } catch (error: unknown) {
      console.error('[Voice] State update error:', error);
      socket.emit('voice:error', {
        message: error instanceof Error ? error.message : 'Failed to update voice state'
      });
    }
  }

  /**
   * Handler : Mettre à jour l'état vidéo (caméra / partage d'écran)
   */
  private async handleVideoStateUpdate(
    socket: Socket,
    isVideoEnabled: boolean | undefined,
    isScreenSharing: boolean | undefined
  ): Promise<void> {
    try {
      const userId = socket.data.userId;
      const channelId = socket.data.voiceChannelId;

      if (!userId) {
        socket.emit('voice:error', { message: 'User not authenticated' });
        return;
      }

      if (isVideoEnabled !== undefined && typeof isVideoEnabled !== 'boolean') {
        socket.emit('voice:error', { message: 'Invalid video state parameters' });
        return;
      }
      if (isScreenSharing !== undefined && typeof isScreenSharing !== 'boolean') {
        socket.emit('voice:error', { message: 'Invalid screen share parameters' });
        return;
      }

      const connection = await this.updateVideoStateUseCase.execute({
        userId,
        isVideoEnabled,
        isScreenSharing
      });

      if (channelId) {
        this.io.to(`voice:${channelId}`).emit('voice:user_state_changed', {
          userId,
          isMuted: connection.isMuted,
          isDeafened: connection.isDeafened,
          isVideoEnabled: connection.isVideoEnabled,
          isScreenSharing: connection.isScreenSharing
        });
      }
    } catch (error: unknown) {
      console.error('[Voice] Video state update error:', error);
      socket.emit('voice:error', {
        message: error instanceof Error ? error.message : 'Failed to update video state'
      });
    }
  }

  /**
   * Handler : Relayer les signaux WebRTC
   *
   * WebRTC nécessite un "signaling server" pour que les peers échangent leurs
   * configurations de connexion (SDP et ICE candidates).
   *
   * Le serveur Socket.IO sert de "messager" : il relaie les signaux entre clients
   * sans les modifier.
   */
  private async handleWebRTCSignal(
    socket: Socket,
    targetUserId: string,
    signal: unknown
  ): Promise<void> {
    try {
      const fromUserId = socket.data.userId;
      const fromUsername = socket.data.username;

      console.log(`[Voice WebRTC] Relaying signal from ${fromUserId} to ${targetUserId}`);

      // Trouver le socket du destinataire
      const sockets = await this.io.fetchSockets();
      const targetSocket = sockets.find(s => s.data.userId === targetUserId);

      if (targetSocket) {
        // Relayer le signal au destinataire
        targetSocket.emit('voice:webrtc_signal', {
          fromUserId,
          fromUsername,
          signal
        });
      } else {
        console.warn(`[Voice WebRTC] Target user ${targetUserId} not found`);
      }
    } catch (error: unknown) {
      console.error('[Voice WebRTC] Signal relay error:', error);
    }
  }

  /**
   * Handler : Déconnexion (quitter automatiquement le voice channel)
   */
  private async handleDisconnect(socket: Socket): Promise<void> {
    try {
      const userId = socket.data.userId;
      const channelId = socket.data.voiceChannelId;

      if (userId && channelId) {
        console.log(`[Voice] User ${userId} disconnected, leaving voice channel ${channelId}`);

        const serverId = socket.data.voiceServerId;

        // Quitter automatiquement le voice channel
        await this.leaveVoiceChannelUseCase.execute({ userId });

        // Notifier les autres utilisateurs
        this.io.to(`voice:${channelId}`).emit('voice:user_left', {
          userId,
          channelId
        });

        // Notifier tous les membres du serveur du nouveau compteur (pour la sidebar)
        if (serverId) {
          const users = await this.getChannelVoiceUsersUseCase.execute({ channelId });
          this.io.to(`server:${serverId}`).emit('server:voice_update', { channelId, count: users.length });
        }
      }
    } catch (error: unknown) {
      console.error('[Voice] Disconnect cleanup error:', error);
    }
  }
}
