/**
 * INFRASTRUCTURE - WEBSOCKET EMITTERS
 * Event emitters pour Socket.IO
 *
 * Les noms d'événements doivent correspondre EXACTEMENT
 * à ceux attendus par le backend (socketHandler.ts).
 */

import { socket } from './socket';

export const socketEmitters = {
  // === MESSAGE EVENTS ===

  sendMessage: (data: { content: string; channelId: string; attachmentIds?: string[]; clientTempId?: string }) => {
    socket.emit('message:send', data);
  },

  updateMessage: (data: { messageId: string; content: string; channelId: string }) => {
    socket.emit('message:update', data);
  },

  deleteMessage: (data: { messageId: string; channelId: string; scope?: 'me' | 'everyone' }) => {
    socket.emit('message:delete', data);
  },

  // === REACTION EVENTS ===

  addReaction: (data: { messageId: string; channelId: string; emoji: string }) => {
    socket.emit('reaction:add', data);
  },

  removeReaction: (data: { messageId: string; channelId: string; emoji: string }) => {
    socket.emit('reaction:remove', data);
  },

  // === TYPING EVENTS ===

  typingStarted: (channelId: string) => {
    socket.emit('typing:start', channelId);
  },

  typingStopped: (channelId: string) => {
    socket.emit('typing:stop', channelId);
  },

  // === SERVER EVENTS ===

  joinServer: (serverId: string) => {
    socket.emit('server:join', serverId);
  },

  leaveServer: (serverId: string) => {
    socket.emit('server:leave', serverId);
  },

  // === CHANNEL EVENTS ===

  joinChannel: (channelId: string) => {
    socket.emit('channel:join', channelId);
  },

  leaveChannel: (channelId: string) => {
    socket.emit('channel:leave', channelId);
  },

  // === READ RECEIPT EVENTS ===

  markChannelAsRead: (channelId: string, messageId: string) => {
    socket.emit('channel:mark_read', { channelId, messageId });
  },

  // === VOICE EVENTS ===

  /**
   * Rejoindre un voice channel
   */
  joinVoiceChannel: (channelId: string) => {
    socket.emit('voice:join', { channelId });
  },

  /**
   * Quitter le voice channel
   */
  leaveVoiceChannel: () => {
    socket.emit('voice:leave', {});
  },

  /**
   * Mettre à jour l'état vocal (mute/deafen)
   */
  updateVoiceState: (isMuted?: boolean, isDeafened?: boolean) => {
    socket.emit('voice:state', { isMuted, isDeafened });
  },

  /**
   * Mettre à jour l'état vidéo (caméra)
   */
  updateVideoState: (isVideoEnabled: boolean) => {
    socket.emit('voice:video_state', { isVideoEnabled });
  },

  /**
   * Mettre à jour l'état du partage d'écran
   */
  updateScreenShare: (isScreenSharing: boolean) => {
    socket.emit('voice:screen_share', { isScreenSharing });
  },

  /**
   * Envoyer un signal WebRTC à un autre utilisateur
   * (pour établir la connexion peer-to-peer audio)
   */
  sendWebRTCSignal: (targetUserId: string, signal: unknown) => {
    socket.emit('voice:webrtc_signal', { targetUserId, signal });
  },
};
