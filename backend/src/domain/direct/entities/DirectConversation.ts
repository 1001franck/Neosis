/**
 * Entité métier DirectConversation
 * Conversation privée entre deux utilisateurs.
 */
export class DirectConversation {
  lastMessage?: { content: string; senderId: string; createdAt: Date } | null;

  constructor(
    public readonly id: string,
    public readonly userOneId: string,
    public readonly userTwoId: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
