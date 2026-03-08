# Spécification Socket.IO - Real Time Chat Application

## Vue d'ensemble

Cette application utilise Socket.IO pour la communication en temps réel entre le client et le serveur. Tous les événements temps réel (messages, notifications de frappe, statuts utilisateurs) passent par WebSocket.

## Connexion

### Client → Serveur

**Événement:** `connection`

**Authentification:**
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'JWT_TOKEN',
    userId: 'user_id',
    memberId: 'member_id',
    serverId: 'server_id'
  }
});
```

**Données requises:**
- `token`: Token JWT pour l'authentification
- `userId`: ID de l'utilisateur
- `memberId`: ID du membre dans le serveur
- `serverId`: ID du serveur auquel se connecter

---

## Channels

### Rejoindre un channel

**Événement:** `channel:join`

**Client → Serveur:**
```javascript
socket.emit('channel:join', channelId);
```

**Serveur → Client (broadcast):**
```javascript
socket.on('channel:user_joined', (data) => {
  // data: { userId: string, channelId: string }
});
```

### Quitter un channel

**Événement:** `channel:leave`

**Client → Serveur:**
```javascript
socket.emit('channel:leave', channelId);
```

**Serveur → Client (broadcast):**
```javascript
socket.on('channel:user_left', (data) => {
  // data: { userId: string, channelId: string }
});
```

---

## Messages

### Envoyer un message

**Événement:** `message:send`

**Client → Serveur:**
```javascript
socket.emit('message:send', {
  content: 'Message content',
  channelId: 'channel_id'
});
```

**Serveur → Client (broadcast à tout le channel):**
```javascript
socket.on('message:new', (message) => {
  // message: {
  //   id: string,
  //   content: string,
  //   memberId: string,
  //   channelId: string,
  //   createdAt: Date,
  //   updatedAt: Date,
  //   member: {
  //     id: string,
  //     role: string,
  //     user: {
  //       id: string,
  //       username: string,
  //       avatarUrl: string | null
  //     }
  //   }
  // }
});
```

### Modifier un message

**Événement:** `message:update`

**Client → Serveur:**
```javascript
socket.emit('message:update', {
  messageId: 'message_id',
  content: 'Updated content',
  channelId: 'channel_id'
});
```

**Serveur → Client (broadcast):**
```javascript
socket.on('message:updated', (message) => {
  // message: Message object (même structure que message:new)
});
```

### Supprimer un message

**Événement:** `message:delete`

**Client → Serveur:**
```javascript
socket.emit('message:delete', {
  messageId: 'message_id',
  channelId: 'channel_id'
});
```

**Serveur → Client (broadcast):**
```javascript
socket.on('message:deleted', (data) => {
  // data: { messageId: string }
});
```

### Gestion des erreurs

**Serveur → Client:**
```javascript
socket.on('message:error', (error) => {
  // error: { message: string }
});
```

---

## Indicateurs de frappe (Typing)

### Début de frappe

**Événement:** `typing:start`

**Client → Serveur:**
```javascript
socket.emit('typing:start', channelId);
```

**Serveur → Client (broadcast):**
```javascript
socket.on('typing:user_started', (data) => {
  // data: { userId: string, channelId: string }
});
```

**Recommandation:** Utilisez un debounce pour limiter la fréquence d'émission (ex: 1 événement toutes les 2 secondes maximum).

### Fin de frappe

**Événement:** `typing:stop`

**Client → Serveur:**
```javascript
socket.emit('typing:stop', channelId);
```

**Serveur → Client (broadcast):**
```javascript
socket.on('typing:user_stopped', (data) => {
  // data: { userId: string, channelId: string }
});
```

**Recommandation:** Émettez cet événement après 3 secondes d'inactivité de frappe ou lors de l'envoi du message.

---

## Utilisateurs en ligne

### Liste des utilisateurs en ligne

**Serveur → Client (automatique):**
```javascript
socket.on('server:online_users', (data) => {
  // data: {
  //   serverId: string,
  //   userIds: string[]
  // }
});
```

**Émis automatiquement:**
- À la connexion d'un utilisateur
- À la déconnexion d'un utilisateur

---

## Déconnexion

**Événement:** `disconnect`

**Client → Serveur:**
```javascript
socket.disconnect();
```

Événement automatique lors de la fermeture de la connexion ou de la page.

---

## Rooms et Namespaces

### Structure des rooms

Les sockets rejoignent automatiquement les rooms suivantes:

1. **Room serveur:** `server:${serverId}`
   - Tous les membres du serveur
   - Utilisé pour: liste des utilisateurs en ligne, notifications serveur

2. **Room channel:** `channel:${channelId}`
   - Tous les membres actuellement dans le channel
   - Utilisé pour: messages, indicateurs de frappe

### Exemple de gestion des rooms côté client

```javascript
// Rejoindre un channel
socket.emit('channel:join', 'channel_id_1');

// Changer de channel
socket.emit('channel:leave', 'channel_id_1');
socket.emit('channel:join', 'channel_id_2');
```

---

## Gestion des erreurs et reconnexion

### Reconnexion automatique

Socket.IO gère automatiquement la reconnexion en cas de perte de connexion.

```javascript
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  // Rejoindre le dernier channel actif
  socket.emit('channel:join', lastChannelId);
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});
```

### Gestion des erreurs d'authentification

```javascript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication error') {
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  }
});
```

---

## Bonnes pratiques

### 1. Optimisation de la bande passante

- Utilisez `socket.compress(true)` pour compresser les messages volumineux
- Limitez la taille des messages (max 4000 caractères dans notre cas)
- Utilisez le debouncing pour les événements fréquents (typing)

### 2. Gestion d'état côté client

- Gardez une trace du channel actuel
- Synchronisez l'état local avec les événements reçus
- Utilisez un système de cache pour éviter de redemander les messages

### 3. Sécurité

- Validez toujours le token JWT à chaque connexion
- Vérifiez les permissions côté serveur pour chaque action
- N'exposez pas d'informations sensibles dans les événements

### 4. Performance

- Utilisez des rooms pour limiter la portée des broadcasts
- Nettoyez les listeners lors du changement de channel
- Implémentez une pagination pour l'historique des messages

---

## Exemple d'implémentation complète côté client

```typescript
import { io, Socket } from 'socket.io-client';

class ChatSocket {
  private socket: Socket;
  private currentChannelId: string | null = null;

  constructor(token: string, userId: string, memberId: string, serverId: string) {
    this.socket = io('http://localhost:3001', {
      auth: { token, userId, memberId, serverId }
    });

    this.setupListeners();
  }

  private setupListeners() {
    // Messages
    this.socket.on('message:new', (message) => {
      console.log('New message:', message);
      // Mettre à jour l'UI
    });

    this.socket.on('message:updated', (message) => {
      console.log('Message updated:', message);
      // Mettre à jour l'UI
    });

    this.socket.on('message:deleted', (data) => {
      console.log('Message deleted:', data.messageId);
      // Mettre à jour l'UI
    });

    // Typing indicators
    this.socket.on('typing:user_started', (data) => {
      console.log(`User ${data.userId} started typing`);
      // Afficher l'indicateur
    });

    this.socket.on('typing:user_stopped', (data) => {
      console.log(`User ${data.userId} stopped typing`);
      // Masquer l'indicateur
    });

    // Online users
    this.socket.on('server:online_users', (data) => {
      console.log('Online users:', data.userIds);
      // Mettre à jour la liste des utilisateurs
    });
  }

  joinChannel(channelId: string) {
    if (this.currentChannelId) {
      this.socket.emit('channel:leave', this.currentChannelId);
    }
    this.socket.emit('channel:join', channelId);
    this.currentChannelId = channelId;
  }

  sendMessage(content: string, channelId: string) {
    this.socket.emit('message:send', { content, channelId });
  }

  updateMessage(messageId: string, content: string, channelId: string) {
    this.socket.emit('message:update', { messageId, content, channelId });
  }

  deleteMessage(messageId: string, channelId: string) {
    this.socket.emit('message:delete', { messageId, channelId });
  }

  startTyping(channelId: string) {
    this.socket.emit('typing:start', channelId);
  }

  stopTyping(channelId: string) {
    this.socket.emit('typing:stop', channelId);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default ChatSocket;
```

---

## Tests

Pour tester les événements Socket.IO, vous pouvez utiliser:

1. **Socket.IO Client Tool**: Extension Chrome pour tester manuellement
2. **Jest + socket.io-client**: Pour les tests automatisés
3. **Postman**: Supporte maintenant WebSocket/Socket.IO

Exemple de test avec Jest:

```typescript
import { io as Client } from 'socket.io-client';

describe('Socket.IO Events', () => {
  let clientSocket;

  beforeAll((done) => {
    clientSocket = Client('http://localhost:3001', {
      auth: { token: 'test_token', userId: 'user1', memberId: 'member1', serverId: 'server1' }
    });
    clientSocket.on('connect', done);
  });

  afterAll(() => {
    clientSocket.disconnect();
  });

  test('should receive new message', (done) => {
    clientSocket.on('message:new', (message) => {
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('content');
      done();
    });

    clientSocket.emit('message:send', {
      content: 'Test message',
      channelId: 'channel1'
    });
  });
});
```

---

## Résumé des événements

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `channel:join` | Client → Serveur | Rejoindre un channel |
| `channel:leave` | Client → Serveur | Quitter un channel |
| `channel:user_joined` | Serveur → Client | Un utilisateur a rejoint |
| `channel:user_left` | Serveur → Client | Un utilisateur est parti |
| `message:send` | Client → Serveur | Envoyer un message |
| `message:new` | Serveur → Client | Nouveau message reçu |
| `message:update` | Client → Serveur | Modifier un message |
| `message:updated` | Serveur → Client | Message modifié |
| `message:delete` | Client → Serveur | Supprimer un message |
| `message:deleted` | Serveur → Client | Message supprimé |
| `message:error` | Serveur → Client | Erreur lors d'une action |
| `typing:start` | Client → Serveur | Début de frappe |
| `typing:stop` | Client → Serveur | Fin de frappe |
| `typing:user_started` | Serveur → Client | Un utilisateur tape |
| `typing:user_stopped` | Serveur → Client | Un utilisateur a arrêté |
| `server:online_users` | Serveur → Client | Liste des utilisateurs en ligne |
| `disconnect` | Client → Serveur | Déconnexion |