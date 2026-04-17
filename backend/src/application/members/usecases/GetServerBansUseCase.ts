import type { IBanRepository } from '../../../domain/bans/repositories/IBanRepository.js';
import type { IUserRepository } from '../../../domain/users/repositories/UserRepository.js';

/**
 * Résultat enrichi d'un ban avec les infos utilisateur
 */
export interface BanWithUser {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  isPermanent: boolean;
  expiresAt: string | null;
  reason: string | null;
}

/**
 * Use Case : Lister les bans actifs d'un serveur avec les infos utilisateur
 */
export class GetServerBansUseCase {
  constructor(
    private banRepository: IBanRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(serverId: string): Promise<BanWithUser[]> {
    const allBans = await this.banRepository.findByServerId(serverId);

    // Utiliser la méthode isActive() de l'entité Ban pour filtrer
    const activeBans = allBans.filter(b => b.isActive());

    // Récupérer les infos utilisateurs en une seule requête
    const userIds = activeBans.map(b => b.userId);
    const users = await this.userRepository.findByIds(userIds);
    const usersMap = new Map(users.map(u => [u.id, u]));

    return activeBans.map(b => {
      const user = usersMap.get(b.userId);
      return {
        userId: b.userId,
        username: user?.username ?? null,
        avatarUrl: user?.avatarUrl ?? null,
        isPermanent: b.isPermanent(),
        expiresAt: b.expiresAt ? b.expiresAt.toISOString() : null,
        reason: b.reason,
      };
    });
  }
}
