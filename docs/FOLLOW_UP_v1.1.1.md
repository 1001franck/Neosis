# Follow-up Projet Neosis v1.1.1

## 1. Introduction

### Sujet
Projet `RTC STRIKES BACK - <UPGRADE YOUR APPLICATION/>`

Objectif initial:
- partir d'une base de chat temps réel
- compléter les fonctionnalités de modération et de messagerie
- professionnaliser le produit
- livrer une application exploitable aussi en desktop

### Notre positionnement
Nous ne sommes plus sur un simple chat temps réel. Le projet a évolué vers une vraie plateforme communautaire inspirée des usages de Discord:
- serveurs et salons textuels / vocaux
- messagerie privée
- réactions emoji
- partage de fichiers
- voix, vidéo et partage d'écran
- application desktop Tauri
- internationalisation FR/EN
- pipeline CI/CD GitHub Actions

Le nom produit visible dans le code est `Neosis`.

## 2. Vision Produit

### Ce qu'on voulait construire
Une application de communication temps réel complète, moderne et extensible, avec:
- une architecture maintenable
- des échanges temps réel robustes
- une séparation claire entre logique métier et interface
- une expérience multi-plateforme web + desktop

### Différence par rapport au sujet minimum
En plus du sujet de base, le projet contient déjà:
- voice chat temps réel
- vidéo dans les salons vocaux
- partage d'écran
- messages privés entre utilisateurs
- réactions emoji
- upload média
- notifications desktop
- Tauri
- Supabase Storage pour les médias

## 3. Stack Technique

### Backend
- Node.js
- TypeScript
- Express 5
- Socket.IO
- Prisma ORM
- PostgreSQL
- Zod
- JWT
- bcrypt
- Multer
- i18next
- Supabase Storage

### Frontend
- Next.js 16
- React 19
- TypeScript
- Zustand
- TanStack React Query
- Socket.IO Client
- Tailwind CSS 4
- Framer Motion
- Axios

### Desktop
- Tauri v2
- Rust
- Tauri notification plugin
- Tauri tray icon

### Outils de qualité
- Vitest
- ESLint
- GitHub Actions CI/CD

## 4. Architecture Générale

Le projet suit une logique de Clean Architecture, surtout côté backend, et reprend la même idée côté frontend.

### Backend
Structure principale dans `backend/src/`:
- `domain/` : règles métier, entités, interfaces de repositories
- `application/` : use cases
- `infrastructure/` : Prisma, upload, stockage, implémentations techniques
- `presentation/` : HTTP controllers, routes, middlewares, WebSocket handlers
- `di/` : container d'injection de dépendances
- `shared/` : config, erreurs, utils, constantes

### Frontend
Structure principale dans `frontend/src/`:
- `domain/` : types et erreurs métier
- `application/` : hooks métier, stores Zustand, services
- `infrastructure/` : API clients, WebSocket, WebRTC, local storage
- `presentation/` : composants UI et pages
- `app/` : routing Next.js App Router
- `shared/` : i18n, constantes, hooks, utils

### Point fort d'architecture
Le code n'est pas organisé "par type technique seulement", mais par responsabilité. Ça rend le projet plus lisible, plus testable et plus défendable en présentation.

## 5. Structure du Projet

### Racine
- `.github/` : workflows CI/CD
- `backend/` : API + WebSocket + logique métier + Prisma
- `frontend/` : client web Next.js + app desktop Tauri
- `docs/` : documentation d'apprentissage et d'architecture
- `prisma/` : schéma racine minimal

### GitHub workflows
Dans `.github/workflows/`:
- `ci.yml`
- `cd.yml`

## 6. Base de Données

Le vrai schéma principal est dans `backend/prisma/schema.prisma`.

### Modèles Prisma
- `User`
- `Server`
- `Member`
- `Channel`
- `Message`
- `MessageReaction`
- `MessageDeletion`
- `UserChannelRead`
- `Attachment`
- `Ban`
- `VoiceConnection`
- `Friendship`
- `DirectConversation`
- `DirectMessage`

### Ce que cela permet
- gestion des utilisateurs et profils
- serveurs communautaires
- rôles `OWNER`, `ADMIN`, `MEMBER`
- salons textuels et vocaux
- messages éditables et supprimables
- réactions emoji
- accusés de lecture par channel
- pièces jointes
- bans temporaires et permanents
- connexions vocales avec états audio/vidéo/screen share
- système d'amis
- conversations privées

### Migrations notables
Les migrations montrent bien l'évolution du produit:
- ajout des bans
- pièces jointes
- read receipts
- profils utilisateur
- voice connections
- customisation serveur/channel
- amis et DM
- réactions messages
- champs voix/vidéo

## 7. Fonctionnalités Réalisées

### Authentification
Déjà en place:
- inscription
- connexion
- JWT
- cookie httpOnly
- support token aussi pour client desktop Tauri
- mise à jour du profil
- upload avatar / bannière

Point d'attention important:
- l'authentification n'est pas exactement la même entre le web et le desktop
- sur le web, les cookies fonctionnent bien
- sur Tauri / WebView2, les cookies cross-origin sont plus sensibles
- on a donc mis en place un fallback Bearer token pour les environnements desktop

Ce qu'on peut dire à l'oral:
"Un vrai sujet technique qu'on a rencontré, c'est la différence de comportement entre navigateur classique et application desktop. On a donc dû adapter la stratégie d'authentification pour garder une session fiable aussi dans Tauri."

Fichiers clés:
- `backend/src/application/auth/usecases/RegisterUserUseCase.ts`
- `backend/src/application/auth/usecases/LoginUserUseCase.ts`
- `backend/src/presentation/http/controllers/AuthController.ts`
- `frontend/src/application/auth/useAuth.ts`
- `frontend/src/infrastructure/api/auth.api.ts`

### Serveurs et channels
Déjà en place:
- créer un serveur
- rejoindre un serveur par code d'invitation
- quitter un serveur
- supprimer un serveur
- créer / modifier / supprimer des channels
- rôles membres
- transfert de propriété

Fichiers clés:
- `backend/src/application/servers/usecases/serverUseCase.ts`
- `backend/src/application/servers/usecases/createServerUserCase.ts`
- `backend/src/application/servers/usecases/TransferOwnershipUseCase.ts`
- `backend/src/application/channels/usecases/channelUseCase.ts`
- `backend/src/presentation/http/controllers/ServerController.ts`
- `backend/src/presentation/http/controllers/ChannelController.ts`
- `frontend/src/application/servers/useServers.ts`
- `frontend/src/application/channels/useChannels.ts`
- `frontend/src/app/servers/[serverId]/ServerPageClient.tsx`

### Modération
Déjà en place:
- kick
- ban permanent
- ban temporaire avec expiration
- mise à jour des rôles
- remontée temps réel des événements de kick / ban / changement de rôle

Fichiers clés:
- `backend/src/application/members/usecases/KickMemberUseCase.ts`
- `backend/src/application/members/usecases/BanMemberUseCase.ts`
- `backend/src/application/members/usecases/UpdateMemberRoleUseCase.ts`
- `backend/src/application/members/usecases/GetServerBansUseCase.ts`
- `backend/src/presentation/http/controllers/ServerController.ts`
- `frontend/src/application/members/useMembers.ts`
- `frontend/src/infrastructure/websocket/listeners.ts`

### Messages
Déjà en place:
- envoi de messages
- édition de messages
- suppression
- suppression soft
- suppression "for me" / "for everyone"
- indicateur de frappe
- statut delivered / read
- pièces jointes
- normalisation des messages

Fichiers clés:
- `backend/src/application/messages/usecases/messageUseCase.ts`
- `backend/src/application/messages/usecases/markChannelAsReadUseCase.ts`
- `backend/src/domain/messages/entities/message.ts`
- `backend/src/presentation/websocket/socketHandler.ts`
- `frontend/src/application/messages/useMessages.ts`
- `frontend/src/application/messages/messageStore.ts`
- `frontend/src/presentation/components/chat/ChatInput.tsx`
- `frontend/src/presentation/components/chat/MessageList.tsx`
- `frontend/src/infrastructure/websocket/emitters.ts`
- `frontend/src/infrastructure/websocket/listeners.ts`

### Réactions emoji
Déjà en place:
- ajout de réaction
- suppression de réaction
- synchronisation temps réel via Socket.IO

Fichiers clés:
- `backend/src/application/messages/usecases/ReactionUseCases.ts`
- `backend/src/infrastructure/database/repositories/PrismaMessageReactionRepository.ts`
- `backend/src/presentation/websocket/socketHandler.ts`
- `frontend/src/presentation/components/chat/MessageReactions.tsx`
- `frontend/src/infrastructure/websocket/emitters.ts`
- `frontend/src/infrastructure/websocket/listeners.ts`

### Messagerie privée
Déjà en place:
- demandes d'amis
- acceptation / refus
- liste d'amis
- création ou récupération de conversation privée
- envoi de messages privés
- réception temps réel des DMs

Fichiers clés:
- `backend/src/application/direct/usecases/friendUseCases.ts`
- `backend/src/application/direct/usecases/directConversationUseCases.ts`
- `backend/src/application/direct/usecases/directMessageUseCases.ts`
- `backend/src/presentation/http/controllers/FriendController.ts`
- `backend/src/presentation/http/controllers/DirectConversationController.ts`
- `backend/src/presentation/http/controllers/DirectMessageController.ts`
- `frontend/src/application/direct/useDirectConversations.ts`
- `frontend/src/application/direct/useDirectMessages.ts`
- `frontend/src/app/messages/[conversationId]/ConversationPageClient.tsx`

### GIF API
Présent côté frontend:
- intégration Giphy
- picker GIF dans l'input de chat
- envoi du GIF comme message

Fichiers clés:
- `frontend/src/infrastructure/api/gif.api.ts`
- `frontend/src/presentation/components/chat/GifPicker.tsx`
- `frontend/src/presentation/components/chat/ChatInput.tsx`

### Internationalisation
Déjà en place:
- français
- anglais

Fichiers clés:
- `frontend/src/shared/i18n/index.ts`
- `frontend/src/shared/i18n/locales/fr.ts`
- `frontend/src/shared/i18n/locales/en.ts`
- `backend/src/locales/fr/translation.json`
- `backend/src/locales/en/translation.json`

### Voice / vidéo / partage d'écran
Très gros point fort du projet.

Déjà en place:
- rejoindre un salon vocal
- quitter un salon vocal
- mute / deafen
- caméra
- partage d'écran
- signal WebRTC via Socket.IO
- diffusion peer-to-peer
- liste des utilisateurs du salon
- compteur vocal dans le serveur
- gestion des notifications de présence vocale

Fichiers clés:
- `backend/src/application/voice/usecases/JoinVoiceChannelUseCase.ts`
- `backend/src/application/voice/usecases/LeaveVoiceChannelUseCase.ts`
- `backend/src/application/voice/usecases/UpdateVoiceStateUseCase.ts`
- `backend/src/application/voice/usecases/UpdateVideoStateUseCase.ts`
- `backend/src/application/voice/usecases/GetChannelVoiceUsersUseCase.ts`
- `backend/src/presentation/websocket/handlers/voiceHandler.ts`
- `backend/src/presentation/http/controllers/VoiceController.ts`
- `frontend/src/application/voice/useVoice.ts`
- `frontend/src/application/voice/voiceStore.ts`
- `frontend/src/infrastructure/webrtc/VoiceClient.ts`
- `frontend/src/presentation/components/voice/VoiceControls.tsx`
- `frontend/src/presentation/components/voice/VoiceMiniPanel.tsx`
- `frontend/src/presentation/components/voice/VoiceVideoGrid.tsx`

Point d'attention important:
- c'est aussi la zone la plus complexe techniquement
- la voix et la vidéo ne reposent pas seulement sur Socket.IO
- le temps réel applicatif passe par Socket.IO, mais l'audio/vidéo passe par WebRTC
- les tests réels ont montré que le vrai point sensible n'était pas seulement le code de signaling, mais surtout la connectivité ICE/TURN entre machines différentes

### Application desktop
Déjà en place avec Tauri:
- build desktop
- fenêtre native
- tray icon
- fermeture minimisée dans le tray
- notifications natives
- bridge frontend -> commande Rust `notify`

Fichiers clés:
- `frontend/src-tauri/tauri.conf.json`
- `frontend/src-tauri/src/main.rs`
- `frontend/src-tauri/src/lib.rs`
- `frontend/src/shared/hooks/useDesktopNotification.ts`

## 8. Fonctionnalités Demandées par le Sujet: État d'Avancement

### Phase 1
- Kick: fait
- Ban permanent: fait
- Ban temporaire: fait
- Message editing: fait

### Phase 2
- i18n FR/EN: fait
- CI/CD GitHub: fait
- GIF API externe: fait
- Private Message: fait
- Message reactions: fait

### Phase 3
- Application desktop Tauri: faite
- Interface graphique complète: en très grande partie faite
- Multilingue desktop: hérité du frontend, donc présent
- Notifications système: faites

## 9. CI/CD et Professionnalisation

### CI
Dans `.github/workflows/ci.yml`:
- déclenché sur push sur branches
- déclenché sur pull request
- job backend:
  - checkout
  - setup Node 22
  - `npm ci`
  - `prisma generate`
  - build TypeScript
  - tests unitaires
- job frontend:
  - checkout
  - setup Node 22
  - `npm ci`
  - vérification TypeScript
  - lint
  - build production

### CD
Dans `.github/workflows/cd.yml`:
- déclenché sur tag `v*.*.*`
- build backend
- build frontend
- upload des artefacts
- création d'une release GitHub

### Ce que ça montre
- on n'a pas seulement codé des features
- on a pensé industrialisation
- on peut prouver une démarche professionnelle

## 10. Fichiers les Plus Importants à Montrer

### Backend

#### `backend/src/main.ts`
Pourquoi il est important:
- point d'entrée backend
- montage des routes HTTP
- configuration CORS
- configuration reverse proxy avec `app.set('trust proxy', 1)`
- instanciation du container DI
- branchement Socket.IO
- purge des `VoiceConnections` au démarrage

À dire à l'oral:
"C'est ici qu'on voit comment toute l'application est assemblée. On y retrouve la logique d'injection de dépendances, les routes métier et la connexion entre l'API HTTP et le temps réel."

#### `backend/src/di/Container.ts`
Pourquoi il est important:
- centralise la création des repositories et use cases
- évite le couplage fort entre couches
- rend l'architecture plus propre et testable

À dire à l'oral:
"On a choisi de centraliser l'instanciation des dépendances pour garder une architecture modulaire. Si on change une implémentation Prisma demain, on limite l'impact."

#### `backend/src/application/messages/usecases/messageUseCase.ts`
Pourquoi il est important:
- création
- lecture
- édition
- suppression
- contrôle de permissions
- sanitation
- prise en compte des bans

Fonctions/classes à citer:
- `CreateMessageUseCase`
- `GetMessageByIdUseCase`
- `GetChannelMessagesUseCase`
- `UpdateMessageUseCase`
- `DeleteMessageUseCase`

#### `backend/src/application/members/usecases/BanMemberUseCase.ts`
Pourquoi il est important:
- correspond directement à la phase 1
- distingue ban temporaire et permanent
- applique règles métier selon rôle

Points clés:
- seul le owner peut bannir
- ban temporaire avec `expiresAt`
- ban permanent avec suppression du membre

#### `backend/src/application/members/usecases/KickMemberUseCase.ts`
Pourquoi il est important:
- phase 1
- règles de permissions claires
- admin/owner peuvent expulser
- owner protégé

#### `backend/src/presentation/websocket/socketHandler.ts`
Pourquoi il est important:
- cœur temps réel du chat
- messages
- édition
- suppression
- typing
- read receipts
- réactions
- présence
- notifications de rôle / kick / ban

Événements clés:
- `message:send`
- `message:update`
- `message:delete`
- `reaction:add`
- `reaction:remove`
- `typing:start`
- `channel:mark_read`

#### `backend/src/presentation/websocket/handlers/voiceHandler.ts`
Pourquoi il est important:
- pont entre Socket.IO et WebRTC
- gestion join/leave/state/video/screen share
- relais des signaux WebRTC

Événements clés:
- `voice:join`
- `voice:leave`
- `voice:state`
- `voice:video_state`
- `voice:screen_share`
- `voice:webrtc_signal`

### Frontend

#### `frontend/src/app/servers/[serverId]/ServerPageClient.tsx`
Pourquoi il est important:
- page d'orchestration principale du serveur
- combine hooks serveurs, channels, membres, messages et voice
- gère actions UI majeures

Actions importantes repérées:
- `handleSendMessage`
- `handleEditMessage`
- `handleDeleteMessage`
- `handleChangeRole`
- `handleTransferOwnership`
- `handleKickMember`
- `handleBanMember`
- `handleAddReaction`
- `handleRemoveReaction`
- `handleJoinVoice`

#### `frontend/src/application/voice/useVoice.ts`
Pourquoi il est important:
- hook applicatif central pour la voix
- coordination entre UI, store Zustand, WebRTC et Socket.IO

Fonctions importantes:
- `joinVoiceChannel`
- `leaveVoiceChannel`
- `toggleMute`
- `toggleDeafen`
- `toggleCamera`
- `toggleScreenShare`

#### `frontend/src/infrastructure/webrtc/VoiceClient.ts`
Pourquoi il est important:
- partie techniquement la plus avancée du projet
- gestion du micro
- peer connections WebRTC
- ICE / STUN / TURN
- caméra
- partage d'écran
- suivi des peers

Fonctions importantes:
- `fetchIceServers`
- `initializeAudio`
- `createPeerConnection`
- `setupSignalingListener`
- `enableCamera`
- `disableCamera`
- `enableScreenShare`
- `disableScreenShare`
- `cleanup`

#### `frontend/src/presentation/components/chat/ChatInput.tsx`
Pourquoi il est important:
- montre une feature visible en démo
- messages texte
- upload
- GIF
- emoji
- état de ban temporaire

#### `frontend/src/infrastructure/websocket/listeners.ts`
Pourquoi il est important:
- centralise la réaction du frontend aux événements temps réel
- fait le lien entre Socket.IO et les stores
- gère aussi les notifications desktop

## 11. Parties du Code à Expliquer Pendant la Présentation

### Option 1 recommandée: walkthrough "Message + temps réel"
Pourquoi c'est la meilleure démo:
- simple à comprendre pour le jury
- montre le backend, le frontend et le socket
- permet de parler de sécurité, de permission et de UX

Chemin de démonstration:
1. frontend `ChatInput.tsx`
2. `socketEmitters.sendMessage(...)`
3. backend `socketHandler.ts` sur `message:send`
4. `CreateMessageUseCase.execute(...)`
5. sauvegarde en base via repository Prisma
6. émission `message:new`
7. frontend `listeners.ts`
8. mise à jour Zustand
9. rendu dans `MessageList.tsx`

### Option 2: walkthrough "Ban temporaire"
Très bon choix aussi car colle exactement au sujet.

Chemin:
1. action UI sur membre
2. appel frontend hook members
3. route backend `ServerController.banMember`
4. `BanMemberUseCase.execute`
5. création du ban en base
6. event temps réel `user:server_banned`
7. blocage de l'envoi de message côté UI avec message d'information

### Option 3: walkthrough "Voice/WebRTC"
Très impressionnant mais plus risqué à présenter si le temps est court.

## 12. Ce Qui Est Déjà Fait et à Mettre en Avant

### Message principal à faire passer
Le projet est déjà bien au-delà du MVP.

### À valoriser fortement
- architecture en couches cohérente
- modération complète demandée en phase 1
- temps réel bien intégré
- DM et réactions réalisés
- i18n FR/EN réalisée
- CI/CD mise en place
- desktop Tauri fonctionnel
- notifications système
- voix + vidéo + partage d'écran, qui dépassent le sujet minimum

### Ce que ça prouve
- capacité à livrer des fonctionnalités complexes
- capacité à structurer le code
- capacité à professionnaliser un projet

## 13. Ce Qu'il Reste à Faire ou à Stabiliser

### Priorité réaliste
Le plus important maintenant n'est plus d'ajouter énormément de features, mais de consolider.

### Reste à faire / à renforcer
- stabiliser complètement l'auth desktop Tauri
- fiabiliser la voix et surtout la vidéo entre machines / réseaux différents
- valider l'infrastructure TURN sur l'environnement déployé
- continuer la consolidation WebRTC après les premiers correctifs
- stabiliser complètement les tests backend
- réduire la dette lint frontend
- sécuriser le build frontend hors environnement connecté aux Google Fonts
- finaliser la démonstration end-to-end la plus robuste
- documenter clairement ce qui est déployé et ce qui est local

### Si vous voulez un discours propre
Dire:
"Notre objectif n'est plus d'accumuler des fonctionnalités. Nous sommes dans une phase de consolidation pour garantir une démonstration fluide, des builds reproductibles et une qualité plus homogène."

## 14. Difficultés Rencontrées

### 1. Complexité du temps réel
Pourquoi c'est difficile:
- plusieurs utilisateurs
- synchronisation état local / état serveur
- gestion des rooms Socket.IO
- cohérence des événements

Comment on y a répondu:
- centralisation des listeners WebSocket
- stores Zustand dédiés
- séparation claire entre emitters et listeners

### 2. WebRTC
Pourquoi c'est difficile:
- négociation peer-to-peer
- gestion ICE candidates
- collisions d'offres
- micro, caméra, partage d'écran
- différences navigateurs / desktop

Comment on y a répondu:
- `VoiceClient.ts` dédié
- signaling via Socket.IO
- fallback STUN
- endpoint backend pour credentials TURN
- cleanup des connexions côté backend au démarrage

Ce qu'on a compris grâce aux tests réels:
- quand deux utilisateurs arrivent à se connecter au serveur mais ne s'entendent pas ou ne se voient pas, le problème ne vient pas forcément du chat ni du backend HTTP
- dans notre cas, les logs ont surtout pointé des problèmes ICE/TURN
- autrement dit, le signaling passait, mais la connexion média peer-to-peer ne s'établissait pas correctement

Ce que ça signifie en langage simple:
"Le serveur sait que deux personnes veulent parler, mais le canal audio/vidéo direct entre les deux machines n'arrive pas toujours à se construire selon le réseau."

### 3. Authentification desktop
Pourquoi c'est difficile:
- Tauri n'a pas exactement le même comportement qu'un navigateur web classique
- les cookies cross-origin sont plus délicats dans WebView2
- il faut garder une stratégie cohérente entre API HTTP, Socket.IO et persistance locale

Comment on y a répondu:
- stockage du JWT côté desktop dans `localStorage`
- envoi du token en `Authorization` sur les appels Axios
- transmission du token au socket via `socket.auth`
- priorité serveur donnée au bearer token plutôt qu'à un ancien cookie

Pourquoi c'est important dans le follow-up:
- ça montre un vrai problème produit, pas juste un détail de code
- ça montre aussi qu'on a réfléchi à la différence entre un client web et un client desktop natif
### 4. Gestion des permissions métier
Pourquoi c'est difficile:
- distinguer owner/admin/member
- empêcher actions incohérentes
- gérer kick, ban, transfert, suppression

Comment on y a répondu:
- logique concentrée dans les use cases
- validation au niveau application, pas seulement dans l'UI
### 5. Industrialisation
Pourquoi c'est difficile:
- faire tourner build, tests et lint sur plusieurs parties
- intégrer secrets et environnements

Comment on y a répondu:
- workflows CI/CD distincts backend/frontend
- build sur tags
- génération Prisma dans la CI

## 15. Difficultés Actuelles Vérifiées

### Vérifications faites localement
- `backend`: build TypeScript OK via `npm.cmd run build`
- `frontend`: lint OK avec warnings seulement
- `frontend`: build bloqué en environnement sandbox sans accès réseau aux Google Fonts
- `backend`: tests non validés ici car `vitest` échoue dans le sandbox sur `spawn EPERM`

### Ce qu'on peut dire proprement
- le backend compile
- le frontend passe le lint sans erreurs bloquantes
- certaines validations automatiques dépendent encore de l'environnement d'exécution

### Difficultés observées en tests réels
- sur desktop, la gestion de session est plus fragile que sur le web
- sur la voix/vidéo, le signaling fonctionne mais la connexion média ne monte pas toujours correctement
- les logs ont montré de nombreux relais `voice:webrtc_signal`, ce qui prouve que Socket.IO passe bien
- en revanche, les problèmes d'audio/vidéo viennent surtout de la phase ICE/TURN et de la négociation WebRTC

### Traduction simple pour un oral
"Le problème principal n'est pas que le message socket ne part pas. Le vrai problème, c'est que le lien audio/vidéo direct entre les deux machines reste la partie la plus fragile."

### Détail concret à citer
- l'auth desktop a demandé une double logique cookie + bearer token
- la vidéo a demandé un vrai travail sur `VoiceClient.ts`, `voiceHandler.ts` et la récupération dynamique des credentials TURN
- on a aussi dû ajouter une purge des `VoiceConnections` au démarrage pour éviter les utilisateurs fantômes après crash

### Problème secondaire identifié pendant les tests
- l'envoi d'une pièce jointe sans texte a révélé un conflit entre la logique métier et une contrainte SQL sur `Message.content`
- cela a mené à une migration Prisma pour autoriser `content` à `null` sur les messages avec attachement
- ce n'était pas le problème principal voix/vidéo, mais c'est un bon exemple de bug réel trouvé en intégration

### Warnings frontend relevés
Principalement:
- `img` natif au lieu de `next/image`
- dépendances de hooks manquantes
- variables inutilisées

Ce n'est pas bloquant pour la démo, mais c'est une piste claire d'amélioration qualité.

## 16. 2FA, Google OAuth, Nginx, VPS: état réel du repo

### 2FA
Je n'ai pas trouvé d'implémentation 2FA réelle dans le code versionné.

Conclusion à dire si on vous interroge:
"La 2FA faisait partie des pistes d'évolution supplémentaires, mais elle n'apparaît pas encore comme fonctionnalité intégrée dans cette version du dépôt."

### Google OAuth
Je n'ai pas trouvé d'implémentation Google OAuth réelle dans le code versionné.

Attention:
- on voit `next/font/google`, mais cela n'a rien à voir avec l'authentification Google

### Reverse proxy Nginx / VPS
Je n'ai pas trouvé de fichier de configuration Nginx versionné dans le repo.

En revanche, le backend est préparé à fonctionner derrière un reverse proxy:
- `app.set('trust proxy', 1)` dans `backend/src/main.ts`

Ce qu'on peut dire proprement:
"L'application est prête à être déployée derrière un reverse proxy, mais la configuration Nginx/VPS n'est pas versionnée dans ce dépôt."

### Déploiement trouvé dans la documentation
La doc interne mentionne plutôt:
- frontend sur Vercel
- backend sur Render

Donc attention à ne pas affirmer une infra Nginx/VPS si elle n'est pas dans le code ou la doc disponible.

## 17. Tests

### Tests présents
- `backend/test/domain/messages/message.test.ts`
- `backend/test/domain/members/member.test.ts`
- `backend/test/application/messages/messageUseCases.test.ts`
- `backend/test/testRunner.test.ts`

### Ce que couvrent les tests
- entité `Message`
- entité `Member`
- use cases de messages
- chargement du middleware auth

### Lecture honnête
La base de tests existe, ce qui est positif, mais la couverture reste limitée par rapport à l'étendue fonctionnelle réelle du produit.

## 18. Dépendances Notables

### Backend
Dans `backend/package.json`:
- `express`
- `socket.io`
- `@prisma/client`
- `@supabase/supabase-js`
- `bcrypt`
- `jsonwebtoken`
- `multer`
- `zod`
- `i18next`

### Frontend
Dans `frontend/package.json`:
- `next`
- `react`
- `@tanstack/react-query`
- `zustand`
- `socket.io-client`
- `axios`
- `framer-motion`
- `@tauri-apps/api`

## 19. Démo Recommandée

### Démo idéale
1. login
2. affichage d'un serveur
3. envoi d'un message en temps réel
4. édition du message
5. réaction emoji
6. kick ou ban temporaire sur un membre
7. ouverture d'un salon vocal
8. activation micro / caméra / partage d'écran
9. notification desktop ou DM

### Ordre conseillé à l'oral
- commencer par le produit
- montrer que ça fonctionne
- ensuite expliquer l'architecture
- finir sur une feature walkthrough

### Variante plus prudente pour éviter une démo risquée
Si la vidéo n'est pas encore totalement stabilisée le jour J:
1. login
2. navigation dans un serveur
3. message temps réel
4. édition / réaction
5. ban temporaire
6. démonstration de l'interface voice
7. explication technique de la vidéo et du TURN plutôt qu'une démo longue en live

Ce choix est défendable:
"On préfère montrer une chaîne fonctionnelle maîtrisée, puis expliquer honnêtement la partie la plus complexe en cours de stabilisation."

## 20. Répartition du Discours en Follow-up

### Partie 1 - Avancement
"Nous avons terminé les fonctionnalités principales demandées sur la modération et la messagerie, puis nous avons professionnalisé l'application avec i18n, CI/CD, messages privés, réactions et une application desktop."

### Partie 2 - Choix techniques
"Nous avons choisi une architecture en couches pour éviter de mélanger la logique métier, l'accès aux données et la présentation. Cela nous a permis de faire évoluer le projet sans trop casser l'existant."

### Partie 3 - Difficultés
"La principale difficulté a été la gestion du temps réel, surtout sur la partie WebRTC, car il fallait synchroniser plusieurs couches: navigateur, Socket.IO, base de données et UI. En pratique, nos deux points les plus sensibles aujourd'hui sont l'authentification desktop et la fiabilité de la voix/vidéo entre réseaux différents."

### Partie 4 - Reste à faire
"Notre priorité est désormais la consolidation: qualité, stabilité des tests, réduction de la dette technique et sécurisation de la démonstration."

## 21. Réponses Courtes Prêtes à l'Emploi

### Pourquoi Node.js ?
"Parce qu'on avait besoin d'un backend très adapté au temps réel et à Socket.IO, avec un écosystème rapide à mettre en place pour un produit de type chat."

### Pourquoi Prisma ?
"Pour sécuriser la couche base de données avec un schéma clair, typé, versionné par migrations, et plus facile à faire évoluer."

### Pourquoi Tauri ?
"Pour éviter le coût mémoire d'Electron et obtenir une vraie application desktop native plus légère, tout en réutilisant notre frontend React/Next."

### Pourquoi Socket.IO + WebRTC ?
"Socket.IO sert au signaling et à tous les événements temps réel applicatifs. WebRTC sert au transport audio/vidéo peer-to-peer, ce qui est plus adapté pour la voix."

### Pourquoi l'auth desktop est plus compliquée ?
"Parce qu'en desktop on ne peut pas dépendre exactement du même comportement de cookies qu'en navigateur classique. Il faut donc fiabiliser la session avec un fallback Bearer token sans casser la sécurité globale."

### Pourquoi la vidéo est la partie la plus compliquée ?
"Parce que ce n'est pas juste une feature UI. Il faut faire fonctionner en même temps le signaling, la négociation WebRTC, les ICE candidates, les politiques d'autoplay, les permissions caméra/micro et l'infrastructure TURN."

### Pourquoi Clean Architecture ?
"Parce qu'on voulait éviter un projet monolithique difficile à maintenir. Les use cases et repositories nous permettent de justifier clairement où se trouve chaque responsabilité."

## 22. Conclusion

### Message de fin conseillé
"Le projet n'est plus seulement une preuve de concept. C'est une base produit sérieuse, avec une architecture défendable, des fonctionnalités avancées de communication temps réel, une ouverture desktop et une vraie logique de professionnalisation. Notre enjeu principal à ce stade est la consolidation de deux zones critiques: l'authentification desktop et la fiabilité de la voix/vidéo."

## 23. Version Orale Très Forte

### Ce qu'on a déjà réussi
- on a livré l'ensemble des fonctionnalités cœur attendues
- on a dépassé le sujet avec la voix, la vidéo, le partage d'écran et le desktop
- on a structuré proprement le projet avec une architecture claire
- on a mis en place de la CI/CD et une vraie logique de déploiement

### Là où on galère vraiment
- l'auth desktop, car le comportement des sessions n'est pas exactement le même que sur le web
- la vidéo et la voix entre utilisateurs réels, car le problème se situe au niveau WebRTC / ICE / TURN, donc sur une couche réseau plus complexe que le simple temps réel applicatif

### Pourquoi c'est intéressant à raconter
- ce sont des difficultés de vrai produit
- ce ne sont pas des bugs "de débutant", mais des sujets d'intégration entre plusieurs technologies
- cela montre qu'on est passé d'un simple CRUD à un système distribué avec contraintes réseau réelles

### Formulation recommandée devant le jury
"Aujourd'hui, notre projet est fonctionnel sur ses briques principales. Les deux sujets qui nous demandent le plus de rigueur sont la gestion de session en desktop et la stabilisation de la voix/vidéo en conditions réelles. C'est précisément là qu'on concentre notre effort de consolidation."

---

## Annexes Rapides

### Fichiers à citer absolument
- `backend/src/main.ts`
- `backend/src/di/Container.ts`
- `backend/src/application/messages/usecases/messageUseCase.ts`
- `backend/src/application/members/usecases/BanMemberUseCase.ts`
- `backend/src/application/members/usecases/KickMemberUseCase.ts`
- `backend/src/presentation/websocket/socketHandler.ts`
- `backend/src/presentation/websocket/handlers/voiceHandler.ts`
- `frontend/src/app/servers/[serverId]/ServerPageClient.tsx`
- `frontend/src/application/voice/useVoice.ts`
- `frontend/src/infrastructure/webrtc/VoiceClient.ts`
- `frontend/src/infrastructure/websocket/listeners.ts`
- `frontend/src/presentation/components/chat/ChatInput.tsx`
- `frontend/src-tauri/src/lib.rs`

### Phrase forte pour marquer le jury
"On a fait le choix de livrer moins de promesses implicites et plus de fonctionnalités réellement intégrées de bout en bout, du modèle de données jusqu'à l'interface et au temps réel."
