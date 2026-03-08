# 🎯 Domain

Couche domaine - Logique métier pure et abstractions.

## Sous-dossiers

- `users/` - Entité User, repository interface
- `servers/` - Entité Server, repository interface
- `channels/` - Entité Channel, repository interface
- `messages/` - Entité Message, repository interface
- `members/` - Entité Member, repository interface
- `shared/` - Types partagés, value objects

## Structure par entité
```
users/
  ├── entities/
  │   └── User.ts
  ├── repositories/
  │   └── UserRepository.ts (INTERFACE)
  └── errors/
      └── UserErrors.ts
```

## Principes

1. **Pas de dépendances externes** - Seulement de la logique métier
2. **Interfaces pour la persistence** - Les repositories sont des interfaces
3. **Value objects** - Types immuables pour les domaines critiques
4. **Erreurs métier** - Exceptions domaine-spécifiques

## Convention d'import
```typescript
//  CORRECT
export class User {}
export interface IUserRepository {}

// ❌ ÉVITER (Domain ne dépend de rien)
import { PrismaClient } from '@prisma/client';
import { RegisterUserUseCase } from '@application/auth';
```
