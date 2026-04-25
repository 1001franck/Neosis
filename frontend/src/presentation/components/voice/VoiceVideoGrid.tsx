/**
 * PRESENTATION - VOICE VIDEO GRID
 * Affiche les flux vidéo des participants (caméra ou partage d'écran)
 * Style Google Meet : grille responsive sans espaces vides
 *
 * Règle : caméra et partage d'écran sont mutuellement exclusifs.
 * Un seul flux vidéo actif par participant à la fois.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useVoice } from '@application/voice/useVoice';
import { getVoiceClient } from '@infrastructure/webrtc/VoiceClient';
import { useAuthStore } from '@application/auth/authStore';

interface VideoFeedProps {
  username: string;
  stream: MediaStream | null;
  isLocal?: boolean;
  mirrored?: boolean;
  label?: string;
}

/**
 * Un flux vidéo individuel
 */
function VideoFeed({ username, stream, isLocal, mirrored, label }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#1e1f22] aspect-video flex items-center justify-center border border-[#3f4147]">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
        />
      ) : (
        /* Placeholder avatar si le stream n'est pas encore disponible */
        <div className="w-12 h-12 rounded-full bg-[#3f4147] flex items-center justify-center">
          <span className="text-white text-lg font-bold">{username[0]?.toUpperCase()}</span>
        </div>
      )}

      {/* Badge nom d'utilisateur */}
      <div className="absolute bottom-2 left-2">
        <span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded font-medium backdrop-blur-sm">
          {label ?? username}{isLocal ? ' (moi)' : ''}
        </span>
      </div>
    </div>
  );
}

/**
 * Grille vidéo complète — affichée quand au moins un participant a la vidéo active
 */
export function VoiceVideoGrid(): React.ReactElement | null {
  const { isConnected, isVideoEnabled, isScreenSharing, connectedUsers } = useVoice();
  const client = getVoiceClient();

  // Forcer le re-render quand un stream WebRTC distant devient disponible
  const [, setStreamVersion] = useState(0);
  useEffect(() => {
    const handler = () => setStreamVersion(v => v + 1);
    window.addEventListener('voice:video-stream-updated', handler);
    return () => window.removeEventListener('voice:video-stream-updated', handler);
  }, []);

  // Utilisateurs distants avec vidéo ou partage d'écran actif
  // On exclut l'utilisateur courant (déjà affiché en local)
  const currentUserId = useAuthStore(state => state.user?.id);
  const connectedPeerIds = client.getConnectedPeerIds();
  const videoUsers = connectedUsers.filter((u) => {
    if (u.userId === currentUserId) return false;

    const hasStateVideo = Boolean(u.isVideoEnabled || u.isScreenSharing);
    const hasRemoteStream = Boolean(client.getRemoteVideoStream(u.userId));
    const isConnectedPeer = connectedPeerIds.includes(u.userId);

    return hasStateVideo || (isConnectedPeer && hasRemoteStream);
  });

  const hasAnyVideo = isVideoEnabled || isScreenSharing || videoUsers.length > 0;
  if (!isConnected || !hasAnyVideo) return null;

  return (
    <div
      className="p-3 grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
    >
      {/* Flux local caméra */}
      {isVideoEnabled && (
        <VideoFeed
          username="Moi"
          isLocal={true}
          mirrored={true}
          stream={client.getLocalVideoStream()}
        />
      )}

      {/* Flux local partage d'écran */}
      {isScreenSharing && (
        <VideoFeed
          username="Moi"
          label="Mon écran"
          isLocal={true}
          mirrored={false}
          stream={client.getLocalScreenStream()}
        />
      )}

      {/* Flux distants — un seul flux vidéo actif par utilisateur (exclusion mutuelle) */}
      {videoUsers.map(user => (
        <VideoFeed
          key={user.userId}
          username={user.username}
          label={user.isScreenSharing ? `${user.username} (écran)` : undefined}
          stream={client.getRemoteVideoStream(user.userId) ?? null}
        />
      ))}
    </div>
  );
}
