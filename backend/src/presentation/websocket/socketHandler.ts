import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { Logger } from '../../shared/utils/logger.js';
import { JWT_SECRET } from '../../shared/config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import {
  CreateMessageUseCase,
  UpdateMessageUseCase,
  DeleteMessageUseCase
} from '../../application/messages/usecases/messageUseCase.js';
import { AddReactionUseCase, RemoveReactionUseCase } from '../../application/messages/usecases/ReactionUseCases.js';
import { MarkChannelAsReadUseCase } from '../../application/messages/usecases/markChannelAsReadUseCase.js';
import type { IUserRepository } from '../../domain/users/repositories/UserRepository.js';

/**
 * Interface pour les donnees d'authentification du socket
 */
interface SocketData {
  userId: string;
  username: string;
  channelId?: string;
}

interface JwtPayload {
  userId: string;
}

/**
 * Gestionnaire principal pour les WebSockets
 * Gere toutes les connexions en temps reel et les evenements Socket.IO
 */
export class SocketHandler {
  private io: SocketIOServer;
  private logger: Logger;

  // Map pour suivre qui est en train de taper dans quel channel
  private typingUsers: Map<string, Set<string>> = new Map();

  constructor(
    httpServer: HTTPServer,
    private createMessageUseCase: CreateMessageUseCase,
    private updateMessageUseCase: UpdateMessageUseCase,
    private deleteMessageUseCase: DeleteMessageUseCase,
    private markChannelAsReadUseCase: MarkChannelAsReadUseCase,
    private userRepository: IUserRepository,
    private addReactionUseCase: AddReactionUseCase,
    private removeReactionUseCase: RemoveReactionUseCase
  ) {
    this.logger = new Logger('SocketHandler');

    // Initialise Socket.IO avec CORS configure
    // Inclure toutes les origines valides : web prod, dev local, app desktop Tauri
    // Accepter toutes les variantes Tauri dynamiquement
    const isTauriOrigin = (origin: string) =>
      origin.includes('tauri.localhost') || origin.startsWith('tauri://');

    const staticOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:1420',
    ].filter(Boolean);

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (isTauriOrigin(origin) || staticOrigins.includes(origin)) return callback(null, true);
          callback(new Error(`CORS Socket.IO: origine non autorisée: ${origin}`));
        },
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupConnectionHandler();
  }

  /**
   * Configure les middlewares Socket.IO
   */
  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        // Cookie httpOnly (web) ou Authorization header (app desktop Tauri)
        const cookieHeader = socket.handshake.headers.cookie || '';
        const tokenMatch = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
        const cookieToken = tokenMatch ? tokenMatch.split('=')[1] : null;
        const authHeader = socket.handshake.headers.authorization as string | undefined;
        const bearerToken = authHeader?.replace('Bearer ', '') || null;
        const token = cookieToken ?? bearerToken ?? (socket.handshake.auth?.token as string | undefined) ?? null;

        if (!token) {
          return next(new Error('Authentication error: token missing'));
        }

        // Verification reelle du JWT
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Lookup the user's username from database
        const user = await this.userRepository.findById(decoded.userId);
        if (!user) {
          return next(new Error('Authentication error: user not found'));
        }

        socket.data = {
          userId: decoded.userId,
          username: user.username,
        } as SocketData;

        next();
      } catch (error) {
        next(new Error('Authentication error: invalid token'));
      }
    });
  }

  /**
   * Configure le gestionnaire de connexion principal
   */
  private setupConnectionHandler(): void {
    this.io.on('connection', (socket: Socket) => {
      const { userId, username } = socket.data as SocketData;

      this.logger.info(`User ${username} (${userId}) connected`);

      // Chaque utilisateur rejoint sa salle personnelle pour recevoir les DMs
      socket.join(`user:${userId}`);

      // Gestion des evenements
      this.handleJoinServer(socket);
      this.handleLeaveServer(socket);
      this.handleJoinChannel(socket);
      this.handleLeaveChannel(socket);
      this.handleSendMessage(socket);
      this.handleUpdateMessage(socket);
      this.handleDeleteMessage(socket);
      this.handleTypingStart(socket);
      this.handleTypingStop(socket);
      this.handleMarkRead(socket);
      this.handleProfileUpdate(socket);
      this.handleAddReaction(socket);
      this.handleRemoveReaction(socket);
      this.handleDisconnect(socket);
    });
  }

  /**
   * Gere l'evenement de rejoindre un serveur (room Socket.IO)
   */
  private handleJoinServer(socket: Socket): void {
    socket.on('server:join', (serverId: string) => {
      try {
        socket.join(`server:${serverId}`);
        this.logger.info(`User ${socket.data.userId} joined server room ${serverId}`);
        this.emitOnlineUsers(serverId);
      } catch (error) {
        this.logger.error('Erreur lors du join serveur:', error);
      }
    });
  }

  /**
   * Gere l'evenement de quitter un serveur (room Socket.IO)
   */
  private handleLeaveServer(socket: Socket): void {
    socket.on('server:leave', (serverId: string) => {
      try {
        socket.leave(`server:${serverId}`);
        this.logger.info(`User ${socket.data.userId} left server room ${serverId}`);
        this.emitOnlineUsers(serverId);
      } catch (error) {
        this.logger.error('Erreur lors du leave serveur:', error);
      }
    });
  }

  /**
   * Gere l'evenement de rejoindre un channel
   */
  private handleJoinChannel(socket: Socket): void {
    socket.on('channel:join', (channelId: string) => {
      // Quitter l'ancien channel si present
      if (socket.data.channelId) {
        socket.leave(`channel:${socket.data.channelId}`);
      }

      // Rejoindre le nouveau channel
      socket.join(`channel:${channelId}`);
      socket.data.channelId = channelId;

      this.logger.info(`User ${socket.data.userId} joined channel ${channelId}`);

      // Notifier les autres utilisateurs qu'un membre a rejoint le channel
      socket.to(`channel:${channelId}`).emit('channel:user_joined', {
        userId: socket.data.userId,
        channelId
      });
    });
  }

  /**
   * Gere l'evenement de quitter un channel
   */
  private handleLeaveChannel(socket: Socket): void {
    socket.on('channel:leave', (channelId: string) => {
      socket.leave(`channel:${channelId}`);

      if (socket.data.channelId === channelId) {
        socket.data.channelId = undefined;
      }

      // Notifier les autres utilisateurs qu'un membre a quitte le channel
      socket.to(`channel:${channelId}`).emit('channel:user_left', {
        userId: socket.data.userId,
        channelId
      });
    });
  }

  /**
   * Gere l'evenement d'envoi de message
   */
  private handleSendMessage(socket: Socket): void {
    socket.on('message:send', async (data: { content: string; channelId: string; attachmentIds?: string[]; clientTempId?: string }) => {
      try {
        const { userId } = socket.data as SocketData;

        // Creer le message via le use case (verifie les permissions en interne)
        const message = await this.createMessageUseCase.execute({
          content: data.content,
          userId,
          channelId: data.channelId,
          ...(data.attachmentIds ? { attachmentIds: data.attachmentIds } : {}),
        });

        // Emettre le message a tous les utilisateurs du channel
        const payload = typeof (message as any).toJSON === 'function' ? (message as any).toJSON() : message;
        this.io.to(`channel:${data.channelId}`).emit('message:new', {
          ...payload,
          clientTempId: data.clientTempId ?? null,
        });

        this.logger.info(`Message sent in channel ${data.channelId}`);
      } catch (error) {
        this.logger.error('Error sending message:', error);
        const msg = error instanceof AppError ? error.message : 'Échec de l\'envoi du message';
        socket.emit('message:error', { message: msg, clientTempId: data.clientTempId ?? null });
      }
    });
  }

  /**
   * Gere l'evenement de mise a jour de message
   */
  private handleUpdateMessage(socket: Socket): void {
    socket.on('message:update', async (data: { messageId: string; content: string; channelId: string }) => {
      try {
        const { userId } = socket.data as SocketData;

        // Mettre a jour le message via le use case (verifie les permissions en interne)
        const message = await this.updateMessageUseCase.execute({
          messageId: data.messageId,
          userId,
          channelId: data.channelId,
          content: data.content
        });

        // Emettre la mise a jour a tous les utilisateurs du channel
        this.io.to(`channel:${data.channelId}`).emit('message:updated', message);

        this.logger.info(`Message ${data.messageId} updated`);
      } catch (error) {
        this.logger.error('Error updating message:', error);
        const msg = error instanceof AppError ? error.message : 'Échec de la modification du message';
        socket.emit('message:error', { message: msg });
      }
    });
  }

  /**
   * Gere l'evenement de suppression de message
   */
  private handleDeleteMessage(socket: Socket): void {
    socket.on('message:delete', async (data: { messageId: string; channelId: string; scope?: 'me' | 'everyone' }) => {
      try {
        const { userId, username } = socket.data as SocketData;

        // Supprimer le message via le use case (verifie les permissions en interne)
        const result = await this.deleteMessageUseCase.execute({
          messageId: data.messageId,
          userId,
          channelId: data.channelId,
          scope: data.scope === 'me' ? 'me' : 'everyone'
        });

        const payload = {
          messageId: data.messageId,
          deletedBy: username,
          deletedByUserId: userId,
          deletedByRole: result.deletedByRole,
          scope: result.scope,
        };

        // Delete for me: only to requester
        if (result.scope === 'me') {
          socket.emit('message:deleted', payload);
        } else {
          // Delete for everyone: broadcast to channel
          this.io.to(`channel:${data.channelId}`).emit('message:deleted', payload);
        }

        this.logger.info(`Message ${data.messageId} deleted`);
      } catch (error) {
        this.logger.error('Error deleting message:', error);
        const msg = error instanceof AppError ? error.message : 'Échec de la suppression du message';
        socket.emit('message:error', { message: msg });
      }
    });
  }

  /**
   * Gère l'ajout d'une réaction à un message
   * Client → Serveur : reaction:add { messageId, channelId, emoji }
   * Serveur → Channel : reaction:updated { messageId, reactions }
   */
  private handleAddReaction(socket: Socket): void {
    socket.on('reaction:add', async (data: { messageId: string; channelId: string; emoji: string }) => {
      try {
        const { userId } = socket.data as SocketData;
        const reactions = await this.addReactionUseCase.execute({ messageId: data.messageId, userId, emoji: data.emoji });
        this.io.to(`channel:${data.channelId}`).emit('reaction:updated', { messageId: data.messageId, reactions });
      } catch (error) {
        this.logger.error('Error adding reaction:', error);
        const msg = error instanceof AppError ? error.message : 'Échec de l\'ajout de la réaction';
        socket.emit('message:error', { message: msg });
      }
    });
  }

  /**
   * Gère la suppression d'une réaction d'un message
   * Client → Serveur : reaction:remove { messageId, channelId, emoji }
   * Serveur → Channel : reaction:updated { messageId, reactions }
   */
  private handleRemoveReaction(socket: Socket): void {
    socket.on('reaction:remove', async (data: { messageId: string; channelId: string; emoji: string }) => {
      try {
        const { userId } = socket.data as SocketData;
        const reactions = await this.removeReactionUseCase.execute({ messageId: data.messageId, userId, emoji: data.emoji });
        this.io.to(`channel:${data.channelId}`).emit('reaction:updated', { messageId: data.messageId, reactions });
      } catch (error) {
        this.logger.error('Error removing reaction:', error);
        const msg = error instanceof AppError ? error.message : 'Échec de la suppression de la réaction';
        socket.emit('message:error', { message: msg });
      }
    });
  }

  /**
   * Gere l'evenement de debut de frappe
   * Envoie le username en plus du userId pour que le frontend puisse afficher qui tape
   */
  private handleTypingStart(socket: Socket): void {
    socket.on('typing:start', (channelId: string) => {
      const { userId, username } = socket.data as SocketData;

      // Ajouter l'utilisateur a la liste des utilisateurs en train de taper
      if (!this.typingUsers.has(channelId)) {
        this.typingUsers.set(channelId, new Set());
      }
      this.typingUsers.get(channelId)!.add(userId);

      // Notifier les autres utilisateurs avec le username
      socket.to(`channel:${channelId}`).emit('typing:user_started', {
        userId,
        username,
        channelId
      });
    });
  }

  /**
   * Gere l'evenement de fin de frappe
   */
  private handleTypingStop(socket: Socket): void {
    socket.on('typing:stop', (channelId: string) => {
      const { userId, username } = socket.data as SocketData;

      // Retirer l'utilisateur de la liste des utilisateurs en train de taper
      if (this.typingUsers.has(channelId)) {
        this.typingUsers.get(channelId)!.delete(userId);

        if (this.typingUsers.get(channelId)!.size === 0) {
          this.typingUsers.delete(channelId);
        }
      }

      // Notifier les autres utilisateurs avec le username
      socket.to(`channel:${channelId}`).emit('typing:user_stopped', {
        userId,
        username,
        channelId
      });
    });
  }

  /**
   * Gere l'evenement de lecture de message
   */
  private handleMarkRead(socket: Socket): void {
    socket.on('channel:mark_read', async (data: { channelId: string; messageId: string }) => {
      try {
        const { userId } = socket.data as SocketData;

        await this.markChannelAsReadUseCase.execute({
          userId,
          channelId: data.channelId,
          messageId: data.messageId
        });

        // Broadcast a tous les utilisateurs du channel
        this.io.to(`channel:${data.channelId}`).emit('message:read', {
          channelId: data.channelId,
          userId,
          messageId: data.messageId,
          readAt: new Date()
        });
      } catch (error) {
        this.logger.error('Error marking channel as read:', error);
      }
    });
  }

  /**
   * Gere la mise a jour du profil utilisateur
   * Broadcast a toutes les rooms serveur que l'utilisateur a rejoint
   */
  private handleProfileUpdate(socket: Socket): void {
    socket.on('user:profile_update', (data: {
      username?: string;
      avatar?: string | null;
      bio?: string | null;
      customStatus?: string | null;
      statusEmoji?: string | null;
    }) => {
      const { userId } = socket.data as SocketData;

      // Broadcast aux rooms serveur rejointes par ce socket
      for (const room of socket.rooms) {
        if (room.startsWith('server:')) {
          socket.to(room).emit('user:profile_updated', {
            userId,
            ...data,
          });
        }
      }

      this.logger.info(`User ${userId} profile updated, broadcast to server rooms`);
    });
  }

  /**
   * Gere l'evenement de deconnexion
   */
  private handleDisconnect(socket: Socket): void {
    socket.on('disconnect', () => {
      const { userId, username } = socket.data as SocketData;

      this.logger.info(`User ${userId} disconnected`);

      // Nettoyer les informations de frappe ET notifier les autres utilisateurs
      // pour que l'indicateur "X is typing..." disparaisse immediatement
      for (const [typingChannelId, typingSet] of this.typingUsers.entries()) {
        if (typingSet.has(userId)) {
          typingSet.delete(userId);

          // Notifier les autres utilisateurs de ce channel
          this.io.to(`channel:${typingChannelId}`).emit('typing:user_stopped', {
            userId,
            username,
            channelId: typingChannelId
          });

          if (typingSet.size === 0) {
            this.typingUsers.delete(typingChannelId);
          }
        }
      }

      // Emettre la liste mise a jour pour chaque serveur room que le socket avait rejoint
      for (const room of socket.rooms) {
        if (room.startsWith('server:')) {
          const serverId = room.replace('server:', '');
          this.emitOnlineUsers(serverId);
        }
      }
    });
  }

  /**
   * Emet la liste des utilisateurs en ligne dans un serveur
   */
  private emitOnlineUsers(serverId: string): void {
    const sockets = this.io.sockets.adapter.rooms.get(`server:${serverId}`);
    const onlineUserIds: string[] = [];

    if (sockets) {
      for (const socketId of sockets) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket && socket.data.userId) {
          onlineUserIds.push(socket.data.userId);
        }
      }
    }

    // Emettre a tous les membres du serveur
    this.io.to(`server:${serverId}`).emit('server:online_users', {
      serverId,
      userIds: Array.from(new Set(onlineUserIds))
    });
  }

  /**
   * Retourne l'instance Socket.IO pour utilisation externe si necessaire
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}
