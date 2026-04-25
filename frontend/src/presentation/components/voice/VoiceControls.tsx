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

import React, { useState, useEffect } from 'react';
import { useVoice } from '@application/voice/useVoice';
import { useChannels } from '@application/channels/useChannels';
import { getVoiceClient } from '@infrastructure/webrtc/VoiceClient';
import { useLocale } from '@shared/hooks/useLocale';

export function VoiceControls(): React.ReactElement | null {
  const {
    isConnected,
    connectedChannelId,
    isMuted,
    isDeafened,
    isVideoEnabled,
    isScreenSharing,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    toggleScreenShare,
    leaveVoiceChannel,
  } = useVoice();

  const { channels } = useChannels();
  const { t } = useLocale();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // Détecter si l'autoplay audio est bloqué par le navigateur
  useEffect(() => {
    const handler = () => setAudioBlocked(true);
    window.addEventListener('voice:audio-autoplay-blocked', handler);
    return () => window.removeEventListener('voice:audio-autoplay-blocked', handler);
  }, []);

  // Ne rien afficher si pas connecté
  if (!isConnected || !connectedChannelId) {
    return null;
  }

  // Trouver le nom du channel
  const connectedChannel = channels.find(c => c.id === connectedChannelId);
  const channelName = connectedChannel?.name || t('voice.defaultChannel');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1e1f22] via-[#232428] to-[#1e1f22] border-t border-[#3f4147] px-3 py-2.5 flex items-center gap-3 z-50 shadow-2xl">
      {/* Bannière déblocage audio — navigateurs qui bloquent l'autoplay */}
      {audioBlocked && (
        <button
          onClick={() => {
            getVoiceClient().unlockAudio();
            setAudioBlocked(false);
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-yellow-500 text-black text-xs font-semibold px-4 py-1.5 rounded-t-lg hover:bg-yellow-400 transition-colors"
        >
          {t('voice.unlockAudio')}
        </button>
      )}
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
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">{t('voice.connected')}</span>
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
            title={isMuted ? t('voice.unmute') : t('voice.mute')}
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
              {isMuted ? t('voice.unmute') : t('voice.mute')}
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
            title={isDeafened ? t('voice.undeafen') : t('voice.deafen')}
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
              {isDeafened ? t('voice.undeafen') : t('voice.deafen')}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>

        {/* Bouton Caméra */}
        <div className="relative group">
          <button
            onClick={() => void toggleCamera()}
            onMouseEnter={() => setHoveredButton('camera')}
            onMouseLeave={() => setHoveredButton(null)}
            className={`
              relative p-3 rounded-lg transition-all duration-200 transform hover:scale-105
              ${isVideoEnabled
                ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                : 'bg-[#3f4147] hover:bg-[#4a4d55] shadow-md'
              }
            `}
            title={isVideoEnabled ? t('voice.disableCamera') : t('voice.enableCamera')}
          >
            {isVideoEnabled ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
              </svg>
            )}
          </button>
          {hoveredButton === 'camera' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs font-medium rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm">
              {isVideoEnabled ? t('voice.disableCamera') : t('voice.enableCamera')}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>

        {/* Bouton Partage d'écran */}
        <div className="relative group">
          <button
            onClick={() => void toggleScreenShare()}
            onMouseEnter={() => setHoveredButton('screen')}
            onMouseLeave={() => setHoveredButton(null)}
            className={`
              relative p-3 rounded-lg transition-all duration-200 transform hover:scale-105
              ${isScreenSharing
                ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
                : 'bg-[#3f4147] hover:bg-[#4a4d55] shadow-md'
              }
            `}
            title={isScreenSharing ? t('voice.stopScreenShare') : t('voice.startScreenShare')}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78.48-4.34 1.71-5.5 3.72.14-1.4.59-4.83 3.89-6.56l-.89-.86V6.5L15 10.26l-2 2-2 2.21z"/>
            </svg>
          </button>
          {hoveredButton === 'screen' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs font-medium rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm">
              {isScreenSharing ? t('voice.stopScreenShare') : t('voice.startScreenShare')}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="w-px h-8 bg-[#3f4147]"></div>

        {/* Bouton Déconnecter */}
        <div className="relative group">
          <button
            onClick={() => void leaveVoiceChannel()}
            onMouseEnter={() => setHoveredButton('disconnect')}
            onMouseLeave={() => setHoveredButton(null)}
            className="p-3 rounded-lg bg-[#3f4147] hover:bg-red-500 transition-all duration-200 transform hover:scale-105 shadow-md"
            title={t('voice.disconnect')}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 17V19H2V17H16ZM21 7V9L12 13.5V11L18 8V11H21V7M16 3V5H2V3H16Z"/>
            </svg>
          </button>

          {/* Tooltip */}
          {hoveredButton === 'disconnect' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs font-medium rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm">
              {t('voice.disconnect')}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
