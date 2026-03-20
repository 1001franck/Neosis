import type { Request, Response, NextFunction } from 'express';
import {
  CreateMessageUseCase,
  GetMessageByIdUseCase,
  GetChannelMessagesUseCase,
  UpdateMessageUseCase,
  DeleteMessageUseCase
} from '../../../application/messages/usecases/messageUseCase.js';

/**
 * Contrôleur pour les messages
 * Gère les requêtes HTTP liées aux messages
 */
export class MessageController {
  constructor(
    private createMessageUseCase: CreateMessageUseCase,
    private getMessageByIdUseCase: GetMessageByIdUseCase,
    private getChannelMessagesUseCase: GetChannelMessagesUseCase,
    private updateMessageUseCase: UpdateMessageUseCase,
    private deleteMessageUseCase: DeleteMessageUseCase
  ) {}

  /**
   * Créer un nouveau message
   * POST /channels/:channelId/messages
   */
  createMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.channelId as string || req.params.id as string;
      const { content } = req.body;
      const userId = req.userId as string;

      const message = await this.createMessageUseCase.execute({
        content,
        userId,
        channelId
      });

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir un message par ID
   * GET /messages/:id
   */
  getMessageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId as string;

      const message = await this.getMessageByIdUseCase.execute({ messageId: id, userId });

      res.status(200).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir les messages d'un channel
   * GET /channels/:id/messages
   */
  getChannelMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.channelId as string || req.params.id as string;
      const userId = req.userId as string;
      const { limit, before } = req.query;

      // Valider que "before" est une date ISO valide avant de la parser
      let beforeDate: Date | undefined;
      if (before) {
        beforeDate = new Date(before as string);
        if (isNaN(beforeDate.getTime())) {
          return res.status(400).json({ success: false, error: 'Paramètre "before" invalide, format ISO 8601 attendu' });
        }
      }

      const messages = await this.getChannelMessagesUseCase.execute({
        channelId,
        userId,
        limit: limit ? parseInt(limit as string) : undefined,
        before: beforeDate
      });

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour un message
   * PUT /channels/:channelId/messages/:id ou PUT /messages/:id
   */
  updateMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { content } = req.body;
      const userId = req.userId as string;

      // channelId est optionnel — le use case le résout lui-même via findById si absent
      const channelId = req.params.channelId as string | undefined;

      const message = await this.updateMessageUseCase.execute({
        messageId: id,
        userId,
        channelId,
        content
      });

      res.status(200).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Supprimer un message
   * DELETE /channels/:channelId/messages/:id ou DELETE /messages/:id
   */
  deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId as string;
      const scope = (req.query.scope as string | undefined) || (req.body?.scope as string | undefined);

      // channelId peut venir de la route nested ou être résolu via le message
      let channelId = req.params.channelId as string;

      if (!channelId) {
        // Route standalone : on récupère le channelId depuis le message
        const message = await this.getMessageByIdUseCase.execute({ messageId: id, userId });
        channelId = message.channelId;
      }

      await this.deleteMessageUseCase.execute({
        messageId: id,
        userId,
        channelId,
        scope: scope === 'me' ? 'me' : 'everyone'
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
