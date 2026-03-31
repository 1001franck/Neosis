/**
 * MESSAGE LIST COMPONENT
 * Liste de messages avec double style (channel vs DM)
 * 
 * Responsabilités:
 * - Afficher les messages avec scroll automatique
 * - Gérer le groupement des messages consécutifs
 * - Afficher les séparateurs de date
 * - Style adaptatif: linéaire (channels) vs bulles (DMs)
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageActions } from './MessageActions';
import { MarkdownText } from './MarkdownText';
import { MessageAttachments } from './MessageAttachments';
import { MessageReactions } from './MessageReactions';
import type { MessageReaction } from '@domain/messages/types';
import type { Attachment } from '@domain/messages/types';
import { formatTimestamp, formatDateSeparator } from '@shared/utils/date';
import { shouldGroupMessages, shouldShowDateSeparator } from '@domain/messages/utils';

export interface Message {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';
  isCurrentUser?: boolean;
  isEdited?: boolean;
  deletedBy?: string;
  deletedByUserId?: string;
  deletedByRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  isRead?: boolean;
}

function renderStatusIcon(status?: Message['status']): React.ReactNode {
  switch (status) {
    case 'sending':
      return (
        <svg className="w-3 h-3 text-muted-foreground animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'failed':
      return (
        <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v5m0 3h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'read':
      return (
        <svg className="w-4 h-3 text-emerald-500" viewBox="0 0 24 16" fill="none">
          <path d="M1 9l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 9l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sent':
    case 'delivered':
      return (
        <svg className={`w-4 h-3 ${status === 'delivered' ? 'text-foreground' : 'text-muted-foreground'}`} viewBox="0 0 24 16" fill="none">
          <path d="M1 9l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {status === 'delivered' && (
            <path d="M9 9l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      );
    default:
      return null;
  }
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  isChannel?: boolean;
  canModerate?: boolean;
  hoveredMessageId: string | null;
  onHoverMessage: (id: string | null) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string, scope?: 'me' | 'everyone') => void;
}

export function MessageList({
  messages,
  currentUserId,
  isChannel = false,
  canModerate = false,
  hoveredMessageId,
  onHoverMessage,
  onAddReaction,
  onRemoveReaction,
  onEditMessage,
  onDeleteMessage,
}: MessageListProps): React.ReactElement {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // === INLINE EDIT STATE ===
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // === DELETE CONFIRMATION STATE ===
  const [deletingMessage, setDeletingMessage] = useState<{ id: string; isOwn: boolean } | null>(null);

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      onEditMessage?.(editingMessageId, editContent.trim());
    }
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleConfirmDelete = (scope: 'me' | 'everyone') => {
    if (deletingMessage) {
      onDeleteMessage?.(deletingMessage.id, scope);
    }
    setDeletingMessage(null);
  };

  // Focus edit input when entering edit mode
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.selectionStart = editInputRef.current.value.length;
    }
  }, [editingMessageId]);

  // === ANIMATION : tracker les messages déjà connus pour ne pas animer le chargement initial ===
  const knownMessageIds = useRef<Set<string>>(new Set());
  const isFirstRender = useRef(true);

  useEffect(() => {
    messages.forEach(m => knownMessageIds.current.add(m.id));
    isFirstRender.current = false;
  }, [messages]);

  // Scroll automatique en bas quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucun message dans cette conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
      <div className="space-y-0">
        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : undefined;
          const isGrouped = shouldGroupMessages(message, prevMessage);
          const showDate = shouldShowDateSeparator(message, prevMessage, index);
          const displayName = message.isCurrentUser ? 'Vous' : message.username;
          const displayInitialSource = message.username || displayName;
          const displayInitial = displayInitialSource.substring(0, 1).toUpperCase();

          // Animer seulement les nouveaux messages (pas le batch initial)
          const isNew = !isFirstRender.current && !knownMessageIds.current.has(message.id);

          return (
            <motion.div
              key={message.id}
              initial={isNew ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Date Separator */}
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="px-2 text-xs font-semibold text-muted-foreground">
                    {message.createdAt ? formatDateSeparator(new Date(message.createdAt)) : 'Date inconnue'}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              {/* Message - Style adaptatif */}
              {message.status === 'deleted' ? (
                // STYLE SUPPRIMÉ — placeholder type WhatsApp
                <div className="flex gap-2 sm:gap-3 px-2 py-1.5 -mx-2">
                  {!isGrouped ? (
                    <div className="flex-shrink-0 w-10 h-10" />
                  ) : (
                    <div className="flex-shrink-0 w-10" />
                  )}
                  <div className="flex items-center gap-2 text-sm italic text-muted-foreground/60">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 opacity-60">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022 1.005 11.36A2.75 2.75 0 007.77 20h4.46a2.75 2.75 0 002.751-2.689l1.005-11.36.149.022a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                    <span>
                      {(() => {
                        const iDeletedIt = message.deletedByUserId === currentUserId;
                        const role = message.deletedByRole;
                        const roleLabel = role === 'OWNER' ? 'Propriétaire' : role === 'ADMIN' ? 'Administrateur' : undefined;

                        if (iDeletedIt && message.isCurrentUser) {
                          return 'Vous avez supprimé ce message';
                        }

                        if (roleLabel) {
                          return message.isCurrentUser
                            ? `Votre message a été supprimé par ${roleLabel}`
                            : `Message supprimé par ${roleLabel}`;
                        }

                        return message.isCurrentUser
                          ? 'Votre message a été supprimé'
                          : 'Message supprimé';
                      })()}
                    </span>
                    <span className="text-[10px] not-italic text-muted-foreground/70">
                      {formatTimestamp(message.timestamp, message.createdAt)}
                    </span>
                    {message.deletedByRole && message.deletedByRole !== 'MEMBER' && (
                      <span
                        className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          message.deletedByRole === 'OWNER'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {message.deletedByRole === 'OWNER' ? 'Propriétaire' : 'Administrateur'}
                      </span>
                    )}
                  </div>
                </div>
              ) : isChannel ? (
                // STYLE CHANNEL - Tous les messages à gauche, style linéaire
                <div
                  className="group relative flex gap-2 sm:gap-3 hover:bg-secondary/30 px-2 py-1.5 -mx-2 rounded transition-colors"
                  onMouseEnter={() => onHoverMessage(message.id)}
                  onMouseLeave={() => onHoverMessage(null)}
                >
                  {/* Message Actions */}
                  {hoveredMessageId === message.id && editingMessageId !== message.id && (
                    <MessageActions
                      isOwnMessage={message.isCurrentUser}
                      canEdit={!!message.createdAt && (Date.now() - new Date(message.createdAt).getTime()) < 25 * 60 * 1000}
                      canModerate={canModerate}
                      onReact={() => onAddReaction?.(message.id, '👍')}
                      onEdit={() => handleStartEdit(message.id, message.content)}
                      onDelete={() => setDeletingMessage({ id: message.id, isOwn: !!message.isCurrentUser })}
                    />
                  )}
                  {!isGrouped ? (
                    <div className="flex-shrink-0">
                      {message.avatar ? (
                        <img
                          src={message.avatar}
                          alt={message.username}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-semibold text-primary-foreground">
                            {displayInitial}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-10 flex items-start pt-0.5">
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTimestamp(message.timestamp, message.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {!isGrouped && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp, message.createdAt)}
                        </span>
                        {message.isCurrentUser && message.status && (
                          <span className="flex items-center" title={message.status}>
                            {renderStatusIcon(message.status)}
                          </span>
                        )}
                      </div>
                    )}
                    {editingMessageId === message.id ? (
                      <div className="space-y-1">
                        <textarea
                          ref={editInputRef}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="w-full px-2 py-1 text-sm bg-background border border-primary rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          rows={Math.min(editContent.split('\n').length + 1, 6)}
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Échap pour <button onClick={handleCancelEdit} className="text-blue-400 hover:underline">annuler</button></span>
                          <span>•</span>
                          <span>Entrée pour <button onClick={handleSaveEdit} className="text-blue-400 hover:underline">sauvegarder</button></span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-foreground leading-relaxed">
                        <MarkdownText content={message.content} />
                        {message.isEdited && (
                          <span className="text-[10px] text-muted-foreground ml-1" title="This message has been edited">(edited)</span>
                        )}
                      </div>
                    )}
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <MessageAttachments attachments={message.attachments} />
                    )}
                    {currentUserId && ((message.reactions?.length ?? 0) > 0 || hoveredMessageId === message.id) && (
                      <div className="mt-1">
                        <MessageReactions
                          reactions={message.reactions ?? []}
                          currentUserId={currentUserId}
                          onAddReaction={(emoji) => onAddReaction?.(message.id, emoji)}
                          onRemoveReaction={(emoji) => onRemoveReaction?.(message.id, emoji)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // STYLE DM - Bulles WhatsApp alignées gauche/droite
                <div
                  className={`group flex gap-2 sm:gap-3 mb-2 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  onMouseEnter={() => onHoverMessage(message.id)}
                  onMouseLeave={() => onHoverMessage(null)}
                >
                  {/* Message Actions */}
                  {hoveredMessageId === message.id && editingMessageId !== message.id && (
                    <MessageActions
                      isOwnMessage={message.isCurrentUser}
                      canEdit={!!message.createdAt && (Date.now() - new Date(message.createdAt).getTime()) < 25 * 60 * 1000}
                      canModerate={canModerate}
                      onReact={() => onAddReaction?.(message.id, '👍')}
                      onEdit={() => handleStartEdit(message.id, message.content)}
                      onDelete={() => setDeletingMessage({ id: message.id, isOwn: !!message.isCurrentUser })}
                    />
                  )}

                  {/* Avatar gauche pour les autres */}
                  {!message.isCurrentUser && !isGrouped && (
                    <div className="flex-shrink-0">
                      {message.avatar ? (
                        <img
                          src={message.avatar}
                          alt={message.username}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[10px] sm:text-xs font-semibold text-primary-foreground">
                            {message.username.substring(0, 1).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Spacer pour messages groupés */}
                  {!message.isCurrentUser && isGrouped && (
                    <div className="flex-shrink-0 w-8" />
                  )}

                  {/* Message Card */}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 shadow-sm ${message.isCurrentUser
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card text-foreground rounded-bl-sm border border-border'
                      }`}
                  >
                    {/* Header pour premier message du groupe */}
                    {!isGrouped && !message.isCurrentUser && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          {message.username}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    {editingMessageId === message.id ? (
                      <div className="space-y-1">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="w-full px-2 py-1 text-sm bg-background text-foreground border border-primary rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          rows={Math.min(editContent.split('\n').length + 1, 6)}
                          autoFocus
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Échap pour <button onClick={handleCancelEdit} className="text-blue-400 hover:underline">annuler</button></span>
                          <span>•</span>
                          <span>Entrée pour <button onClick={handleSaveEdit} className="text-blue-400 hover:underline">sauvegarder</button></span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed break-words">
                        <MarkdownText content={message.content} />
                      </div>
                    )}
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <MessageAttachments attachments={message.attachments} />
                    )}

                    {/* Timestamp */}
                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${message.isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                      <span>{formatTimestamp(message.timestamp, message.createdAt)}</span>
                      {message.isCurrentUser && message.status && (
                        <span className="flex items-center" title={message.status}>
                          {renderStatusIcon(message.status)}
                        </span>
                      )}
                    </div>

                    {/* Reactions */}
                    {currentUserId && ((message.reactions?.length ?? 0) > 0 || hoveredMessageId === message.id) && (
                      <div className="mt-1">
                        <MessageReactions
                          reactions={message.reactions ?? []}
                          currentUserId={currentUserId}
                          onAddReaction={(emoji) => onAddReaction?.(message.id, emoji)}
                          onRemoveReaction={(emoji) => onRemoveReaction?.(message.id, emoji)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Avatar droite pour messages utilisateur */}
                  {message.isCurrentUser && !isGrouped && (
                    <div className="flex-shrink-0">
                      {message.avatar ? (
                        <img
                          src={message.avatar}
                          alt={message.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                          <span className="text-xs font-semibold text-accent-foreground">
                            {displayInitial}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Spacer pour messages groupés utilisateur */}
                  {message.isCurrentUser && isGrouped && (
                    <div className="flex-shrink-0 w-8" />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
        {/* Élément invisible pour le scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* === DELETE CONFIRMATION DIALOG === */}
      {deletingMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeletingMessage(null)}>
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Supprimer le message</h3>
              <button
                onClick={() => setDeletingMessage(null)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.18 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3z" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Choisissez la portée de suppression. Cette action est définitive pour la portée choisie.
              </p>
              <div className="space-y-2">
                {deletingMessage.isOwn && (
                  <button
                    onClick={() => handleConfirmDelete('me')}
                    className="w-full px-4 py-3 text-sm rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-left"
                  >
                    Supprimer pour moi
                    <div className="text-xs text-muted-foreground mt-1">Visible seulement pour vous</div>
                  </button>
                )}
                <button
                  onClick={() => handleConfirmDelete('everyone')}
                  className="w-full px-4 py-3 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-left"
                >
                  Supprimer pour tout le monde
                  <div className="text-xs text-red-100/80 mt-1">Un placeholder restera visible dans le salon</div>
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setDeletingMessage(null)}
                  className="px-4 py-2 text-sm rounded bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
