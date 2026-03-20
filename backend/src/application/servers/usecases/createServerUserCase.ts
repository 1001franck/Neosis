import type { ServerRepository } from '../../../domain/servers/repositories/ServerRepository.js';
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import type { ChannelRepository } from '../../../domain/channels/repositories/ChannelRepository.js';
import { Server } from '../../../domain/servers/entities/server.js';
import { Member, MemberRole } from '../../../domain/members/entities/Member.js';
import { Channel, ChannelType } from '../../../domain/channels/entities/channel.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import crypto from 'crypto';

/**
 * DTO pour la création d'un serveur
 */
export interface CreateServerDTO {
  name: string;
  ownerId: string;
  imageUrl?: string;
  description?: string;
}

/**
 * Use Case : Créer un nouveau serveur
 * Responsabilités:
 * - Créer le serveur avec un code d'invitation unique
 * - Créer le member OWNER pour le créateur
 * - Créer le channel "general" par défaut
 */
export class CreateServerUseCase extends BaseUseCase<CreateServerDTO, Server> {
  constructor(
    private serverRepository: ServerRepository,
    private memberRepository: IMemberRepository,
    private channelRepository: ChannelRepository
  ) { super(); }

  getName(): string {
    return 'CreateServerUseCase';
  }

  /**
   * Génère un code d'invitation unique
   */
  private async generateUniqueInviteCode(): Promise<string> {
    let inviteCode: string;
    let exists: boolean;

    do {
      // Génère un code aléatoire de 8 caractères
      inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      exists = await this.serverRepository.inviteCodeExists(inviteCode);
    } while (exists);

    return inviteCode;
  }

  /**
   * Exécute le use case
   * Les 3 créations (server, owner member, general channel) sont liées.
   * En cas d'échec partiel, on nettoie le serveur (cascade supprime members + channels).
   */
  async execute(data: CreateServerDTO): Promise<Server> {
    // Génère un code d'invitation unique
    const inviteCode = await this.generateUniqueInviteCode();

    // Crée l'entité serveur
    const server = new Server(
      crypto.randomUUID(),
      data.name,
      data.ownerId,
      inviteCode,
      data.imageUrl || null,
      new Date(),
      data.description || null
    );

    // Persiste le serveur
    const createdServer = await this.serverRepository.create(server);

    try {
      // Crée le member OWNER pour le créateur du serveur
      const ownerMember = new Member(
        crypto.randomUUID(),
        data.ownerId,
        createdServer.id,
        MemberRole.OWNER,
        new Date()
      );
      await this.memberRepository.create(ownerMember);

      // Crée le channel "general" par défaut
      const generalChannel = new Channel(
        crypto.randomUUID(),
        'general',
        ChannelType.TEXT,
        createdServer.id,
        new Date()
      );
      await this.channelRepository.create(generalChannel);
    } catch (error) {
      // Rollback : supprimer le serveur (cascade supprime members + channels)
      await this.serverRepository.delete(createdServer.id).catch(() => {});
      throw error;
    }

    return createdServer;
  }
}