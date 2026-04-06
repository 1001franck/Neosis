import type { IUserRepository } from "./repositories/UserRepository.js";
import { User } from "./entities/User.js";

export class FakeUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) || null;
  }

  async findByUsername(username: string) {
    return this.users.find((u) => u.username === username) || null;
  }

  async create(user: User) {
    const newUser = new User(
      String(this.users.length + 1),
      user.email,
      user.username,
      user.passwordHash,
      user.avatarUrl,
      user.createdAt,
      user.updatedAt,
      user.bio,
      user.customStatus,
      user.statusEmoji,
      user.bannerUrl
    );
    this.users.push(newUser);
    return newUser;
  }

  async update(user: User) {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) this.users[index] = user;
    return user;
  }

  async delete(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
  }
}