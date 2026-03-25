import type { IMessageReactionRepository } from '../../../domain/messages/repositories/IMessageReactionRepository.js';
import type { MessageRepository } from '../../../domain/messages/repositories/MessageRepository.js';
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import type { ChannelRepository } from '../../../domain/channels/repositories/ChannelRepository.js';
import type { MessageReactionData } from '../../../domain/messages/entities/message.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

export interface ReactionDTO {
  messageId: string;
  userId: string;
  emoji: string;
}

/**
 * Use Case : Ajouter une réaction à un message
 * Vérifie que l'utilisateur est membre du serveur avant d'autoriser la réaction
 */
export class AddReactionUseCase {
  constructor(
    private reactionRepository: IMessageReactionRepository,
    private messageRepository: MessageRepository,
    private memberRepository: IMemberRepository,
    private channelRepository: ChannelRepository
  ) {}

  async execute(data: ReactionDTO): Promise<MessageReactionData[]> {
    const message = await this.messageRepository.findById(data.messageId);
    if (!message) throw new AppError(ErrorCode.MESSAGE_NOT_FOUND, 'Message non trouvé', 404);

    const channel = await this.channelRepository.findById(message.channelId);
    if (!channel) throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);

    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);
    if (!member) throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);

    await this.reactionRepository.add(data.messageId, data.userId, data.emoji);
    return this.reactionRepository.findByMessageId(data.messageId);
  }
}

/**
 * Use Case : Supprimer une réaction d'un message
 * Seul l'auteur de la réaction peut la supprimer
 */
export class RemoveReactionUseCase {
  constructor(
    private reactionRepository: IMessageReactionRepository,
    private messageRepository: MessageRepository,
    private memberRepository: IMemberRepository,
    private channelRepository: ChannelRepository
  ) {}

  async execute(data: ReactionDTO): Promise<MessageReactionData[]> {
    const message = await this.messageRepository.findById(data.messageId);
    if (!message) throw new AppError(ErrorCode.MESSAGE_NOT_FOUND, 'Message non trouvé', 404);

    const channel = await this.channelRepository.findById(message.channelId);
    if (!channel) throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);

    const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);
    if (!member) throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);

    await this.reactionRepository.remove(data.messageId, data.userId, data.emoji);
    return this.reactionRepository.findByMessageId(data.messageId);
  }
}
