'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDirectConversations } from '@application/direct/useDirectConversations';
import { useFriends } from '@application/direct/useFriends';
import { directApi } from '@infrastructure/api/direct.api';
import { logger } from '@shared/utils/logger';
import { useLocale } from '@shared/hooks/useLocale';
import { useScrollbarVisibility } from '@shared/hooks/useScrollbarVisibility';
import { setLastDmConversationId, toConversationRoute } from '@shared/utils/desktopRoutes';
import type { Friend } from '@domain/direct/types';
import { useAuthStore } from '@application/auth/authStore';

// ─── Helpers ────────────────────────────────────────────────────────────────

function isGifUrl(text: string): boolean {
  const t = text.trim();
  return (
    /^https?:\/\/media\d*\.giphy\.com\/.+\.gif(\?.*)?$/i.test(t) ||
    /^https?:\/\/i\.giphy\.com\/.+\.gif(\?.*)?$/i.test(t) ||
    /^https?:\/\/media\d*\.tenor\.com\/.+\.(gif|mp4)(\?.*)?$/i.test(t)
  );
}

function SentIcon() {
  return (
    <svg className="w-4 h-3 text-muted-foreground flex-shrink-0" viewBox="0 0 24 16" fill="none">
      <path d="M1 9l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatMessagePreview(content: string, isMine: boolean): React.ReactNode {
  const isGif = isGifUrl(content);
  return (
    <span className="flex items-center gap-1 min-w-0">
      {isMine && <SentIcon />}
      {isGif ? (
        <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-muted text-[10px] font-semibold text-muted-foreground leading-none flex-shrink-0">
          GIF
        </span>
      ) : (
        <span className="truncate">{content}</span>
      )}
    </span>
  );
}

function formatConversationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - msgDay.getTime()) / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) {
    const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  }
  return date.toLocaleDateString('fr-FR');
}

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
];

function avatarColor(username: string): string {
  let n = 0;
  for (let i = 0; i < username.length; i++) n += username.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ username, avatarUrl, size = 'md' }: { username: string; avatarUrl?: string | null; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  if (avatarUrl) {
    return <img src={avatarUrl} alt={username} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br ${avatarColor(username)} flex items-center justify-center flex-shrink-0`}>
      <span className="font-bold text-white">{username.charAt(0).toUpperCase()}</span>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{text}</p>
    </div>
  );
}

// ─── Friends view ────────────────────────────────────────────────────────────

type FriendsTab = 'all' | 'pending' | 'add';

function FriendsView() {
  const router = useRouter();
  const { t } = useLocale();
  const [tab, setTab] = useState<FriendsTab>('all');
  const [addUsername, setAddUsername] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { friends, requests, loading, accept, decline, cancel, remove, sendRequest } = useFriends(true);
  const { onScroll } = useScrollbarVisibility();
  const menuRef = useRef<HTMLDivElement>(null);

  const pendingCount = requests.incoming.length;

  // Fermer le menu au clic extérieur
  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

  const handleStartDM = async (friend: Friend) => {
    if (!friend.user) return;
    try {
      const conv = await directApi.createConversation(friend.user.id);
      setLastDmConversationId(conv.id);
      router.push(toConversationRoute(conv.id));
    } catch (err) {
      logger.error('Failed to start DM', err);
    }
  };

  const handleSendRequest = async () => {
    if (!addUsername.trim()) return;
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      await sendRequest(addUsername.trim());
      setAddSuccess(true);
      setAddUsername('');
    } catch (err) {
      logger.error('Failed to send friend request', err);
      setAddError(t('dm.errors.sendRequest'));
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-border/60">
        <button
          onClick={() => setTab('all')}
          className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
            tab === 'all'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          {t('dm.allFriends')} ({friends.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`relative flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
            tab === 'pending'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          {t('dm.pendingTab')}
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('add')}
          className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
            tab === 'add'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          {t('dm.addTab')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-auto" onScroll={onScroll}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <svg className="w-5 h-5 text-muted-foreground animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : tab === 'all' ? (
          /* ── Tous les amis ── */
          friends.length === 0 ? (
            <EmptyState
              icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>}
              text={t('dm.noFriends')}
            />
          ) : (
            <div className="py-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t('dm.yourFriends')} — {friends.length}
              </p>
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="group relative flex items-center gap-2.5 px-2 py-2 mx-1 rounded-lg hover:bg-secondary/70 transition-colors cursor-pointer"
                  onClick={() => handleStartDM(friend)}
                >
                  <Avatar username={friend.user?.username ?? '?'} avatarUrl={friend.user?.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{friend.user?.username ?? 'Utilisateur'}</p>
                    <p className="text-[11px] text-muted-foreground">{t('dm.friendLabel')}</p>
                  </div>
                  {/* Actions au hover */}
                  <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Message */}
                    <button
                      onClick={() => handleStartDM(friend)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                      title={t('dm.message')}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </button>
                    {/* Menu kebab */}
                    <div className="relative" ref={openMenuId === friend.id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === friend.id ? null : friend.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title={t('dm.moreOptions')}
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                      {openMenuId === friend.id && (
                        <div className="absolute right-0 top-8 z-50 w-44 bg-popover border border-border rounded-lg shadow-xl py-1 animate-fadeIn">
                          <button
                            onClick={() => { void remove(friend.id); setOpenMenuId(null); }}
                            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            {t('dm.removeFriend')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'pending' ? (
          /* ── Demandes en attente ── */
          <div className="py-1 space-y-1">
            {/* Reçues */}
            <div>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t('dm.received')} — {requests.incoming.length}
              </p>
              {requests.incoming.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>}
                  text={t('dm.noIncomingRequests')}
                />
              ) : (
                requests.incoming.map((req) => (
                  <div key={req.id} className="flex items-center gap-2.5 px-2 py-2 mx-1 rounded-lg hover:bg-secondary/50 transition-colors">
                    <Avatar username={req.user?.username ?? '?'} avatarUrl={req.user?.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.user?.username ?? 'Utilisateur'}</p>
                      <p className="text-[11px] text-muted-foreground">{t('dm.wantsToAdd')}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => void accept(req.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 transition-colors"
                        title="Accepter"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      </button>
                      <button
                        onClick={() => void decline(req.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        title="Refuser"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Séparateur */}
            <div className="h-px bg-border/40 mx-3" />

            {/* Envoyées */}
            <div>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t('dm.sentRequests')} — {requests.outgoing.length}
              </p>
              {requests.outgoing.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>}
                  text={t('dm.noOutgoingRequests')}
                />
              ) : (
                requests.outgoing.map((req) => (
                  <div key={req.id} className="flex items-center gap-2.5 px-2 py-2 mx-1 rounded-lg hover:bg-secondary/50 transition-colors">
                    <Avatar username={req.user?.username ?? '?'} avatarUrl={req.user?.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.user?.username ?? 'Utilisateur'}</p>
                      <p className="text-[11px] text-amber-500 font-medium">{t('dm.pending')}</p>
                    </div>
                    <button
                      onClick={() => void cancel(req.id)}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title={t('dm.cancelRequest')}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* ── Ajouter un ami ── */
          <div className="px-3 py-4 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground mb-0.5">{t('dm.addFriendTitle')}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {t('dm.addFriendDesc')}
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={addUsername}
                onChange={(e) => { setAddUsername(e.target.value); setAddError(null); setAddSuccess(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSendRequest(); }}
                placeholder={t('dm.addFriendPlaceholder')}
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-colors"
                autoFocus
              />
              <button
                onClick={() => void handleSendRequest()}
                disabled={addLoading || !addUsername.trim()}
                className="px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {addLoading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                )}
              </button>
            </div>
            {addError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {addError}
              </p>
            )}
            {addSuccess && (
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                {t('dm.requestSent')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Messages view ────────────────────────────────────────────────────────────

function MessagesView() {
  const router = useRouter();
  const { t } = useLocale();
  const { conversations } = useDirectConversations();
  const { onScroll } = useScrollbarVisibility();
  const currentUserId = useAuthStore((state) => state.user?.id);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-auto" onScroll={onScroll}>
      {conversations.length > 0 ? (
        <div className="py-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                setLastDmConversationId(conversation.id);
                router.push(toConversationRoute(conversation.id));
              }}
              className="w-full flex items-center gap-2.5 px-2 py-2 mx-1 rounded-lg hover:bg-secondary/70 transition-colors group"
              style={{ width: 'calc(100% - 8px)' }}
            >
              <Avatar
                username={conversation.user?.username ?? '?'}
                avatarUrl={conversation.user?.avatarUrl}
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium text-foreground truncate">
                    {conversation.user?.username ?? 'Utilisateur'}
                  </span>
                  {(conversation.lastMessage?.createdAt ?? conversation.updatedAt) && (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatConversationTime(conversation.lastMessage?.createdAt ?? conversation.updatedAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-[11px] text-muted-foreground min-w-0 overflow-hidden">
                  {conversation.lastMessage
                    ? formatMessagePreview(
                        conversation.lastMessage.content,
                        conversation.lastMessage.senderId === currentUserId
                      )
                    : <span className="truncate">{t('dm.privateConversation')}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">{t('dm.noMessages')}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface DirectMessagesPanelProps {
  activeView?: 'messages' | 'friends';
}

export function DirectMessagesPanel({ activeView = 'messages' }: DirectMessagesPanelProps): React.ReactNode {
  const [view, setView] = useState<'messages' | 'friends'>(activeView);
  const { t, locale, setLocale } = useLocale();

  useEffect(() => {
    const handler = () => { setView('friends'); };
    window.addEventListener('friends:add', handler);
    return () => window.removeEventListener('friends:add', handler);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header avec onglets */}
      <div className="flex items-center px-2 h-12 border-b border-border/60 gap-1 flex-shrink-0">
        <button
          onClick={() => setView('messages')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            view === 'messages'
              ? 'text-foreground bg-muted'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          {t('dm.messages')}
        </button>
        <button
          onClick={() => setView('friends')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            view === 'friends'
              ? 'text-foreground bg-muted'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          {t('dm.friends')}
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 min-h-0">
        {view === 'messages' ? <MessagesView /> : <FriendsView />}
      </div>

      {/* Footer - Language switcher */}
      <div className="p-2 border-t border-border/60 flex-shrink-0">
        <button
          type="button"
          onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label={t('language.label')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {locale === 'fr' ? t('language.fr') : t('language.en')}
        </button>
      </div>
    </div>
  );
}
