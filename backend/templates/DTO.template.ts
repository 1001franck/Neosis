/**
 * =====================================================
 * TEMPLATE: DTO (Data Transfer Object)
 * =====================================================
 * 
 * Copie ce fichier et remplace XXX par ton concept
 * 
 * Règles:
 *  DTOs pour les requêtes et réponses
 *  Validations avec Zod
 *  Types TypeScript
 *  Toujours typer complètement
 */

import { z } from 'zod';

/**
 * Request DTO pour créer un XXX
 * Utilisé dans le controller et validé via middleware
 */
export const CreateXXXSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  // ... autres champs
});

export type CreateXXXRequest = z.infer<typeof CreateXXXSchema>;

/**
 * Response DTO pour un XXX
 * Retourné au client après la création
 */
export interface XXXResponseDTO {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // ... autres champs publics
}
