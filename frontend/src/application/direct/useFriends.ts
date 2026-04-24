'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Friend, FriendRequests } from '@domain/direct/types';
import { friendsApi } from '@infrastructure/api/friends.api';
import { logger } from '@shared/utils/logger';

export function useFriends(active: boolean) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequests>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, r] = await Promise.all([friendsApi.listFriends(), friendsApi.listRequests()]);
      setFriends(f);
      setRequests(r);
    } catch (err) {
      logger.error('Failed to load friends', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) load().catch(() => {});
  }, [active, load]);

  const accept = useCallback(async (id: string) => {
    await friendsApi.acceptFriend(id);
    await load();
  }, [load]);

  const decline = useCallback(async (id: string) => {
    await friendsApi.declineFriend(id);
    await load();
  }, [load]);

  const cancel = useCallback(async (id: string) => {
    await friendsApi.cancelFriendRequest(id);
    await load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await friendsApi.removeFriend(id);
    await load();
  }, [load]);

  const sendRequest = useCallback(async (username: string) => {
    await friendsApi.requestFriend(username);
    await load();
  }, [load]);

  return { friends, requests, loading, load, accept, decline, cancel, remove, sendRequest };
}
