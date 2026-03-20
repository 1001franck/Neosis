import type { Friendship, FriendshipStatus } from '../entities/Friendship.js';

export interface FriendshipRepository {
  findByUsers(userOneId: string, userTwoId: string): Promise<Friendship | null>;
  findById(friendshipId: string): Promise<Friendship | null>;
  create(friendship: Friendship): Promise<Friendship>;
  updateStatus(id: string, status: FriendshipStatus): Promise<Friendship>;
  delete(id: string): Promise<void>;
  listForUser(userId: string): Promise<Friendship[]>;
  listPendingForUser(userId: string): Promise<Friendship[]>;
}
