# 📋 Application

Couche applicative - Use cases et orchestration métier.

## Sous-dossiers

- `auth/` - Authentification (register, login, logout)
- `servers/` - Gestion des serveurs
- `channels/` - Gestion des canaux
- `messages/` - Gestion des messages
- `members/` - Gestion des membres
- `shared/` - Use cases partagés

## Structure par feature
```
auth/
  ├── usecases/
  │   ├── RegisterUserUseCase.ts
  │   ├── LoginUserUseCase.ts
  │   └── LogoutUserUseCase.ts
  └── dtos/
      ├── RegisterUserRequest.ts
      ├── LoginUserRequest.ts
      └── UserResponse.ts
```

## Convention d'import
```typescript
//  CORRECT
import { IUserRepository } from '@domain/users/repositories';
import { User } from '@domain/users/entities';
import { ValidationError } from '@shared/errors';

// ❌ ÉVITER (Application ne dépend pas de Presentation)
import { AuthController } from '@presentation/http/controllers';
```
