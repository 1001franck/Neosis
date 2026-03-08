export class User {
  constructor(
    public id: string,
    public email: string,
    public username: string,
    public passwordHash: string,
    public avatarUrl: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public bio: string | null = null,
    public customStatus: string | null = null,
    public statusEmoji: string | null = null,
    public bannerUrl: string | null = null
  ) {}

  toPublic() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar: this.avatarUrl,
      bio: this.bio,
      customStatus: this.customStatus,
      statusEmoji: this.statusEmoji,
      banner: this.bannerUrl,
      createdAt: this.createdAt,
    };
  }
}