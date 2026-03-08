import re

# 1. Update User.ts entity - add bannerUrl
with open("src/domain/users/entities/User.ts", "r") as f:
    content = f.read()

content = content.replace(
    "public statusEmoji: string | null = null\n  ) {}",
    "public statusEmoji: string | null = null,\n    public bannerUrl: string | null = null\n  ) {}"
)

content = content.replace(
    "statusEmoji: this.statusEmoji,\n      createdAt: this.createdAt,",
    "statusEmoji: this.statusEmoji,\n      banner: this.bannerUrl,\n      createdAt: this.createdAt,"
)

with open("src/domain/users/entities/User.ts", "w") as f:
    f.write(content)
print("1. User.ts updated")

# 2. Update PrismaUserRepository.ts - add bannerUrl in create, update, toDomain
with open("src/infrastructure/database/repositories/PrismaUserRepository.ts", "r") as f:
    content = f.read()

# create data
content = content.replace(
    "statusEmoji: user.statusEmoji,\n      },",
    "statusEmoji: user.statusEmoji,\n        bannerUrl: user.bannerUrl,\n      },"
)

# update data
content = content.replace(
    "statusEmoji: user.statusEmoji,\n        updatedAt: new Date(),",
    "statusEmoji: user.statusEmoji,\n        bannerUrl: user.bannerUrl,\n        updatedAt: new Date(),"
)

# toDomain type signature
content = content.replace(
    "statusEmoji: string | null;\n    createdAt: Date;",
    "statusEmoji: string | null;\n    bannerUrl: string | null;\n    createdAt: Date;"
)

# toDomain constructor call
content = content.replace(
    "raw.customStatus,\n      raw.statusEmoji\n    );",
    "raw.customStatus,\n      raw.statusEmoji,\n      raw.bannerUrl\n    );"
)

with open("src/infrastructure/database/repositories/PrismaUserRepository.ts", "w") as f:
    f.write(content)
print("2. PrismaUserRepository.ts updated")

# 3. Update FakeUserRepository.ts - add bannerUrl in create
with open("src/domain/users/FakeUserRepository.ts", "r") as f:
    content = f.read()

content = content.replace(
    "user.customStatus,\n      user.statusEmoji\n    );",
    "user.customStatus,\n      user.statusEmoji,\n      user.bannerUrl\n    );"
)

with open("src/domain/users/FakeUserRepository.ts", "w") as f:
    f.write(content)
print("3. FakeUserRepository.ts updated")

# 4. Update RegisterUserUseCase.ts - add null for bannerUrl
with open("src/application/auth/usecases/RegisterUserUseCase.ts", "r") as f:
    content = f.read()

content = content.replace(
    "      null,\n      null,\n      null\n    );",
    "      null,\n      null,\n      null,\n      null\n    );"
)

with open("src/application/auth/usecases/RegisterUserUseCase.ts", "w") as f:
    f.write(content)
print("4. RegisterUserUseCase.ts updated")

# 5. Update AuthController.ts - add uploadBanner method
with open("src/presentation/http/controllers/AuthController.ts", "r") as f:
    content = f.read()

upload_banner_method = '''
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

      // Vérifier que c'est une image
      if (!file.mimetype.startsWith('image/')) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "Le fichier doit être une image", 400);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found", 404);
      }

      // Supprimer l'ancienne bannière du disque si elle existe
      if (user.bannerUrl) {
        const oldFilename = user.bannerUrl.split('/uploads/').pop();
        if (oldFilename) {
          const oldPath = path.join(UPLOAD_DIR, oldFilename);
          fs.unlink(oldPath, () => {}); // fire-and-forget
        }
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      user.bannerUrl = `${baseUrl}/uploads/${file.filename}`;

      const updatedUser = await this.userRepository.update(user);

      res.status(200).json({ success: true, data: { user: updatedUser.toPublic() } });
    } catch (error) {
      next(error);
    }
  };
}'''

# Replace the closing brace of the class
content = content.rstrip()
if content.endswith("}"):
    # Remove the last closing brace of the class and the closing of uploadAvatar
    # Find the last "}" which is the class closing
    last_brace = content.rfind("}")
    second_last = content.rfind("}", 0, last_brace)
    # The pattern should be: "  };\n}" — end of uploadAvatar + class close
    # Let's replace from after uploadAvatar's closing
    content = content[:last_brace] + upload_banner_method

with open("src/presentation/http/controllers/AuthController.ts", "w") as f:
    f.write(content)
print("5. AuthController.ts updated")

# 6. Update authRoute.ts - add POST /me/banner
with open("src/presentation/http/routes/authRoute.ts", "r") as f:
    content = f.read()

content = content.replace(
    "router.post('/me/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar.bind(authController));",
    "router.post('/me/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar.bind(authController));\n  router.post('/me/banner', authMiddleware, upload.single('banner'), authController.uploadBanner.bind(authController));"
)

with open("src/presentation/http/routes/authRoute.ts", "w") as f:
    f.write(content)
print("6. authRoute.ts updated")

print("\nAll backend files patched successfully!")
