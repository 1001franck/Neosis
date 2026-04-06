import { useEffect, useRef } from 'react';
import { useAuthStore } from '../auth/authStore';
import { socketEmitters } from '../../infrastructure/websocket/emitters';
import type { Message } from '../../domain/messages/types';

/**
 * Hook to automatically mark messages as read when they are viewed
 * Uses a simple strategy: viewing the message list updates the read status to the last message
 */
export const useReadConfirmation = (channelId: string | undefined, messages: Message[]) => {
    const user = useAuthStore((state) => state.user);
    const lastMarkedMessageIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!channelId || !user || messages.length === 0) return;

        // Get the last message in the list
        const lastMessage = messages[messages.length - 1];

        // Only mark as read if the last message is new to our tracking
        if (lastMessage.id !== lastMarkedMessageIdRef.current) {

            socketEmitters.markChannelAsRead(channelId, lastMessage.id);
            lastMarkedMessageIdRef.current = lastMessage.id;
        }
    }, [channelId, messages, user]);
};
