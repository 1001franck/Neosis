export interface DirectMessageSender {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface DirectMessageReplyTo {
  id: string;
  content: string;
  senderId: string;
  sender?: DirectMessageSender | null;
}

/**
 * Entité métier DirectMessage
 * Message privé entre deux utilisateurs.
 */
export class DirectMessage {
  public sender?: DirectMessageSender;
  public replyTo?: DirectMessageReplyTo | null;

  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public content: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
    public readonly replyToId: string | null = null
  ) {
    this.validateContent(content);
  }

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Le contenu du message ne peut pas être vide');
    }
    if (content.length > 4000) {
      throw new Error('Le contenu du message ne peut pas dépasser 4000 caractères');
    }
  }
}
