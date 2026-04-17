import crypto from 'crypto';
import type { IUserRepository } from '../../../domain/users/repositories/UserRepository.js';
import type { FriendshipRepository } from '../../../domain/direct/repositories/FriendshipRepository.js';
import { Friendship } from '../../../domain/direct/entities/Friendship.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

function normalizePair(userA: string, userB: string): [string, string] {
  return userA < userB ? [userA, userB] : [userB, userA];
}

export class RequestFriendUseCase {
  constructor(
    private friendshipRepository: FriendshipRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(requesterId: string, username: string): Promise<Friendship> {
    const target = await this.userRepository.findByUsername(username);
    if (!target) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, 'Utilisateur introuvable', 404);
    }
    if (target.id === requesterId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Vous ne pouvez pas vous ajouter vous-même', 400);
    }

    const [userOneId, userTwoId] = normalizePair(requesterId, target.id);
    const existing = await this.friendshipRepository.findByUsers(userOneId, userTwoId);
    if (existing) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Une relation existe déjà entre ces utilisateurs', 400);
    }

    const now = new Date();
    const friendship = new Friendship(
      crypto.randomUUID(),
      userOneId,
      userTwoId,
      requesterId,
      'PENDING',
      now,
      now
    );

    return this.friendshipRepository.create(friendship);
  }
}

export class AcceptFriendUseCase {
  constructor(private friendshipRepository: FriendshipRepository) {}

  async execute(userId: string, friendshipId: string): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Demande d’ami introuvable', 404);
    }
    if (friendship.status !== 'PENDING') {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'La demande n’est plus en attente', 400);
    }
    if (friendship.requesterId === userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Impossible d’accepter sa propre demande', 403);
    }
    if (friendship.userOneId !== userId && friendship.userTwoId !== userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Accès interdit', 403);
    }

    return this.friendshipRepository.updateStatus(friendshipId, 'ACCEPTED');
  }
}

export class DeclineFriendUseCase {
  constructor(private friendshipRepository: FriendshipRepository) {}

  async execute(userId: string, friendshipId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Demande introuvable', 404);
    }
    if (friendship.status !== 'PENDING') {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'La demande n\'est plus en attente', 400);
    }
    if (friendship.requesterId === userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Utilisez l\'annulation pour retirer votre propre demande', 403);
    }
    if (friendship.userOneId !== userId && friendship.userTwoId !== userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Accès interdit', 403);
    }
    await this.friendshipRepository.delete(friendshipId);
  }
}

export class CancelFriendRequestUseCase {
  constructor(private friendshipRepository: FriendshipRepository) {}

  async execute(userId: string, friendshipId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Demande introuvable', 404);
    }
    if (friendship.status !== 'PENDING') {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'La demande n\'est plus en attente', 400);
    }
    if (friendship.requesterId !== userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Seul l\'expéditeur peut annuler la demande', 403);
    }
    await this.friendshipRepository.delete(friendshipId);
  }
}

export class RemoveFriendUseCase {
  constructor(private friendshipRepository: FriendshipRepository) {}

  async execute(userId: string, friendshipId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Relation introuvable', 404);
    }
    if (friendship.status !== 'ACCEPTED') {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cette relation n\'est pas un ami accepté', 400);
    }
    if (friendship.userOneId !== userId && friendship.userTwoId !== userId) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Accès interdit', 403);
    }
    await this.friendshipRepository.delete(friendshipId);
  }
}

export class ListFriendsUseCase {
  constructor(private friendshipRepository: FriendshipRepository) {}

  async execute(userId: string): Promise<Friendship[]> {
    const all = await this.friendshipRepository.listForUser(userId);
    return all.filter((f) => f.status === 'ACCEPTED');
  }
}

export class ListFriendRequestsUseCase {
  constructor(private friendshipRepository: FriendshipRepository) {}

  async execute(userId: string): Promise<{ incoming: Friendship[]; outgoing: Friendship[] }> {
    const allPending = await this.friendshipRepository.listPendingForUser(userId);
    const incoming = allPending.filter((f) => f.requesterId !== userId);
    const outgoing = allPending.filter((f) => f.requesterId === userId);
    return { incoming, outgoing };
  }
}
