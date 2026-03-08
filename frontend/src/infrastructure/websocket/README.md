# 🔌 Infrastructure - WebSocket

## Responsabilité
- Configuration Socket.IO
- Event listeners (réception)
- Event emitters (envoi)

## Fichiers
- `socket.ts` : Configuration Socket.IO + connexion
- `listeners.ts` : Event listeners
- `emitters.ts` : Event emitters

## Règles
-  Cleanup listeners pour éviter les fuites mémoire
-  Types depuis domain
-  Pas de logique métier ici
