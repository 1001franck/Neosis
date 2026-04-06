import { z } from 'zod';

/**
 * Regex partagée avec l'entité domain Channel
 * Lettres, chiffres, tirets et underscores uniquement
 */
const channelNameRegex = /^[a-z0-9_-]+$/i;

/**
 * Schema de validation pour la création d'un channel
 */
export const CreateChannelDTO = z.object({
  name: z
    .string({ message: "Le nom du channel est requis" })
    .min(1, "Le nom du channel ne peut pas être vide")
    .max(100, "Le nom du channel ne peut pas dépasser 100 caractères")
    .trim()
    .regex(channelNameRegex, "Le nom ne peut contenir que des lettres, chiffres, tirets et underscores"),

  type: z.enum(['TEXT', 'VOICE'], {
    message: "Le type doit être TEXT ou VOICE"
  })
});

export type CreateChannelInput = z.infer<typeof CreateChannelDTO>;

/**
 * Schema de validation pour la mise à jour d'un channel
 */
export const UpdateChannelDTO = z.object({
  name: z
    .string()
    .min(1, "Le nom du channel ne peut pas être vide")
    .max(100, "Le nom du channel ne peut pas dépasser 100 caractères")
    .trim()
    .regex(channelNameRegex, "Le nom ne peut contenir que des lettres, chiffres, tirets et underscores")
    .optional(),

  type: z.enum(['TEXT', 'VOICE'], {
    message: "Le type doit être TEXT ou VOICE"
  }).optional()
});

export type UpdateChannelInput = z.infer<typeof UpdateChannelDTO>;
