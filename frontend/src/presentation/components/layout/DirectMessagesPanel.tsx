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
import { useRouter } from 'next/navigation';
import { useDirectConversations } from '@application/direct/useDirectConversations';
import { friendsApi } from '@infrastructure/api/friends.api';
import { logger } from '@shared/utils/logger';
import { Modal } from '@presentation/components/common/Modal';
import { useLocale } from '@shared/hooks/useLocale';

interface DirectMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  isOnline?: boolean;
}

interface DirectMessagesPanelProps {
  messages?: DirectMessage[];
  activeView?: 'messages' | 'friends';
}

/**
 * Composant DirectMessagesPanel
 * Réplique exacte du design Discord - Panel Messages
 * Contenu uniquement, le wrapper responsive est géré par ResponsiveSidebar
 */
function formatConversationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - msgDay.getTime()) / 86_400_000);

  if (diffDays === 0) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return 'Hier';
  }
  if (diffDays < 7) {
    const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  }
  return date.toLocaleDateString('fr-FR');
}

export function DirectMessagesPanel({
  messages = [],
  activeView = 'messages'
}: DirectMessagesPanelProps): React.ReactNode {
  const router = useRouter();
  const [view, setView] = useState<'messages' | 'friends'>(activeView);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendError, setFriendError] = useState<string | null>(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const { conversations, reload } = useDirectConversations();
  const { locale, setLocale, t } = useLocale();

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
    } catch (err) {
      logger.error('Failed to request friend', err);
      setFriendError(t('dm.errors.sendRequest'));
    } finally {
      setFriendLoading(false);
    }
  };

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
          {t('dm.messages')}
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
          {t('dm.friends')}
        </button>
        <button
          onClick={() => {
            setView('friends');
            setShowAddFriend(true);
          }}
          className="ml-1 flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label={t('nav.addFriend')}
          title={t('nav.addFriend')}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12ZM7 10C8.66 10 10 8.66 10 7C10 5.34 8.66 4 7 4C5.34 4 4 5.34 4 7C4 8.66 5.34 10 7 10ZM7 12C4.33 12 0 13.34 0 16V18H10V16C10 13.34 5.67 12 7 12ZM15 14C12.33 14 8 15.34 8 18V20H22V18C22 15.34 17.67 14 15 14ZM20 8V6H18V8H16V10H18V12H20V10H22V8H20Z"/>
          </svg>
        </button>
      </div>

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
                  {/* Online Status */}
                  {false && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
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
                        {formatConversationTime(conversation.updatedAt)}
                      </span>
                    )}
                  </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {t('dm.privateConversation')}
                    </p>
                </div>

                {/* Pin Icon (Blue) */}
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15096 9.87801L5.73596 8.46401L4.32196 9.87801L8.56496 14.121L2.14296 20.543L3.55696 21.957L9.97896 15.535L14.222 19.778L15.636 18.364L14.222 16.95L19.171 12L20.586 13.414L22 12Z" />
                  </svg>
                </div>

                {/* Unread Badge */}
                {false && (
                  <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      1
                    </span>
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t('dm.noMessages')}
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col h-full px-4 py-4 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Conversations privées</h3>
                <p className="text-xs text-muted-foreground">Retrouvez toutes vos discussions privées ici</p>
              </div>
              <button
                onClick={() => setShowAddFriend(true)}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
              >
                {t('dm.add')}
              </button>
            </div>

            {filteredConversations.length > 0 ? (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => router.push(`/messages/${conversation.id}`)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
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

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">
                          {conversation.user?.username || 'Utilisateur'}
                        </span>
                        {conversation.updatedAt && (
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
                            {formatConversationTime(conversation.updatedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {t('dm.privateConversation')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Aucune conversation privée pour le moment</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Language switcher */}
      <div className="p-2 border-t border-border">
        <button
          type="button"
          onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label={t('language.label')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          {locale === 'fr' ? t('language.fr') : t('language.en')}
        </button>
      </div>

      <Modal
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        title={t('dm.modal.title')}
        footer={(
          <>
            <button
              onClick={() => setShowAddFriend(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t('dm.modal.cancel')}
            </button>
            <button
              onClick={handleAddFriend}
              disabled={friendLoading || !friendUsername.trim()}
              className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg disabled:opacity-60"
            >
              {t('dm.modal.send')}
            </button>
          </>
        )}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t('dm.modal.description')}
          </p>
          <input
            type="text"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            placeholder={t('dm.modal.placeholder')}
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

