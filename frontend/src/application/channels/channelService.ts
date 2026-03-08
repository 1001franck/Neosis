/**
 * APPLICATION - CHANNELS SERVICE
 * Logique métier pour les canaux
 */

import { channelsApi } from '@infrastructure/api/channels.api';
import type { Channel, CreateChannelRequest, UpdateChannelRequest } from '@domain/channels/types';
import { ChannelNotFoundError, ChannelAccessDeniedError } from '@domain/channels/errors';
import { logger } from '@shared/utils/logger';

export class ChannelService {
  async getChannels(serverId: string): Promise<Channel[]> {
    try {
      logger.info('Fetching channels', { serverId });
      return await channelsApi.getChannels(serverId);
    } catch (error) {
      logger.error('Failed to fetch channels', error);
      throw error;
    }
  }

  async getChannel(channelId: string): Promise<Channel> {
    try {
      return await channelsApi.getChannel(channelId);
    } catch (error) {
      logger.error('Failed to fetch channel', error);
      throw new ChannelNotFoundError();
    }
  }

  async createChannel(serverId: string, request: CreateChannelRequest): Promise<Channel> {
    try {
      logger.info('Creating channel', { serverId, name: request.name });
      return await channelsApi.createChannel(serverId, request);
    } catch (error) {
      logger.error('Failed to create channel', error);
      throw error;
    }
  }

  async updateChannel(channelId: string, request: UpdateChannelRequest): Promise<Channel> {
    try {
      logger.info('Updating channel', { channelId });
      return await channelsApi.updateChannel(channelId, request);
    } catch (error) {
      logger.error('Failed to update channel', error);
      throw new ChannelAccessDeniedError();
    }
  }

  async deleteChannel(channelId: string): Promise<void> {
    try {
      logger.info('Deleting channel', { channelId });
      return await channelsApi.deleteChannel(channelId);
    } catch (error) {
      logger.error('Failed to delete channel', error);
      throw new ChannelAccessDeniedError();
    }
  }
}

export const channelService = new ChannelService();
