import type { ReadReceiptRepository } from '../../../domain/messages/repositories/ReadReceiptRepository.js';
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import type { ChannelRepository } from '../../../domain/channels/repositories/ChannelRepository.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

/**
 * Use Case : Marquer un channel comme lu jusqu'à un message donné
 */
export interface MarkChannelAsReadDTO {
    userId: string;
    channelId: string;
    messageId: string;
}

export class MarkChannelAsReadUseCase extends BaseUseCase<MarkChannelAsReadDTO, void> {
    constructor(
        private readReceiptRepository: ReadReceiptRepository,
        private memberRepository: IMemberRepository,
        private channelRepository: ChannelRepository
    ) { super(); }

    getName(): string {
        return 'MarkChannelAsReadUseCase';
    }

    async execute(data: MarkChannelAsReadDTO): Promise<void> {
        // Vérifier que le channel existe et résoudre serverId
        const channel = await this.channelRepository.findById(data.channelId);

        if (!channel) {
            // Si channel n'existe pas, on ignore silencieusement ou on throw 404
            // Pour une action WebSocket/User, throw est plus propre
            throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel non trouvé', 404);
        }

        // Vérifier que l'utilisateur est membre du serveur
        const member = await this.memberRepository.findByUserAndServer(data.userId, channel.serverId);

        if (!member) {
            throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
        }

        // Marquer comme lu
        await this.readReceiptRepository.markAsRead(data.userId, data.channelId, data.messageId);
    }
}
