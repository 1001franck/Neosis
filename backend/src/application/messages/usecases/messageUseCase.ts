import type { MessageRepository } from '../../../domain/messages/repositories/MessageRepository.js';
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import type { ChannelRepository } from '../../../domain/channels/repositories/ChannelRepository.js';
import { Message } from '../../../domain/messages/entities/message.js';
import { MemberRole } from '../../../domain/members/entities/Member.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';
import crypto from 'crypto';

/**
 * Use Case : Créer un message
 */
export interface CreateMessageDTO {
  content: string;
  userId: string;
  channelId: string;
  attachmentIds?: string[];
}

export class CreateMessageUseCase extends BaseUseCase<CreateMessageDTO, Message> {
  constructor(
    private messageRepository: MessageRepository,
    private memberRepository: IMemberRepository,
    private channelRepository: ChannelRepository
  ) { super(); }

  getName(): string {
    return 'CreateMessageUseCase';
  }

  async execute(data: CreateMessageDTO): Promise<Message> {
    // Sanitize le contenu pour prévenir les attaques XSS
    const sanitizedContent = Message.sanitize(data.content);

    // Récupère le channel pour connaître le serverId
    const channel = await this.channelRepository.findById(data.channelId);

    if (!channel) {
      throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);
    }

    // Vérifie que l'utilisateur est membre du serveur
    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);

    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    const id = crypto.randomUUID();

    const hasAttachments = !!(data.attachmentIds && data.attachmentIds.length > 0);

    const message = new Message(
      id,
      sanitizedContent,
      member.id,
      data.channelId,
      new Date(),
      new Date(),
      null, // deletedAt
      null, // deliveredAt
      hasAttachments
    );

    const created = await this.messageRepository.create(message);

    // Lier les pièces jointes si fournies
    if (data.attachmentIds && data.attachmentIds.length > 0) {
      return await this.messageRepository.linkAttachments(created.id, data.attachmentIds);
    }

    return created;
  }
}

/**
 * Use Case : Obtenir un message par ID
 */
export interface GetMessageByIdDTO {
  messageId: string;
  userId: string;
}

export class GetMessageByIdUseCase extends BaseUseCase<GetMessageByIdDTO, Message> {
  constructor(
    private messageRepository: MessageRepository,
    private memberRepository: IMemberRepository,
    private channelRepository: ChannelRepository
  ) { super(); }

  getName(): string {
    return 'GetMessageByIdUseCase';
  }

  async execute(data: GetMessageByIdDTO): Promise<Message> {
    const message = await this.messageRepository.findById(data.messageId);

    if (!message) {
      throw new AppError(ErrorCode.MESSAGE_NOT_FOUND, 'Message non trouvé', 404);
    }

    if (message.isDeleted()) {
      throw new AppError(ErrorCode.MESSAGE_DELETED, 'Ce message a été supprimé', 410);
    }

    // Vérifier que le requester est membre du serveur
    const channel = await this.channelRepository.findById(message.channelId);
    if (channel) {
      const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);
      if (!member) {
        throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
      }
    }

    return message;
  }
}

/**
 * Use Case : Obtenir les messages d'un channel
 */
export interface GetChannelMessagesDTO {
  channelId: string;
  userId: string;
  limit?: number | undefined;
  before?: Date | undefined;
}

export class GetChannelMessagesUseCase extends BaseUseCase<GetChannelMessagesDTO, Message[]> {
  constructor(
    private messageRepository: MessageRepository,
    private memberRepository: IMemberRepository,
    private channelRepository: ChannelRepository
  ) { super(); }

  getName(): string {
    return 'GetChannelMessagesUseCase';
  }

  async execute(data: GetChannelMessagesDTO): Promise<Message[]> {
    // Vérifier que le requester est membre du serveur
    const channel = await this.channelRepository.findById(data.channelId);
    if (!channel) {
      throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);
    }

    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);
    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    return await this.messageRepository.findByChannelId(
      data.channelId,
      data.limit,
      data.before,
      data.userId
    );
  }
}

/**
 * Use Case : Obtenir les messages récents d'un channel
 */
export interface GetRecentMessagesDTO {
  channelId: string;
  limit: number;
  userId?: string;
}

export class GetRecentMessagesUseCase extends BaseUseCase<GetRecentMessagesDTO, Message[]> {
  constructor(private messageRepository: MessageRepository) { super(); }

  getName(): string {
    return 'GetRecentMessagesUseCase';
  }

  async execute(data: GetRecentMessagesDTO): Promise<Message[]> {
    return await this.messageRepository.findRecentByChannelId(data.channelId, data.limit, data.userId);
  }
}

/**
 * Use Case : Mettre à jour un message
 */
export interface UpdateMessageDTO {
  messageId: string;
  userId: string;
  channelId: string;
  content: string;
}

export class UpdateMessageUseCase extends BaseUseCase<UpdateMessageDTO, Message> {
  constructor(
    private messageRepository: MessageRepository,
    private memberRepository: IMemberRepository,
    private channelRepository: ChannelRepository
  ) { super(); }

  getName(): string {
    return 'UpdateMessageUseCase';
  }

  async execute(data: UpdateMessageDTO): Promise<Message> {
    const message = await this.messageRepository.findById(data.messageId);

    if (!message) {
      throw new AppError(ErrorCode.MESSAGE_NOT_FOUND, 'Message non trouvé', 404);
    }

    if (message.isDeleted()) {
      throw new AppError(ErrorCode.MESSAGE_DELETED, 'Ce message a été supprimé', 410);
    }

    // Résoudre le member depuis userId + channel.serverId
    const channel = await this.channelRepository.findById(data.channelId);

    if (!channel) {
      throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);
    }

    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);

    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    // Seul l'auteur peut modifier son message
    if (!message.belongsTo(member.id)) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous ne pouvez modifier que vos propres messages', 403);
    }

    // Limite de 25 minutes pour modifier un message
    const EDIT_WINDOW_MS = 25 * 60 * 1000;
    const elapsedMs = Date.now() - message.createdAt.getTime();
    if (elapsedMs > EDIT_WINDOW_MS) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous ne pouvez plus modifier ce message (limite de 25 minutes dépassée)', 403);
    }

    // Sanitize le contenu pour prévenir les attaques XSS
    const sanitizedContent = Message.sanitize(data.content);

    return await this.messageRepository.update(data.messageId, sanitizedContent);
  }
}

/**
 * Use Case : Supprimer un message (soft delete)
 */
export interface DeleteMessageDTO {
  messageId: string;
  userId: string;
  channelId: string;
  scope?: 'me' | 'everyone';
}

export interface DeleteMessageResult {
  scope: 'me' | 'everyone';
  deletedByRole: MemberRole;
  deletedByUserId: string;
  deletedByUsername?: string | null;
}

export class DeleteMessageUseCase extends BaseUseCase<DeleteMessageDTO, DeleteMessageResult> {
  constructor(
    private messageRepository: MessageRepository,
    private memberRepository: IMemberRepository,
    private channelRepository: ChannelRepository
  ) { super(); }

  getName(): string {
    return 'DeleteMessageUseCase';
  }

  async execute(data: DeleteMessageDTO): Promise<DeleteMessageResult> {
    const message = await this.messageRepository.findById(data.messageId);

    if (!message) {
      throw new AppError(ErrorCode.MESSAGE_NOT_FOUND, 'Message non trouvé', 404);
    }

    if (message.isDeleted()) {
      throw new AppError(ErrorCode.MESSAGE_NOT_FOUND, 'Ce message a déjà été supprimé', 410);
    }

    // Résoudre le member depuis userId + channel.serverId
    const channel = await this.channelRepository.findById(data.channelId);

    if (!channel) {
      throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);
    }

    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);

    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    const scope = data.scope === 'me' ? 'me' : 'everyone';

    // Delete for me: only author can use this
    if (scope === 'me') {
      if (!message.belongsTo(member.id)) {
        throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous ne pouvez supprimer que vos propres messages', 403);
      }
      await this.messageRepository.deleteForUser(data.messageId, data.userId);
      return {
        scope,
        deletedByRole: member.role,
        deletedByUserId: data.userId,
      };
    }

    // Delete for everyone: author or admin/owner
    if (!message.belongsTo(member.id) && !member.canManageMessages()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous ne pouvez supprimer que vos propres messages', 403);
    }

    await this.messageRepository.softDelete(data.messageId);

    return {
      scope,
      deletedByRole: member.role,
      deletedByUserId: data.userId,
    };
  }
}
