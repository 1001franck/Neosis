'use client';

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