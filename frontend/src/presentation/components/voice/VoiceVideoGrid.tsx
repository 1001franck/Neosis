/**
 * PRESENTATION - VOICE VIDEO GRID
 * Affiche les flux vidéo des participants (caméra ou partage d'écran)
 * Style Google Meet : grille responsive de flux vidéo
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useVoice } from '@application/voice/useVoice';
import { getVoiceClient } from '@infrastructure/webrtc/VoiceClient';

interface VideoFeedProps {
  username: string;
  stream: MediaStream | null;
  isLocal?: boolean;
  label?: string;
}

/**
 * Un flux vidéo individuel
 */
function VideoFeed({ username, stream, isLocal, label }: VideoFeedProps) {
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
        />
      ) : (
        // Placeholder si le stream n'est pas encore disponible
        <div className="w-12 h-12 rounded-full bg-[#3f4147] flex items-center justify-center">
          <span className="text-white text-lg font-bold">{username[0]?.toUpperCase()}</span>
        </div>
      )}

      {/* Badge utilisateur */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded font-medium backdrop-blur-sm">
          {label ?? username}{isLocal ? ' (moi)' : ''}
        </span>
      </div>
    </div>
  );
}

/**
 * Grille vidéo complète affichée au-dessus du chat quand quelqu'un a la vidéo active
 */
export function VoiceVideoGrid(): React.ReactElement | null {
  const { isConnected, isVideoEnabled, isScreenSharing, connectedUsers } = useVoice();
  const client = getVoiceClient();

  // Compteur pour forcer le re-render quand un stream WebRTC devient disponible
  const [, setStreamVersion] = useState(0);

  useEffect(() => {
    const handler = () => setStreamVersion(v => v + 1);
    window.addEventListener('voice:video-stream-updated', handler);
    return () => window.removeEventListener('voice:video-stream-updated', handler);
  }, []);

  // Utilisateurs distants ayant la vidéo ou le partage d'écran actif
  const videoUsers = connectedUsers.filter(u => u.isVideoEnabled || u.isScreenSharing);

  // Rien à afficher si personne n'utilise la vidéo
  const hasAnyVideo = isVideoEnabled || isScreenSharing || videoUsers.length > 0;
  if (!isConnected || !hasAnyVideo) return null;

  // Nombre total de flux pour calculer la taille de la grille
  const totalFeeds =
    (isVideoEnabled ? 1 : 0) +
    (isScreenSharing ? 1 : 0) +
    videoUsers.length;

  const gridCols = totalFeeds === 1 ? 'grid-cols-1' : totalFeeds <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className={`p-3 grid ${gridCols} gap-3`}>
      {/* Mon flux caméra */}
      {isVideoEnabled && (
        <VideoFeed
          username="Moi"
          isLocal={true}
          stream={client.getLocalVideoStream()}
        />
      )}

      {/* Mon flux partage d'écran */}
      {isScreenSharing && (
        <VideoFeed
          username="Moi"
          label="Mon écran"
          isLocal={true}
          stream={client.getLocalScreenStream()}
        />
      )}

      {/* Flux vidéo des autres utilisateurs */}
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
