import type { Request, Response, NextFunction } from "express";
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import { MemberRole } from '../../../domain/members/entities/Member.js';

export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

/**
 * Factory qui crée un middleware de vérification des rôles
 * Injecte le MemberRepository pour requêter la DB au lieu de données mockées
 */
export function createCheckRole(memberRepository: IMemberRepository) {
  return (allowedRoles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.userId;
      const serverId = req.params.serverId as string || req.params.id as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Accès refusé. Utilisateur non authentifié."
        });
        return;
      }

      if (!serverId) {
        res.status(400).json({
          success: false,
          error: "ID du serveur manquant."
        });
        return;
      }

      // Requête la DB pour trouver le member
      const member = await memberRepository.findByUserAndServer(userId, serverId);

      if (!member) {
        res.status(403).json({
          success: false,
          error: "Accès refusé. Tu n'es pas membre de ce serveur."
        });
        return;
      }

      // Vérifie si son rôle est dans la liste autorisée
      if (!allowedRoles.includes(member.role as UserRole)) {
        res.status(403).json({
          success: false,
          error: `Permission insuffisante. Rôles requis : ${allowedRoles.join(", ")}`
        });
        return;
      }

      // Attache le member à la request pour les controllers en aval
      (req as any).member = member;

      next();
    };
  };
}