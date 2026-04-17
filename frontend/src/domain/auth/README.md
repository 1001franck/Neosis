# 🔐 Domain - Auth

## Responsabilité
- Types métier pour l'authentification
- Erreurs spécifiques au domaine auth

## Fichiers
- `types.ts` : AuthUser, LoginRequest, RegisterRequest, AuthResponse, AuthState
- `errors.ts` : AuthError, InvalidCredentialsError, UserAlreadyExistsError, TokenExpiredError

## Règles
-  Aucune dépendance externe
-  Types purs TypeScript
-  Erreurs héritent d'AppError
