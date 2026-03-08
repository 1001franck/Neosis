/**
 * Middleware: Gestion des erreurs
 * Responsabilité: Capturer et formater les erreurs pour les envoyer au client
 */
import type { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';
import type { ApiResponse } from '../../../shared/types/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Si c'est une AppError, on a plus d'infos
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || {},
      },
    };
    return res.status(err.statusCode).json(response);
  }

  // Erreur générique
  const response: ApiResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    },
  };

  res.status(500).json(response);
};
