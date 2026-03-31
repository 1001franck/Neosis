/**
 * PRESENTATION - VOICE USERS LIST
 * Composant affichant la liste des utilisateurs connectés dans un voice channel
 *
 * UI moderne avec:
 * - Avatars des utilisateurs
 * - Indicateurs mute/deafen
 * - Animations d'entrée/sortie
 */

'use client';

import React from 'react';
import type { VoiceUser } from '@domain/voice/types';

interface VoiceUsersListProps {
  users: VoiceUser[];
  channelName: string;
}

export function VoiceUsersList({ users, channelName: _channelName }: VoiceUsersListProps): React.ReactElement {
  if (users.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#3f4147] flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3C10.34 3 9 4.34 9 6V10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10V6C15 4.34 13.66 3 12 3ZM18.5 10C18.5 10 18.5 10.26 18.48 10.58C18.27 13.4 16.05 15.62 13.23 15.88V18.96H16V21H8V18.96H10.77V15.88C7.95 15.62 5.73 13.4 5.52 10.58C5.5 10.26 5.5 10 5.5 10H7.5C7.5 10 7.5 10.18 7.51 10.41C7.67 12.67 9.5 14.5 12 14.5C14.5 14.5 16.33 12.67 16.49 10.41C16.5 10.18 16.5 10 16.5 10H18.5Z"/>
          </svg>
        </div>
        <p className="text-sm text-gray-400 font-medium">Aucun utilisateur connecté</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-1">
      <div className="px-2 py-1 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {users.length} {users.length === 1 ? 'Utilisateur' : 'Utilisateurs'}
          </span>
        </div>
      </div>

      {users.map((user) => (
        <div
          key={user.userId}
          className="
            flex items-center gap-3 px-2 py-2 rounded-lg
            hover:bg-[#3f4147] transition-colors
            group
            animate-in slide-in-from-left duration-200
          "
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}

            {user.isSpeaking && !user.isMuted && (
              <div
                className="absolute -inset-1 rounded-full border-2 border-green-400 animate-pulse"
                title="Parle"
              />
            )}

            {/* Indicateur de connexion */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#232428]"></div>
          </div>

          {/* Info utilisateur */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {user.username}
            </p>
          </div>

          {/* Indicateurs d'état */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {user.isMuted && (
              <div
                className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center"
                title="Micro coupé"
              >
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 11H17.3C17.3 11.74 17.14 12.43 16.87 13.05L18.1 14.28C18.66 13.3 19 12.19 19 11ZM14.98 11.17C14.98 11.11 15 11.06 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V5.18L14.98 11.17ZM4.27 3L3 4.27L9.01 10.28V11C9 12.66 10.34 14 12 14C12.22 14 12.44 13.97 12.65 13.92L14.31 15.58C13.6 15.91 12.81 16.1 12 16.1C9.24 16.1 6.7 14 6.7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C13.91 17.59 14.77 17.27 15.54 16.82L19.73 21L21 19.73L4.27 3Z"/>
                </svg>
              </div>
            )}

            {user.isDeafened && (
              <div
                className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center"
                title="Son coupé"
              >
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1C7.03 1 3 5.03 3 10V16.5C3 17.88 4.12 19 5.5 19H6.5C7.33 19 8 18.33 8 17.5V13.5C8 12.67 7.33 12 6.5 12H5V10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10V12H17.5C16.67 12 16 12.67 16 13.5V17.5C16 18.33 16.67 19 17.5 19H18.5C19.88 19 21 17.88 21 16.5V10C21 5.03 16.97 1 12 1ZM4.27 3L3 4.27L20.73 22L22 20.73L4.27 3Z"/>
                </svg>
              </div>
            )}

            {!user.isMuted && !user.isDeafened && (
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: '40%' }}></div>
                  <div className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: '70%', animationDelay: '0.1s' }}></div>
                  <div className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }}></div>
                  <div className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
