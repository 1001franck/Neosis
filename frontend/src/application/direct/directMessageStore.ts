import { create } from 'zustand';
import type { DirectMessage } from '@domain/direct/types';

interface LastMessagePreview {
  content: string;
  senderId: string;
  createdAt: string;
}

interface DirectMessageStoreState {
  messagesByConversation: Map<string, DirectMessage[]>;
  latestConversationTimestamps: Map<string, string>;
  lastMessageByConversation: Map<string, LastMessagePreview>;
  addIncomingMessage: (message: DirectMessage) => void;
  setConversationTimestamp: (conversationId: string, timestamp: string) => void;
  setLastMessage: (conversationId: string, preview: LastMessagePreview) => void;
}

export const useDirectMessageStore = create<DirectMessageStoreState>((set) => ({
  messagesByConversation: new Map(),
  latestConversationTimestamps: new Map(),
  lastMessageByConversation: new Map(),

  addIncomingMessage: (message) => {
    set((state) => {
      const newMap = new Map(state.messagesByConversation);
      const existing = newMap.get(message.conversationId) || [];
      if (!existing.find((m) => m.id === message.id)) {
        newMap.set(message.conversationId, [...existing, message]);
      }
      return { messagesByConversation: newMap };
    });
  },

  setConversationTimestamp: (conversationId, timestamp) => {
    set((state) => {
      const newMap = new Map(state.latestConversationTimestamps);
      newMap.set(conversationId, timestamp);
      return { latestConversationTimestamps: newMap };
    });
  },

  setLastMessage: (conversationId, preview) => {
    set((state) => {
      const newMap = new Map(state.lastMessageByConversation);
      newMap.set(conversationId, preview);
      return { lastMessageByConversation: newMap };
    });
  },
}));
