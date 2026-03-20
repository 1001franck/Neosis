/**
 * Informations de l'auteur attachées au message
 */
export interface MessageAuthor {
  id: string;
  username: string;
  avatar?: string | null;
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

  /** Message supprimé uniquement pour un user (Delete for me) */
  public deletedForUserId?: string | null;

  constructor(
    public readonly id: string,
    public content: string,
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
   * Échappe les caractères HTML pour prévenir les attaques XSS
   * On échappe au lieu de supprimer pour préserver le contenu (ex: "1 < 2", "List<String>")
   */
  static sanitize(content: string): string {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Validation du contenu du message
   */
  private validateContent(content: string): void {
    // Allow empty content when message has attachments
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
      // authorId = user.id (pas memberId) pour que le frontend puisse identifier l'auteur
      authorId: this.author?.id ?? null,
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
