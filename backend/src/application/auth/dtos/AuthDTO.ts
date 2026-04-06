import { z } from 'zod';

/**
 * Schema de validation pour l'inscription
 */
export const RegisterDTO = z.object({
  email: z
    .string({ message: "L'email est requis" })
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),

  username: z
    .string({ message: "Le nom d'utilisateur est requis" })
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(20, "Le nom d'utilisateur ne peut pas dépasser 20 caractères")
    .regex(/^[a-zA-Z0-9_]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"),

  password: z
    .string({ message: "Le mot de passe est requis" })
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
});

export type RegisterInput = z.infer<typeof RegisterDTO>;

/**
 * Schema de validation pour la connexion
 */
export const LoginDTO = z.object({
  email: z
    .string({ message: "L'email est requis" })
    .email("Format d'email invalide"),

  password: z
    .string({ message: "Le mot de passe est requis" })
    .min(1, "Le mot de passe est requis")
});

export type LoginInput = z.infer<typeof LoginDTO>;

/**
 * Schema de validation pour la mise à jour du profil
 */
export const UpdateProfileDTO = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(20, "Le nom d'utilisateur ne peut pas dépasser 20 caractères")
    .regex(/^[a-zA-Z0-9_]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores")
    .optional(),

  avatarUrl: z
    .string()
    .url("L'URL de l'avatar doit être une URL valide")
    .max(2048, "L'URL de l'avatar ne peut pas dépasser 2048 caractères")
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      "L'URL de l'avatar doit commencer par http:// ou https://"
    )
    .nullable()
    .optional(),

  bio: z
    .string()
    .max(190, "La bio ne peut pas dépasser 190 caractères")
    .transform((v) => v.trim() || null)
    .nullable()
    .optional(),

  customStatus: z
    .string()
    .max(128, "Le statut ne peut pas dépasser 128 caractères")
    .transform((v) => v.trim() || null)
    .nullable()
    .optional(),

  statusEmoji: z
    .string()
    .max(8, "L'emoji de statut ne peut pas dépasser 8 caractères")
    .transform((v) => v.trim() || null)
    .nullable()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileDTO>;
