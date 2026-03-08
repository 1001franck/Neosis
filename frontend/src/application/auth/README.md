# 🔐 Application - Auth

## Responsabilité
- Orchestrer la logique métier d'authentification
- Gérer l'état global avec Zustand
- Combiner Service + Store + Hooks

## Fichiers
- `authService.ts` : Service métier (login, register, logout)
- `authStore.ts` : Zustand store + sélecteurs intégrés
- `useAuthHook.ts` : Hook personnalisé (accès simple au store)

## Règles
-  Service = logique pure
-  Store = état global
-  Hook = interface unique pour composants
-  Accès au store via hook (pas de selectors séparés)
