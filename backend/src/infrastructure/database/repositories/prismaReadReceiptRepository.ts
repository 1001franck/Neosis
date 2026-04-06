import { PrismaClient } from '@prisma/client';
import type { ReadReceiptRepository } from '../../../domain/messages/repositories/ReadReceiptRepository.js';

/**
 * Implémentation Prisma du repository ReadReceipt
 */
export class PrismaReadReceiptRepository implements ReadReceiptRepository {
    constructor(private prisma: PrismaClient) { }

    /**
     * Marque un channel comme lu jusqu'à un certain message pour un utilisateur
     */
    async markAsRead(userId: string, channelId: string, messageId: string): Promise<void> {
        await this.prisma.userChannelRead.upsert({
            where: {
                userId_channelId: {
                    userId,
                    channelId,
                },
            },
            update: {
                lastReadMessageId: messageId,
                lastReadAt: new Date(),
            },
            create: {
                userId,
                channelId,
                lastReadMessageId: messageId,
                lastReadAt: new Date(),
            },
        });
    }

    /**
     * Récupère le dernier message lu par un utilisateur dans un channel
     */
    async getLastReadMessageId(userId: string, channelId: string): Promise<string | null> {
        const status = await this.prisma.userChannelRead.findUnique({
            where: {
                userId_channelId: {
                    userId,
                    channelId,
                },
            },
        });

        return status ? status.lastReadMessageId : null;
    }

    /**
     * Récupère les statuts de lecture pour tous les utilisateurs d'un channel
     * Retourne une map: userId -> lastReadMessageId
     */
    async getChannelReadStatus(channelId: string): Promise<Map<string, string>> {
        const statuses = await this.prisma.userChannelRead.findMany({
            where: {
                channelId,
            },
        });

        const statusMap = new Map<string, string>();
        for (const status of statuses) {
            if (status.lastReadMessageId) {
                statusMap.set(status.userId, status.lastReadMessageId);
            }
        }

        return statusMap;
    }
}
