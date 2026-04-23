/**
 * CHANNEL SEARCH MODAL
 * Modal de recherche de messages dans un channel (style Discord)
 * 
 * Fonctionnalités:
 * - Recherche en temps réel avec debounce
 * - Filtres: from (auteur), has (images/videos/links/files), date
 * - Affichage des résultats avec contexte
 * - Navigation vers le message dans le chat
 * - Tabs: New/Old/Relevant
 */

'use client';

import { memo, useState, useMemo, useCallback, useEffect } from 'react';
import type { Message as MessageListMessage } from './MessageList';
import { formatTimestamp } from '@shared/utils/date';
import { logger } from '@shared/utils/logger';

interface ChannelSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
  messages: MessageListMessage[]; // Use MessageList type
  onMessageClick: (messageId: string) => void;
}

type SortOrder = 'new' | 'old' | 'relevant';

interface SearchFilters {
  query: string;
  from?: string; // username
  has?: 'image' | 'video' | 'link' | 'file';
  before?: Date;
  after?: Date;
}

const ChannelSearchModalComponent = ({
  isOpen,
  onClose,
  channelId: _channelId,
  channelName,
  messages,
  onMessageClick,
}: ChannelSearchModalProps): React.ReactNode => {
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [sortOrder, setSortOrder] = useState<SortOrder>('relevant');
  const [showFilters, setShowFilters] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setFilters({ query: '' });
      setSortOrder('relevant');
      setShowFilters(false);
    }
  }, [isOpen]);

  /**
   * Filter messages based on search criteria
   */
  const filteredMessages = useMemo(() => {
    if (!filters.query.trim() && !filters.from && !filters.has && !filters.before && !filters.after) {
      return [];
    }

    return messages.filter((message) => {
      // Text search
      if (filters.query && !message.content.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }

      // Author filter
      if (filters.from && message.username.toLowerCase() !== filters.from.toLowerCase()) {
        return false;
      }

      // Has filter (skip for now as MessageListMessage doesn't have attachments)
      if (filters.has === 'link') {
        const hasLink = /https?:\/\/[^\s]+/.test(message.content);
        if (!hasLink) return false;
      }

      // Date filters
      if (message.createdAt) {
        const messageDate = new Date(message.createdAt);
        if (filters.before && messageDate > filters.before) return false;
        if (filters.after && messageDate < filters.after) return false;
      }

      return true;
    });
  }, [messages, filters]);

  /**
   * Sort filtered messages
   */
  const sortedMessages = useMemo(() => {
    const sorted = [...filteredMessages];
    
    if (sortOrder === 'new') {
      sorted.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } else if (sortOrder === 'old') {
      sorted.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });
    } else {
      // Relevant: prioritize exact matches and recent messages
      sorted.sort((a, b) => {
        const aExact = a.content.toLowerCase().includes(filters.query.toLowerCase());
        const bExact = b.content.toLowerCase().includes(filters.query.toLowerCase());
        if (aExact !== bExact) return bExact ? 1 : -1;
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }
    
    return sorted;
  }, [filteredMessages, sortOrder, filters.query]);

  const handleMessageClick = useCallback((messageId: string) => {
    logger.info('Navigating to message', { messageId });
    onMessageClick(messageId);
    onClose();
  }, [onMessageClick, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg w-full max-w-3xl mt-16 shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">
              Rechercher dans la chaîne "{channelName}"
            </h2>
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

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher des messages..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
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

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-2 text-xs text-primary hover:underline"
          >
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-3 space-y-2 p-3 bg-secondary rounded">
              <div>
                <label className="text-xs text-muted-foreground">De l&apos;utilisateur :</label>
                <input
                  type="text"
                  placeholder="nom d'utilisateur"
                  value={filters.from || ''}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value || undefined })}
                  className="w-full mt-1 px-2 py-1 bg-card text-white text-sm rounded"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Contient :</label>
                <select
                  value={filters.has || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters({ ...filters, has: val === 'link' ? 'link' : undefined });
                  }}
                  className="w-full mt-1 px-2 py-1 bg-card text-white text-sm rounded"
                >
                  <option value="">Tout</option>
                  <option value="link">Lien</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Sort Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setSortOrder('relevant')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              sortOrder === 'relevant'
                ? 'text-white border-b-2 border-primary'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Pertinent
          </button>
          <button
            onClick={() => setSortOrder('new')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              sortOrder === 'new'
                ? 'text-white border-b-2 border-primary'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Récent
          </button>
          <button
            onClick={() => setSortOrder('old')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              sortOrder === 'old'
                ? 'text-white border-b-2 border-primary'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Ancien
          </button>
          <div className="ml-auto px-4 py-2 text-sm text-muted-foreground">
            {sortedMessages.length} {sortedMessages.length === 1 ? 'résultat' : 'résultats'}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[500px] overflow-y-auto">
          {sortedMessages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {filters.query.trim() ? 'Aucun message trouvé' : 'Commencez à taper pour rechercher...'}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedMessages.map((message) => {
                const timestamp = message.createdAt
                  ? formatTimestamp(
                      new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      new Date(message.createdAt)
                    )
                  : message.timestamp;

                return (
                  <button
                    key={message.id}
                    onClick={() => handleMessageClick(message.id)}
                    className="w-full p-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      {message.avatar ? (
                        <img
                          src={message.avatar}
                          alt={message.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-foreground">
                            {message.username.substring(0, 1).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-white">
                            {message.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {timestamp}
                          </span>
                        </div>
                        <div className="text-sm text-foreground mt-1 line-clamp-3">
                          {message.content}
                        </div>
                      </div>

                      {/* Jump Icon */}
                      <div className="text-muted-foreground">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChannelSearchModal = memo(ChannelSearchModalComponent);
