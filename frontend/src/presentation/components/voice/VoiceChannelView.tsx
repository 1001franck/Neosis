'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceStore } from '@application/voice/voiceStore';
import { useVoice } from '@application/voice/useVoice';
import { useLocale } from '@shared/hooks/useLocale';
import { VoiceVideoGrid } from './VoiceVideoGrid';
import type { VoiceUser } from '@domain/voice/types';

const EMPTY_USERS: VoiceUser[] = [];

interface VoiceChannelViewProps {
  channelId: string;
  channelName: string;
  onJoinVoice: (channelId: string) => void;
}

// ─── Tuile participant ────────────────────────────────────────────────────────

function ParticipantTile({ user }: { user: VoiceUser }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center gap-2.5"
    >
      <div className="relative">
        {/* Anneau "en train de parler" */}
        {user.isSpeaking && !user.isMuted && (
          <div className="absolute -inset-1.5 rounded-full border-2 border-emerald-400 animate-pulse" />
        )}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {user.username.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Badge statut — coin bas droite */}
        <div className="absolute -bottom-0.5 -right-0.5 flex gap-0.5">
          {user.isMuted && (
            <div className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 11H17.3C17.3 11.74 17.14 12.43 16.87 13.05L18.1 14.28C18.66 13.3 19 12.19 19 11ZM14.98 11.17C14.98 11.11 15 11.06 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V5.18L14.98 11.17ZM4.27 3L3 4.27L9.01 10.28V11C9 12.66 10.34 14 12 14C12.22 14 12.44 13.97 12.65 13.92L14.31 15.58C13.6 15.91 12.81 16.1 12 16.1C9.24 16.1 6.7 14 6.7 11H5C5 14.41 7.72 17.23 11 17.72V21H13V17.72C13.91 17.59 14.77 17.27 15.54 16.82L19.73 21L21 19.73L4.27 3Z"/>
              </svg>
            </div>
          )}
          {user.isDeafened && (
            <div className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C7.03 1 3 5.03 3 10V16.5C3 17.88 4.12 19 5.5 19H6.5C7.33 19 8 18.33 8 17.5V13.5C8 12.67 7.33 12 6.5 12H5V10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10V12H17.5C16.67 12 16 12.67 16 13.5V17.5C16 18.33 16.67 19 17.5 19H18.5C19.88 19 21 17.88 21 16.5V10C21 5.03 16.97 1 12 1ZM4.27 3L3 4.27L20.73 22L22 20.73L4.27 3Z"/>
              </svg>
            </div>
          )}
          {!user.isMuted && !user.isDeafened && (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          )}
        </div>
      </div>

      <span className="text-xs font-medium text-foreground max-w-[80px] truncate text-center">
        {user.username}
      </span>
    </motion.div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function VoiceChannelView({ channelId, channelName, onJoinVoice }: VoiceChannelViewProps): React.ReactElement {
  const { t } = useLocale();
  const { isConnected, connectedChannelId, isConnecting, leaveVoiceChannel } = useVoice();

  const connectedUsers = useVoiceStore((s) => s.connectedUsers.get(channelId) ?? EMPTY_USERS);

  const isInThisChannel = isConnected && connectedChannelId === channelId;
  const hasParticipants = connectedUsers.length > 0;

  return (
    <div className="flex flex-col h-full bg-background/35">
      {/* Header — même style que ChatHeader */}
      <div className="flex items-center h-12 px-4 border-b border-border shadow-sm gap-3">
        <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3C10.34 3 9 4.34 9 6V10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10V6C15 4.34 13.66 3 12 3ZM18.5 10C18.5 10 18.5 10.26 18.48 10.58C18.27 13.4 16.05 15.62 13.23 15.88V18.96H16V21H8V18.96H10.77V15.88C7.95 15.62 5.73 13.4 5.52 10.58C5.5 10.26 5.5 10 5.5 10H7.5C7.5 10 7.5 10.18 7.51 10.41C7.67 12.67 9.5 14.5 12 14.5C14.5 14.5 16.33 12.67 16.49 10.41C16.5 10.18 16.5 10 16.5 10H18.5Z"/>
        </svg>
        <span className="text-sm font-semibold text-foreground truncate">{channelName}</span>
        {hasParticipants && (
          <div className="flex items-center gap-1.5 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {connectedUsers.length} {connectedUsers.length === 1 ? t('voice.participant') : t('voice.participants')}
            </span>
          </div>
        )}
        <div className="ml-auto">
          {isInThisChannel ? (
            <button
              onClick={() => leaveVoiceChannel()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('voice.leave')}
            </button>
          ) : (
            <button
              onClick={() => onJoinVoice(channelId)}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3C10.34 3 9 4.34 9 6V10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10V6C15 4.34 13.66 3 12 3ZM18.5 10C18.5 10 18.5 10.26 18.48 10.58C18.27 13.4 16.05 15.62 13.23 15.88V18.96H16V21H8V18.96H10.77V15.88C7.95 15.62 5.73 13.4 5.52 10.58C5.5 10.26 5.5 10 5.5 10H7.5C7.5 10 7.5 10.18 7.51 10.41C7.67 12.67 9.5 14.5 12 14.5C14.5 14.5 16.33 12.67 16.49 10.41C16.5 10.18 16.5 10 16.5 10H18.5Z"/>
              </svg>
              {isConnecting ? t('common.loading') : t('voice.connected')}
            </button>
          )}
        </div>
      </div>

      {/* Grille vidéo — affichée si caméra ou partage d'écran actif */}
      <VoiceVideoGrid />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!hasParticipants ? (
          /* État vide */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 text-center max-w-xs"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3C10.34 3 9 4.34 9 6V10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10V6C15 4.34 13.66 3 12 3ZM18.5 10C18.5 10 18.5 10.26 18.48 10.58C18.27 13.4 16.05 15.62 13.23 15.88V18.96H16V21H8V18.96H10.77V15.88C7.95 15.62 5.73 13.4 5.52 10.58C5.5 10.26 5.5 10 5.5 10H7.5C7.5 10 7.5 10.18 7.51 10.41C7.67 12.67 9.5 14.5 12 14.5C14.5 14.5 16.33 12.67 16.49 10.41C16.5 10.18 16.5 10 16.5 10H18.5Z"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{t('voice.noUsers')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('voice.noParticipants')}
              </p>
            </div>
            {!isInThisChannel && (
              <button
                onClick={() => onJoinVoice(channelId)}
                disabled={isConnecting}
                className="mt-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isConnecting ? t('common.loading') : t('voice.connected')}
              </button>
            )}
          </motion.div>
        ) : (
          /* Participants connectés */
          <div className="w-full max-w-lg flex flex-col items-center gap-8">
            <AnimatePresence>
              <motion.div
                className="flex flex-wrap justify-center gap-6"
                layout
              >
                {connectedUsers.map((u: VoiceUser) => (
                  <ParticipantTile key={u.userId} user={u} />
                ))}
              </motion.div>
            </AnimatePresence>

            {!isInThisChannel && (
              <button
                onClick={() => onJoinVoice(channelId)}
                disabled={isConnecting}
                className="px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isConnecting ? t('common.loading') : t('voice.connected')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
