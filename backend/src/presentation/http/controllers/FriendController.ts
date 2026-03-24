import type { Request, Response, NextFunction } from 'express';
import type { IUserRepository } from '../../../domain/users/repositories/UserRepository.js';
import {
  RequestFriendUseCase,
  AcceptFriendUseCase,
  DeclineFriendUseCase,
  CancelFriendRequestUseCase,
  RemoveFriendUseCase,
  ListFriendsUseCase,
  ListFriendRequestsUseCase,
} from '../../../application/direct/usecases/friendUseCases.js';

export class FriendController {
  constructor(
    private requestFriendUseCase: RequestFriendUseCase,
    private acceptFriendUseCase: AcceptFriendUseCase,
    private declineFriendUseCase: DeclineFriendUseCase,
    private cancelFriendRequestUseCase: CancelFriendRequestUseCase,
    private removeFriendUseCase: RemoveFriendUseCase,
    private listFriendsUseCase: ListFriendsUseCase,
    private listFriendRequestsUseCase: ListFriendRequestsUseCase,
    private userRepository: IUserRepository
  ) {}

  requestFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.body;
      const userId = req.userId!;
      const friendship = await this.requestFriendUseCase.execute(userId, username);
      res.status(201).json({ success: true, data: friendship });
    } catch (error) {
      next(error);
    }
  };

  acceptFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { friendshipId } = req.body;
      const userId = req.userId!;
      const friendship = await this.acceptFriendUseCase.execute(userId, friendshipId);
      res.status(200).json({ success: true, data: friendship });
    } catch (error) {
      next(error);
    }
  };

  declineFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { friendshipId } = req.body;
      const userId = req.userId!;
      await this.declineFriendUseCase.execute(userId, friendshipId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  cancelFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { friendshipId } = req.body;
      const userId = req.userId!;
      await this.cancelFriendRequestUseCase.execute(userId, friendshipId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  removeFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const friendshipId = req.params.id as string;
      const userId = req.userId!;
      await this.removeFriendUseCase.execute(userId, friendshipId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  listFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const friends = await this.listFriendsUseCase.execute(userId);

      // Récupérer tous les utilisateurs en une seule requête pour éviter le N+1
      const otherUserIds = friends.map(f => f.userOneId === userId ? f.userTwoId : f.userOneId);
      const users = await this.userRepository.findByIds(otherUserIds);
      const usersMap = new Map(users.map(u => [u.id, u]));

      const data = friends.map((friendship) => {
        const otherUserId = friendship.userOneId === userId ? friendship.userTwoId : friendship.userOneId;
        const otherUser = usersMap.get(otherUserId) ?? null;
        return {
          id: friendship.id,
          status: friendship.status,
          user: otherUser
            ? { id: otherUser.id, username: otherUser.username, avatarUrl: otherUser.avatarUrl }
            : null,
        };
      });

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  listRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const requests = await this.listFriendRequestsUseCase.execute(userId);

      // Récupérer tous les utilisateurs en une seule requête pour éviter le N+1
      const allItems = [...requests.incoming, ...requests.outgoing];
      const otherUserIds = allItems.map(f => f.userOneId === userId ? f.userTwoId : f.userOneId);
      const users = await this.userRepository.findByIds(otherUserIds);
      const usersMap = new Map(users.map(u => [u.id, u]));

      const mapSide = (items: typeof requests.incoming) =>
        items.map((friendship) => {
          const otherUserId = friendship.userOneId === userId ? friendship.userTwoId : friendship.userOneId;
          const otherUser = usersMap.get(otherUserId) ?? null;
          return {
            id: friendship.id,
            status: friendship.status,
            requesterId: friendship.requesterId,
            user: otherUser
              ? { id: otherUser.id, username: otherUser.username, avatarUrl: otherUser.avatarUrl }
              : null,
          };
        });

      res.status(200).json({
        success: true,
        data: {
          incoming: mapSide(requests.incoming),
          outgoing: mapSide(requests.outgoing),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
