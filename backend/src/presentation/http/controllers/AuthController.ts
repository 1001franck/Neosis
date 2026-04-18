import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { RegisterUserUseCase } from "../../../application/auth/usecases/RegisterUserUseCase.js";
import type { LoginUserUseCase } from "../../../application/auth/usecases/LoginUserUseCase.js";
import type { IUserRepository } from "../../../domain/users/repositories/UserRepository.js";
import { JWT_SECRET } from "../../../shared/config/env.js";
import { AppError, ErrorCode } from "../../../shared/errors/AppError.js";
import { uploadToSupabase, deleteFromSupabase } from "../../../infrastructure/storage/supabaseStorage.js";

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  constructor(
    private registerUseCase: RegisterUserUseCase,
    private loginUseCase: LoginUserUseCase,
    private userRepository: IUserRepository
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   * POST /auth/signup
   */
  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.registerUseCase.execute(req.body);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie('token', token, COOKIE_OPTIONS);
      // Token aussi dans le body pour les clients sans cookies (app desktop Tauri)
      res.status(201).json({ success: true, data: { user: user.toPublic(), token } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Connexion d'un utilisateur
   * POST /auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.loginUseCase.execute(req.body);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie('token', token, COOKIE_OPTIONS);
      // Token aussi dans le body pour les clients sans cookies (app desktop Tauri)
      res.status(200).json({ success: true, data: { user: user.toPublic(), token } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Déconnexion (JWT stateless - cookie clearing côté client)
   * POST /auth/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('token', { httpOnly: true, secure: isProduction, sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' });
    res.status(200).json({ success: true, message: "Déconnexion réussie" });
  };

  /**
   * Obtenir l'utilisateur actuel (requiert authMiddleware)
   * GET /auth/me
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!; // garanti par authMiddleware

      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new AppError(ErrorCode.USER_NOT_FOUND, "Utilisateur non trouvé", 404);
      }

      res.status(200).json({ success: true, data: { user: user.toPublic() } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update current user profile
   * PUT /auth/me
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { username, avatarUrl, bio, customStatus, statusEmoji } = req.body;

      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found", 404);
      }

      // Update fields if provided (validation already done by UpdateProfileDTO middleware)
      if (username !== undefined) {
        const existing = await this.userRepository.findByUsername(username.trim());
        if (existing && existing.id !== userId) {
          throw new AppError(ErrorCode.VALIDATION_ERROR, "Username is already taken", 409);
        }
        user.username = username.trim();
      }

      if (avatarUrl !== undefined) {
        user.avatarUrl = avatarUrl;
      }

      if (bio !== undefined) {
        user.bio = bio;
      }

      if (customStatus !== undefined) {
        user.customStatus = customStatus;
      }

      if (statusEmoji !== undefined) {
        user.statusEmoji = statusEmoji;
      }

      const updatedUser = await this.userRepository.update(user);

      res.status(200).json({ success: true, data: { user: updatedUser.toPublic() } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload avatar image
   * POST /auth/me/avatar
   * Body: multipart/form-data with field "avatar" (single file)
   */
  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const file = req.file as Express.Multer.File | undefined;

      if (!file) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "Aucun fichier envoyé", 400);
      }

      // Vérifier que c'est une image
      if (!file.mimetype.startsWith('image/')) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "Le fichier doit être une image", 400);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found", 404);
      }

      // Supprimer l'ancien avatar de Supabase s'il existe
      if (user.avatarUrl) {
        await deleteFromSupabase(user.avatarUrl).catch((e) => console.warn('Échec suppression ancien avatar:', e));
      }

      user.avatarUrl = await uploadToSupabase(file.buffer, file.originalname, file.mimetype, 'avatars');

      const updatedUser = await this.userRepository.update(user);

      res.status(200).json({ success: true, data: { user: updatedUser.toPublic() } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload banner image
   * POST /auth/me/banner
   * Body: multipart/form-data with field "banner" (single file)
   */
  uploadBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const file = req.file as Express.Multer.File | undefined;

      if (!file) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "Aucun fichier envoyé", 400);
      }

      if (!file.mimetype.startsWith('image/')) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "Le fichier doit être une image", 400);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found", 404);
      }

      // Supprimer l'ancienne bannière de Supabase si elle existe
      if (user.bannerUrl) {
        await deleteFromSupabase(user.bannerUrl).catch((e) => console.warn('Échec suppression ancienne bannière:', e));
      }

      user.bannerUrl = await uploadToSupabase(file.buffer, file.originalname, file.mimetype, 'banners');

      const updatedUser = await this.userRepository.update(user);

      res.status(200).json({ success: true, data: { user: updatedUser.toPublic() } });
    } catch (error) {
      next(error);
    }
  };
}