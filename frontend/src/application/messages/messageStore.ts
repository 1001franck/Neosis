/**
 * APPLICATION - MESSAGES STORE
 */

import { create } from 'zustand';
import { MessageStatus, type Message } from '@domain/messages/types';

export interface TypingUser {
  userId: string;
  username: string;
}

export interface MessageStoreState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  // Map: channelId → Set of typing users
  typingUsers: Map<string, Map<string, TypingUser>>;
  // Map: channelId → Set of online userIds (for delivery status)
  channelOnlineUsers: Map<string, Set<string>>;
  // Map: channelId → mentions count
  mentionsByChannel: Map<string, number>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addOptimisticMessage: (message: Message) => void;
  reconcileOptimisticMessage: (clientTempId: string, message: Message) => void;
  updateMessage: (messageId: string, message: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
  updateAuthorMessagesDelivered: (channelId: string, authorId: string) => void;
  updateAuthorMessagesReadUpTo: (channelId: string, authorId: string, messageId: string) => void;
  removeMessage: (messageId: string) => void;
  markAsDeleted: (
    messageId: string,
    deletedByUsername: string,
    deletedByUserId: string,
    deletedByRole?: 'OWNER' | 'ADMIN' | 'MEMBER'
  ) => void;
  addReaction: (messageId: string, emoji: string, userId: string, count: number) => void;
  removeReaction: (messageId: string, emoji: string, userId: string) => void;
  addTypingUser: (channelId: string, userId: string, username: string) => void;
  removeTypingUser: (channelId: string, userId: string) => void;
  getTypingUsers: (channelId: string) => TypingUser[];
  addChannelUser: (channelId: string, userId: string) => void;
  removeChannelUser: (channelId: string, userId: string) => void;
  getChannelUserCount: (channelId: string) => number;
  addMention: (channelId: string) => void;
  clearMentions: (channelId: string) => void;
  getMentionCount: (channelId: string) => number;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
  typingUsers: new Map<string, Map<string, TypingUser>>(),
  channelOnlineUsers: new Map<string, Set<string>>(),
  mentionsByChannel: new Map<string, number>(),
};

export const useMessageStore = create<MessageStoreState>((set, get) => ({
  ...initialState,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  addOptimisticMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  reconcileOptimisticMessage: (clientTempId, message) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.clientTempId === clientTempId ? message : m
      ),
    })),
  updateMessage: (messageId, message) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === messageId ? message : m)),
    })),
  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, status } : m
      ),
    })),
  updateAuthorMessagesDelivered: (channelId, authorId) =>
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.channelId !== channelId) return m;
        if (m.authorId !== authorId) return m;
        if (m.status === MessageStatus.SENT) {
          return { ...m, status: MessageStatus.DELIVERED };
        }
        return m;
      }),
    })),
  updateAuthorMessagesReadUpTo: (channelId, authorId, messageId) =>
    set((state) => {
      const target = state.messages.find((m) => m.id === messageId);
      if (!target) return state;
      const targetTime = new Date(target.createdAt).getTime();
      return {
        messages: state.messages.map((m) => {
          if (m.channelId !== channelId) return m;
          if (m.authorId !== authorId) return m;
          const msgTime = new Date(m.createdAt).getTime();
          if (msgTime <= targetTime) {
            return { ...m, status: MessageStatus.READ };
          }
          return m;
        }),
      };
    }),
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    })),
  markAsDeleted: (messageId, deletedByUsername, deletedByUserId, deletedByRole) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              status: 'deleted' as Message['status'],
              content: '',
              deletedBy: deletedByUsername,
              deletedByUserId,
              deletedByRole,
            }
          : m
      ),
    })),
  
  // Reactions
  addReaction: (messageId, emoji, userId, count) =>
    set((state) => ({
      messages: state.messages.map((message) => {
        if (message.id !== messageId) return message;
        
        const existingReaction = message.reactions.find((r) => r.emoji === emoji);
        
        if (existingReaction) {
          // Update existing reaction
          return {
            ...message,
            reactions: message.reactions.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.userIds.includes(userId) ? r.count : count,
                    userIds: r.userIds.includes(userId) ? r.userIds : [...r.userIds, userId],
                  }
                : r
            ),
          };
        } else {
          // Add new reaction
          return {
            ...message,
            reactions: [...message.reactions, { emoji, count, userIds: [userId] }],
          };
        }
      }),
    })),
  
  removeReaction: (messageId, emoji, userId) =>
    set((state) => ({
      messages: state.messages.map((message) => {
        if (message.id !== messageId) return message;
        
        return {
          ...message,
          reactions: message.reactions
            .map((r) => {
              if (r.emoji !== emoji) return r;
              
              const newUserIds = r.userIds.filter((id) => id !== userId);
              return {
                ...r,
                count: Math.max(0, r.count - 1),
                userIds: newUserIds,
              };
            })
            .filter((r) => r.count > 0), // Remove reactions with 0 count
        };
      }),
    })),
  
  // Typing Indicators
  addTypingUser: (channelId, userId, username) =>
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      
      if (!newTypingUsers.has(channelId)) {
        newTypingUsers.set(channelId, new Map());
      }
      
      const channelTyping = newTypingUsers.get(channelId)!;
      channelTyping.set(userId, { userId, username });
      
      return { typingUsers: newTypingUsers };
    }),
  
  removeTypingUser: (channelId, userId) =>
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      const channelTyping = newTypingUsers.get(channelId);
      
      if (channelTyping) {
        channelTyping.delete(userId);
        
        // Clean up empty channel maps
        if (channelTyping.size === 0) {
          newTypingUsers.delete(channelId);
        }
      }
      
      return { typingUsers: newTypingUsers };
    }),
  
  getTypingUsers: (channelId) => {
    const channelTyping = get().typingUsers.get(channelId);
    return channelTyping ? Array.from(channelTyping.values()) : [];
  },

  addChannelUser: (channelId, userId) =>
    set((state) => {
      const next = new Map(state.channelOnlineUsers);
      if (!next.has(channelId)) {
        next.set(channelId, new Set());
      }
      next.get(channelId)!.add(userId);
      return { channelOnlineUsers: next };
    }),

  removeChannelUser: (channelId, userId) =>
    set((state) => {
      const next = new Map(state.channelOnlineUsers);
      const users = next.get(channelId);
      if (users) {
        users.delete(userId);
        if (users.size === 0) next.delete(channelId);
      }
      return { channelOnlineUsers: next };
    }),

  getChannelUserCount: (channelId) => {
    const users = get().channelOnlineUsers.get(channelId);
    return users ? users.size : 0;
  },

  addMention: (channelId) =>
    set((state) => {
      const next = new Map(state.mentionsByChannel);
      const current = next.get(channelId) || 0;
      next.set(channelId, current + 1);
      return { mentionsByChannel: next };
    }),

  clearMentions: (channelId) =>
    set((state) => {
      const next = new Map(state.mentionsByChannel);
      next.delete(channelId);
      return { mentionsByChannel: next };
    }),

  getMentionCount: (channelId) => {
    return get().mentionsByChannel.get(channelId) || 0;
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
