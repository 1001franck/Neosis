import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authRateLimit } from '../middlewares/rateLimit.middleware.js';
import { RegisterDTO, LoginDTO, UpdateProfileDTO } from '../../../application/auth/dtos/AuthDTO.js';
import { upload } from '../../../infrastructure/upload/multerConfig.js';

/**
 * Configure les routes pour l'authentification
 * - signup/login : publiques avec rate limit strict
 * - logout/me : protégées par authMiddleware (pas de rate limit strict)
 */
export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Routes publiques avec rate limit strict
  router.post('/signup', authRateLimit, validate(RegisterDTO), authController.signup.bind(authController));
  router.post('/login', authRateLimit, validate(LoginDTO), authController.login.bind(authController));

  // Logout sans authMiddleware — doit fonctionner même avec un token expiré
  router.post('/logout', authController.logout.bind(authController));
  router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));
  router.put('/me', authMiddleware, validate(UpdateProfileDTO), authController.updateProfile.bind(authController));
  router.post('/me/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar.bind(authController));
  router.post('/me/banner', authMiddleware, upload.single('banner'), authController.uploadBanner.bind(authController));

  return router;
}
