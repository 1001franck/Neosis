import { z } from 'zod';

/**
 * Schema de validation pour la création d'un message
 */
export const CreateMessageDTO = z.object({
  content: z
    .string({ message: "Le contenu du message est requis" })
    .min(1, "Le message ne peut pas être vide")
    .max(4000, "Le message ne peut pas dépasser 4000 caractères")
});

export type CreateMessageInput = z.infer<typeof CreateMessageDTO>;

/**
 * Schema de validation pour la mise à jour d'un message
 */
export const UpdateMessageDTO = z.object({
  content: z
    .string({ message: "Le contenu du message est requis" })
    .min(1, "Le message ne peut pas être vide")
    .max(4000, "Le message ne peut pas dépasser 4000 caractères")
});

export type UpdateMessageInput = z.infer<typeof UpdateMessageDTO>;
