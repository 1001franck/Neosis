import { create } from 'zustand';
import type { DirectMessage } from '@domain/direct/types';

interface DirectMessageStoreState {
  messagesByConversation: Map<string, DirectMessage[]>;
  addIncomingMessage: (message: DirectMessage) => void;
}

export const useDirectMessageStore = create<DirectMessageStoreState>((set) => ({
  messagesByConversation: new Map(),

  addIncomingMessage: (message) => {
    set((state) => {
      const newMap = new Map(state.messagesByConversation);
      const existing = newMap.get(message.conversationId) || [];
      // Éviter les doublons
      if (!existing.find((m) => m.id === message.id)) {
        newMap.set(message.conversationId, [...existing, message]);
      }
      return { messagesByConversation: newMap };
    });
  },
}));
