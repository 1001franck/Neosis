/**
 * CONTROLLER - UPLOAD
 * Gère l'upload de fichiers (images, vidéos, documents)
 * 
 * POST /upload — Upload un ou plusieurs fichiers
 * Retourne les métadonnées des fichiers uploadés (id, url, name, size, mimeType)
 */

import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Logger } from '../../../shared/utils/logger.js';
import { uploadToSupabase } from '../../../infrastructure/storage/supabaseStorage.js';

const logger = new Logger('UploadController');

export class UploadController {
  constructor(private prisma: PrismaClient) {}

  /**
   * Upload un ou plusieurs fichiers et les attache à un message
   * POST /upload
   * Body (multipart/form-data):
   *   - files: File[] (max 5)
   *   - messageId: string
   *   - channelId: string
   */
  uploadFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId as string;
      const { messageId, channelId } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'Aucun fichier envoyé' });
        return;
      }

      if (!channelId) {
        res.status(400).json({ success: false, error: 'channelId requis' });
        return;
      }

      // Vérifier que l'utilisateur est membre du serveur via le channel
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          server: {
            include: {
              members: { where: { userId } },
            },
          },
        },
      });

      if (!channel || channel.server.members.length === 0) {
        res.status(403).json({ success: false, error: 'Accès refusé au channel' });
        return;
      }

      // Uploader vers Supabase et créer les attachments en base
      const attachments = await Promise.all(
        files.map(async (file) => {
          const url = await uploadToSupabase(file.buffer, file.originalname, file.mimetype, 'attachments');
          return this.prisma.attachment.create({
            data: {
              id: randomUUID(),
              url,
              name: file.originalname,
              size: file.size,
              mimeType: file.mimetype,
              messageId: messageId || null,
              uploadedBy: userId,
            },
          });
        })
      );

      logger.info(`${files.length} file(s) uploaded`, { userId, channelId });

      res.status(201).json({
        success: true,
        data: attachments,
      });
    } catch (error) {
      logger.error('Upload failed', error);
      next(error);
    }
  };

  /**
   * Obtenir les médias d'un channel (images, vidéos, fichiers, liens)
   * GET /channels/:channelId/media
   */
  getChannelMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId as string;
      const channelId = req.params.channelId as string;

      // Vérifier l'accès
      const channel = await this.prisma.channel.findUnique({
        where: { id: channelId },
        include: {
          server: {
            include: {
              members: { where: { userId } },
            },
          },
        },
      });

      if (!channel || channel.server.members.length === 0) {
        res.status(403).json({ success: false, error: 'Accès refusé' });
        return;
      }

      // Récupérer tous les attachments de ce channel
      const attachments = await this.prisma.attachment.findMany({
        where: {
          message: {
            channelId,
            deletedAt: null,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          message: {
            include: {
              member: {
                include: {
                  user: {
                    select: { id: true, username: true },
                  },
                },
              },
            },
          },
        },
      });

      // Séparer media (images/vidéos) et files (documents)
      const media = attachments
        .filter((a: any) => a.mimeType.startsWith('image/') || a.mimeType.startsWith('video/'))
        .map((a: any) => ({
          id: a.id,
          type: a.mimeType.startsWith('image/') ? 'image' : 'video',
          url: a.url,
          name: a.name,
          size: a.size,
          uploadedBy: a.message.member?.user?.username || 'Unknown',
          uploadedAt: a.createdAt,
        }));

      const files = attachments
        .filter((a: any) => !a.mimeType.startsWith('image/') && !a.mimeType.startsWith('video/'))
        .map((a: any) => ({
          id: a.id,
          type: 'file' as const,
          url: a.url,
          name: a.name,
          size: a.size,
          uploadedBy: a.message.member?.user?.username || 'Unknown',
          uploadedAt: a.createdAt,
        }));

      // Extraire les liens depuis le contenu des messages
      const messagesWithLinks = await this.prisma.message.findMany({
        where: {
          channelId,
          deletedAt: null,
          content: { contains: 'http' },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          member: {
            include: {
              user: {
                select: { id: true, username: true },
              },
            },
          },
        },
      });

      const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
      const links = messagesWithLinks.flatMap((msg) => {
        const urls = (msg.content ?? '').match(urlRegex) || [];
        return urls.map((url) => ({
          id: `${msg.id}-${url}`,
          url,
          title: url,
          postedBy: msg.member?.user?.username || 'Unknown',
          postedAt: msg.createdAt,
        }));
      });

      res.status(200).json({
        success: true,
        data: { media, files, links },
      });
    } catch (error) {
      logger.error('Failed to get channel media', error);
      next(error);
    }
  };
}
