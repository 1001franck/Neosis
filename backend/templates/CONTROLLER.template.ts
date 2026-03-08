/**
 * =====================================================
 * TEMPLATE: Controller HTTP
 * =====================================================
 * 
 * Copie ce fichier et remplace XXX par ton concept
 * 
 * Règles:
 *  Reçoit les requêtes HTTP
 *  Appelle les use cases
 *  Retourne les réponses formatées
 *  Ne fait PAS de logique métier
 *  Les erreurs sont gérées par le middleware global
 */

import { Request, Response } from 'express';
import { CreateXXXUseCase } from '@application/xxx/usecases/CreateXXXUseCase';
import { XXXResponseDTO } from '@application/xxx/dtos/XXXResponseDTO';
import { ApiResponse } from '@shared/types/api-response';
import { Logger } from '@shared/utils/logger';

/**
 * Controller: XXX
 * 
 * Responsabilité: Gérer les requêtes HTTP pour XXX
 * - Extraire les données de la requête
 * - Appeler le use case approprié
 * - Formater et retourner la réponse HTTP
 * 
 * Les erreurs sont gérées par le middleware errorHandler global
 */
export class XXXController {
  private logger = new Logger('XXXController');

  constructor(private createXXXUseCase: CreateXXXUseCase) {}

  /**
   * POST /xxx
   * Crée un nouveau XXX
   */
  async create(req: Request, res: Response): Promise<void> {
    this.logger.info('POST /xxx - Creating new XXX', { body: req.body });

    try {
      const result = await this.createXXXUseCase.execute(req.body);

      const response: ApiResponse<XXXResponseDTO> = {
        success: true,
        data: result,
      };

      res.status(201).json(response);
      this.logger.info('XXX created successfully', { id: result.id });
    } catch (error) {
      // Les erreurs sont gérées par le middleware errorHandler
      this.logger.error('Error creating XXX', { error });
      throw error;
    }
  }

  /**
   * GET /xxx/:id
   * Récupère un XXX par ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    this.logger.info('GET /xxx/:id', { id });

    try {
      // Appelle le use case approprié
      // const result = await this.getXXXByIdUseCase.execute({ id });

      const response: ApiResponse<XXXResponseDTO> = {
        success: true,
        // data: result,
      };

      res.json(response);
    } catch (error) {
      this.logger.error('Error getting XXX', { id, error });
      throw error;
    }
  }
}
