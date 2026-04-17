/**
 * PRESENTATION - VOICE CONTROLS
 * Barre de contrôles vocaux moderne affichée quand l'utilisateur est connecté à un voice channel
 *
 * UI améliorée avec:
 * - Design Discord-like moderne
 * - Animations fluides
 * - Tooltips informatifs
 * - Nom du channel affiché
 */

'use client';

import React, { useState } from 'react';
import { useVoice } from '@application/voice/useVoice';
import { useChannels } from '@application/channels/useChannels';

export function VoiceControls(): React.ReactElement | null {
  const {
    isConnected,
    connectedChannelId,
    isMuted,
    isDeafened,
    toggleMute,
    toggleDeafen,
    leaveVoiceChannel,
  } = useVoice();

  const { channels } = useChannels();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Ne rien afficher si pas connecté
  if (!isConnected || !connectedChannelId) {
    return null;
  }

  // Trouver le nom du channel
  const connectedChannel = channels.find(c => c.id === connectedChannelId);
  const channelName = connectedChannel?.name || 'Salon vocal';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1e1f22] via-[#232428] to-[#1e1f22] border-t border-[#3f4147] px-3 py-2.5 flex items-center gap-3 z-50 shadow-2xl">
      {/* Section gauche : Info du channel */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Indicateur de connexion animé */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3C10.34 3 9 4.34 9 6V10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10V6C15 4.34 13.66 3 12 3ZM18.5 10C18.5 10 18.5 10.26 18.48 10.58C18.27 13.4 16.05 15.62 13.23 15.88V18.96H16V21H8V18.96H10.77V15.88C7.95 15.62 5.73 13.4 5.52 10.58C5.5 10.26 5.5 10 5.5 10H7.5C7.5 10 7.5 10.18 7.51 10.41C7.67 12.67 9.5 14.5 12 14.5C14.5 14.5 16.33 12.67 16.49 10.41C16.5 10.18 16.5 10 16.5 10H18.5Z"/>
            </svg>
          </div>
          {/* Pulse animation */}
          <div className="absolute inset-0 w-8 h-8 rounded-lg bg-green-500 animate-ping opacity-20"></div>
        </div>

        {/* Info texte */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Connexion vocale</span>
          </div>
          <span className="text-sm text-gray-200 font-medium truncate">
            {channelName}
          </span>
        </div>
      </div>

      {/* Section centrale : Contrôles */}
      <div className="flex items-center gap-2">
        {/* Bouton Mute/Unmute */}
        <div className="relative group">
          <button
            onClick={toggleMute}
            onMouseEnter={() => setHoveredButton('mute')}
            onMouseLeave={() => setHoveredButton(null)}
            className={`
              relative p-3 rounded-lg transition-all duration-200 transform hover:scale-105
              ${isMuted
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                : 'bg-[#3f4147] hover:bg-[#4a4d55] shadow-md'
              }
            `}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            {isMuted ? (
              // Icône Micro OFF (slash)
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 11H17.3C17.3 11.74 17.14 12.43 16.87 13.05L18.1 14.28C18.66 13.3 19 12.19 19 11ZM14.98 11.17C14.98 11.11 15 11.06 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V5.18L14.98 11.17ZM4.27 3L3 4.27L9.01 10.28V11C9 12.66 10.34 14 12 14C12.22 14 12.44 13.97 12.65 13.92L14.31 15.58C13.6 15.91 12.81 16.1 12 16.1C9.24 16.1 6.7 14 6.7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C13.91 17.59 14.77 17.27 15.54 16.82L19.73 21L21 19.73L4.27 3Z"/>
              </svg>
            ) : (
              // Icône Micro ON
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM17.3 11C17.3 14 14.76 16.1 12 16.1C9.24 16.1 6.7 14 6.7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C16.28 17.24 19 14.42 19 11H17.3Z"/>
              </svg>
            )}
          </button>

          {/* Tooltip */}
          {hoveredButton === 'mute' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs font-medium rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm">
              {isMuted ? 'Activer le micro' : 'Couper le micro'}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>

        {/* Bouton Deafen/Undeafen */}
        <div className="relative group">
          <button
            onClick={toggleDeafen}
            onMouseEnter={() => setHoveredButton('deafen')}
            onMouseLeave={() => setHoveredButton(null)}
            className={`
              relative p-3 rounded-lg transition-all duration-200 transform hover:scale-105
              ${isDeafened
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                : 'bg-[#3f4147] hover:bg-[#4a4d55] shadow-md'
              }
            `}
            title={isDeafened ? 'Activer le son' : 'Couper le son'}
          >
            {isDeafened ? (
              // Icône Casque OFF (slash)
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C7.03 1 3 5.03 3 10V16.5C3 17.88 4.12 19 5.5 19H6.5C7.33 19 8 18.33 8 17.5V13.5C8 12.67 7.33 12 6.5 12H5V10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10V12H17.5C16.67 12 16 12.67 16 13.5V17.5C16 18.33 16.67 19 17.5 19H18.5C19.88 19 21 17.88 21 16.5V10C21 5.03 16.97 1 12 1ZM4.27 3L3 4.27L20.73 22L22 20.73L4.27 3Z"/>
              </svg>
            ) : (
              // Icône Casque ON
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C7.03 1 3 5.03 3 10V16.5C3 17.88 4.12 19 5.5 19H6.5C7.33 19 8 18.33 8 17.5V13.5C8 12.67 7.33 12 6.5 12H5V10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10V12H17.5C16.67 12 16 12.67 16 13.5V17.5C16 18.33 16.67 19 17.5 19H18.5C19.88 19 21 17.88 21 16.5V10C21 5.03 16.97 1 12 1Z"/>
              </svg>
            )}
          </button>

          {/* Tooltip */}
          {hoveredButton === 'deafen' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs font-medium rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm">
              {isDeafened ? 'Activer le son' : 'Couper le son'}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="w-px h-8 bg-[#3f4147]"></div>

        {/* Bouton Déconnecter */}
        <div className="relative group">
          <button
            onClick={() => leaveVoiceChannel()}
            onMouseEnter={() => setHoveredButton('disconnect')}
            onMouseLeave={() => setHoveredButton(null)}
            className="p-3 rounded-lg bg-[#3f4147] hover:bg-red-500 transition-all duration-200 transform hover:scale-105 shadow-md"
            title="Se déconnecter"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 17V19H2V17H16ZM21 7V9L12 13.5V11L18 8V11H21V7M16 3V5H2V3H16Z"/>
            </svg>
          </button>

          {/* Tooltip */}
          {hoveredButton === 'disconnect' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs font-medium rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm">
              Se déconnecter
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
