/**
 * APPLICATION - READ RECEIPTS STORE
 * Gère l'état de lecture des messages par channel et par utilisateur
 * Stratégie : last_read_message_id
 */

import { create } from 'zustand';

interface ReadReceiptStoreState {
    /**
     * Map: channelId -> userId -> { lastReadMessageId, readAt }
     */
    readReceipts: Map<string, Map<string, { lastReadMessageId: string; readAt: Date }>>;

    /**
     * Mettre à jour le statut de lecture d'un utilisateur dans un channel
     */
    updateReadStatus: (channelId: string, userId: string, messageId: string, readAt: Date) => void;

    /**
     * Obtenir le statut de lecture d'un utilisateur dans un channel
     */
    getReadStatus: (channelId: string, userId: string) => { lastReadMessageId: string; readAt: Date } | null;

    reset: () => void;
}

export const useReadReceiptStore = create<ReadReceiptStoreState>((set, get) => ({
    readReceipts: new Map(),

    updateReadStatus: (channelId, userId, messageId, readAt) =>
        set((state) => {
            const newReadReceipts = new Map(state.readReceipts);

            if (!newReadReceipts.has(channelId)) {
                newReadReceipts.set(channelId, new Map());
            }

            const channelReads = newReadReceipts.get(channelId)!;
            channelReads.set(userId, { lastReadMessageId: messageId, readAt });

            return { readReceipts: newReadReceipts };
        }),

    getReadStatus: (channelId, userId) => {
        const channelReads = get().readReceipts.get(channelId);
        return channelReads ? channelReads.get(userId) || null : null;
    },

    reset: () => set({ readReceipts: new Map() }),
}));
