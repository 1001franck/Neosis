# 🔧 Infrastructure

Couche d'infrastructure - Détails techniques et implantations concrètes.

## Sous-dossiers

- `database/` - ORM (Prisma), migrations, repositories
- `auth/` - Authentification, JWT, password hashing
- `websocket/` - Socket.IO, event handlers

## Principe de dépendance
- Implémente les interfaces définies en Domain
- Ne dépend pas de Application
- Détails techniques isolés ici

## Convention d'import
```typescript
//  CORRECT
import { IUserRepository } from '@domain/users/repositories';
import { User } from '@domain/users/entities';

// ❌ ÉVITER (Infrastructure ne dépend pas de Application)
import { RegisterUserUseCase } from '@application/auth';
```
