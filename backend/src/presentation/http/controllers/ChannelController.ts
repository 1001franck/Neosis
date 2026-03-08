import type { Request, Response, NextFunction } from 'express';
import {
  CreateChannelUseCase,
  GetChannelByIdUseCase,
  GetServerChannelsUseCase,
  UpdateChannelUseCase,
  DeleteChannelUseCase
} from '../../../application/channels/usecases/channelUseCase.js';

/**
 * Contrôleur pour les channels
 * Gère les requêtes HTTP liées aux channels
 */
export class ChannelController {
  constructor(
    private createChannelUseCase: CreateChannelUseCase,
    private getChannelByIdUseCase: GetChannelByIdUseCase,
    private getServerChannelsUseCase: GetServerChannelsUseCase,
    private updateChannelUseCase: UpdateChannelUseCase,
    private deleteChannelUseCase: DeleteChannelUseCase
  ) {}

  /**
   * Créer un nouveau channel
   * POST /servers/:serverId/channels
   */
  createChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.serverId as string;
      const { name, type } = req.body;
      const userId = req.userId as string;

      const channel = await this.createChannelUseCase.execute({
        name,
        type,
        serverId,
        userId
      });

      res.status(201).json({
        success: true,
        data: channel
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir un channel par ID
   * GET /channels/:id
   */
  getChannelById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId as string;

      const channel = await this.getChannelByIdUseCase.execute({ channelId: id, userId });

      res.status(200).json({
        success: true,
        data: channel
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir tous les channels d'un serveur
   * GET /servers/:serverId/channels
   */
  getServerChannels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.serverId as string;
      const userId = req.userId as string;

      const channels = await this.getServerChannelsUseCase.execute({ serverId, userId });

      res.status(200).json({
        success: true,
        data: channels
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour un channel
   * PUT /channels/:id
   *
   * Body: { name?: string, topic?: string, position?: number }
   * ⚠️ PERMISSIONS : ADMIN et OWNER peuvent modifier les channels
   */
  updateChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { name, topic, position } = req.body;
      const userId = req.userId as string;

      const channel = await this.updateChannelUseCase.execute({
        channelId: id,
        userId,
        name,
        topic,
        position
      });

      res.status(200).json({
        success: true,
        data: channel
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Supprimer un channel
   * DELETE /channels/:id
   */
  deleteChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId as string;

      await this.deleteChannelUseCase.execute({ channelId: id, userId });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}