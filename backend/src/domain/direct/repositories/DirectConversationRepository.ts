import type { DirectConversation } from '../entities/DirectConversation.js';

export interface DirectConversationRepository {
  findByUsers(userOneId: string, userTwoId: string): Promise<DirectConversation | null>;
  create(conversation: DirectConversation): Promise<DirectConversation>;
  listByUser(userId: string): Promise<DirectConversation[]>;
  findById(conversationId: string): Promise<DirectConversation | null>;
}
