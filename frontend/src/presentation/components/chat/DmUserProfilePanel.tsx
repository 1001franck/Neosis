'use client';

import React, { useEffect, useState } from 'react';
import { usersApi, type UserProfile } from '@infrastructure/api/users.api';
import { useLocale } from '@shared/hooks/useLocale';

interface DmUserProfilePanelProps {
  userId: string;
  onClose: () => void;
}

export function DmUserProfilePanel({ userId, onClose }: DmUserProfilePanelProps): React.ReactElement {
  const { t, locale } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function formatJoinDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  useEffect(() => {
    setIsLoading(true);
    setProfile(null);
    usersApi
      .getProfile(userId)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <div className="w-72 flex-shrink-0 border-l border-border bg-background flex flex-col h-full overflow-y-auto">
      {/* Bouton fermer */}
      <div className="flex justify-end p-2">
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
          <div className="relative">
            {profile.banner ? (
              <img src={profile.banner} alt="" className="w-full h-24 object-cover" />
            ) : (
              <div className="w-full h-24 bg-gradient-to-br from-primary/40 to-secondary" />
            )}
            <div className="absolute -bottom-10 left-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-20 h-20 rounded-full border-4 border-background object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-background bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {profile.username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Infos */}
          <div className="mt-12 px-4 pb-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">{profile.username}</h2>
              {(profile.statusEmoji || profile.customStatus) && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {profile.statusEmoji && <span className="mr-1">{profile.statusEmoji}</span>}
                  {profile.customStatus}
                </p>
              )}
            </div>

            <div className="border-t border-border" />

            {profile.bio && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  {t('dm.profileAbout')}
                </h3>
                <p className="text-sm text-foreground whitespace-pre-line">{profile.bio}</p>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {t('dm.profileSince')}
              </h3>
              <p className="text-sm text-foreground">{formatJoinDate(profile.createdAt)}</p>
            </div>
          </div>
        </>
      )}

      {!isLoading && !profile && (
        <div className="flex items-center justify-center flex-1 px-4 text-sm text-muted-foreground text-center">
          {t('dm.profileError')}
        </div>
      )}
    </div>
  );
}
