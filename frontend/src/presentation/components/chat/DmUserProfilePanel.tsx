'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usersApi, type UserProfile } from '@infrastructure/api/users.api';
import { useLocale } from '@shared/hooks/useLocale';
import type { Message } from './MessageList';

interface DmUserProfilePanelProps {
  userId: string;
  messages?: Message[];
  onClose: () => void;
}

// ─── Helpers médias ─────────────────────────────────────────────────────────

function isGifUrl(url: string): boolean {
  const t = url.trim();
  return (
    /^https?:\/\/media\d*\.giphy\.com\/.+\.gif(\?.*)?$/i.test(t) ||
    /^https?:\/\/i\.giphy\.com\/.+\.gif(\?.*)?$/i.test(t) ||
    /^https?:\/\/media\d*\.tenor\.com\/.+\.(gif|mp4)(\?.*)?$/i.test(t)
  );
}

function isImageUrl(url: string): boolean {
  return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url.trim());
}

interface MediaItem {
  url: string;
  isGif: boolean;
}

function extractMedia(messages: Message[]): MediaItem[] {
  const items: MediaItem[] = [];
  for (const msg of messages) {
    if (msg.status === 'deleted') continue;
    const content = msg.content.trim();
    if (isGifUrl(content)) {
      items.push({ url: content, isGif: true });
    } else if (isImageUrl(content)) {
      items.push({ url: content, isGif: false });
    }
    if (msg.attachments) {
      for (const att of msg.attachments) {
        if (att.mimeType.startsWith('image/')) {
          items.push({ url: att.url, isGif: att.mimeType === 'image/gif' });
        }
      }
    }
  }
  return items.reverse();
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function DmUserProfilePanel({ userId, messages = [], onClose }: DmUserProfilePanelProps): React.ReactElement {
  const { t, locale } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'media'>('profile');
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setProfile(null);
    usersApi
      .getProfile(userId)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userId]);

  const mediaItems = useMemo(() => extractMedia(messages), [messages]);

  function formatJoinDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
            aria-label={t('common.close')}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="w-72 flex-shrink-0 border-l border-border bg-background flex flex-col h-full overflow-hidden">
        {/* Bouton fermer */}
        <div className="flex justify-end p-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            aria-label={t('dm.profileClose')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && profile && (
          <>
            {/* Bannière + avatar */}
            <div className="relative flex-shrink-0">
              {profile.banner ? (
                <img src={profile.banner} alt="" className="w-full h-20 object-cover" />
              ) : (
                <div className="w-full h-20 bg-gradient-to-br from-primary/40 to-secondary" />
              )}
              <div className="absolute -bottom-9 left-4">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-16 h-16 rounded-full border-4 border-background object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-4 border-background bg-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">
                      {profile.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nom + statut */}
            <div className="mt-11 px-4 pb-3 flex-shrink-0">
              <h2 className="text-base font-bold text-foreground leading-tight">{profile.username}</h2>
              {(profile.statusEmoji || profile.customStatus) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profile.statusEmoji && <span className="mr-1">{profile.statusEmoji}</span>}
                  {profile.customStatus}
                </p>
              )}
            </div>

            {/* Onglets */}
            <div className="flex border-b border-border flex-shrink-0">
              <button
                onClick={() => setTab('profile')}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  tab === 'profile'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('dm.profileTab')}
              </button>
              <button
                onClick={() => setTab('media')}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  tab === 'media'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('dm.mediaTab')}
                {mediaItems.length > 0 && (
                  <span className="ml-1 text-[10px] text-muted-foreground">({mediaItems.length})</span>
                )}
              </button>
            </div>

            {/* Contenu onglet */}
            <div className="flex-1 overflow-y-auto">
              {tab === 'profile' ? (
                <div className="px-4 py-4 space-y-4">
                  <div className="border-t border-border" />
                  {profile.bio && (
                    <div>
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        {t('dm.profileAbout')}
                      </h3>
                      <p className="text-sm text-foreground whitespace-pre-line">{profile.bio}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t('dm.profileSince')}
                    </h3>
                    <p className="text-sm text-foreground">{formatJoinDate(profile.createdAt)}</p>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {mediaItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                      <svg className="w-10 h-10 text-muted-foreground/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-muted-foreground">{t('dm.noMedia')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {mediaItems.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => setLightbox(item.url)}
                          className="aspect-square rounded overflow-hidden bg-muted hover:opacity-80 transition-opacity relative group"
                        >
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {item.isGif && (
                            <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1 rounded leading-none py-0.5">
                              GIF
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!isLoading && !profile && (
          <div className="flex items-center justify-center flex-1 px-4 text-sm text-muted-foreground text-center">
            {t('dm.profileError')}
          </div>
        )}
      </div>
    </>
  );
}
