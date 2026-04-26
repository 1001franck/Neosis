import type { Request, Response, NextFunction } from 'express';
import type { IUserRepository } from '../../../domain/users/repositories/UserRepository.js';
import {
  CreateOrGetDirectConversationUseCase,
  ListDirectConversationsUseCase,
  GetDirectConversationUseCase,
} from '../../../application/direct/usecases/directConversationUseCases.js';

export class DirectConversationController {
  constructor(
    private createOrGetConversationUseCase: CreateOrGetDirectConversationUseCase,
    private listConversationsUseCase: ListDirectConversationsUseCase,
    private getConversationUseCase: GetDirectConversationUseCase,
    private userRepository: IUserRepository
  ) {}

  createConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otherUserId } = req.body;
      const userId = req.userId!;
      const conversation = await this.createOrGetConversationUseCase.execute(userId, otherUserId);
      res.status(201).json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  };

  listConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const conversations = await this.listConversationsUseCase.execute(userId);

      // Récupérer tous les utilisateurs en une seule requête pour éviter le N+1
      const otherUserIds = conversations.map(c => c.userOneId === userId ? c.userTwoId : c.userOneId);
      const users = await this.userRepository.findByIds(otherUserIds);
      const usersMap = new Map(users.map(u => [u.id, u]));

      const data = conversations.map((conv) => {
        const otherUserId = conv.userOneId === userId ? conv.userTwoId : conv.userOneId;
        const otherUser = usersMap.get(otherUserId) ?? null;
        return {
          id: conv.id,
          user: otherUser
            ? { id: otherUser.id, username: otherUser.username, avatarUrl: otherUser.avatarUrl }
            : null,
          updatedAt: conv.updatedAt,
          lastMessage: conv.lastMessage
            ? { content: conv.lastMessage.content, senderId: conv.lastMessage.senderId, createdAt: conv.lastMessage.createdAt }
            : null,
        };
      });

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const conversationId = req.params.id as string;
      const conv = await this.getConversationUseCase.execute(userId, conversationId);
      const otherUserId = conv.userOneId === userId ? conv.userTwoId : conv.userOneId;
      const otherUser = await this.userRepository.findById(otherUserId);
      res.status(200).json({
        success: true,
        data: {
          id: conv.id,
          user: otherUser
            ? { id: otherUser.id, username: otherUser.username, avatarUrl: otherUser.avatarUrl }
            : null,
          updatedAt: conv.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
