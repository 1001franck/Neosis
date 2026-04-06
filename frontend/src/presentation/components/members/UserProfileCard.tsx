/**
 * USER PROFILE CARD - Popup card affichant le profil d'un membre
 * Style Discord: bannière en haut, avatar qui chevauche, infos en dessous
 */

'use client';

import { useEffect, useRef } from 'react';
import { Avatar } from '@presentation/components/common/Avatar';

interface UserProfileCardProps {
  user: {
    id: string;
    username: string;
    avatar?: string;
    bio?: string | null;
    customStatus?: string | null;
    statusEmoji?: string | null;
    banner?: string | null;
  };
  role?: string;
  isOnline?: boolean;
  onClose: () => void;
  /** Position anchor (coords where the card should appear) */
  anchorRect?: { top: number; left: number };
}

export function UserProfileCard({
  user,
  role,
  isOnline = false,
  onClose,
  anchorRect,
}: UserProfileCardProps): React.ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);

  // Fermer au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Couleur du rôle  
  const roleColor =
    role === 'OWNER' ? '#e2b714' : role === 'ADMIN' ? '#5865f2' : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={cardRef}
        className="w-80 rounded-xl overflow-hidden shadow-2xl border border-border bg-card animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Banner */}
        <div className="h-[60px] relative">
          {user.banner ? (
            <img
              src={user.banner}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600" />
          )}
        </div>

        {/* Avatar chevauchant */}
        <div className="px-4 relative">
          <div className="relative -mt-8 mb-2 w-fit">
            <Avatar name={user.username} src={user.avatar} size="xl" />
            {/* Status dot */}
            <div
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-card ${
                isOnline ? 'bg-[#3ba55d]' : 'bg-[#747f8d]'
              }`}
            />
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">{user.username}</h3>
            {role && role !== 'MEMBER' && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  color: roleColor,
                  backgroundColor: roleColor ? `${roleColor}20` : undefined,
                }}
              >
                {role}
              </span>
            )}
          </div>

          {/* Statut personnalisé */}
          {(user.statusEmoji || user.customStatus) && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.statusEmoji && <span className="mr-1">{user.statusEmoji}</span>}
              {user.customStatus}
            </p>
          )}

          {/* Séparateur + Bio */}
          {user.bio && (
            <>
              <hr className="my-3 border-border" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  À propos de moi
                </p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                  {user.bio}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
