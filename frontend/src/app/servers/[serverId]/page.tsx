/**
 * SERVER PAGE
 * Page principale pour l'affichage d'un serveur avec ses channels
 * Connectée au backend via les hooks application
 * 
 * Route: /servers/[serverId]
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChannelView } from '@presentation/components/layout/ChannelView';
import { useServers } from '@application/servers/useServers';
import { useChannels } from '@application/channels/useChannels';
import { useChannelStore } from '@application/channels/channelStore';
import { useMembers } from '@application/members/useMembers';
import { useMessages } from '@application/messages/useMessages';
import { useMessageStore } from '@application/messages/messageStore';
import { MessageStatus } from '@domain/messages/types';
import { useAuth } from '@application/auth/useAuth';
import { useVoice } from '@application/voice/useVoice';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { VoiceMiniPanel } from '@presentation/components/voice/VoiceMiniPanel';
import { logger } from '@shared/utils/logger';
import type { Message as PresentationMessage } from '@presentation/components/chat/MessageList';
import { MemberRole } from '@domain/members/types';
import { ChannelType } from '@domain/channels/types';
import { socketEmitters } from '@infrastructure/websocket/emitters';
import { uploadApi } from '@infrastructure/api/upload.api';
import { serversApi } from '@infrastructure/api/servers.api';
import { toastBus } from '@shared/utils/toastBus';
import type { ChannelMedia, ChannelLink } from '@presentation/components/channels/types';

interface ServerPageProps {
  params: Promise<{ serverId: string }>;
}

export default function ServerPage({ params }: ServerPageProps): React.ReactNode {
  const { serverId } = use(params);

  // === HOOKS ===
  const { user, logout } = useAuth();
  const { servers, currentServer, getServers, getServer, leaveServer, deleteServer, createServer, joinServer, isLoading: serversLoading } = useServers();
  const { channels, listChannels, createChannel, updateChannel, deleteChannel } = useChannels();
  const resetChannels = useChannelStore((state) => state.reset);
  const { members, loadMembers, changeRole, transferOwnership, kickMember, banMember } = useMembers();
  const { messages, loadMessages } = useMessages();
  const resetMessages = useMessageStore((state) => state.reset);
  const addOptimisticMessage = useMessageStore((state) => state.addOptimisticMessage);
  const addChannelUser = useMessageStore((state) => state.addChannelUser);
  const removeChannelUser = useMessageStore((state) => state.removeChannelUser);
  const clearMentions = useMessageStore((state) => state.clearMentions);
  const router = useRouter();
  const { joinVoiceChannel } = useVoice();

  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const prevChannelIdRef = useRef<string>('');
  const loadMessagesRef = useRef(loadMessages);

  useEffect(() => {
    loadMessagesRef.current = loadMessages;
  }, [loadMessages]);

  // === SOCKET ROOM MANAGEMENT ===
  // Join server room on mount, leave on unmount
  useEffect(() => {
    if (serverId) {
      socketEmitters.joinServer(serverId);
      logger.debug('Joined server room', { serverId });
    }
    return () => {
      if (serverId) {
        socketEmitters.leaveServer(serverId);
        logger.debug('Left server room', { serverId });
      }
    };
  }, [serverId]);

  // Join/leave channel rooms when activeChannelId changes
  useEffect(() => {
    const prevChannelId = prevChannelIdRef.current;

    if (prevChannelId && prevChannelId !== activeChannelId) {
      socketEmitters.leaveChannel(prevChannelId);
      logger.debug('Left channel room', { channelId: prevChannelId });
      if (user?.id) removeChannelUser(prevChannelId, user.id);
    }

    if (activeChannelId) {
      socketEmitters.joinChannel(activeChannelId);
      logger.debug('Joined channel room', { channelId: activeChannelId });
      if (user?.id) addChannelUser(activeChannelId, user.id);
    }

    prevChannelIdRef.current = activeChannelId;

    return () => {
      // Cleanup on unmount: leave current channel
      if (activeChannelId) {
        socketEmitters.leaveChannel(activeChannelId);
        if (user?.id) removeChannelUser(activeChannelId, user.id);
      }
    };
  }, [activeChannelId, user?.id, addChannelUser, removeChannelUser]);

  // === BAN STATUS ===
  const [banInfo, setBanInfo] = useState<{ expiresAt?: string | null; reason?: string | null } | undefined>(undefined);
  // Set des userId actuellement bannis temporairement (pour badge visuel dans la sidebar)
  const [bannedUserIds, setBannedUserIds] = useState<Set<string>>(new Set());

  // Écouter les événements de ban/kick en temps réel
  useEffect(() => {
    const handleKicked = (e: Event) => {
      const { serverId: kickedServerId } = (e as CustomEvent).detail;
      if (kickedServerId === serverId) {
        router.push('/neosis');
      }
    };

    const handleBanned = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        serverId: string;
        isPermanent: boolean;
        expiresAt: string | null;
        reason: string | null;
      };
      if (detail.serverId !== serverId) return;

      if (detail.isPermanent) {
        router.push('/neosis');
      } else {
        setBanInfo({ expiresAt: detail.expiresAt, reason: detail.reason });
      }
    };

    window.addEventListener('neosis:server_kicked', handleKicked);
    window.addEventListener('neosis:server_banned', handleBanned);
    return () => {
      window.removeEventListener('neosis:server_kicked', handleKicked);
      window.removeEventListener('neosis:server_banned', handleBanned);
    };
  }, [serverId, router]);

  // === CHANNEL MODAL STATE ===
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<ChannelType>(ChannelType.TEXT);
  const [channelModalError, setChannelModalError] = useState<string | null>(null);
  const [channelModalLoading, setChannelModalLoading] = useState(false);
  const [channelMedia, setChannelMedia] = useState<ChannelMedia[]>([]);
  const [channelLinks, setChannelLinks] = useState<ChannelLink[]>([]);
  const [channelFiles, setChannelFiles] = useState<ChannelMedia[]>([]);
  const [, setMediaLoading] = useState(false);

  // === SERVER MODAL STATE ===
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [createServerName, setCreateServerName] = useState('');
  const [createServerDesc, setCreateServerDesc] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [serverModalError, setServerModalError] = useState<string | null>(null);
  const [serverModalLoading, setServerModalLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // === DATA LOADING ===
  // Reset active channel and channel list when switching servers
  useEffect(() => {
    if (serverId) {
      resetChannels();
      resetMessages();
      setActiveChannelId('');
      getServer(serverId).catch(() => {
        toastBus.emit({ type: 'error', message: 'Impossible de charger le serveur' });
      });
      getServers().catch(() => {
        logger.error('Échec du chargement des serveurs');
      });
      listChannels(serverId).catch(() => {
        toastBus.emit({ type: 'error', message: 'Impossible de charger les canaux' });
      });
      loadMembers(serverId).catch(() => {
        logger.error('Échec du chargement des membres');
      });
      // Vérifier si l'utilisateur est banni temporairement
      serversApi.getMyBanStatus(serverId)
        .then((status) => {
          if (status.isBanned && !status.isPermanent) {
            setBanInfo({ expiresAt: status.expiresAt, reason: status.reason });
          } else {
            setBanInfo(undefined);
          }
        })
        .catch(() => setBanInfo(undefined));
      // Récupérer les bans actifs pour les badges visuels
      serversApi.getServerBans(serverId)
        .then((bans) => setBannedUserIds(new Set(bans.map(b => b.userId))))
        .catch(() => setBannedUserIds(new Set()));
    }
  }, [serverId, resetChannels, resetMessages]);

  // Sélectionner le channel 'general' du serveur courant si présent, sinon le premier channel text
  useEffect(() => {
    if (channels.length === 0) return;

    const activeIsValid = !!activeChannelId && channels.some(c => c.id === activeChannelId);
    if (activeIsValid) return;

    // Cherche le channel nommé 'general' (insensible à la casse)
    const general = channels.find(c => c.name.toLowerCase() === 'general' && c.type === ChannelType.TEXT);
    if (general) {
      setActiveChannelId(general.id);
      return;
    }

    const firstText = channels.find(c => c.type === ChannelType.TEXT) || channels[0];
    if (firstText) {
      setActiveChannelId(firstText.id);
    }
  }, [channels, activeChannelId]);

  // Charger les messages quand le channel actif change
  useEffect(() => {
    const activeIsValid = !!activeChannelId && channels.some(c => c.id === activeChannelId);
    if (activeIsValid) {
      loadMessagesRef.current(activeChannelId).catch(() => {});
    }
  }, [activeChannelId, channels]);

  // Effacer les mentions quand on ouvre un channel
  useEffect(() => {
    if (activeChannelId) {
      clearMentions(activeChannelId);
    }
  }, [activeChannelId, clearMentions]);

  // Charger les medias/liens/fichiers quand le channel actif change
  useEffect(() => {
    if (!activeChannelId) {
      setChannelMedia([]);
      setChannelLinks([]);
      setChannelFiles([]);
      return;
    }

    setMediaLoading(true);
    uploadApi.getChannelMedia(activeChannelId)
      .then((data) => {
        const mediaItems: ChannelMedia[] = data.media.map(item => ({
          id: item.id,
          type: item.type,
          url: item.url,
          name: item.name,
          size: item.size,
          uploadedBy: item.uploadedBy,
          uploadedAt: new Date(item.uploadedAt),
        }));

        const fileItems: ChannelMedia[] = data.files.map(item => ({
          id: item.id,
          type: 'file',
          url: item.url,
          name: item.name,
          size: item.size,
          uploadedBy: item.uploadedBy,
          uploadedAt: new Date(item.uploadedAt),
        }));

        const linkItems: ChannelLink[] = data.links.map(item => ({
          id: item.id,
          url: item.url,
          title: item.title || item.url,
          postedBy: item.postedBy,
          postedAt: new Date(item.postedAt),
        }));

        setChannelMedia(mediaItems);
        setChannelFiles(fileItems);
        setChannelLinks(linkItems);
      })
      .catch((err) => {
        logger.error('Failed to load channel media', err);
        setChannelMedia([]);
        setChannelFiles([]);
        setChannelLinks([]);
      })
      .finally(() => {
        setMediaLoading(false);
      });
  }, [activeChannelId]);

  // === CALLBACKS ===
  const handleChannelClick = useCallback((channelId: string): void => {
    setActiveChannelId(channelId);
    logger.debug('Channel switched', { channelId });
  }, []);

  const handleSendMessage = useCallback((content: string, attachmentIds?: string[]): void => {
    if (!activeChannelId || !user?.id) return;
    const clientTempId = `temp-${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    addOptimisticMessage({
      id: clientTempId,
      clientTempId,
      channelId: activeChannelId,
      authorId: user.id,
      content,
      attachments: [],
      reactions: [],
      status: MessageStatus.SENDING,
      createdAt: nowIso,
      updatedAt: nowIso,
      author: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    });

    socketEmitters.sendMessage({ content, channelId: activeChannelId, attachmentIds, clientTempId });
    logger.debug('Message sent via socket', { channelId: activeChannelId, attachmentIds, clientTempId });
  }, [activeChannelId, user?.id, user?.username, user?.avatar, addOptimisticMessage]);

  const handleMemberClick = useCallback((memberId: string): void => {
    logger.debug('Member clicked', { memberId });
  }, []);

  const handleLeaveServer = useCallback(async (): Promise<void> => {
    if (!confirm('Voulez-vous vraiment quitter ce serveur ?')) return;
    try {
      // Leave socket rooms before HTTP call
      if (activeChannelId) socketEmitters.leaveChannel(activeChannelId);
      socketEmitters.leaveServer(serverId);
      await leaveServer(serverId);
      router.push('/neosis');
    } catch (err) {
      logger.error('Failed to leave server', err);
    }
  }, [serverId, activeChannelId, leaveServer, router]);

  const handleEditMessage = useCallback((messageId: string, content: string): void => {
    if (!activeChannelId) return;
    socketEmitters.updateMessage({ messageId, content, channelId: activeChannelId });
    logger.debug('Message edit sent via socket', { messageId, channelId: activeChannelId });
  }, [activeChannelId]);

  const handleDeleteMessage = useCallback((messageId: string, scope: 'me' | 'everyone' = 'everyone'): void => {
    if (!activeChannelId) return;
    socketEmitters.deleteMessage({ messageId, channelId: activeChannelId, scope });
    logger.debug('Message delete sent via socket', { messageId, channelId: activeChannelId, scope });
  }, [activeChannelId]);

  const handleAddChannel = useCallback((_categoryId: string): void => {
    setShowCreateChannel(true);
  }, []);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawName = newChannelName.trim();
    if (!rawName) return;
    setChannelModalError(null);
    setChannelModalLoading(true);
    try {
      const normalizedName = rawName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9_-]/g, '');

      if (!normalizedName) {
        setChannelModalError('Le nom du salon ne peut contenir que des lettres, chiffres, tirets et underscores.');
        setChannelModalLoading(false);
        return;
      }

      if (normalizedName !== rawName) {
        setNewChannelName(normalizedName);
      }

      await createChannel(serverId, { name: normalizedName, type: newChannelType });
      setShowCreateChannel(false);
      setNewChannelName('');
      setNewChannelType(ChannelType.TEXT);
      // Refresh channels list
      await listChannels(serverId);
    } catch (err) {
      const anyErr = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const message = anyErr.response?.data?.error?.message || anyErr.message || 'Erreur lors de la création du channel';
      setChannelModalError(message);
    } finally {
      setChannelModalLoading(false);
    }
  };

  const handleChangeRole = useCallback(async (memberId: string, role: MemberRole): Promise<void> => {
    try {
      await changeRole(serverId, memberId, { role });
      // Refresh members list
      await loadMembers(serverId);
    } catch (err) {
      logger.error('Failed to change member role', err);
    }
  }, [serverId, changeRole, loadMembers]);

  const handleTransferOwnership = useCallback(async (memberId: string): Promise<void> => {
    try {
      await transferOwnership(serverId, memberId);
      await loadMembers(serverId);
    } catch (err) {
      logger.error('Failed to transfer ownership', err);
    }
  }, [serverId, transferOwnership, loadMembers]);

  const handleKickMember = useCallback(async (memberId: string): Promise<void> => {
    try {
      await kickMember(serverId, memberId);
      await loadMembers(serverId);
    } catch (err) {
      logger.error('Failed to kick member', err);
    }
  }, [serverId, kickMember, loadMembers]);

  const handleBanMember = useCallback(async (memberId: string, durationHours?: number | null, reason?: string): Promise<void> => {
    try {
      await banMember(serverId, memberId, durationHours, reason);
      await loadMembers(serverId);
      // Rafraîchir les badges de ban après un bannissement temporaire
      if (durationHours !== null && durationHours !== undefined) {
        serversApi.getServerBans(serverId)
          .then((bans) => setBannedUserIds(new Set(bans.map(b => b.userId))))
          .catch(() => {});
      }
    } catch (err) {
      logger.error('Failed to ban member', err);
    }
  }, [serverId, banMember, loadMembers]);

  const handleTypingStart = useCallback((): void => {
    if (activeChannelId) {
      socketEmitters.typingStarted(activeChannelId);
    }
  }, [activeChannelId]);

  const handleTypingStop = useCallback((): void => {
    if (activeChannelId) {
      socketEmitters.typingStopped(activeChannelId);
    }
  }, [activeChannelId]);

  const handleDeleteServer = useCallback(async (): Promise<void> => {
    if (!confirm('Voulez-vous vraiment supprimer ce serveur ? Cette action est irréversible.')) return;
    try {
      await deleteServer(serverId);
      router.push('/neosis');
    } catch (err) {
      logger.error('Failed to delete server', err);
    }
  }, [serverId, deleteServer, router]);

  const handleCopyInviteCode = useCallback((): void => {
    const inviteCode = currentServer?.inviteCode;
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode).then(() => {
        logger.info('Invite code copied', { inviteCode });
      }).catch(() => {
        logger.error('Failed to copy invite code');
      });
    }
  }, [currentServer]);

  // === SERVER CREATE / JOIN / LOGOUT HANDLERS ===
  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createServerName.trim()) return;
    setServerModalError(null);
    setServerModalLoading(true);
    try {
      const server = await createServer({ name: createServerName.trim(), description: createServerDesc.trim() || undefined });
      setShowCreateServer(false);
      setCreateServerName('');
      setCreateServerDesc('');
      router.push(`/servers/${server.id}`);
    } catch (err) {
      setServerModalError((err as Error).message || 'Erreur lors de la création');
    } finally {
      setServerModalLoading(false);
    }
  };

  const handleJoinServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInviteCode.trim()) return;
    setServerModalError(null);
    setServerModalLoading(true);
    try {
      const server = await joinServer(joinInviteCode.trim());
      setShowJoinServer(false);
      setJoinInviteCode('');
      router.push(`/servers/${server.id}`);
    } catch (err) {
      setServerModalError((err as Error).message || "Code d'invitation invalide");
    } finally {
      setServerModalLoading(false);
    }
  };

  const closeServerModals = () => {
    setShowCreateServer(false);
    setShowJoinServer(false);
    setServerModalError(null);
    setCreateServerName('');
    setCreateServerDesc('');
    setJoinInviteCode('');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch {
      router.push('/');
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleDeleteChannel = useCallback(async (channelId: string): Promise<void> => {
    if (!confirm('Voulez-vous vraiment supprimer ce channel ?')) return;
    try {
      await deleteChannel(channelId);
      if (channelId === activeChannelId) {
        setActiveChannelId('');
      }
      await listChannels(serverId);
    } catch (err) {
      logger.error('Failed to delete channel', err);
    }
  }, [activeChannelId, deleteChannel, listChannels, serverId]);

  const handleEditChannel = useCallback(async (channelId: string, name: string): Promise<void> => {
    try {
      await updateChannel(channelId, { name });
      await listChannels(serverId);
    } catch (err) {
      logger.error('Failed to update channel', err);
    }
  }, [updateChannel, listChannels, serverId]);

  const handleJoinVoice = useCallback(async (channelId: string): Promise<void> => {
    try {
      await joinVoiceChannel(channelId);
      logger.info('Joined voice channel', { channelId });
    } catch (err) {
      logger.error('Failed to join voice channel', err);
    }
  }, [joinVoiceChannel]);

  // Determine current user's role in this server
  const currentUserRole = members.find(m => m.userId === user?.id)?.role as MemberRole | undefined;

  // === TYPING USERS ===
  const typingUsers = useMessageStore((state) => state.typingUsers);
  const typingUsernames = useMemo(() => {
    const typingMap = typingUsers.get(activeChannelId);
    if (!typingMap) return [] as string[];
    return Array.from(typingMap.values())
      .filter(t => t.userId !== user?.id)
      .map(t => t.username);
  }, [typingUsers, activeChannelId, user?.id]);

  // === MAP domain messages → presentation messages ===
  const presentationMessages: PresentationMessage[] = messages.map(msg => ({
    id: msg.id,
    userId: msg.authorId,
    username: msg.author?.username || 'Unknown',
    avatar: msg.author?.avatar,
    content: msg.content,
    timestamp: new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    createdAt: new Date(msg.createdAt),
    updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : undefined,
    isCurrentUser: msg.authorId === user?.id,
    isEdited: !!(msg.updatedAt && msg.createdAt !== msg.updatedAt),
    status: msg.status as PresentationMessage['status'],
    deletedBy: msg.deletedBy,
    deletedByUserId: msg.deletedByUserId,
    deletedByRole: (msg as { deletedByRole?: PresentationMessage['deletedByRole'] }).deletedByRole,
    attachments: msg.attachments,
  }));

  // === LOADING STATE ===
  if (serversLoading && !currentServer) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Chargement du serveur...</p>
      </div>
    );
  }

  if (!currentServer) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Serveur introuvable</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <ChannelView
        server={{
          current: currentServer,
          all: servers,
          activeServerId: currentServer.id,
        }}
        channels={{
          list: channels,
          categories: [],
          activeChannelId,
          media: channelMedia,
          files: channelFiles,
          links: channelLinks,
        }}
        members={{
          list: members,
          currentUserRole,
          bannedUserIds,
        }}
        messages={presentationMessages}
        typingUsernames={typingUsernames}
        currentUserId={user?.id}
        user={user ? { username: user.username, avatar: user.avatar, customStatus: user.customStatus ?? undefined, statusEmoji: user.statusEmoji ?? undefined } : undefined}
        banInfo={banInfo}
        callbacks={{
          onChannelClick: handleChannelClick,
          onServerClick: (id) => router.push(`/servers/${id}`),
          onServerMenuClick: () => logger.debug('Server menu clicked'),
          onSendMessage: handleSendMessage,
          onMemberClick: handleMemberClick,
          onLeaveServer: handleLeaveServer,
          onAddChannel: handleAddChannel,
          onEditMessage: handleEditMessage,
          onDeleteMessage: handleDeleteMessage,
          onChangeRole: handleChangeRole,
          onTransferOwnership: handleTransferOwnership,
          onTypingStart: handleTypingStart,
          onTypingStop: handleTypingStop,
          onDeleteServer: handleDeleteServer,
          onCopyInviteCode: handleCopyInviteCode,
          onDeleteChannel: handleDeleteChannel,
          onEditChannel: handleEditChannel,
          onKickMember: handleKickMember,
          onBanMember: handleBanMember,
          onCreateServer: () => setShowCreateServer(true),
          onJoinServer: () => setShowJoinServer(true),
          onSettings: () => router.push('/settings'),
          onLogout: () => setShowLogoutModal(true),
          onJoinVoice: handleJoinVoice,
        }}
      />

      {/* === MODAL : Créer un channel === */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateChannel(false)}>
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-4">Créer un channel</h3>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nom du channel *</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="general"
                  required
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  disabled={channelModalLoading}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="channelType"
                      value="text"
                      checked={newChannelType === ChannelType.TEXT}
                      onChange={() => setNewChannelType(ChannelType.TEXT)}
                      disabled={channelModalLoading}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground">Texte</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="channelType"
                      value="voice"
                      checked={newChannelType === ChannelType.VOICE}
                      onChange={() => setNewChannelType(ChannelType.VOICE)}
                      disabled={channelModalLoading}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground">Vocal</span>
                  </label>
                </div>
              </div>
              {channelModalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">{channelModalError}</div>
              )}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreateChannel(false)} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors" disabled={channelModalLoading}>
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors" disabled={channelModalLoading || !newChannelName.trim()}>
                  {channelModalLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL : Créer un serveur === */}
      {showCreateServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeServerModals}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-foreground mb-5">Créer un serveur</h3>
            <form onSubmit={handleCreateServer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Nom du serveur *</label>
                <input
                  type="text"
                  value={createServerName}
                  onChange={(e) => setCreateServerName(e.target.value)}
                  placeholder="Mon serveur"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  disabled={serverModalLoading}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Description (optionnel)</label>
                <input
                  type="text"
                  value={createServerDesc}
                  onChange={(e) => setCreateServerDesc(e.target.value)}
                  placeholder="Description du serveur"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  disabled={serverModalLoading}
                />
              </div>
              {serverModalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{serverModalError}</div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeServerModals} className="px-4 py-2.5 text-muted-foreground hover:text-foreground text-sm transition-colors" disabled={serverModalLoading}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  disabled={serverModalLoading || !createServerName.trim()}
                >
                  {serverModalLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL : Rejoindre un serveur === */}
      {showJoinServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeServerModals}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-foreground mb-5">Rejoindre un serveur</h3>
            <form onSubmit={handleJoinServer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Code d&apos;invitation *</label>
                <input
                  type="text"
                  value={joinInviteCode}
                  onChange={(e) => setJoinInviteCode(e.target.value)}
                  placeholder="Entrez le code d'invitation"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  disabled={serverModalLoading}
                  autoFocus
                />
              </div>
              {serverModalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{serverModalError}</div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeServerModals} className="px-4 py-2.5 text-muted-foreground hover:text-foreground text-sm transition-colors" disabled={serverModalLoading}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  disabled={serverModalLoading || !joinInviteCode.trim()}
                >
                  {serverModalLoading ? 'Connexion...' : 'Rejoindre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL : Déconnexion === */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowLogoutModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center">Se déconnecter ?</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-foreground bg-secondary border border-border hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === VOICE MINI PANEL === */}
      <VoiceMiniPanel />
    </ProtectedRoute>
  );
}
