# Socket.IO - Specification des evenements

## Connexion

| Parametre   | Valeur |
| --- | --- |
| Transport | WebSocket (Socket.IO v4) |
| Auth | Cookie `token` (JWT httpOnly) |
| CORS origin | `FRONTEND_URL` (defaut `http://localhost:3000`) |
| Credentials | `true` |

Apres connexion, le middleware verifie le JWT et attache `socket.data.userId` et `socket.data.username`.

---

## Evenements Client -> Serveur

### Serveurs (rooms)

| Evenement | Payload | Description |
| --- | --- | --- |
| `server:join` | `serverId: string` | Rejoindre la room du serveur |
| `server:leave` | `serverId: string` | Quitter la room du serveur |

### Channels (rooms)

| Evenement | Payload | Description |
| --- | --- | --- |
| `channel:join` | `channelId: string` | Rejoindre la room du channel (quitte l'ancien automatiquement) |
| `channel:leave` | `channelId: string` | Quitter la room du channel |

### Messages

| Evenement | Payload | Description |
| --- | --- | --- |
| `message:send` | `{ content: string, channelId: string, attachmentIds?: string[], clientTempId?: string }` | Envoyer un message |
| `message:update` | `{ messageId: string, content: string, channelId: string }` | Modifier un message |
| `message:delete` | `{ messageId: string, channelId: string, scope?: 'me' | 'everyone' }` | Supprimer un message |

### Typing (frappe)

| Evenement | Payload | Description |
| --- | --- | --- |
| `typing:start` | `channelId: string` | L'utilisateur commence a taper |
| `typing:stop` | `channelId: string` | L'utilisateur arrete de taper |

### Read receipts

| Evenement | Payload | Description |
| --- | --- | --- |
| `message:read` | `{ channelId: string, messageId: string }` | Marquer les messages comme lus jusqu'a `messageId` |

### Voice

| Evenement | Payload | Description |
| --- | --- | --- |
| `voice:join` | `{ channelId: string }` | Rejoindre un voice channel |
| `voice:leave` | `{}` | Quitter le voice channel courant |
| `voice:state` | `{ isMuted: boolean, isDeafened: boolean }` | Mettre a jour l'etat vocal |
| `voice:webrtc_signal` | `{ targetUserId: string, signal: any }` | Relayer un signal WebRTC |

---

## Evenements Serveur -> Client

### Serveurs

| Evenement | Payload | Scope |
| --- | --- | --- |
| `server:online_users` | `{ serverId: string, userIds: string[] }` | Room `server:{serverId}` |

### Channels

| Evenement | Payload | Scope |
| --- | --- | --- |
| `channel:user_joined` | `{ userId: string, channelId: string }` | Room `channel:{channelId}` |
| `channel:user_left` | `{ userId: string, channelId: string }` | Room `channel:{channelId}` |

### Messages

| Evenement | Payload | Scope |
| --- | --- | --- |
| `message:new` | `Message` (objet complet avec auteur) + `clientTempId` | Room `channel:{channelId}` |
| `message:updated` | `Message` (objet complet mis a jour) | Room `channel:{channelId}` |
| `message:deleted` | `{ messageId: string, deletedBy: string, deletedByUserId: string, deletedByRole?: 'OWNER' | 'ADMIN' | 'MEMBER', scope?: 'me' | 'everyone' }` | Room `channel:{channelId}` |
| `message:error` | `{ message: string }` | Socket emetteur seulement |
| `message:read` | `{ userId: string, channelId: string, messageId: string, readAt: string }` | Room `channel:{channelId}` |

### Typing (frappe)

| Evenement | Payload | Scope |
| --- | --- | --- |
| `typing:user_started` | `{ userId: string, username?: string, channelId: string }` | Room `channel:{channelId}` |
| `typing:user_stopped` | `{ userId: string, channelId: string }` | Room `channel:{channelId}` |

### Voice

| Evenement | Payload | Scope |
| --- | --- | --- |
| `voice:user_joined` | `{ userId: string, username: string, channelId: string, isMuted: boolean, isDeafened: boolean }` | Room `voice:{channelId}` |
| `voice:user_left` | `{ userId: string, channelId: string }` | Room `voice:{channelId}` |
| `voice:user_state_changed` | `{ userId: string, isMuted: boolean, isDeafened: boolean }` | Room `voice:{channelId}` |
| `voice:channel_users` | `{ channelId: string, users: VoiceUser[] }` | Socket emetteur seulement |
| `voice:webrtc_signal` | `{ fromUserId: string, fromUsername: string, signal: any }` | Socket destinataire seulement |
| `voice:error` | `{ message: string }` | Socket emetteur seulement |

---

## Rooms Socket.IO

| Pattern | Utilisation |
| --- | --- |
| `server:{serverId}` | Tous les membres connectes au serveur (presence) |
| `channel:{channelId}` | Tous les utilisateurs actifs sur le channel (messages, typing) |
| `voice:{channelId}` | Tous les utilisateurs connectes au voice channel |

---

## Flux typiques

### 1. Connexion initiale
```
Client -> connect (cookie token)
Server -> middleware verifie JWT -> socket.data.userId
Client -> server:join(serverId)
Client -> channel:join(channelId)
```

### 2. Envoi de message
```
Client -> message:send({ content, channelId, attachmentIds?, clientTempId? })
Server -> CreateMessageUseCase.execute(...)
Server -> io.to(channel:{channelId}).emit('message:new', message)
```

### 3. Modification de message
```
Client -> message:update({ messageId, content, channelId })
Server -> UpdateMessageUseCase.execute(...)
Server -> io.to(channel:{channelId}).emit('message:updated', message)
```

### 4. Suppression de message
```
Client -> message:delete({ messageId, channelId, scope })
Server -> DeleteMessageUseCase.execute(...)
Server -> io.to(channel:{channelId}).emit('message:deleted', payload)
```

### 5. Indicateur de frappe
```
Client -> typing:start(channelId)
Server -> socket.to(channel:{channelId}).emit('typing:user_started', { userId, channelId })
Client -> typing:stop(channelId)
Server -> socket.to(channel:{channelId}).emit('typing:user_stopped', { userId, channelId })
```

### 6. Voice join
```
Client -> voice:join({ channelId })
Server -> joinVoiceChannelUseCase.execute(...)
Server -> io.to(voice:{channelId}).emit('voice:user_joined', ...)
Server -> socket.emit('voice:channel_users', { channelId, users })
```

### 7. Voice leave
```
Client -> voice:leave({})
Server -> leaveVoiceChannelUseCase.execute(...)
Server -> io.to(voice:{channelId}).emit('voice:user_left', ...)
```

---

## Fichiers sources

| Fichier | Role |
| --- | --- |
| `backend/src/presentation/websocket/socketHandler.ts` | Gestionnaire principal backend |
| `backend/src/presentation/websocket/handlers/voiceHandler.ts` | Handler voice |
| `frontend/src/infrastructure/websocket/socket.ts` | Instance Socket.IO client |
| `frontend/src/infrastructure/websocket/emitters.ts` | Emetteurs client -> serveur |
| `frontend/src/infrastructure/websocket/listeners.ts` | Ecouteurs serveur -> client |
