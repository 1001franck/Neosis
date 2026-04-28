import { apiClient } from './client';
import type { DirectConversation, DirectMessage } from '@domain/direct/types';

export const directApi = {
  listConversations: async (): Promise<DirectConversation[]> => {
    const response = await apiClient.get<DirectConversation[]>('/dm/conversations');
    return response.data;
  },
  getConversation: async (conversationId: string): Promise<DirectConversation> => {
    const response = await apiClient.get<DirectConversation>(`/dm/conversations/${conversationId}`);
    return response.data;
  },
  createConversation: async (otherUserId: string): Promise<DirectConversation> => {
    const response = await apiClient.post<DirectConversation>('/dm/conversations', { otherUserId });
    return response.data;
  },
  listMessages: async (conversationId: string): Promise<DirectMessage[]> => {
    const response = await apiClient.get<DirectMessage[]>(`/dm/conversations/${conversationId}/messages`);
    return response.data;
  },
  sendMessage: async (conversationId: string, content: string, replyToId?: string): Promise<DirectMessage> => {
    const response = await apiClient.post<DirectMessage>(`/dm/conversations/${conversationId}/messages`, { content, ...(replyToId ? { replyToId } : {}) });
    return response.data;
  },
};
