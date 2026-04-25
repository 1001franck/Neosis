/**
 * APPLICATION - VOICE STORE
 * Zustand store pour gérer l'état des voice channels
 */

import { create } from 'zustand';
import type { VoiceUser, VoiceState } from '@domain/voice/types';

/**
 * Interface du store voice
 */
interface VoiceStore extends VoiceState {
  // Utilisateurs connectés par channel
  connectedUsers: Map<string, VoiceUser[]>;

  // Compteur de voix par channel (visible par tous les membres du serveur)
  voiceCountByChannel: Map<string, number>;

  // Actions
  setConnected: (channelId: string) => void;
  setDisconnected: () => void;
  setConnecting: (isConnecting: boolean) => void;
  setMuted: (isMuted: boolean) => void;
  setDeafened: (isDeafened: boolean) => void;
  setVideoEnabled: (isVideoEnabled: boolean) => void;
  setScreenSharing: (isScreenSharing: boolean) => void;
  setError: (error: string | null) => void;

  // Gestion des utilisateurs
  setChannelUsers: (channelId: string, users: VoiceUser[]) => void;
  addUser: (channelId: string, user: VoiceUser) => void;
  removeUser: (channelId: string, userId: string) => void;
  updateUserState: (channelId: string, userId: string, isMuted: boolean, isDeafened: boolean, isVideoEnabled?: boolean, isScreenSharing?: boolean) => void;
  setUserSpeaking: (channelId: string, userId: string, isSpeaking: boolean) => void;
  setVoiceCount: (channelId: string, count: number) => void;

  // Reset
  reset: () => void;
}

/**
 * État initial
 */
const initialState: VoiceState = {
  isConnected: false,
  connectedChannelId: null,
  isMuted: false,
  isDeafened: false,
  isVideoEnabled: false,
  isScreenSharing: false,
  isConnecting: false,
  error: null,
};

/**
 * Store Zustand pour le voice
 */
export const useVoiceStore = create<VoiceStore>((set) => ({
  ...initialState,
  connectedUsers: new Map(),
  voiceCountByChannel: new Map(),

  /**
   * Marquer comme connecté à un voice channel
   */
  setConnected: (channelId: string) => set({
    isConnected: true,
    connectedChannelId: channelId,
    isConnecting: false,
    error: null,
  }),

  /**
   * Marquer comme déconnecté
   */
  setDisconnected: () => set({
    isConnected: false,
    connectedChannelId: null,
    isConnecting: false,
    isMuted: false,
    isDeafened: false,
    isVideoEnabled: false,
    isScreenSharing: false,
    connectedUsers: new Map(),
  }),

  /**
   * Définir l'état de connexion
   */
  setConnecting: (isConnecting: boolean) => set({ isConnecting }),

  /**
   * Toggle mute
   */
  setMuted: (isMuted: boolean) => set({ isMuted }),

  /**
   * Toggle deafen (implique aussi mute)
   */
  setDeafened: (isDeafened: boolean) => set((state) => ({
    isDeafened,
    isMuted: isDeafened ? true : state.isMuted, // Deafen implique mute
  })),

  /**
   * Activer/désactiver la caméra
   */
  setVideoEnabled: (isVideoEnabled: boolean) => set({ isVideoEnabled }),

  /**
   * Activer/désactiver le partage d'écran
   */
  setScreenSharing: (isScreenSharing: boolean) => set({ isScreenSharing }),

  /**
   * Définir une erreur
   */
  setError: (error: string | null) => set({ error }),

  /**
   * Définir la liste complète des utilisateurs d'un channel
   */
  setChannelUsers: (channelId: string, users: VoiceUser[]) => set((state) => {
    const newMap = new Map(state.connectedUsers);
    newMap.set(channelId, users);
    return { connectedUsers: newMap };
  }),

  /**
   * Ajouter un utilisateur à un channel
   */
  addUser: (channelId: string, user: VoiceUser) => set((state) => {
    const newMap = new Map(state.connectedUsers);
    const currentUsers = newMap.get(channelId) || [];

    // Ne pas ajouter si déjà présent
    if (currentUsers.some(u => u.userId === user.userId)) {
      return state;
    }

    newMap.set(channelId, [...currentUsers, user]);
    return { connectedUsers: newMap };
  }),

  /**
   * Retirer un utilisateur d'un channel
   */
  removeUser: (channelId: string, userId: string) => set((state) => {
    const newMap = new Map(state.connectedUsers);
    const currentUsers = newMap.get(channelId) || [];
    newMap.set(channelId, currentUsers.filter(u => u.userId !== userId));
    return { connectedUsers: newMap };
  }),

  /**
   * Mettre à jour l'état d'un utilisateur (mute/deafen/video/screen)
   */
  updateUserState: (channelId: string, userId: string, isMuted: boolean, isDeafened: boolean, isVideoEnabled?: boolean, isScreenSharing?: boolean) => set((state) => {
    const newMap = new Map(state.connectedUsers);
    const currentUsers = newMap.get(channelId) || [];

    newMap.set(
      channelId,
      currentUsers.map(u =>
        u.userId === userId
          ? {
              ...u,
              isMuted,
              isDeafened,
              ...(isVideoEnabled !== undefined ? { isVideoEnabled } : {}),
              ...(isScreenSharing !== undefined ? { isScreenSharing } : {}),
            }
          : u
      )
    );

    return { connectedUsers: newMap };
  }),

  /**
   * Mettre à jour l'état "parle" d'un utilisateur
   */
  setUserSpeaking: (channelId: string, userId: string, isSpeaking: boolean) => set((state) => {
    const newMap = new Map(state.connectedUsers);
    const currentUsers = newMap.get(channelId) || [];

    let changed = false;
    const updatedUsers = currentUsers.map(u => {
      if (u.userId !== userId) return u;
      if (u.isSpeaking === isSpeaking) return u;
      changed = true;
      return { ...u, isSpeaking };
    });

    if (!changed) {
      return state;
    }

    newMap.set(channelId, updatedUsers);
    return { connectedUsers: newMap };
  }),

  /**
   * Mettre à jour le compteur de voix d'un channel (reçu via server:voice_update)
   */
  setVoiceCount: (channelId: string, count: number) => set((state) => {
    const newMap = new Map(state.voiceCountByChannel);
    newMap.set(channelId, count);
    return { voiceCountByChannel: newMap };
  }),

  /**
   * Reset complet du store
   */
  reset: () => set({
    ...initialState,
    connectedUsers: new Map(),
    voiceCountByChannel: new Map(),
  }),
}));
