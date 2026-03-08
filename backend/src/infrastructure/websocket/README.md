# 🔌 Infrastructure - WebSocket

## Responsabilité
- Event handlers pour WebSocket events
- Real-time message delivery
- Room management (servers, channels)

## Structure
```
handlers/    ← Event handlers (1 fichier par feature)
```

## Fichiers
- `handlers/ServerSocketHandlers.ts`
- `handlers/ChannelSocketHandlers.ts`
- `handlers/MessageSocketHandlers.ts`
- `socket.ts` ← Socket.IO initialization
