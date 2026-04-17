import type { Server } from '../entities/server.js';

/**
 * Interface du repository Server
 * Définit les opérations de persistance pour les serveurs
 */
export interface ServerRepository {
  create(server: Server): Promise<Server>;
  findById(id: string): Promise<Server | null>;
  findByInviteCode(inviteCode: string): Promise<Server | null>;
  findByUserId(userId: string): Promise<Server[]>;
  update(id: string, data: Partial<Server>): Promise<Server>;
  delete(id: string): Promise<void>;
  inviteCodeExists(inviteCode: string): Promise<boolean>;
  countMembers(serverId: string): Promise<number>;
}
