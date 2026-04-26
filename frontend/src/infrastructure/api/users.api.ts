import { apiClient } from './client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  customStatus: string | null;
  statusEmoji: string | null;
  banner: string | null;
  createdAt: string;
}

export const usersApi = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get<{ user: UserProfile }>(`/auth/users/${userId}`);
    return response.data.user;
  },
};
