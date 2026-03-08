import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware de validation des requêtes avec Zod
 * Valide req.body contre un schema Zod et retourne 400 avec les erreurs formatées
 */
export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      res.status(400).json({
        success: false,
        error: 'Validation échouée',
        details: errors
      });
      return;
    }

    // Remplace req.body par les données validées et transformées
    req.body = result.data;
    next();
  };
}
