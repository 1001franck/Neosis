/**
 * PRESENTATION - VOICE SOCKET HANDLER
 * Gère les événements Socket.IO pour le voice chat
 */

import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { JoinVoiceChannelUseCase } from '../../../application/voice/usecases/JoinVoiceChannelUseCase.js';
import type { LeaveVoiceChannelUseCase } from '../../../application/voice/usecases/LeaveVoiceChannelUseCase.js';
import type { UpdateVoiceStateUseCase } from '../../../application/voice/usecases/UpdateVoiceStateUseCase.js';
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
      const connection = await this.joinVoiceChannelUseCase.execute({ userId, channelId });

      // Rejoindre la room Socket.IO du channel
      await socket.join(`voice:${channelId}`);

      // Stocker le channelId dans les données du socket
      socket.data.voiceChannelId = channelId;

      // Notifier tous les utilisateurs du channel
      this.io.to(`voice:${channelId}`).emit('voice:user_joined', {
        userId,
        username,
        channelId,
        isMuted: connection.isMuted,
        isDeafened: connection.isDeafened
      });

      // Envoyer la liste complète des utilisateurs au nouveau venu
      const users = await this.getChannelVoiceUsersUseCase.execute({ channelId });
      socket.emit('voice:channel_users', { channelId, users });

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
      }

      // Nettoyer les données du socket
      delete socket.data.voiceChannelId;

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
          isDeafened: connection.isDeafened
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

        // Quitter automatiquement le voice channel
        await this.leaveVoiceChannelUseCase.execute({ userId });

        // Notifier les autres utilisateurs
        this.io.to(`voice:${channelId}`).emit('voice:user_left', {
          userId,
          channelId
        });
      }
    } catch (error: unknown) {
      console.error('[Voice] Disconnect cleanup error:', error);
    }
  }
}
