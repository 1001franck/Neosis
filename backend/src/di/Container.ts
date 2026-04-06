/**
 * Container d'injection de dépendances
 * Responsabilité: Créer et gérer les instances des services
 * 
 * Pattern: Service Locator / Dependency Injection Container
 * Centralize la création de toutes les dépendances
 */
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../infrastructure/database/repositories/PrismaUserRepository.js';
import { PrismaServerRepository } from '../infrastructure/database/repositories/prismaServerRepository.js';
import { PrismaChannelRepository } from '../infrastructure/database/repositories/prismaChannelRepository.js';
import { PrismaMessageRepository } from '../infrastructure/database/repositories/prismaMessageRepository.js';
import { PrismaMemberRepository } from '../infrastructure/database/repositories/PrismaMemberRepository.js';
import { PrismaBanRepository } from '../infrastructure/database/repositories/PrismaBanRepository.js';
import { PrismaReadReceiptRepository } from '../infrastructure/database/repositories/prismaReadReceiptRepository.js';
import { PrismaVoiceConnectionRepository } from '../infrastructure/database/repositories/PrismaVoiceConnectionRepository.js';
import { PrismaFriendshipRepository } from '../infrastructure/database/repositories/PrismaFriendshipRepository.js';
import { PrismaDirectConversationRepository } from '../infrastructure/database/repositories/PrismaDirectConversationRepository.js';
import { PrismaDirectMessageRepository } from '../infrastructure/database/repositories/PrismaDirectMessageRepository.js';
import { RegisterUserUseCase } from '../application/auth/usecases/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../application/auth/usecases/LoginUserUseCase.js';
import { CreateServerUseCase } from '../application/servers/usecases/createServerUserCase.js';
import { LeaveServerUseCase } from '../application/servers/usecases/LeaveServerUseCase.js';
import { TransferOwnershipUseCase } from '../application/servers/usecases/TransferOwnershipUseCase.js';
import {
  GetServerByIdUseCase,
  GetUserServersUseCase,
  UpdateServerUseCase,
  DeleteServerUseCase,
  JoinServerUseCase
} from '../application/servers/usecases/serverUseCase.js';
import { GetServerMembersUseCase } from '../application/members/usecases/GetServerMembersUseCase.js';
import { UpdateMemberRoleUseCase } from '../application/members/usecases/UpdateMemberRoleUseCase.js';
import { KickMemberUseCase } from '../application/members/usecases/KickMemberUseCase.js';
import { BanMemberUseCase } from '../application/members/usecases/BanMemberUseCase.js';
import {
  CreateChannelUseCase,
  GetChannelByIdUseCase,
  GetServerChannelsUseCase,
  UpdateChannelUseCase,
  DeleteChannelUseCase
} from '../application/channels/usecases/channelUseCase.js';
import {
  CreateMessageUseCase,
  GetMessageByIdUseCase,
  GetChannelMessagesUseCase,
  GetRecentMessagesUseCase,
  UpdateMessageUseCase,
  DeleteMessageUseCase
} from '../application/messages/usecases/messageUseCase.js';
import { MarkChannelAsReadUseCase } from '../application/messages/usecases/markChannelAsReadUseCase.js';
import { JoinVoiceChannelUseCase } from '../application/voice/usecases/JoinVoiceChannelUseCase.js';
import { LeaveVoiceChannelUseCase } from '../application/voice/usecases/LeaveVoiceChannelUseCase.js';
import { UpdateVoiceStateUseCase } from '../application/voice/usecases/UpdateVoiceStateUseCase.js';
import { GetChannelVoiceUsersUseCase } from '../application/voice/usecases/GetChannelVoiceUsersUseCase.js';
import {
  RequestFriendUseCase,
  AcceptFriendUseCase,
  ListFriendsUseCase,
  ListFriendRequestsUseCase,
} from '../application/direct/usecases/friendUseCases.js';
import {
  CreateOrGetDirectConversationUseCase,
  ListDirectConversationsUseCase,
  GetDirectConversationUseCase,
} from '../application/direct/usecases/directConversationUseCases.js';
import {
  SendDirectMessageUseCase,
  GetDirectMessagesUseCase,
} from '../application/direct/usecases/directMessageUseCases.js';

export class Container {
  private static instance: Container;
  private prisma: PrismaClient;

  // Cached repository instances (lazy-initialized)
  private _userRepository?: PrismaUserRepository;
  private _serverRepository?: PrismaServerRepository;
  private _channelRepository?: PrismaChannelRepository;
  private _messageRepository?: PrismaMessageRepository;
  private _memberRepository?: PrismaMemberRepository;
  private _banRepository?: PrismaBanRepository;
  private _readReceiptRepository?: PrismaReadReceiptRepository;
  private _voiceConnectionRepository?: PrismaVoiceConnectionRepository;
  private _friendshipRepository?: PrismaFriendshipRepository;
  private _directConversationRepository?: PrismaDirectConversationRepository;
  private _directMessageRepository?: PrismaDirectMessageRepository;

  private constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('❌ Variable d\'environnement manquante : DATABASE_URL');
    }
    this.prisma = new PrismaClient({
      datasourceUrl: databaseUrl,
    });
  }

  /**
   * Obtenir l'instance unique du container (Singleton)
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Obtenir l'instance Prisma
   */
  getPrisma(): PrismaClient {
    return this.prisma;
  }

  // ============ REPOSITORIES (cached singletons) ============

  createUserRepository() {
    if (!this._userRepository) {
      this._userRepository = new PrismaUserRepository(this.prisma);
    }
    return this._userRepository;
  }

  createServerRepository() {
    if (!this._serverRepository) {
      this._serverRepository = new PrismaServerRepository(this.prisma);
    }
    return this._serverRepository;
  }

  createChannelRepository() {
    if (!this._channelRepository) {
      this._channelRepository = new PrismaChannelRepository(this.prisma);
    }
    return this._channelRepository;
  }

  createMessageRepository() {
    if (!this._messageRepository) {
      this._messageRepository = new PrismaMessageRepository(this.prisma);
    }
    return this._messageRepository;
  }

  createMemberRepository() {
    if (!this._memberRepository) {
      this._memberRepository = new PrismaMemberRepository(this.prisma);
    }
    return this._memberRepository;
  }

  createBanRepository() {
    if (!this._banRepository) {
      this._banRepository = new PrismaBanRepository(this.prisma);
    }
    return this._banRepository;
  }

  createReadReceiptRepository() {
    if (!this._readReceiptRepository) {
      this._readReceiptRepository = new PrismaReadReceiptRepository(this.prisma);
    }
    return this._readReceiptRepository;
  }

  createVoiceConnectionRepository() {
    if (!this._voiceConnectionRepository) {
      this._voiceConnectionRepository = new PrismaVoiceConnectionRepository(this.prisma);
    }
    return this._voiceConnectionRepository;
  }

  createFriendshipRepository() {
    if (!this._friendshipRepository) {
      this._friendshipRepository = new PrismaFriendshipRepository(this.prisma);
    }
    return this._friendshipRepository;
  }

  createDirectConversationRepository() {
    if (!this._directConversationRepository) {
      this._directConversationRepository = new PrismaDirectConversationRepository(this.prisma);
    }
    return this._directConversationRepository;
  }

  createDirectMessageRepository() {
    if (!this._directMessageRepository) {
      this._directMessageRepository = new PrismaDirectMessageRepository(this.prisma);
    }
    return this._directMessageRepository;
  }

  // ============ AUTH USE CASES ============

  /**
   * Créer le Use Case d'enregistrement
   */
  createRegisterUserUseCase() {
    const userRepository = this.createUserRepository();
    return new RegisterUserUseCase(userRepository);
  }

  /**
   * Créer le Use Case de connexion
   */
  createLoginUserUseCase() {
    const userRepository = this.createUserRepository();
    return new LoginUserUseCase(userRepository);
  }

  // ============ SERVER USE CASES ============

  /**
   * Créer le Use Case de création de serveur
   */
  createServerUseCase() {
    const serverRepository = this.createServerRepository();
    const memberRepository = this.createMemberRepository();
    const channelRepository = this.createChannelRepository();
    return new CreateServerUseCase(serverRepository, memberRepository, channelRepository);
  }

  /**
   * Créer le Use Case pour obtenir un serveur par ID
   */
  getServerByIdUseCase() {
    const serverRepository = this.createServerRepository();
    const memberRepository = this.createMemberRepository();
    return new GetServerByIdUseCase(serverRepository, memberRepository);
  }

  /**
   * Créer le Use Case pour obtenir les serveurs d'un utilisateur
   */
  getUserServersUseCase() {
    const serverRepository = this.createServerRepository();
    return new GetUserServersUseCase(serverRepository);
  }

  /**
   * Créer le Use Case pour mettre à jour un serveur
   */
  updateServerUseCase() {
    const serverRepository = this.createServerRepository();
    const memberRepository = this.createMemberRepository();
    return new UpdateServerUseCase(serverRepository, memberRepository);
  }

  /**
   * Créer le Use Case pour supprimer un serveur
   */
  deleteServerUseCase() {
    const serverRepository = this.createServerRepository();
    return new DeleteServerUseCase(serverRepository);
  }

  /**
   * Créer le Use Case pour rejoindre un serveur
   */
  joinServerUseCase() {
    const serverRepository = this.createServerRepository();
    const memberRepository = this.createMemberRepository();
    const banRepository = this.createBanRepository();
    return new JoinServerUseCase(serverRepository, memberRepository, banRepository);
  }

  /**
   * Créer le Use Case pour quitter un serveur
   */
  leaveServerUseCase() {
    const memberRepository = this.createMemberRepository();
    return new LeaveServerUseCase(memberRepository);
  }

  /**
   * Créer le Use Case pour transférer la propriété d'un serveur
   */
  transferOwnershipUseCase() {
    const memberRepository = this.createMemberRepository();
    const serverRepository = this.createServerRepository();
    return new TransferOwnershipUseCase(memberRepository, serverRepository);
  }

  // ============ MEMBER USE CASES ============

  /**
   * Créer le Use Case pour obtenir les membres d'un serveur
   */
  getServerMembersUseCase() {
    const memberRepository = this.createMemberRepository();
    return new GetServerMembersUseCase(memberRepository);
  }

  /**
   * Créer le Use Case pour mettre à jour le rôle d'un membre
   */
  updateMemberRoleUseCase() {
    const memberRepository = this.createMemberRepository();
    return new UpdateMemberRoleUseCase(memberRepository);
  }

  kickMemberUseCase() {
    const memberRepository = this.createMemberRepository();
    return new KickMemberUseCase(memberRepository);
  }

  banMemberUseCase() {
    const memberRepository = this.createMemberRepository();
    const banRepository = this.createBanRepository();
    return new BanMemberUseCase(memberRepository, banRepository);
  }

  // ============ CHANNEL USE CASES ============

  /**
   * Créer le Use Case de création de channel
   */
  createChannelUseCase() {
    const channelRepository = this.createChannelRepository();
    const memberRepository = this.createMemberRepository();
    return new CreateChannelUseCase(channelRepository, memberRepository);
  }

  /**
   * Créer le Use Case pour obtenir un channel par ID
   */
  getChannelByIdUseCase() {
    const channelRepository = this.createChannelRepository();
    const memberRepository = this.createMemberRepository();
    return new GetChannelByIdUseCase(channelRepository, memberRepository);
  }

  /**
   * Créer le Use Case pour obtenir les channels d'un serveur
   */
  getServerChannelsUseCase() {
    const channelRepository = this.createChannelRepository();
    const memberRepository = this.createMemberRepository();
    return new GetServerChannelsUseCase(channelRepository, memberRepository);
  }

  /**
   * Créer le Use Case pour mettre à jour un channel
   */
  updateChannelUseCase() {
    const channelRepository = this.createChannelRepository();
    const memberRepository = this.createMemberRepository();
    return new UpdateChannelUseCase(channelRepository, memberRepository);
  }

  /**
   * Créer le Use Case pour supprimer un channel
   */
  deleteChannelUseCase() {
    const channelRepository = this.createChannelRepository();
    const memberRepository = this.createMemberRepository();
    return new DeleteChannelUseCase(channelRepository, memberRepository);
  }

  // ============ MESSAGE USE CASES ============

  /**
   * Créer le Use Case de création de message
   */
  createMessageUseCase() {
    const messageRepository = this.createMessageRepository();
    const memberRepository = this.createMemberRepository();
    const channelRepository = this.createChannelRepository();
    const banRepository = this.createBanRepository();
    return new CreateMessageUseCase(messageRepository, memberRepository, channelRepository, banRepository);
  }

  /**
   * Créer le Use Case pour obtenir un message par ID
   */
  getMessageByIdUseCase() {
    const messageRepository = this.createMessageRepository();
    const memberRepository = this.createMemberRepository();
    const channelRepository = this.createChannelRepository();
    return new GetMessageByIdUseCase(messageRepository, memberRepository, channelRepository);
  }

  /**
   * Créer le Use Case pour obtenir les messages d'un channel
   */
  getChannelMessagesUseCase() {
    const messageRepository = this.createMessageRepository();
    const memberRepository = this.createMemberRepository();
    const channelRepository = this.createChannelRepository();
    return new GetChannelMessagesUseCase(messageRepository, memberRepository, channelRepository);
  }

  /**
   * Créer le Use Case pour obtenir les messages récents
   */
  getRecentMessagesUseCase() {
    const messageRepository = this.createMessageRepository();
    return new GetRecentMessagesUseCase(messageRepository);
  }

  /**
   * Créer le Use Case pour mettre à jour un message
   */
  updateMessageUseCase() {
    const messageRepository = this.createMessageRepository();
    const memberRepository = this.createMemberRepository();
    const channelRepository = this.createChannelRepository();
    return new UpdateMessageUseCase(messageRepository, memberRepository, channelRepository);
  }

  /**
   * Créer le Use Case pour supprimer un message
   */
  deleteMessageUseCase() {
    const messageRepository = this.createMessageRepository();
    const memberRepository = this.createMemberRepository();
    const channelRepository = this.createChannelRepository();
    return new DeleteMessageUseCase(messageRepository, memberRepository, channelRepository);
  }

  /**
   * Créer le Use Case pour marquer un channel comme lu
   */
  markChannelAsReadUseCase() {
    const readReceiptRepository = this.createReadReceiptRepository();
    const memberRepository = this.createMemberRepository();
    const channelRepository = this.createChannelRepository();
    return new MarkChannelAsReadUseCase(readReceiptRepository, memberRepository, channelRepository);
  }

  // ============ VOICE USE CASES ============

  /**
   * Créer le Use Case pour rejoindre un voice channel
   */
  createJoinVoiceChannelUseCase() {
    const voiceRepository = this.createVoiceConnectionRepository();
    const channelRepository = this.createChannelRepository();
    const memberRepository = this.createMemberRepository();
    return new JoinVoiceChannelUseCase(voiceRepository, channelRepository, memberRepository);
  }

  /**
   * Créer le Use Case pour quitter un voice channel
   */
  createLeaveVoiceChannelUseCase() {
    const voiceRepository = this.createVoiceConnectionRepository();
    return new LeaveVoiceChannelUseCase(voiceRepository);
  }

  /**
   * Créer le Use Case pour mettre à jour l'état vocal
   */
  createUpdateVoiceStateUseCase() {
    const voiceRepository = this.createVoiceConnectionRepository();
    return new UpdateVoiceStateUseCase(voiceRepository);
  }

  /**
   * Créer le Use Case pour récupérer les utilisateurs d'un voice channel
   */
  createGetChannelVoiceUsersUseCase() {
    const voiceRepository = this.createVoiceConnectionRepository();
    return new GetChannelVoiceUsersUseCase(voiceRepository, this.prisma);
  }

  // ============ FRIENDS / DIRECT USE CASES ============

  createRequestFriendUseCase() {
    const friendshipRepository = this.createFriendshipRepository();
    const userRepository = this.createUserRepository();
    return new RequestFriendUseCase(friendshipRepository, userRepository);
  }

  createAcceptFriendUseCase() {
    const friendshipRepository = this.createFriendshipRepository();
    return new AcceptFriendUseCase(friendshipRepository);
  }

  createListFriendsUseCase() {
    const friendshipRepository = this.createFriendshipRepository();
    return new ListFriendsUseCase(friendshipRepository);
  }

  createListFriendRequestsUseCase() {
    const friendshipRepository = this.createFriendshipRepository();
    return new ListFriendRequestsUseCase(friendshipRepository);
  }

  createDirectConversationUseCase() {
    const conversationRepository = this.createDirectConversationRepository();
    const friendshipRepository = this.createFriendshipRepository();
    return new CreateOrGetDirectConversationUseCase(conversationRepository, friendshipRepository);
  }

  createListDirectConversationsUseCase() {
    const conversationRepository = this.createDirectConversationRepository();
    return new ListDirectConversationsUseCase(conversationRepository);
  }

  createGetDirectConversationUseCase() {
    const conversationRepository = this.createDirectConversationRepository();
    return new GetDirectConversationUseCase(conversationRepository);
  }

  createSendDirectMessageUseCase() {
    const messageRepository = this.createDirectMessageRepository();
    const conversationRepository = this.createDirectConversationRepository();
    return new SendDirectMessageUseCase(messageRepository, conversationRepository);
  }

  createGetDirectMessagesUseCase() {
    const messageRepository = this.createDirectMessageRepository();
    const conversationRepository = this.createDirectConversationRepository();
    return new GetDirectMessagesUseCase(messageRepository, conversationRepository);
  }

  /**
   * Fermer la connexion Prisma
   */
  async shutdown(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
