import type { Request, Response, NextFunction } from 'express';
import type { Server as SocketIOServer } from 'socket.io';
import { SendDirectMessageUseCase, GetDirectMessagesUseCase } from '../../../application/direct/usecases/directMessageUseCases.js';
import { GetDirectConversationUseCase } from '../../../application/direct/usecases/directConversationUseCases.js';

export class DirectMessageController {
  constructor(
    private sendDirectMessageUseCase: SendDirectMessageUseCase,
    private getDirectMessagesUseCase: GetDirectMessagesUseCase,
    private getDirectConversationUseCase: GetDirectConversationUseCase,
    private io?: SocketIOServer
  ) {}

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversationId = req.params.id as string;
      const { content, replyToId } = req.body;
      const userId = req.userId!;
      const message = await this.sendDirectMessageUseCase.execute(userId, conversationId, content, replyToId);

      const payload = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        replyToId: message.replyToId ?? null,
        replyTo: message.replyTo ?? null,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: message.sender ?? null,
      };

      // Notifier le destinataire en temps réel via WebSocket
      if (this.io) {
        const conversation = await this.getDirectConversationUseCase.execute(userId, conversationId);
        const recipientId = conversation.userOneId === userId
          ? conversation.userTwoId
          : conversation.userOneId;
        this.io.to(`user:${recipientId}`).emit('direct:message:new', payload);

        // Notifier l'auteur du message cité s'il est différent de l'expéditeur et du destinataire
        if (message.replyTo?.sender?.id && message.replyTo.sender.id !== userId && message.replyTo.sender.id !== recipientId) {
          this.io.to(`user:${message.replyTo.sender.id}`).emit('reply:notification', {
            type: 'dm_reply',
            conversationId,
            messageId: message.id,
            repliedToId: replyToId,
            senderUsername: message.sender?.username ?? userId,
            preview: message.content.slice(0, 80),
          });
        }
      }

      res.status(201).json({ success: true, data: payload });
    } catch (error) {
      next(error);
    }
  };

  listMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversationId = req.params.id as string;
      const userId = req.userId!;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const offset = req.query.offset ? Number(req.query.offset) : undefined;
      const messages = await this.getDirectMessagesUseCase.execute(userId, conversationId, limit, offset);
      const data = messages.map((message) => ({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        replyToId: message.replyToId ?? null,
        replyTo: message.replyTo ?? null,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: message.sender ?? null,
      }));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
