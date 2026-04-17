/**
 * Interface pour les reçus de lecture (Read Receipts)
 * Gère le statut de lecture par utilisateur et par channel
 */
export interface ReadReceiptRepository {
    /**
     * Marque un channel comme lu jusqu'à un certain message pour un utilisateur
     */
    markAsRead(userId: string, channelId: string, messageId: string): Promise<void>;

    /**
     * Récupère le dernier message lu par un utilisateur dans un channel
     */
    getLastReadMessageId(userId: string, channelId: string): Promise<string | null>;

    /**
     * Récupère les statuts de lecture pour tous les utilisateurs d'un channel
     * Retourne une map: userId -> lastReadMessageId
     */
    getChannelReadStatus(channelId: string): Promise<Map<string, string>>;
}
