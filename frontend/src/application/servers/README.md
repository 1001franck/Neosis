# 🏠 Application - Servers

## Responsabilité
- Orchestrer la logique métier des serveurs
- Gérer l'état global avec Zustand
- Combiner Service + Store + Hooks

## Fichiers
- `serverService.ts` : Service métier
- `serverStore.ts` : Zustand store + sélecteurs intégrés
- `useServersHook.ts` : Hook personnalisé (accès simple au store)

## Règles
-  Service = logique pure
-  Store = état global
-  Hook = interface unique pour composants
-  Accès au store via hook (pas de selectors séparés)
