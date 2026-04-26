/**
 * DIRECT MESSAGES PAGE
 * Conversation privee entre deux amis
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { MainLayout } from '@presentation/components/layout/MainLayout';
import { ChatArea, type Message } from '@presentation/components/chat/ChatArea';
import { DmUserProfilePanel } from '@presentation/components/chat/DmUserProfilePanel';
import { useAuth } from '@application/auth/useAuth';
import { useLocale } from '@shared/hooks/useLocale';
import { useServers } from '@application/servers/useServers';
import { useDirectMessages } from '@application/direct/useDirectMessages';
import { directApi } from '@infrastructure/api/direct.api';
import type { DirectConversation, DirectMessage } from '@domain/direct/types';
import { logger } from '@shared/utils/logger';
import { resolveConversationIdFromRoute, setLastDmConversationId } from '@shared/utils/desktopRoutes';

function formatTime(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapDirectMessage(message: DirectMessage, currentUserId?: string, locale = 'fr'): Message {
  const senderId = message.sender?.id ?? message.senderId;
  const senderName = message.sender?.username ?? 'Utilisateur';
  const isCurrentUser = currentUserId ? senderId === currentUserId : false;
  return {
    id: message.id,
    userId: senderId,
    username: senderName,
    avatar: message.sender?.avatarUrl ?? undefined,
    content: message.content,
    timestamp: formatTime(message.createdAt, locale),
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
    isCurrentUser,
    status: isCurrentUser ? 'sent' : undefined,
  };
}

export default function DirectConversationPage(): React.ReactNode {
  const params = useParams();
  const searchParams = useSearchParams();
  const conversationIdParam = params?.conversationId;
  const routeConversationId = Array.isArray(conversationIdParam)
    ? conversationIdParam[0]
    : conversationIdParam;
  const conversationId = useMemo(
    () => resolveConversationIdFromRoute(routeConversationId, searchParams),
    [routeConversationId, searchParams]
  );
  const { locale } = useLocale();
  const { user } = useAuth();
  const { servers, getServers } = useServers();
  const { messages, isLoading, error, sendMessage } = useDirectMessages(conversationId);
  const [conversation, setConversation] = useState<DirectConversation | null>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const toggleProfile = useCallback(() => setShowProfile((prev) => !prev), []);

  const handleMessageClick = useCallback((messageId: string) => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-primary/10');
      setTimeout(() => el.classList.remove('bg-primary/10'), 1500);
    }
  }, []);

  useEffect(() => {
    getServers().catch((err) => logger.error('Failed to load servers', err));
  }, [getServers]);

  useEffect(() => {
    if (!conversationId) return;
    setLastDmConversationId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    setConversationError(null);
    directApi
      .getConversation(conversationId)
      .then(setConversation)
      .catch((err) => {
        logger.error('Failed to load direct conversation', err);
        setConversationError('Conversation introuvable');
      });
  }, [conversationId]);

  const mappedMessages = useMemo(
    () => messages.map((m) => mapDirectMessage(m, user?.id, locale)),
    [messages, user?.id, locale]
  );

  return (
    <ProtectedRoute>
      <MainLayout showDirectMessages servers={servers} user={user ? { username: user.username, avatar: user.avatar ?? undefined } : undefined}>
        <div className="flex-1 flex h-full overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            {conversationError && (
              <div className="p-4 text-sm text-red-500">{conversationError}</div>
            )}
            <ChatArea
              channelId={conversationId ?? undefined}
              recipient={{
                name: conversation?.user?.username ?? 'Conversation',
                avatar: conversation?.user?.avatarUrl ?? undefined,
              }}
              messages={mappedMessages}
              currentUserId={user?.id}
              isChannel={false}
              isLoading={isLoading}
              error={error ?? undefined}
              ui={{
                showProfile,
                onToggleProfile: toggleProfile,
              }}
              callbacks={{
                onSendMessage: async (content) => {
                  if (!conversationId) return;
                  await sendMessage(content);
                },
                onTypingStart: () => {},
                onTypingStop: () => {},
                onMessageClick: handleMessageClick,
              }}
            />
          </div>
          {showProfile && conversation?.user && (
            <DmUserProfilePanel
              userId={conversation.user.id}
              messages={mappedMessages}
              onClose={() => setShowProfile(false)}
            />
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
