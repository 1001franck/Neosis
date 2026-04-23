/**
 * DIRECT MESSAGES PAGE
 * Conversation privee entre deux amis
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { MainLayout } from '@presentation/components/layout/MainLayout';
import { ChatArea, type Message } from '@presentation/components/chat/ChatArea';
import { useAuth } from '@application/auth/useAuth';
import { useServers } from '@application/servers/useServers';
import { useDirectMessages } from '@application/direct/useDirectMessages';
import { directApi } from '@infrastructure/api/direct.api';
import type { DirectConversation, DirectMessage } from '@domain/direct/types';
import { logger } from '@shared/utils/logger';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapDirectMessage(message: DirectMessage, currentUserId?: string): Message {
  const senderId = message.sender?.id ?? message.senderId;
  const senderName = message.sender?.username ?? 'Utilisateur';
  const isCurrentUser = currentUserId ? senderId === currentUserId : false;
  return {
    id: message.id,
    userId: senderId,
    username: senderName,
    avatar: message.sender?.avatarUrl ?? undefined,
    content: message.content,
    timestamp: formatTime(message.createdAt),
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
    isCurrentUser,
    status: isCurrentUser ? 'sent' : undefined,
  };
}

export default function DirectConversationPage(): React.ReactNode {
  const params = useParams();
  const conversationIdParam = params?.conversationId;
  const conversationId = Array.isArray(conversationIdParam)
    ? conversationIdParam[0]
    : conversationIdParam;
  const { user } = useAuth();
  const { servers, getServers } = useServers();
  const { messages, isLoading, error, sendMessage } = useDirectMessages(conversationId);
  const [conversation, setConversation] = useState<DirectConversation | null>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);

  useEffect(() => {
    getServers().catch((err) => logger.error('Failed to load servers', err));
  }, [getServers]);

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
    () => messages.map((m) => mapDirectMessage(m, user?.id)),
    [messages, user?.id]
  );

  return (
    <ProtectedRoute>
      <MainLayout showDirectMessages servers={servers} user={user ? { username: user.username, avatar: user.avatar ?? undefined } : undefined}>
        <div className="flex-1 flex flex-col h-full">
          {conversationError && (
            <div className="p-4 text-sm text-red-500">{conversationError}</div>
          )}
          <ChatArea
            recipient={{
              name: conversation?.user?.username ?? 'Conversation',
              avatar: conversation?.user?.avatarUrl ?? undefined,
            }}
            messages={mappedMessages}
            currentUserId={user?.id}
            isChannel={false}
            isLoading={isLoading}
            error={error ?? undefined}
            callbacks={{
              onSendMessage: async (content) => {
                if (!conversationId) return;
                await sendMessage(content);
              },
              onTypingStart: () => {},
              onTypingStop: () => {},
            }}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
