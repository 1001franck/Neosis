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
  onReact: _onReact,
  onEdit,
  onDelete,
  isOwnMessage,
  canEdit = true,
  canModerate
}: MessageActionsProps): React.ReactNode {
  return (
    <div className="absolute -top-4 right-2 flex items-center gap-1 bg-card border border-border rounded shadow-lg p-1">
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
