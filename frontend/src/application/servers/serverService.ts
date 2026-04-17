/**
 * APPLICATION - SERVERS SERVICE
 * Logique métier pour les serveurs
 */

import { serversApi } from '@infrastructure/api/servers.api';
import type { Server, ServerWithMembers, CreateServerRequest, UpdateServerRequest } from '@domain/servers/types';
import { ServerNotFoundError, ServerAccessDeniedError } from '@domain/servers/errors';
import { logger } from '@shared/utils/logger';

/**
 * Service pour les serveurs
 */
export class ServerService {
  async getServers(): Promise<Server[]> {
    try {
      logger.info('Fetching servers');
      return await serversApi.getServers();
    } catch (error) {
      logger.error('Failed to fetch servers', error);
      throw error;
    }
  }

  async getServer(serverId: string): Promise<ServerWithMembers> {
    try {
      logger.info('Fetching server', { serverId });
      return await serversApi.getServer(serverId);
    } catch (error) {
      logger.error('Failed to fetch server', error);
      throw new ServerNotFoundError();
    }
  }

  async createServer(request: CreateServerRequest): Promise<Server> {
    try {
      logger.info('Creating server', { name: request.name });
      return await serversApi.createServer(request);
    } catch (error) {
      logger.error('Failed to create server', error);
      throw error;
    }
  }

  async updateServer(serverId: string, request: UpdateServerRequest): Promise<Server> {
    try {
      logger.info('Updating server', { serverId });
      return await serversApi.updateServer(serverId, request);
    } catch (error) {
      logger.error('Failed to update server', error);
      throw new ServerAccessDeniedError();
    }
  }

  async deleteServer(serverId: string): Promise<void> {
    try {
      logger.info('Deleting server', { serverId });
      return await serversApi.deleteServer(serverId);
    } catch (error) {
      logger.error('Failed to delete server', error);
      throw new ServerAccessDeniedError();
    }
  }

  async joinServer(inviteCode: string): Promise<Server> {
    try {
      logger.info('Joining server', { inviteCode });
      return await serversApi.joinServer(inviteCode);
    } catch (error) {
      logger.error('Failed to join server', error);
      throw error;
    }
  }

  async leaveServer(serverId: string): Promise<void> {
    try {
      logger.info('Leaving server', { serverId });
      return await serversApi.leaveServer(serverId);
    } catch (error) {
      logger.error('Failed to leave server', error);
      throw error;
    }
  }
}

export const serverService = new ServerService();
