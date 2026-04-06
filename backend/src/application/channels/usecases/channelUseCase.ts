import type { ChannelRepository } from '../../../domain/channels/repositories/ChannelRepository.js';
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import { Channel, ChannelType } from '../../../domain/channels/entities/channel.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';
import crypto from 'crypto';

/**
 * Use Case : Créer un channel
 */
export interface CreateChannelDTO {
  name: string;
  type: ChannelType;
  serverId: string;
  userId: string;
}

export class CreateChannelUseCase extends BaseUseCase<CreateChannelDTO, Channel> {
  constructor(
    private channelRepository: ChannelRepository,
    private memberRepository: IMemberRepository
  ) { super(); }

  getName(): string {
    return 'CreateChannelUseCase';
  }

  async execute(data: CreateChannelDTO): Promise<Channel> {
    // Vérifie que l'utilisateur est admin ou owner du serveur
    const member = await this.memberRepository.findByUserAndServer(data.userId, data.serverId);

    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    if (!member.canManageChannels()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Seuls les administrateurs et le propriétaire peuvent créer des channels', 403);
    }

    // Vérifie si un channel avec ce nom existe déjà dans le serveur
    const exists = await this.channelRepository.existsInServer(data.serverId, data.name);

    if (exists) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Un channel avec ce nom existe déjà dans ce serveur', 409);
    }

    const id = crypto.randomUUID();

    const channel = new Channel(
      id,
      data.name,
      data.type,
      data.serverId,
      new Date()
    );

    return await this.channelRepository.create(channel);
  }
}

/**
 * Use Case : Obtenir un channel par ID
 */
export interface GetChannelByIdDTO {
  channelId: string;
  userId: string;
}

export class GetChannelByIdUseCase extends BaseUseCase<GetChannelByIdDTO, Channel> {
  constructor(
    private channelRepository: ChannelRepository,
    private memberRepository: IMemberRepository
  ) { super(); }

  getName(): string {
    return 'GetChannelByIdUseCase';
  }

  async execute(data: GetChannelByIdDTO): Promise<Channel> {
    const channel = await this.channelRepository.findById(data.channelId);
    
    if (!channel) {
      throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);
    }

    // Vérifier que le requester est membre du serveur auquel appartient le channel
    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);
    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    return channel;
  }
}

/**
 * Use Case : Obtenir tous les channels d'un serveur
 */
export interface GetServerChannelsDTO {
  serverId: string;
  userId: string;
}

export class GetServerChannelsUseCase extends BaseUseCase<GetServerChannelsDTO, Channel[]> {
  constructor(
    private channelRepository: ChannelRepository,
    private memberRepository: IMemberRepository
  ) { super(); }

  getName(): string {
    return 'GetServerChannelsUseCase';
  }

  async execute(data: GetServerChannelsDTO): Promise<Channel[]> {
    // Vérifier que le requester est membre du serveur
    const member = await this.memberRepository.findByUserAndServer(data.userId, data.serverId);
    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    return await this.channelRepository.findByServerId(data.serverId);
  }
}

/**
 * Use Case : Mettre à jour un channel
 * PERMISSIONS : ADMIN et OWNER peuvent modifier les channels
 */
export interface UpdateChannelDTO {
  channelId: string;
  userId: string;
  name?: string;
  type?: ChannelType;
  topic?: string;
  position?: number;
}

export class UpdateChannelUseCase extends BaseUseCase<UpdateChannelDTO, Channel> {
  constructor(
    private channelRepository: ChannelRepository,
    private memberRepository: IMemberRepository
  ) { super(); }

  getName(): string {
    return 'UpdateChannelUseCase';
  }

  async execute(data: UpdateChannelDTO): Promise<Channel> {
    const channel = await this.channelRepository.findById(data.channelId);

    if (!channel) {
      throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);
    }

    // Vérifie que l'utilisateur est admin ou owner du serveur
    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);

    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    if (!member.canManageChannels()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Seuls les administrateurs et le propriétaire peuvent modifier des channels', 403);
    }

    const updateData: Partial<Channel> = {};

    // Validation et mise à jour du nom
    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (trimmedName.length === 0) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Le nom du channel ne peut pas être vide', 400);
      }
      if (trimmedName.length > 100) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Le nom du channel ne peut pas dépasser 100 caractères', 400);
      }

      // Vérifier si le nom existe déjà dans ce serveur (sauf si c'est le même nom)
      if (trimmedName.toLowerCase() !== channel.name.toLowerCase()) {
        const exists = await this.channelRepository.existsInServer(channel.serverId, trimmedName);
        if (exists) {
          throw new AppError(ErrorCode.VALIDATION_ERROR, 'Un channel avec ce nom existe déjà dans ce serveur', 409);
        }
      }

      channel.updateName(trimmedName);
      updateData.name = trimmedName;
    }

    // Mise à jour du type
    if (data.type !== undefined) {
      channel.updateType(data.type);
      updateData.type = data.type;
    }

    // Validation et mise à jour du topic
    if (data.topic !== undefined) {
      if (data.topic.length > 1024) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Le topic ne peut pas dépasser 1024 caractères', 400);
      }
      updateData.topic = data.topic.trim() || null;
    }

    // Mise à jour de la position
    if (data.position !== undefined) {
      updateData.position = data.position;
    }

    return await this.channelRepository.update(data.channelId, updateData);
  }
}

/**
 * Use Case : Supprimer un channel
 */
export interface DeleteChannelDTO {
  channelId: string;
  userId: string;
}

export class DeleteChannelUseCase extends BaseUseCase<DeleteChannelDTO, void> {
  constructor(
    private channelRepository: ChannelRepository,
    private memberRepository: IMemberRepository
  ) { super(); }

  getName(): string {
    return 'DeleteChannelUseCase';
  }

  async execute(data: DeleteChannelDTO): Promise<void> {
    const channel = await this.channelRepository.findById(data.channelId);

    if (!channel) {
      throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);
    }

    // Protéger le channel "general" (channel par défaut créé avec le serveur)
    if (channel.name === 'general') {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Le channel "general" ne peut pas être supprimé',
        400
      );
    }

    // Vérifie que l'utilisateur est admin ou owner du serveur
    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);

    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    if (!member.canManageChannels()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Seuls les administrateurs et le propriétaire peuvent supprimer des channels', 403);
    }

    await this.channelRepository.delete(data.channelId);
  }
}