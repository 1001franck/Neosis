/**
 * ROUTES - UPLOAD
 * Routes pour l'upload de fichiers et la récupération des médias d'un channel
 * 
 * POST   /upload                        → Upload fichiers (multipart/form-data)
 * GET    /channels/:channelId/media     → Médias/fichiers/liens d'un channel
 */

import { Router } from 'express';
import { upload } from '../../../infrastructure/upload/multerConfig.js';
import { UploadController } from '../controllers/UploadController.js';

export function createUploadRoutes(uploadController: UploadController): Router {
  const router = Router();

  // Upload de fichiers (max 5)
  router.post('/', upload.array('files', 5), uploadController.uploadFiles.bind(uploadController));

  return router;
}

export function createChannelMediaRoutes(uploadController: UploadController): Router {
  const router = Router({ mergeParams: true });

  // Récupérer les médias du channel
  router.get('/', uploadController.getChannelMedia.bind(uploadController));

  return router;
}
