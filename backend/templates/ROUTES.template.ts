/**
 * =====================================================
 * TEMPLATE: Routes
 * =====================================================
 * 
 * Copie ce fichier et remplace XXX par ton concept
 * 
 * Règles:
 *  Mapper les endpoints HTTP aux controllers
 *  Ajouter les middlewares (validation, auth, etc)
 *  Garder la logique simple
 *  Capturer les erreurs avec .catch(next)
 */

import { Router, Request, Response } from 'express';
import { XXXController } from '../controllers/XXXController';
import { validationMiddleware } from '../middlewares/validation';
import { authenticationMiddleware } from '../middlewares/authentication';
import { CreateXXXSchema } from '@application/xxx/dtos/CreateXXXRequest';

/**
 * Factory pour créer les routes XXX
 * 
 * @param controller - Le controller XXX injecté
 * @returns Router Express configuré
 * 
 * @example
 * const router = createXXXRoutes(container.getXXXController());
 * app.use('/xxx', router);
 */
export function createXXXRoutes(controller: XXXController): Router {
  const router = Router();

  /**
   * POST /
   * Crée un nouveau XXX
   * 
   * Middlewares:
   * - validation: Valide le body contre le schema
   * - authentication: Vérifie que l'utilisateur est connecté
   */
  router.post(
    '/',
    authenticationMiddleware,
    validationMiddleware(CreateXXXSchema),
    (req: Request, res: Response, next) =>
      controller.create(req, res).catch(next),
  );

  /**
   * GET /:id
   * Récupère un XXX par ID
   */
  router.get(
    '/:id',
    authenticationMiddleware,
    (req: Request, res: Response, next) =>
      controller.getById(req, res).catch(next),
  );

  return router;
}
