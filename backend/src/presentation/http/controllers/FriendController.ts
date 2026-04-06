import type { Request, Response, NextFunction } from 'express';
import type { IUserRepository } from '../../../domain/users/repositories/UserRepository.js';
import {
  RequestFriendUseCase,
  AcceptFriendUseCase,
  ListFriendsUseCase,
  ListFriendRequestsUseCase,
} from '../../../application/direct/usecases/friendUseCases.js';

export class FriendController {
  constructor(
    private requestFriendUseCase: RequestFriendUseCase,
    private acceptFriendUseCase: AcceptFriendUseCase,
    private listFriendsUseCase: ListFriendsUseCase,
    private listFriendRequestsUseCase: ListFriendRequestsUseCase,
    private userRepository: IUserRepository
  ) {}

  requestFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.body;
      const userId = req.userId;
      const friendship = await this.requestFriendUseCase.execute(userId, username);
      res.status(201).json({ success: true, data: friendship });
    } catch (error) {
      next(error);
    }
  };

  acceptFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { friendshipId } = req.body;
      const userId = req.userId;
      const friendship = await this.acceptFriendUseCase.execute(userId, friendshipId);
      res.status(200).json({ success: true, data: friendship });
    } catch (error) {
      next(error);
    }
  };

  listFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const friends = await this.listFriendsUseCase.execute(userId);
      const data = await Promise.all(
        friends.map(async (friendship) => {
          const otherUserId = friendship.userOneId === userId ? friendship.userTwoId : friendship.userOneId;
          const otherUser = await this.userRepository.findById(otherUserId);
          return {
            id: friendship.id,
            status: friendship.status,
            user: otherUser
              ? {
                  id: otherUser.id,
                  username: otherUser.username,
                  avatarUrl: otherUser.avatarUrl,
                }
              : null,
          };
        })
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  listRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const requests = await this.listFriendRequestsUseCase.execute(userId);
      const mapSide = async (items: typeof requests.incoming) => {
        return Promise.all(
          items.map(async (friendship) => {
            const otherUserId = friendship.userOneId === userId ? friendship.userTwoId : friendship.userOneId;
            const otherUser = await this.userRepository.findById(otherUserId);
            return {
              id: friendship.id,
              status: friendship.status,
              requesterId: friendship.requesterId,
              user: otherUser
                ? {
                    id: otherUser.id,
                    username: otherUser.username,
                    avatarUrl: otherUser.avatarUrl,
                  }
                : null,
            };
          })
        );
      };
      res.status(200).json({
        success: true,
        data: {
          incoming: await mapSide(requests.incoming),
          outgoing: await mapSide(requests.outgoing),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
