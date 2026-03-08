/**
 * APPLICATION - CHANNELS STORE
 */

import { create } from 'zustand';
import type { Channel } from '@domain/channels/types';

export interface ChannelStoreState {
  channels: Channel[];
  currentChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  updateChannel: (channelId: string, updates: Partial<Channel>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  channels: [],
  currentChannel: null,
  isLoading: false,
  error: null,
};

export const useChannelStore = create<ChannelStoreState>((set) => ({
  ...initialState,
  setChannels: (channels) => set({ channels }),
  setCurrentChannel: (currentChannel) => set({ currentChannel }),
  updateChannel: (channelId, updates) =>
    set((state) => ({
      channels: state.channels.map((channel) =>
        channel.id === channelId ? { ...channel, ...updates } : channel
      ),
      currentChannel:
        state.currentChannel?.id === channelId
          ? { ...state.currentChannel, ...updates }
          : state.currentChannel,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
