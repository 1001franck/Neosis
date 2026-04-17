/**
 * MESSAGES HOME PAGE
 * Point d'entree pour les conversations privees
 */

'use client';

import React, { useEffect } from 'react';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { MainLayout } from '@presentation/components/layout/MainLayout';
import { useAuth } from '@application/auth/useAuth';
import { useServers } from '@application/servers/useServers';
import { logger } from '@shared/utils/logger';
import { useLocale } from '@shared/hooks/useLocale';

export default function MessagesHomePage(): React.ReactNode {
  const { user } = useAuth();
  const { servers, getServers } = useServers();
  const { t } = useLocale();

  useEffect(() => {
    getServers().catch((err) => {
      logger.error('Failed to load servers', err);
    });
  }, [getServers]);

  return (
    <ProtectedRoute>
      <MainLayout servers={servers} showDirectMessages user={user ? { username: user.username, avatar: user.avatar ?? undefined } : undefined}>
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="max-w-lg w-full text-center space-y-4 px-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-card flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM6 9H18V11H6V9ZM14 14H6V12H14V14ZM18 8H6V6H18V8Z"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">{t('messages.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('messages.selectConversation')}
            </p>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
