import { z } from 'zod';

/**
 * Schema de validation pour la création d'un serveur
 */
export const CreateServerDTO = z.object({
  name: z
    .string({ message: "Le nom du serveur est requis" })
    .min(1, "Le nom du serveur ne peut pas être vide")
    .max(100, "Le nom du serveur ne peut pas dépasser 100 caractères")
    .trim(),

  imageUrl: z
    .string()
    .url("L'URL de l'image doit être une URL valide")
    .optional(),

  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional()
});

export type CreateServerInput = z.infer<typeof CreateServerDTO>;

/**
 * Schema de validation pour la mise à jour d'un serveur
 */
export const UpdateServerDTO = z.object({
  name: z
    .string()
    .min(1, "Le nom du serveur ne peut pas être vide")
    .max(100, "Le nom du serveur ne peut pas dépasser 100 caractères")
    .trim()
    .optional(),

  imageUrl: z
    .string()
    .url("L'URL de l'image doit être une URL valide")
    .nullable()
    .optional(),

  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .nullable()
    .optional()
});

export type UpdateServerInput = z.infer<typeof UpdateServerDTO>;

/**
 * Schema de validation pour rejoindre un serveur
 */
export const JoinServerDTO = z.object({
  inviteCode: z
    .string({ message: "Le code d'invitation est requis" })
    .min(1, "Le code d'invitation ne peut pas être vide")
});

export type JoinServerInput = z.infer<typeof JoinServerDTO>;

/**
 * Schema de validation pour le transfert de propriété
 */
export const TransferOwnershipDTO = z.object({
  newOwnerId: z
    .string({ message: "L'ID du nouvel owner est requis" })
    .min(1, "L'ID du nouvel owner ne peut pas être vide")
});

export type TransferOwnershipInput = z.infer<typeof TransferOwnershipDTO>;

/**
 * Schema de validation pour la mise à jour du rôle d'un membre
 */
export const UpdateMemberRoleDTO = z.object({
  role: z.enum(['ADMIN', 'MEMBER'], {
    message: "Le rôle doit être ADMIN ou MEMBER"
  })
});

export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleDTO>;
