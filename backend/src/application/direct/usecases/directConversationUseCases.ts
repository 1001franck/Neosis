import crypto from 'crypto';
import type { DirectConversationRepository } from '../../../domain/direct/repositories/DirectConversationRepository.js';
import type { FriendshipRepository } from '../../../domain/direct/repositories/FriendshipRepository.js';
import { DirectConversation } from '../../../domain/direct/entities/DirectConversation.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

function normalizePair(userA: string, userB: string): [string, string] {
  return userA < userB ? [userA, userB] : [userB, userA];
}

export class CreateOrGetDirectConversationUseCase {
  constructor(
    private conversationRepository: DirectConversationRepository,
    private friendshipRepository: FriendshipRepository
  ) { }

  async execute(userId: string, otherUserId: string): Promise<DirectConversation> {
    if (userId === otherUserId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Conversation invalide', 400);
    }
    const [userOneId, userTwoId] = normalizePair(userId, otherUserId);

    const friendship = await this.friendshipRepository.findByUsers(userOneId, userTwoId);
    if (!friendship || friendship.status !== 'ACCEPTED') {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous devez être amis pour discuter', 403);
    }

    const existing = await this.conversationRepository.findByUsers(userOneId, userTwoId);
    if (existing) return existing;

    const now = new Date();
    const convo = new DirectConversation(
      crypto.randomUUID(),
      userOneId,
      userTwoId,
      now,
      now
    );
    return this.conversationRepository.create(convo);
  }
}

export class ListDirectConversationsUseCase {
  constructor(private conversationRepository: DirectConversationRepository) { }

  async execute(userId: string): Promise<DirectConversation[]> {
    return this.conversationRepository.listByUser(userId);
  }
}

export class GetDirectConversationUseCase {
  constructor(private conversationRepository: DirectConversationRepository) { }

  async execute(userId: string, conversationId: string): Promise<DirectConversation> {
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Conversation introuvable', 404);
    }
    if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Accès interdit', 403);
    }
    return conversation;
  }
}