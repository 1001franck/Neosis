/**
 * Informations de l'auteur attachées au message
 */
export interface MessageAuthor {
  id: string;
  username: string;
  avatar?: string | null;
}

/**
 * Réaction agrégée sur un message
 */
export interface MessageReactionData {
  emoji: string;
  count: number;
  userIds: string[];
}

/**
 * Pièce jointe d'un message
 */
export interface MessageAttachment {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Entité métier Message
 * Représente un message dans un channel
 */
export class Message {
  /** Données auteur (peuplées par le repository) */
  public author?: MessageAuthor;

  /** Pièces jointes (peuplées par le repository) */
  public attachments: MessageAttachment[] = [];

  /** Réactions agrégées (peuplées par le repository) */
  public reactions: MessageReactionData[] = [];

  /** Message supprimé uniquement pour un user (Delete for me) */
  public deletedForUserId?: string | null;

  constructor(
    public readonly id: string,
    public content: string | null,
    public readonly memberId: string,
    public readonly channelId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
    public deliveredAt: Date | null = null,
    private readonly hasAttachments: boolean = false
  ) {
    this.validateContent(content);
  }

  /**
   * Supprime les balises HTML pour prévenir les attaques XSS
   */
  static sanitize(content: string): string {
    return content.replace(/<[^>]*>/g, '');
  }

  /**
   * Validation du contenu. Un message sans texte est valide uniquement
   * s'il contient des pièces jointes ; sinon le texte est obligatoire.
   */
  private validateContent(content: string | null): void {
    if (this.hasAttachments && (!content || content.trim().length === 0)) {
      return;
    }
    if (!content || content.trim().length === 0) {
      throw new Error('Le contenu du message ne peut pas être vide');
    }
    if (content.length > 4000) {
      throw new Error('Le contenu du message ne peut pas dépasser 4000 caractères');
    }
  }

  /**
   * Met à jour le contenu du message
   */
  updateContent(newContent: string): void {
    this.validateContent(newContent);
    this.content = newContent;
    this.updatedAt = new Date();
  }

  /**
   * Supprime le message (soft delete)
   */
  softDelete(): void {
    this.deletedAt = new Date();
  }

  /**
   * Vérifie si le message est supprimé
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Vérifie si le message appartient à un membre spécifique
   */
  belongsTo(memberId: string): boolean {
    return this.memberId === memberId;
  }

  /**
   * Vérifie si le message a été édité
   */
  isEdited(): boolean {
    return this.updatedAt.getTime() !== this.createdAt.getTime();
  }

  /**
   * Convertit l'entité en objet simple
   * Inclut authorId (user.id) et author pour le frontend
   */
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      memberId: this.memberId,
      // authorId = user.id, avec fallback sur memberId si l'auteur n'est pas peuplé
      authorId: this.author?.id ?? this.memberId,
      channelId: this.channelId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      deliveredAt: this.deliveredAt,
      isEdited: this.isEdited(),
      isDeleted: this.isDeleted(),
      isDeletedForUser: !!this.deletedForUserId,
      deletedForUserId: this.deletedForUserId ?? null,
      attachments: this.attachments,
      reactions: this.reactions,
      ...(this.author && {
        author: {
          id: this.author.id,
          username: this.author.username,
          avatar: this.author.avatar || undefined,
        },
      }),
    };
  }
}
