import { apiClient } from './client';
import type { Friend, FriendRequests } from '@domain/direct/types';

export const friendsApi = {
  listFriends: async (): Promise<Friend[]> => {
    const response = await apiClient.get<Friend[]>('/friends');
    return response.data;
  },
  listRequests: async (): Promise<FriendRequests> => {
    const response = await apiClient.get<FriendRequests>('/friends/requests');
    return response.data;
  },
  requestFriend: async (username: string): Promise<void> => {
    await apiClient.post('/friends/request', { username });
  },
  acceptFriend: async (friendshipId: string): Promise<void> => {
    await apiClient.post('/friends/accept', { friendshipId });
  },
  declineFriend: async (friendshipId: string): Promise<void> => {
    await apiClient.post('/friends/decline', { friendshipId });
  },
  cancelFriendRequest: async (friendshipId: string): Promise<void> => {
    await apiClient.post('/friends/cancel', { friendshipId });
  },
  removeFriend: async (friendshipId: string): Promise<void> => {
    await apiClient.delete(`/friends/${friendshipId}`);
  },
};
