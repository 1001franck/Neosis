'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { Channel } from '@domain/channels/types';
import type { Message } from '@domain/messages/types';
import { messagesApi } from '@infrastructure/api/messages.api';
import { formatTimeOnly } from '@shared/utils/date';
import { useLocale } from '@shared/hooks/useLocale';

interface ServerMessageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  channels: Channel[];
  onResultClick: (channelId: string, messageId: string) => void;
}

interface IndexedMessage {
  id: string;
  channelId: string;
  channelName: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

const SEARCH_LIMIT = 200;

function toIndexedMessage(message: Message, channelName: string): IndexedMessage {
  return {
    id: message.id,
    channelId: message.channelId,
    channelName,
    authorName: message.author?.username ?? 'Utilisateur',
    authorAvatar: message.author?.avatar,
    content: message.content,
    createdAt: message.createdAt,
  };
}

function formatResultTime(createdAt: string, locale: string): string {
  const date = new Date(createdAt);
  const time = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatTimeOnly(time, date);
}

const ServerMessageSearchModalComponent = ({
  isOpen,
  onClose,
  serverId,
  channels,
  onResultClick,
}: ServerMessageSearchModalProps): React.ReactNode => {
  const { locale } = useLocale();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<IndexedMessage[]>([]);

  const textChannels = useMemo(
    () => channels.filter((channel) => channel.type === 'TEXT'),
    [channels]
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const q = query.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    const channelNamesById = new Map(textChannels.map((channel) => [channel.id, channel.name]));

    const debounceId = setTimeout(async () => {
      setLoading(true);
      try {
        const messages = await messagesApi.searchServerMessages(serverId, q, SEARCH_LIMIT);
        if (!isCancelled) {
          setSearchResults(
            messages
              .filter((message) => channelNamesById.has(message.channelId))
              .map((message) => toIndexedMessage(message, channelNamesById.get(message.channelId) ?? 'salon'))
          );
        }
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      clearTimeout(debounceId);
    };
  }, [isOpen, query, serverId, textChannels]);

  const filteredResults = useMemo(() => searchResults, [searchResults]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleResultClick = useCallback((result: IndexedMessage) => {
    onResultClick(result.channelId, result.id);
    onClose();
  }, [onClose, onResultClick]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-card rounded-lg w-full max-w-3xl mt-16 shadow-xl">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Rechercher dans tout le serveur</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un message dans tous les salons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 pl-9 bg-secondary text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <svg
              className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 7.863 17.167 5.854 15.656 4.344C14.146 2.832 12.137 2 10 2C7.863 2 5.854 2.832 4.344 4.344C2.833 5.854 2 7.863 2 10C2 12.137 2.833 14.146 4.344 15.656C5.854 17.168 7.863 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C8.397 16 6.891 15.376 5.758 14.243C4.624 13.11 4 11.603 4 10C4 8.397 4.624 6.891 5.758 5.758C6.891 4.624 8.397 4 10 4C11.603 4 13.109 4.624 14.242 5.758C15.376 6.891 16 8.397 16 10C16 11.603 15.376 13.11 14.242 14.243C13.109 15.376 11.603 16 10 16Z" />
            </svg>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Chargement des messages du serveur...</div>
          ) : query.trim().length < 2 ? (
            <div className="p-8 text-center text-muted-foreground">Tapez au moins 2 caractères pour rechercher</div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Aucun message trouvé</div>
          ) : (
            <div className="divide-y divide-border">
              {filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {result.authorAvatar ? (
                      <img src={result.authorAvatar} alt={result.authorName} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-foreground">
                          {result.authorName.substring(0, 1).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-semibold text-white">{result.authorName}</span>
                        <span className="text-xs text-muted-foreground">dans #{result.channelName}</span>
                        <span className="text-xs text-muted-foreground">{formatResultTime(result.createdAt, locale)}</span>
                      </div>
                      <div className="text-sm text-foreground mt-1 line-clamp-3">{result.content}</div>
                    </div>

                    <div className="text-muted-foreground">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ServerMessageSearchModal = memo(ServerMessageSearchModalComponent);
