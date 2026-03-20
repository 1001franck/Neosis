/**
 * DIRECT MESSAGES PANEL COMPONENT
 * Panel central avec Messages/Friends et liste des conversations
 * 
 * Responsabilités:
 * - Afficher onglets Messages/Friends
 * - Lister les conversations directes
 * - Actions search et create
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDirectConversations } from '@application/direct/useDirectConversations';
import { friendsApi } from '@infrastructure/api/friends.api';
import { directApi } from '@infrastructure/api/direct.api';
import { logger } from '@shared/utils/logger';
import { Modal } from '@presentation/components/common/Modal';
import type { Friend, FriendRequests } from '@domain/direct/types';

interface DirectMessagesPanelProps {
  activeView?: 'messages' | 'friends';
}

/**
 * Formate une date en temps relatif (ex: "il y a 2h", "hier", "lun.")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

/**
 * Composant DirectMessagesPanel
 * Réplique exacte du design Discord - Panel Messages
 * Contenu uniquement, le wrapper responsive est géré par ResponsiveSidebar
 */
export function DirectMessagesPanel({
  activeView = 'messages'
}: DirectMessagesPanelProps): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'messages' | 'friends'>(activeView);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendError, setFriendError] = useState<string | null>(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const { conversations, reload } = useDirectConversations();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequests>({ incoming: [], outgoing: [] });
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState<string | null>(null);

  const filteredConversations = conversations.filter((conv) =>
    (conv.user?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) return;
    setFriendLoading(true);
    setFriendError(null);
    try {
      await friendsApi.requestFriend(friendUsername.trim());
      setShowAddFriend(false);
      setFriendUsername('');
      await loadFriends();
    } catch (err) {
      logger.error('Failed to request friend', err);
      setFriendError('Impossible d\'envoyer la demande');
    } finally {
      setFriendLoading(false);
    }
  };

  const loadFriends = async () => {
    setFriendsLoading(true);
    setFriendsError(null);
    try {
      const [friendsData, requestsData] = await Promise.all([
        friendsApi.listFriends(),
        friendsApi.listRequests(),
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (err) {
      logger.error('Failed to load friends', err);
      setFriendsError('Impossible de charger les amis');
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    try {
      await friendsApi.acceptFriend(friendshipId);
      await loadFriends();
    } catch (err) {
      logger.error('Failed to accept friend', err);
      setFriendsError('Impossible d\'accepter la demande');
    }
  };

  const handleStartConversation = async (userId?: string) => {
    if (!userId) return;
    try {
      const convo = await directApi.createConversation(userId);
      await reload();
      router.push(`/messages/${convo.id}`);
    } catch (err) {
      logger.error('Failed to start conversation', err);
      setFriendsError('Impossible de demarrer la conversation');
    }
  };

  useEffect(() => {
    loadFriends().catch(() => {});
  }, []);

  useEffect(() => {
    const shouldOpen = searchParams?.get('addFriend') === '1';
    if (shouldOpen) {
      setView('friends');
      setShowAddFriend(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = () => {
      setView('friends');
      setShowAddFriend(true);
    };
    window.addEventListener('friends:add', handler);
    return () => window.removeEventListener('friends:add', handler);
  }, []);

  return (
    <>
      {/* Header with Tabs */}
      <div className="flex items-center px-2 h-12 border-b border-border shadow-sm gap-2">
        <button
          onClick={() => setView('messages')}
          className={`
            flex-1 px-4 py-1.5 text-sm font-semibold rounded
            transition-colors
            ${view === 'messages'
              ? 'text-foreground bg-muted'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }
          `}
        >
          Messages
        </button>
        <button
          onClick={() => setView('friends')}
          className={`
            flex-1 px-4 py-1.5 text-sm font-semibold rounded
            transition-colors
            ${view === 'friends'
              ? 'text-foreground bg-muted'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }
          `}
        >
          Amis
        </button>
        <button
          onClick={() => {
            setView('friends');
            setShowAddFriend(true);
          }}
          className="ml-1 flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label="Ajouter un ami"
          title="Ajouter un ami"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12ZM7 10C8.66 10 10 8.66 10 7C10 5.34 8.66 4 7 4C5.34 4 4 5.34 4 7C4 8.66 5.34 10 7 10ZM7 12C4.33 12 0 13.34 0 16V18H10V16C10 13.34 5.67 12 7 12ZM15 14C12.33 14 8 15.34 8 18V20H22V18C22 15.34 17.67 14 15 14ZM20 8V6H18V8H16V10H18V12H20V10H22V8H20Z"/>
          </svg>
        </button>
      </div>

      {/* Barre de recherche — visible uniquement dans l'onglet messages */}
      {view === 'messages' && (
        <div className="px-2 py-2 border-b border-border">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full px-3 py-1.5 text-sm rounded-md bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        {view === 'messages' ? (
          filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => router.push(`/messages/${conversation.id}`)}
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-secondary transition-colors group"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {conversation.user?.avatarUrl ? (
                    <img
                      src={conversation.user.avatarUrl}
                      alt={conversation.user?.username || 'Utilisateur'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-foreground">
                        {(conversation.user?.username || '?').substring(0, 1).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {conversation.user?.username || 'Utilisateur'}
                    </span>
                    {conversation.updatedAt && (
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
                        {formatRelativeTime(conversation.updatedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Message privé
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun message pour le moment
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col h-full px-4 py-4 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Amis</h3>
                <p className="text-xs text-muted-foreground">Gerez vos demandes et discussions privees</p>
              </div>
              <button
                onClick={() => setShowAddFriend(true)}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
              >
                Ajouter
              </button>
            </div>

            {friendsError && (
              <div className="text-xs text-red-500">{friendsError}</div>
            )}

            {friendsLoading ? (
              <div className="text-sm text-muted-foreground">Chargement...</div>
            ) : (
              <>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Demandes entrantes
                  </h4>
                  {requests.incoming.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune demande en attente</p>
                  ) : (
                    requests.incoming.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between px-3 py-2 bg-secondary/40 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {request.user?.avatarUrl ? (
                            <img
                              src={request.user.avatarUrl}
                              alt={request.user.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary-foreground">
                                {(request.user?.username || '?').substring(0, 1).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-foreground">
                            {request.user?.username || 'Utilisateur'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAcceptFriend(request.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/90 text-white rounded-lg"
                        >
                          Accepter
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Demandes envoyees
                  </h4>
                  {requests.outgoing.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune demande envoyee</p>
                  ) : (
                    requests.outgoing.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between px-3 py-2 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {request.user?.avatarUrl ? (
                            <img
                              src={request.user.avatarUrl}
                              alt={request.user.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-semibold text-foreground">
                                {(request.user?.username || '?').substring(0, 1).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-foreground">
                            {request.user?.username || 'Utilisateur'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">En attente</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Vos amis
                  </h4>
                  {friends.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Ajoutez un ami pour commencer une discussion privee.
                    </p>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {friend.user?.avatarUrl ? (
                            <img
                              src={friend.user.avatarUrl}
                              alt={friend.user.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary-foreground">
                                {(friend.user?.username || '?').substring(0, 1).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-foreground">
                            {friend.user?.username || 'Utilisateur'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleStartConversation(friend.user?.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg"
                        >
                          Message
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        title="Ajouter un ami"
        footer={(
          <>
            <button
              onClick={() => setShowAddFriend(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Annuler
            </button>
            <button
              onClick={handleAddFriend}
              disabled={friendLoading || !friendUsername.trim()}
              className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg disabled:opacity-60"
            >
              Envoyer
            </button>
          </>
        )}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Entrez le nom d'utilisateur exact pour envoyer une demande.
          </p>
          <input
            type="text"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {friendError && (
            <p className="text-sm text-red-500">{friendError}</p>
          )}
        </div>
      </Modal>
    </>
  );
}

