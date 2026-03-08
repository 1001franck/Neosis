# 📡 Presentation

Couche de présentation - Controllers et routes HTTP/WebSocket.

## Sous-dossiers

- `http/` - Controllers, routes, middlewares HTTP
- `websocket/` - WebSocket handlers, namespaces

## Responsabilités

1. **Controllers**: Traiter les requêtes, appeler les use cases, retourner des réponses
2. **Routes**: Mapper les endpoints aux controllers
3. **Middlewares**: Authentification, validation, error handling
4. **WebSocket**: Événements temps réel

## Convention d'import
```typescript
//  CORRECT
import { RegisterUserUseCase } from '@application/auth/usecases';
import { AuthMiddleware } from '@presentation/http/middlewares';

// ❌ ÉVITER (Presentation ne dépend pas d'Infrastructure)
import { PrismaUserRepository } from '@infrastructure/database';
```
