import type { Channel } from '../entities/channel.js';

/**
 * Interface du repository Channel
 * Définit les opérations de persistance pour les channels
 */
export interface ChannelRepository {
  create(channel: Channel): Promise<Channel>;
  findById(id: string): Promise<Channel | null>;
  findByServerId(serverId: string): Promise<Channel[]>;
  update(id: string, data: Partial<Channel>): Promise<Channel>;
  delete(id: string): Promise<void>;
  existsInServer(serverId: string, channelName: string): Promise<boolean>;
  countMessages(channelId: string): Promise<number>;
}
