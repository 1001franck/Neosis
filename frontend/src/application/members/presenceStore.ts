/**
 * APPLICATION - PRESENCE STORE
 * Store Zustand pour gérer les utilisateurs en ligne par serveur
 */

import { create } from 'zustand';

interface PresenceStoreState {
  /** Map: serverId → Set of online userIds */
  onlineUsers: Map<string, Set<string>>;
  setOnlineUsers: (serverId: string, userIds: string[]) => void;
  isUserOnline: (serverId: string, userId: string) => boolean;
  getOnlineUserIds: (serverId: string) => string[];
  reset: () => void;
}

export const usePresenceStore = create<PresenceStoreState>((set, get) => ({
  onlineUsers: new Map(),

  setOnlineUsers: (serverId, userIds) =>
    set((state) => {
      const newMap = new Map(state.onlineUsers);
      newMap.set(serverId, new Set(userIds));
      return { onlineUsers: newMap };
    }),

  isUserOnline: (serverId, userId) => {
    const serverUsers = get().onlineUsers.get(serverId);
    return serverUsers ? serverUsers.has(userId) : false;
  },

  getOnlineUserIds: (serverId) => {
    const serverUsers = get().onlineUsers.get(serverId);
    return serverUsers ? Array.from(serverUsers) : [];
  },

  reset: () => set({ onlineUsers: new Map() }),
}));
