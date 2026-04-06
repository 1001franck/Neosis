/**
 * =====================================================
 * TEMPLATE: Prisma Repository Implementation
 * =====================================================
 * 
 * Copie ce fichier et remplace XXX par ton concept
 * 
 * Règles:
 *  Implémente l'interface du domain
 *  Utilise Prisma pour les opérations BD
 *  Mappe les records Prisma → Entities du domain
 *  Gère les erreurs Prisma
 */

import { PrismaClient } from '@prisma/client';
import { XXX } from '@domain/xxx/entities/XXX';
import { IXXXRepository } from '@domain/xxx/repositories/IXXXRepository';
import { Logger } from '@shared/utils/logger';

/**
 * Implémentation Prisma du Repository XXX
 * 
 * Responsabilité: Accéder à la base de données
 * - Implémente IXXXRepository du domain
 * - Utilise Prisma pour les opérations
 * - Mappe Prisma records → Domain entities
 */
export class PrismaXXXRepository implements IXXXRepository {
  private logger = new Logger('PrismaXXXRepository');

  constructor(private prisma: PrismaClient) {}

  /**
   * Trouve un XXX par ID
   */
  async findById(id: string): Promise<XXX | null> {
    try {
      const record = await this.prisma.xxx.findUnique({
        where: { id },
      });

      if (!record) {
        this.logger.debug('XXX not found', { id });
        return null;
      }

      return this.mapToDomain(record);
    } catch (error) {
      this.logger.error('Error finding XXX', { id, error });
      throw error;
    }
  }

  /**
   * Crée un nouveau XXX
   */
  async create(entity: XXX): Promise<XXX> {
    try {
      const record = await this.prisma.xxx.create({
        data: {
          id: entity.id,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
          // ... autres fields
        },
      });

      this.logger.info('XXX created', { id: record.id });
      return this.mapToDomain(record);
    } catch (error) {
      this.logger.error('Error creating XXX', { entity, error });
      throw error;
    }
  }

  /**
   * Met à jour un XXX
   */
  async update(entity: XXX): Promise<XXX> {
    try {
      const record = await this.prisma.xxx.update({
        where: { id: entity.id },
        data: {
          updatedAt: entity.updatedAt,
          // ... autres fields à mettre à jour
        },
      });

      this.logger.info('XXX updated', { id: record.id });
      return this.mapToDomain(record);
    } catch (error) {
      this.logger.error('Error updating XXX', { id: entity.id, error });
      throw error;
    }
  }

  /**
   * Supprime un XXX
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.xxx.delete({
        where: { id },
      });

      this.logger.info('XXX deleted', { id });
    } catch (error) {
      this.logger.error('Error deleting XXX', { id, error });
      throw error;
    }
  }

  /**
   * Trouve tous les XXX avec pagination
   */
  async findAll(
    page: number,
    limit: number,
  ): Promise<{ items: XXX[]; total: number; hasMore: boolean }> {
    try {
      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        this.prisma.xxx.findMany({
          skip,
          take: limit,
        }),
        this.prisma.xxx.count(),
      ]);

      return {
        items: records.map((r) => this.mapToDomain(r)),
        total,
        hasMore: skip + limit < total,
      };
    } catch (error) {
      this.logger.error('Error finding all XXX', { page, limit, error });
      throw error;
    }
  }

  /**
   * Mappe un record Prisma vers une Entity du domain
   * 
   * Important: C'est ici qu'on convertit BD → Domain
   */
  private mapToDomain(record: Prisma.XXXGetPayload<any>): XXX {
    return new XXX(
      record.id,
      record.createdAt,
      record.updatedAt,
      // ... autres propriétés
    );
  }
}
