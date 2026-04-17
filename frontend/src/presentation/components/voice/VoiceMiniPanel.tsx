/**
 * PRESENTATION - VOICE MINI PANEL
 * Fenêtre flottante pour le voice channel (Discord-like, compacte)
 *
 * Responsabilités:
 * - Afficher l'état connecté + nom du channel
 * - Afficher la liste des participants
 * - Contrôles: mute / deafen / leave
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useVoice } from '@application/voice/useVoice';
import { useChannels } from '@application/channels/useChannels';
import { VoiceUsersList } from './VoiceUsersList';
import { useResponsiveLayout } from '@presentation/contexts/ResponsiveLayoutContext';

export function VoiceMiniPanel(): React.ReactElement | null {
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
    connectedUsers,
  } = useVoice();

  const { channels } = useChannels();
  const { isSidebarOpen, isMobile } = useResponsiveLayout();
  const [showUsers, setShowUsers] = useState(true);

  const connectedChannel = channels.find(c => c.id === connectedChannelId);
  const channelName = connectedChannel?.name || 'Salon vocal';
  const userCount = connectedUsers.length;

  const participantsLabel = useMemo(() => {
    if (userCount === 0) return 'Aucun participant';
    return `${userCount} ${userCount === 1 ? 'participant' : 'participants'}`;
  }, [userCount]);

  if (!isConnected || !connectedChannelId) {
    return null;
  }

  const dockRight = !isMobile && (isSidebarOpen('members') || isSidebarOpen('channel-info'));

  return (
    <div
      className={`fixed bottom-4 z-50 w-[320px] max-w-[90vw] ${
        dockRight ? 'right-4 left-auto' : 'left-4 md:left-[84px] right-auto'
      }`}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3C10.34 3 9 4.34 9 6V10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10V6C15 4.34 13.66 3 12 3ZM18.5 10C18.5 10 18.5 10.26 18.48 10.58C18.27 13.4 16.05 15.62 13.23 15.88V18.96H16V21H8V18.96H10.77V15.88C7.95 15.62 5.73 13.4 5.52 10.58C5.5 10.26 5.5 10 5.5 10H7.5C7.5 10 7.5 10.18 7.51 10.41C7.67 12.67 9.5 14.5 12 14.5C14.5 14.5 16.33 12.67 16.49 10.41C16.5 10.18 16.5 10 16.5 10H18.5Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-green-400 uppercase tracking-wide">Connexion vocale</div>
              <div className="text-sm font-medium text-foreground truncate">{channelName}</div>
            </div>
          </div>

          <button
            onClick={() => setShowUsers((v) => !v)}
            className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Afficher les participants"
          >
            {showUsers ? 'Masquer' : 'Voir'}
          </button>
        </div>

        {/* Participants */}
        {showUsers && (
          <div className="border-b border-border">
            <div className="px-4 pt-3 text-xs text-muted-foreground">{participantsLabel}</div>
            <VoiceUsersList users={connectedUsers} channelName={channelName} />
          </div>
        )}

        {/* Controls */}
        <div className="px-3 py-2 flex flex-wrap items-center gap-2">
          {/* Ligne 1 : micro + son */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={toggleMute}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isMuted ? 'bg-red-500 text-white' : 'bg-secondary text-foreground'
              }`}
            >
              {isMuted ? 'Activer le micro' : 'Couper le micro'}
            </button>
            <button
              onClick={toggleDeafen}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isDeafened ? 'bg-red-500 text-white' : 'bg-secondary text-foreground'
              }`}
            >
              {isDeafened ? 'Activer le son' : 'Couper le son'}
            </button>
          </div>

          {/* Ligne 2 : caméra + écran + quitter */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => void toggleCamera()}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isVideoEnabled ? 'bg-blue-500 text-white' : 'bg-secondary text-foreground'
              }`}
            >
              {isVideoEnabled ? 'Caméra ON' : 'Caméra'}
            </button>
            <button
              onClick={() => void toggleScreenShare()}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isScreenSharing ? 'bg-green-500 text-white' : 'bg-secondary text-foreground'
              }`}
            >
              {isScreenSharing ? 'Partage ON' : 'Partager'}
            </button>
            <button
              onClick={() => leaveVoiceChannel()}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Quitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
