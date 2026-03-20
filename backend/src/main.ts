/**
 * Point d'entrée principal du serveur backend
 * Architecture: Clean Architecture avec DI Container
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Container } from './di/Container.js';
import { AuthController } from './presentation/http/controllers/AuthController.js';
import { ServerController } from './presentation/http/controllers/ServerController.js';
import { ChannelController } from './presentation/http/controllers/ChannelController.js';
import { MessageController } from './presentation/http/controllers/MessageController.js';
import { createAuthRoutes } from './presentation/http/routes/authRoute.js';
import { createServerRoutes } from './presentation/http/routes/serverRoute.js';
import { createChannelRoutes, createServerChannelRoutes } from './presentation/http/routes/channelRoute.js';
import { createMessageRoutes, createChannelMessageRoutes } from './presentation/http/routes/messageRoute.js';
import { createUploadRoutes, createChannelMediaRoutes } from './presentation/http/routes/uploadRoute.js';
import { createVoiceRouter } from './presentation/http/routes/voiceRoute.js';
import { createFriendRoutes } from './presentation/http/routes/friendRoute.js';
import { createDirectConversationRoutes, createDirectMessageRoutes } from './presentation/http/routes/directRoute.js';
import { UploadController } from './presentation/http/controllers/UploadController.js';
import { VoiceController } from './presentation/http/controllers/VoiceController.js';
import { FriendController } from './presentation/http/controllers/FriendController.js';
import { DirectConversationController } from './presentation/http/controllers/DirectConversationController.js';
import { DirectMessageController } from './presentation/http/controllers/DirectMessageController.js';
import { authMiddleware } from './presentation/http/middlewares/auth.middleware.js';
import { errorHandler } from './presentation/http/middlewares/errorHandler.js';
import { globalRateLimit, messageRateLimit } from './presentation/http/middlewares/rateLimit.middleware.js';
import { SocketHandler } from './presentation/websocket/socketHandler.js';
import { VoiceHandler } from './presentation/websocket/handlers/voiceHandler.js';

const app = express();

// Nécessaire pour que les middlewares (rate limiter, logs) lisent la vraie IP
// derrière un reverse proxy (Nginx, Railway, Render, etc.)
app.set('trust proxy', 1);

const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ============ DEPENDENCY INJECTION ============
const container = Container.getInstance();

// Repositories
const userRepository = container.createUserRepository();
const banRepository = container.createBanRepository();

// Auth Use Cases
const registerUseCase = container.createRegisterUserUseCase();
const loginUseCase = container.createLoginUserUseCase();

// Server Use Cases
const createServerUseCase = container.createServerUseCase();
const getServerByIdUseCase = container.getServerByIdUseCase();
const getUserServersUseCase = container.getUserServersUseCase();
const updateServerUseCase = container.updateServerUseCase();
const deleteServerUseCase = container.deleteServerUseCase();
const joinServerUseCase = container.joinServerUseCase();
const leaveServerUseCase = container.leaveServerUseCase();
const transferOwnershipUseCase = container.transferOwnershipUseCase();

// Member Use Cases
const getServerMembersUseCase = container.getServerMembersUseCase();
const updateMemberRoleUseCase = container.updateMemberRoleUseCase();
const kickMemberUseCase = container.kickMemberUseCase();
const banMemberUseCase = container.banMemberUseCase();

// Channel Use Cases
const createChannelUseCase = container.createChannelUseCase();
const getChannelByIdUseCase = container.getChannelByIdUseCase();
const getServerChannelsUseCase = container.getServerChannelsUseCase();
const updateChannelUseCase = container.updateChannelUseCase();
const deleteChannelUseCase = container.deleteChannelUseCase();

// Message Use Cases
const createMessageUseCase = container.createMessageUseCase();
const getMessageByIdUseCase = container.getMessageByIdUseCase();
const getChannelMessagesUseCase = container.getChannelMessagesUseCase();
const updateMessageUseCase = container.updateMessageUseCase();
const deleteMessageUseCase = container.deleteMessageUseCase();
const markChannelAsReadUseCase = container.markChannelAsReadUseCase();

// Voice Use Cases
const joinVoiceChannelUseCase = container.createJoinVoiceChannelUseCase();
const leaveVoiceChannelUseCase = container.createLeaveVoiceChannelUseCase();
const updateVoiceStateUseCase = container.createUpdateVoiceStateUseCase();
const getChannelVoiceUsersUseCase = container.createGetChannelVoiceUsersUseCase();

// Friend / Direct Use Cases
const requestFriendUseCase = container.createRequestFriendUseCase();
const acceptFriendUseCase = container.createAcceptFriendUseCase();
const listFriendsUseCase = container.createListFriendsUseCase();
const listFriendRequestsUseCase = container.createListFriendRequestsUseCase();
const createDirectConversationUseCase = container.createDirectConversationUseCase();
const listDirectConversationsUseCase = container.createListDirectConversationsUseCase();
const getDirectConversationUseCase = container.createGetDirectConversationUseCase();
const sendDirectMessageUseCase = container.createSendDirectMessageUseCase();
const getDirectMessagesUseCase = container.createGetDirectMessagesUseCase();

// Controllers
const authController = new AuthController(registerUseCase, loginUseCase, userRepository);
const channelController = new ChannelController(
  createChannelUseCase,
  getChannelByIdUseCase,
  getServerChannelsUseCase,
  updateChannelUseCase,
  deleteChannelUseCase
);
const messageController = new MessageController(
  createMessageUseCase,
  getMessageByIdUseCase,
  getChannelMessagesUseCase,
  updateMessageUseCase,
  deleteMessageUseCase
);

// Upload Controller
const uploadController = new UploadController(container.getPrisma());

// Voice Controller
const voiceController = new VoiceController(getChannelVoiceUsersUseCase);
const friendController = new FriendController(
  requestFriendUseCase,
  acceptFriendUseCase,
  listFriendsUseCase,
  listFriendRequestsUseCase,
  userRepository
);
const directConversationController = new DirectConversationController(
  createDirectConversationUseCase,
  listDirectConversationsUseCase,
  getDirectConversationUseCase,
  userRepository
);
// WebSocket Handler
const socketHandler = new SocketHandler(
  httpServer,
  createMessageUseCase,
  updateMessageUseCase,
  deleteMessageUseCase,
  markChannelAsReadUseCase,
  userRepository
);

// Voice Handler (WebRTC signaling)
const voiceHandler = new VoiceHandler(
  socketHandler.getIO(), // Récupérer l'instance Socket.IO
  joinVoiceChannelUseCase,
  leaveVoiceChannelUseCase,
  updateVoiceStateUseCase,
  getChannelVoiceUsersUseCase
);

// ServerController (après socketHandler pour passer io)
const serverController = new ServerController(
  createServerUseCase,
  getServerByIdUseCase,
  getUserServersUseCase,
  updateServerUseCase,
  deleteServerUseCase,
  joinServerUseCase,
  leaveServerUseCase,
  getServerMembersUseCase,
  updateMemberRoleUseCase,
  transferOwnershipUseCase,
  kickMemberUseCase,
  banMemberUseCase,
  banRepository,
  socketHandler.getIO()
);

// DirectMessage Controller (après socketHandler pour avoir accès à getIO())
const directMessageController = new DirectMessageController(
  sendDirectMessageUseCase,
  getDirectMessagesUseCase,
  getDirectConversationUseCase,
  socketHandler.getIO()
);

// Enregistrer les handlers voice pour chaque connexion
socketHandler.getIO().on('connection', (socket) => {
  voiceHandler.register(socket);
});

// ============ MIDDLEWARES ============
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Rate limiting global (100 req/min par IP)
app.use(globalRateLimit);

// ============ ROUTES ============

// Health check
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Real Time Chat API',
    version: '1.0.0'
  });
});

// Auth routes (signup/login publics, logout/me protégés)
const authRoutes = createAuthRoutes(authController);
app.use('/auth', authRoutes);

// Server routes (all protected)
app.use('/servers', authMiddleware, createServerRoutes(serverController));

// Channel routes
app.use('/channels', authMiddleware, createChannelRoutes(channelController));
app.use('/servers/:serverId/channels', authMiddleware, createServerChannelRoutes(channelController));

// Message routes + rate limit sur l'envoi
app.use('/messages', authMiddleware, createMessageRoutes(messageController));
app.use('/channels/:channelId/messages', authMiddleware, messageRateLimit, createChannelMessageRoutes(messageController));

// Upload routes
app.use('/upload', authMiddleware, createUploadRoutes(uploadController));
app.use('/channels/:channelId/media', authMiddleware, createChannelMediaRoutes(uploadController));

// Voice routes
app.use('/voice', createVoiceRouter(voiceController));

// Friend / Direct routes
app.use('/friends', authMiddleware, createFriendRoutes(friendController));
app.use('/dm/conversations', authMiddleware, createDirectConversationRoutes(directConversationController));
app.use('/dm/conversations/:id/messages', authMiddleware, createDirectMessageRoutes(directMessageController));

// ============ ERROR HANDLER (must be last) ============
app.use(errorHandler);

// ============ START SERVER ============
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(` Frontend URL: ${FRONTEND_URL}`);
  console.log(` WebSocket: active`);
  console.log(`JWT Secret: configured`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n Shutting down gracefully...');
  await container.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n Received SIGTERM, shutting down...');
  await container.shutdown();
  process.exit(0);
});
