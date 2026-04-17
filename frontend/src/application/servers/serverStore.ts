/**
 * APPLICATION - SERVERS STORE
 * Zustand store pour l'état des serveurs
 */

import { create } from 'zustand';
import type { Server, ServerWithMembers } from '@domain/servers/types';

export interface ServerStoreState {
  servers: Server[];
  currentServer: ServerWithMembers | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setServers: (servers: Server[]) => void;
  setCurrentServer: (server: ServerWithMembers | null) => void;
  updateServer: (serverId: string, updates: Partial<Server>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  servers: [],
  currentServer: null,
  isLoading: false,
  error: null,
};

export const useServerStore = create<ServerStoreState>((set) => ({
  ...initialState,

  setServers: (servers) => set({ servers }),

  setCurrentServer: (currentServer) => set({ currentServer }),

  updateServer: (serverId, updates) =>
    set((state) => ({
      servers: state.servers.map((server) =>
        server.id === serverId ? { ...server, ...updates } : server
      ),
      currentServer:
        state.currentServer?.id === serverId
          ? { ...state.currentServer, ...updates }
          : state.currentServer,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
