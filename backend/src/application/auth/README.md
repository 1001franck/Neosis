# 🔐 Application - Auth

## Responsabilité
- Use Cases: RegisterUser, LoginUser
- DTOs: Requêtes et réponses typées
- Orchestration de la logique métier

## Fichiers
- `usecases/RegisterUserUseCase.ts`
- `usecases/LoginUserUseCase.ts`
- `dtos/RegisterUserRequest.ts`
- `dtos/LoginUserRequest.ts`
- `dtos/UserResponse.ts`

## Structure
```
usecases/      ← Use Cases (1 fichier par use case)
dtos/          ← DTOs (Zod schemas + types)
```
