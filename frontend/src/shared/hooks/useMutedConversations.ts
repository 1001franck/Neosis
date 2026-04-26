'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'neosis:muted_conversations';

function getMuted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveMuted(muted: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...muted]));
}

export function isMutedConversation(conversationId: string): boolean {
  if (typeof window === 'undefined') return false;
  return getMuted().has(conversationId);
}

export function useMutedConversations(conversationId: string | null | undefined) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!conversationId) { setIsMuted(false); return; }
    setIsMuted(getMuted().has(conversationId));
  }, [conversationId]);

  const toggle = useCallback(() => {
    if (!conversationId) return;
    const muted = getMuted();
    if (muted.has(conversationId)) {
      muted.delete(conversationId);
      setIsMuted(false);
    } else {
      muted.add(conversationId);
      setIsMuted(true);
    }
    saveMuted(muted);
  }, [conversationId]);

  return { isMuted, toggle };
}
