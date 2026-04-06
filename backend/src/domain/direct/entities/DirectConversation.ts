/**
 * Entité métier DirectConversation
 * Conversation privée entre deux utilisateurs.
 */
export class DirectConversation {
  constructor(
    public readonly id: string,
    public readonly userOneId: string,
    public readonly userTwoId: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
