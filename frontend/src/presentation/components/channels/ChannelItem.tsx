/**
 * CHANNEL ITEM COMPONENT
 * Item cliquable représentant un channel (text/voice/stage/forum)
 * 
 * Responsabilités:
 * - Afficher le nom et l'icône selon le type
 * - Gérer l'état actif/hover
 * - Afficher les indicateurs (unread, users connected)
 */

'use client';

import React from 'react';
import { ChannelType } from '@domain/channels/types';
import { logger } from '@shared/utils/logger';

interface ChannelItemProps {
  id: string;
  name: string;
  type: ChannelType;
  isActive?: boolean;
  unreadCount?: number;
  mentionCount?: number;
  connectedUsers?: number;
  onClick?: (channelId: string) => void;
  onJoinVoice?: (channelId: string) => void;
  onSettings?: (channelId: string) => void;
}

/**
 * Retourne l'icône SVG selon le type de channel
 */
function getChannelIcon(type: ChannelType): React.ReactNode {
  switch (type) {
    case ChannelType.TEXT:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z" />
        </svg>
      );
    case ChannelType.VOICE:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3C10.34 3 9 4.34 9 6V10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10V6C15 4.34 13.66 3 12 3ZM12 15C8.13 15 5 11.87 5 8H7C7 10.76 9.24 13 12 13C14.76 13 17 10.76 17 8H19C19 11.87 15.87 15 12 15ZM11 19V22H13V19H11Z" transform="translate(0, -1)"/>
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z" />
        </svg>
      );
  }
}

export function ChannelItem({
  id,
  name,
  type,
  isActive = false,
  unreadCount = 0,
  mentionCount = 0,
  connectedUsers,
  onClick,
  onJoinVoice,
  onSettings,
}: ChannelItemProps): React.ReactElement {
  const voiceUserCount = connectedUsers ?? 0;
  const voiceActionLabel = voiceUserCount > 0 ? 'Rejoindre' : 'Démarrer';
  const handleClick = (): void => {
    // Pour les voice channels, on ne change pas le channel actif au clic
    if (type === ChannelType.VOICE) {
      return;
    }
    onClick?.(id);
  };

  const handleJoinVoice = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onJoinVoice?.(id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      className={`
        w-full flex items-center gap-1.5 px-2 py-1.5 rounded group
        transition-colors cursor-pointer
        ${isActive
          ? 'bg-muted text-white'
          : 'text-[#96989d] hover:bg-[#35373c] hover:text-foreground'
        }
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {getChannelIcon(type)}
      </div>

      {/* Name */}
      <span className="flex-1 text-left text-base font-medium truncate">
        {name}
      </span>

      {/* Indicators */}
      <div className="flex items-center gap-1.5">
        {/* Connected users (voice channels only) - Improved design */}
      {type === ChannelType.VOICE && voiceUserCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-green-400">{voiceUserCount}</span>
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"/>
          </svg>
        </div>
      )}

        {/* Unread indicator */}
        {mentionCount > 0 ? (
          <div className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            @{mentionCount}
          </div>
        ) : unreadCount > 0 ? (
          <div className="w-2 h-2 rounded-full bg-white"></div>
        ) : null}
      </div>

      {/* Hover icons for text channels */}
      {type === ChannelType.TEXT && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Invite */}
          <button
            className="p-0.5 hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              logger.debug('Channel invite clicked', { channelId: id });
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"/>
              <path d="M18 8H20V10H18V8Z" fill="white"/>
              <path d="M16 8H18V10H16V8Z" fill="white"/>
            </svg>
          </button>

          {/* Settings */}
          {onSettings && (
            <button
              className="p-0.5 hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onSettings(id);
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Bouton voice : "Démarrer" si vide, "Rejoindre" si actif */}
      {type === ChannelType.VOICE && onJoinVoice && (
        <button
          onClick={handleJoinVoice}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-xs font-semibold
            bg-gradient-to-r from-green-500 to-green-600
            hover:from-green-600 hover:to-green-700
            text-white rounded-lg
            transition-all duration-200
            opacity-0 group-hover:opacity-100
            transform group-hover:translate-x-0 -translate-x-2
            shadow-md hover:shadow-lg hover:shadow-green-500/30
            hover:scale-105
          "
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2Z"/>
            <path d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z"/>
          </svg>
          {voiceActionLabel}
        </button>
      )}
    </div>
  );
}
