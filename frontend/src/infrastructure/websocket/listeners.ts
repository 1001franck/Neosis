/**
 * INFRASTRUCTURE - WEBSOCKET LISTENERS
 * Event listeners pour Socket.IO
 *
 * Les noms d'evenements doivent correspondre EXACTEMENT
 * a ceux emis par le backend (socketHandler.ts).
 *
 * Architecture:
 * - Les listeners sont enregistres par useAuth hook
 * - Ils utilisent directement le store Zustand pour maj l'etat
 * - Pas de props drilling, communication via store global
 */

import { socket } from './socket';
import { useMessageStore } from '@application/messages/messageStore';
import { usePresenceStore } from '@application/members/presenceStore';
import { useReadReceiptStore } from '@application/messages/readReceiptStore';
import { useVoiceStore } from '@application/voice/voiceStore';
import { useMemberStore } from '@application/members/memberStore';
import { useDirectMessageStore } from '@application/direct/directMessageStore';
import { normalizeMessage } from '@domain/messages/normalizeMessage';
import { MessageStatus } from '@domain/messages/types';
import type { DirectMessage } from '@domain/direct/types';
import type { VoiceUser } from '@domain/voice/types';
import type { Member } from '@domain/members/types';
import { logger } from '@shared/utils/logger';
import { useAuthStore } from '@application/auth/authStore';
import { toastBus } from '@shared/utils/toastBus';
import { sendDesktopNotification } from '@shared/hooks/useDesktopNotification';

function messageMentionsUser(content: string, username: string): boolean {
  const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mentionRegex = new RegExp(`(^|\\s)@${escaped}(\\b|$)`, 'i');
  const everyoneRegex = /(^|\s)@(everyone|all)(\b|$)/i;
  return mentionRegex.test(content) || everyoneRegex.test(content);
}

/**
 * Enregistrer tous les listeners WebSocket
 * Les callbacks utilisent le store Zustand directement
 */
export function setupListeners() {
  // === MESSAGE EVENTS ===

  /**
   * Nouveau message recu
   * Backend emet: message:new
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- données brutes socket, normalisées immédiatement
  socket.on('message:new', (rawMessage: any) => {
    const message = normalizeMessage(rawMessage);
    logger.info('Message new event received', { messageId: message.id });
    const store = useMessageStore.getState();
    const currentUserId = useAuthStore.getState().user?.id;

    if (message.clientTempId && message.authorId === currentUserId) {
      // Réconcilier uniquement si c'est NOTRE propre message optimiste
      store.reconcileOptimisticMessage(message.clientTempId, {
        ...message,
        status: MessageStatus.SENT,
      });
    } else {
      // Message d'un autre utilisateur (ou le nôtre sans clientTempId)
      store.addMessage(message);
    }

    // If this is our own message, upgrade to DELIVERED when others are in the channel
    if (currentUserId && message.authorId === currentUserId) {
      const onlineCount = store.getChannelUserCount(message.channelId);
      if (onlineCount > 1) {
        store.updateMessageStatus(message.id, MessageStatus.DELIVERED);
      }
    }

    const currentUser = useAuthStore.getState().user;
    if (currentUser && message.authorId !== currentUser.id) {
      const isMention = messageMentionsUser(message.content || '', currentUser.username);
      if (isMention) {
        store.addMention(message.channelId);
        const authorName = message.author?.username ?? "Unknown";
        toastBus.emit({
          type: ‘info’,
          message: `${authorName} vous a mentionné`,
          duration: 4000,
        });
        // Notification native desktop
        void sendDesktopNotification(‘Neosis — Mention’, `${authorName} vous a mentionné`);
      } else {
        // Notification pour tout nouveau message quand la fenêtre est masquée
        if (typeof document !== ‘undefined’ && document.hidden) {
          const authorName = message.author?.username ?? "Unknown";
          void sendDesktopNotification(‘Neosis — Nouveau message’, `${authorName} : ${(message.content || ‘’).slice(0, 80)}`);
        }
      }
    }
  });

  /**
   * Message modifie
   * Backend emet: message:updated
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- données brutes socket, normalisées immédiatement
  socket.on('message:updated', (rawMessage: any) => {
    const message = normalizeMessage(rawMessage);
    logger.info('Message updated event received', { messageId: message.id });
    useMessageStore.getState().updateMessage(message.id, message);
  });

  /**
   * Message supprime
   * Backend emet: message:deleted avec { messageId: string }
   */
  socket.on('message:deleted', (data: {
    messageId: string;
    deletedBy: string;
    deletedByUserId: string;
    deletedByRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
    scope?: 'me' | 'everyone';
  }) => {
    logger.info('Message deleted event received', { messageId: data.messageId, deletedBy: data.deletedBy });
    useMessageStore.getState().markAsDeleted(data.messageId, data.deletedBy, data.deletedByUserId, data.deletedByRole);
  });

  // === TYPING EVENTS ===

  /**
   * Utilisateur en train de taper
   * Backend emet: typing:user_started avec { userId, username, channelId }
   */
  socket.on('typing:user_started', ({
    channelId,
    userId,
    username,
  }: {
    channelId: string;
    userId: string;
    username: string;
  }) => {
    logger.debug('User typing started', { channelId, userId, username });
    useMessageStore.getState().addTypingUser(channelId, userId, username || userId);
  });

  /**
   * Utilisateur a arrete de taper
   * Backend emet: typing:user_stopped avec { userId, username, channelId }
   */
  socket.on('typing:user_stopped', ({
    channelId,
    userId,
  }: {
    channelId: string;
    userId: string;
  }) => {
    logger.debug('User typing stopped', { channelId, userId });
    useMessageStore.getState().removeTypingUser(channelId, userId);
  });

  // === SERVER PRESENCE ===

  /**
   * Liste des utilisateurs en ligne mise a jour
   * Backend emet: server:online_users avec { serverId, userIds }
   */
  socket.on('server:online_users', ({
    serverId,
    userIds,
  }: {
    serverId: string;
    userIds: string[];
  }) => {
    logger.info('Online users updated', { serverId, count: userIds.length });
    usePresenceStore.getState().setOnlineUsers(serverId, userIds);
  });

  // === CHANNEL USER EVENTS ===

  socket.on('channel:user_joined', ({
    userId,
    channelId,
  }: {
    userId: string;
    channelId: string;
  }) => {
    logger.info('User joined channel', { userId, channelId });
    const store = useMessageStore.getState();
    store.addChannelUser(channelId, userId);

    const currentUserId = useAuthStore.getState().user?.id;
    if (currentUserId) {
      const onlineCount = store.getChannelUserCount(channelId);
      if (onlineCount > 1) {
        store.updateAuthorMessagesDelivered(channelId, currentUserId);
      }
    }
  });

  socket.on('channel:user_left', ({
    userId,
    channelId,
  }: {
    userId: string;
    channelId: string;
  }) => {
    logger.info('User left channel', { userId, channelId });
    useMessageStore.getState().removeChannelUser(channelId, userId);
  });

  // === READ RECEIPT EVENTS ===

  socket.on('message:read', ({
    userId,
    channelId,
    messageId,
    readAt
  }: {
    userId: string;
    channelId: string;
    messageId: string;
    readAt: string | Date;
  }) => {
    // logger.debug('Message read receipt', { userId, channelId, messageId });
    useReadReceiptStore.getState().updateReadStatus(channelId, userId, messageId, new Date(readAt));

    // Mark our own messages as READ up to the read message
    const currentUserId = useAuthStore.getState().user?.id;
    if (currentUserId && userId !== currentUserId) {
      useMessageStore.getState().updateAuthorMessagesReadUpTo(channelId, currentUserId, messageId);
    }
  });

  // === REACTION EVENTS ===

  /**
   * Réactions mises à jour sur un message
   * Backend émet : reaction:updated { messageId, reactions }
   */
  socket.on('reaction:updated', ({ messageId, reactions }: { messageId: string; reactions: { emoji: string; count: number; userIds: string[] }[] }) => {
    const store = useMessageStore.getState();
    const message = store.messages.find((m) => m.id === messageId);
    if (message) {
      store.updateMessage(messageId, { ...message, reactions });
    }
  });

  // === ERROR EVENTS ===

  socket.on('message:error', ({ message, clientTempId }: { message: string; clientTempId?: string | null }) => {
    logger.error('Socket message error', { message, clientTempId });
    // Supprimer le message optimiste orphelin si le clientTempId est fourni
    if (clientTempId) {
      useMessageStore.getState().removeMessage(clientTempId);
    }
    toastBus.emit({ type: 'error', message });
  });

  // === BAN / KICK EVENTS ===

  /**
   * L'utilisateur courant a été expulsé d'un serveur
   * Backend émet: user:server_kicked avec { serverId }
   */
  socket.on('user:server_kicked', ({ serverId }: { serverId: string }) => {
    logger.info('Kicked from server', { serverId });
    window.dispatchEvent(new CustomEvent('neosis:server_kicked', { detail: { serverId } }));
  });

  /**
   * L'utilisateur courant a été banni d'un serveur
   * Backend émet: user:server_banned avec { serverId, isPermanent, expiresAt, reason }
   */
  socket.on('user:server_banned', (data: {
    serverId: string;
    isPermanent: boolean;
    expiresAt: string | null;
    reason: string | null;
  }) => {
    logger.info('Banned from server', { serverId: data.serverId, isPermanent: data.isPermanent });
    window.dispatchEvent(new CustomEvent('neosis:server_banned', { detail: data }));
  });

  /**
   * Le rôle de l'utilisateur courant a été modifié dans un serveur
   * Backend émet: user:role_updated avec { serverId, role }
   */
  socket.on('user:role_updated', ({ role }: { serverId: string; role: string }) => {
    logger.info('Role updated', { role });
    const messages: Record<string, string> = {
      ADMIN: 'Vous êtes désormais administrateur de ce serveur !',
      OWNER: 'Vous êtes désormais propriétaire de ce serveur !',
      MEMBER: 'Vous n\'êtes plus administrateur de ce serveur.',
    };
    const message = messages[role] ?? `Votre rôle a été mis à jour : ${role}`;
    const type = role === 'MEMBER' ? 'info' : 'success';
    toastBus.emit({ type, message, duration: 5000 });
  });

  // === DIRECT MESSAGE EVENTS ===

  /**
   * Nouveau message privé reçu en temps réel
   * Backend émet: direct:message:new
   */
  socket.on('direct:message:new', (message: DirectMessage) => {
    logger.info('DM received via socket', { messageId: message.id, conversationId: message.conversationId });
    useDirectMessageStore.getState().addIncomingMessage(message);

    // Notification native desktop pour les DMs
    const currentUserId = useAuthStore.getState().user?.id;
    if (message.senderId !== currentUserId) {
      void sendDesktopNotification('Neosis — Message privé', (message.content || '').slice(0, 80));
    }
  });

  // === VOICE EVENTS ===

  /**
   * Un utilisateur a rejoint le voice channel
   */
  socket.on('voice:user_joined', ({ userId, username, channelId, isMuted, isDeafened, isVideoEnabled, isScreenSharing }: {
    userId: string;
    username: string;
    channelId: string;
    isMuted: boolean;
    isDeafened: boolean;
    isVideoEnabled?: boolean;
    isScreenSharing?: boolean;
  }) => {
    logger.info('User joined voice channel', { userId, username, channelId });

    const member = useMemberStore.getState().members.find((m: Member) => m.userId === userId);
    const voiceUser: VoiceUser = {
      userId,
      username,
      avatar: member?.user.avatar ?? null,
      isMuted,
      isDeafened,
      isVideoEnabled: isVideoEnabled ?? false,
      isScreenSharing: isScreenSharing ?? false,
      connectedAt: new Date().toISOString(),
    };

    useVoiceStore.getState().addUser(channelId, voiceUser);
  });

  /**
   * Un utilisateur a quitté le voice channel
   */
  socket.on('voice:user_left', ({ userId, channelId }: { userId: string; channelId: string }) => {
    logger.info('User left voice channel', { userId, channelId });
    useVoiceStore.getState().removeUser(channelId, userId);
  });

  /**
   * L'état vocal d'un utilisateur a changé (mute/deafen)
   */
  socket.on('voice:user_state_changed', ({ userId, isMuted, isDeafened, isVideoEnabled, isScreenSharing }: {
    userId: string;
    isMuted: boolean;
    isDeafened: boolean;
    isVideoEnabled?: boolean;
    isScreenSharing?: boolean;
  }) => {
    const { connectedChannelId } = useVoiceStore.getState();
    if (connectedChannelId) {
      logger.info('User voice state changed', { userId, isMuted, isDeafened, isVideoEnabled, isScreenSharing });
      useVoiceStore.getState().updateUserState(connectedChannelId, userId, isMuted, isDeafened, isVideoEnabled, isScreenSharing);
    }
  });

  /**
   * Réception de la liste des utilisateurs du voice channel
   */
  socket.on('voice:channel_users', ({ channelId, users }: { channelId: string; users: VoiceUser[] }) => {
    logger.info('Received voice channel users', { channelId, count: users.length });
    useVoiceStore.getState().setChannelUsers(channelId, users);
  });

  /**
   * Erreur voice
   */
  socket.on('voice:error', ({ message }: { message: string }) => {
    logger.error('Voice error', { message });
    useVoiceStore.getState().setError(message);
    useVoiceStore.getState().setConnecting(false);
  });

  /**
   * Mise à jour du compteur de voix d'un channel (visible par tous les membres du serveur)
   */
  socket.on('server:voice_update', ({ channelId, count }: { channelId: string; count: number }) => {
    logger.info('Voice count updated', { channelId, count });
    useVoiceStore.getState().setVoiceCount(channelId, count);
  });

  logger.info('WebSocket listeners setup complete');
}

/**
 * Nettoyer les listeners WebSocket
 */
export function cleanupListeners() {
  socket.off('message:new');
  socket.off('message:updated');
  socket.off('reaction:updated');
  socket.off('message:deleted');
  socket.off('typing:user_started');
  socket.off('typing:user_stopped');
  socket.off('server:online_users');
  socket.off('channel:user_joined');
  socket.off('channel:user_left');
  socket.off('message:read');
  socket.off('message:error');
  socket.off('user:server_kicked');
  socket.off('user:server_banned');
  socket.off('user:role_updated');
  socket.off('direct:message:new');
  socket.off('voice:user_joined');
  socket.off('voice:user_left');
  socket.off('voice:user_state_changed');
  socket.off('voice:channel_users');
  socket.off('voice:error');
  socket.off('server:voice_update');

  logger.info('WebSocket listeners cleaned up');
}
