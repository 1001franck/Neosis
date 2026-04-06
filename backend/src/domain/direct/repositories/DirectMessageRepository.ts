import type { DirectMessage } from '../entities/DirectMessage.js';

export interface DirectMessageRepository {
  create(message: DirectMessage): Promise<DirectMessage>;
  listByConversation(conversationId: string, limit?: number, offset?: number): Promise<DirectMessage[]>;
}
