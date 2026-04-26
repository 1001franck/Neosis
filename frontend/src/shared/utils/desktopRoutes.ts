'use client';

const LAST_DM_CONVERSATION_KEY = 'neosis:lastDmConversationId';

function isDesktopTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function toServerRoute(serverId: string): string {
  const encodedId = encodeURIComponent(serverId);
  if (isDesktopTauriRuntime()) {
    return `/servers/_?serverId=${encodedId}`;
  }
  return `/servers/${encodedId}`;
}

export function toConversationRoute(conversationId: string): string {
  const encodedId = encodeURIComponent(conversationId);
  if (isDesktopTauriRuntime()) {
    return `/messages/_?conversationId=${encodedId}`;
  }
  return `/messages/${encodedId}`;
}

export function setLastDmConversationId(conversationId: string): void {
  if (typeof window === 'undefined') return;
  const normalized = conversationId.trim();
  if (!normalized) return;
  window.localStorage.setItem(LAST_DM_CONVERSATION_KEY, normalized);
}

export function getLastDmConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(LAST_DM_CONVERSATION_KEY);
  if (!value) return null;
  const normalized = value.trim();
  return normalized || null;
}

export function getPreferredMessagesRoute(): string {
  const lastConversationId = getLastDmConversationId();
  if (lastConversationId) {
    return toConversationRoute(lastConversationId);
  }
  return '/messages';
}

export function resolveServerIdFromRoute(
  routeServerId: string | undefined,
  searchParams?: URLSearchParams | null
): string {
  if (routeServerId && routeServerId !== '_') {
    return routeServerId;
  }

  const queryServerId = searchParams?.get('serverId')?.trim();
  if (queryServerId) {
    return queryServerId;
  }

  return routeServerId ?? '';
}

export function resolveConversationIdFromRoute(
  routeConversationId: string | undefined,
  searchParams?: URLSearchParams | null
): string {
  if (routeConversationId && routeConversationId !== '_') {
    return routeConversationId;
  }

  const queryConversationId = searchParams?.get('conversationId')?.trim();
  if (queryConversationId) {
    return queryConversationId;
  }

  return routeConversationId ?? '';
}