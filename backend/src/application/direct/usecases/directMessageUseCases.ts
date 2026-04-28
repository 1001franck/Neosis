import crypto from 'crypto';
import type { DirectMessageRepository } from '../../../domain/direct/repositories/DirectMessageRepository.js';
import type { DirectConversationRepository } from '../../../domain/direct/repositories/DirectConversationRepository.js';
import { DirectMessage } from '../../../domain/direct/entities/DirectMessage.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

export class SendDirectMessageUseCase {
  constructor(
    private messageRepository: DirectMessageRepository,
    private conversationRepository: DirectConversationRepository
  ) {}

  async execute(userId: string, conversationId: string, content: string, replyToId?: string): Promise<DirectMessage> {
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Conversation introuvable', 404);
    }
    if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Accès interdit', 403);
    }

    const now = new Date();
    const message = new DirectMessage(
      crypto.randomUUID(),
      conversationId,
      userId,
      content,
      now,
      now,
      null,
      replyToId ?? null
    );
    return this.messageRepository.create(message);
  }
}

export class GetDirectMessagesUseCase {
  constructor(
    private messageRepository: DirectMessageRepository,
    private conversationRepository: DirectConversationRepository
  ) {}

  async execute(userId: string, conversationId: string, limit?: number, offset?: number): Promise<DirectMessage[]> {
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Conversation introuvable', 404);
    }
    if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Accès interdit', 403);
    }

    return this.messageRepository.listByConversation(conversationId, limit, offset);
  }
}
