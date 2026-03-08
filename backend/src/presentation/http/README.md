# 📡 Presentation - HTTP

## Responsabilité
- Controllers (Request handling)
- Routes (Endpoint definitions)
- Middlewares (Validation, Auth, CORS)

## Structure
```
controllers/   ← Controllers (1 fichier par feature)
routes/        ← Routes (1 fichier par feature)
middlewares/   ← Middlewares partagés
```

## Fichiers
- `controllers/AuthController.ts`
- `controllers/ServerController.ts`
- `controllers/ChannelController.ts`
- `controllers/MessageController.ts`
- `controllers/MemberController.ts`
- `routes/authRoutes.ts`
- `routes/serverRoutes.ts`
- `routes/channelRoutes.ts`
- `routes/messageRoutes.ts`
- `routes/memberRoutes.ts`
- `middlewares/errorHandler.ts`
- `middlewares/validationMiddleware.ts`
- `middlewares/authMiddleware.ts`
