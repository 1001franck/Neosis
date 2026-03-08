export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

/**
 * Entité métier Friendship
 * Représente une relation d'amitié (ou demande) entre deux utilisateurs.
 */
export class Friendship {
  constructor(
    public readonly id: string,
    public readonly userOneId: string,
    public readonly userTwoId: string,
    public readonly requesterId: string,
    public status: FriendshipStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  isAccepted(): boolean {
    return this.status === 'ACCEPTED';
  }
}
