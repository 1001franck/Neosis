/**
 * MESSAGE ACTIONS COMPONENT
 * Actions qui apparaissent au hover sur un message
 * 
 * Responsabilités:
 * - Afficher les actions disponibles (réaction, éditer, supprimer)
 * - Gérer les clics sur chaque action
 */

'use client';

import React from 'react';

interface MessageActionsProps {
  onReact: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwnMessage?: boolean;
  canEdit?: boolean;
  canModerate?: boolean;
}

export function MessageActions({
  onReact,
  onEdit,
  onDelete,
  isOwnMessage,
  canEdit = true,
  canModerate
}: MessageActionsProps): React.ReactNode {
  return (
    <div className="absolute -top-4 right-2 flex items-center gap-1 bg-card border border-border rounded shadow-lg p-1">
      {/* Réaction rapide 👍 */}
      <button
        onClick={onReact}
        className="p-1 hover:bg-background rounded transition-colors"
        aria-label="Réagir"
        title="Réagir"
      >
        <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      </button>
      {/* Edit (only own messages within 25 min) */}
      {isOwnMessage && canEdit && onEdit && (
        <button
          onClick={onEdit}
          className="p-1 hover:bg-background rounded transition-colors"
          aria-label="Éditer"
          title="Éditer"
        >
          <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" />
          </svg>
        </button>
      )}

      {/* Delete (own messages or moderators) */}
      {(isOwnMessage || canModerate) && onDelete && (
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 rounded transition-colors"
          aria-label="Supprimer"
          title="Supprimer"
        >
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      )}
    </div>
  );
}
