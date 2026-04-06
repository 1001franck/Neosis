# 🔌 Infrastructure - API

## Responsabilité
- Appels API pour chaque feature
- Transformation requête/réponse
- Gestion centralisée des erreurs HTTP

## Fichiers
- `client.ts` : Configuration axios (interceptors, auth)
- `auth.api.ts` : Endpoints authentification
- `servers.api.ts` : Endpoints serveurs
- `channels.api.ts` : Endpoints canaux
- `messages.api.ts` : Endpoints messages
- `members.api.ts` : Endpoints membres

## Règles
-  Utiliser apiClient (jamais fetch direct)
-  Types depuis domain
-  Pas de logique métier
-  Documenter endpoints JSDoc
