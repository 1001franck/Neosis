/**
 * CHAT HEADER COMPONENT
 * Header du chat avec informations du destinataire et actions
 * 
 * Responsabilités:
 * - Afficher le nom et l'avatar du destinataire
 * - Afficher le statut (online/offline/idle/dnd)
 * - Boutons d'actions (appel, vidéo, recherche, etc.)
 */

'use client';

import React from 'react';
import { useResponsiveLayout } from '@presentation/contexts/ResponsiveLayoutContext';
import { MobileMenuButton } from '@presentation/components/common/MobileMenuButton';
import { useTheme } from '@shared/hooks/useTheme';
import { useLocale } from '@shared/hooks/useLocale';

interface ChatHeaderProps {
  recipientName: string;
  recipientAvatar?: string;
  recipientStatus?: 'online' | 'offline' | 'idle' | 'dnd';
  serverName?: string;
  serverAvatar?: string;
  isChannel?: boolean;
  showChannelInfo?: boolean;
  showMembers?: boolean;
  showFriends?: boolean;
  showProfile?: boolean;
  onToggleChannelInfo?: () => void;
  onToggleMembers?: () => void;
  onToggleFriends?: () => void;
  onToggleProfile?: () => void;
  onSearchClick?: () => void;
}

export function ChatHeader({
  recipientName,
  recipientAvatar,
  recipientStatus = 'offline',
  serverName,
  serverAvatar,
  isChannel = false,
  showChannelInfo = false,
  showMembers = false,
  showProfile = false,
  onToggleChannelInfo,
  onToggleMembers,
  onToggleProfile,
  onSearchClick,
}: ChatHeaderProps): React.ReactElement {
  const { toggleChannelSidebar, isChannelSidebarOpen, isMobile, toggleSidebar, isSidebarOpen } = useResponsiveLayout();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();

  return (
    <div className="flex items-center h-12 px-2 sm:px-4 border-b border-border shadow-sm">
      {/* Menu Burger (Mobile only) */}
      {isMobile && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleSidebar('server')}
            className={`p-2 rounded transition-colors ${
              isSidebarOpen('server') ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            aria-label={t('chat.openServerList')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z" />
            </svg>
          </button>
          <MobileMenuButton
            isOpen={isChannelSidebarOpen}
            onClick={toggleChannelSidebar}
            label="Menu navigation"
          />
        </div>
      )}
      
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {serverName && (
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            {serverAvatar ? (
              <img
                src={serverAvatar}
                alt={serverName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-[10px] font-semibold text-foreground">
                  {serverName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-semibold text-foreground truncate max-w-[120px] md:max-w-[160px]">
              {serverName}
            </span>
            <span className="text-muted-foreground">/</span>
          </div>
        )}

        {!isChannel && (
          <div className="relative">
            {recipientAvatar ? (
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">
                  {recipientName.substring(0, 1).toUpperCase()}
                </span>
              </div>
            )}
            {/* Status indicator */}
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-background rounded-full ${
                recipientStatus === 'online'
                  ? 'bg-emerald-500'
                  : recipientStatus === 'idle'
                  ? 'bg-amber-500'
                  : recipientStatus === 'dnd'
                  ? 'bg-red-500'
                  : 'bg-muted'
              }`}
            />
          </div>
        )}

        {/* Recipient Name */}
        <span className="text-sm sm:text-base font-semibold text-foreground truncate">
          {recipientName}
        </span>
      </div>

      {/* Header Actions */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('chat.toggleTheme')}
          title={theme === 'dark' ? t('chat.lightMode') : t('chat.darkMode')}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          )}
        </button>

        {!isChannel && onToggleProfile && (
          <button
            onClick={onToggleProfile}
            className={`hidden sm:inline-flex transition-colors ${
              showProfile
                ? 'text-foreground bg-muted'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={t('chat.viewProfile')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </button>
        )}

        {onSearchClick && (
          <button
            onClick={onSearchClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('chat.search')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 7.863 17.167 5.854 15.656 4.344C14.146 2.832 12.137 2 10 2C7.863 2 5.854 2.832 4.344 4.344C2.833 5.854 2 7.863 2 10C2 12.137 2.833 14.146 4.344 15.656C5.854 17.168 7.863 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C8.397 16 6.891 15.376 5.758 14.243C4.624 13.11 4 11.603 4 10C4 8.397 4.624 6.891 5.758 5.758C6.891 4.624 8.397 4 10 4C11.603 4 13.109 4.624 14.242 5.758C15.376 6.891 16 8.397 16 10C16 11.603 15.376 13.11 14.242 14.243C13.109 15.376 11.603 16 10 16Z" />
            </svg>
          </button>
        )}

        {isChannel && onToggleMembers && (
          <button
            onClick={onToggleMembers}
            className={`hidden sm:inline-flex transition-colors ${
              showMembers
                ? 'text-foreground bg-muted'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={t('chat.showMembers')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 20V18C17 16.3431 15.6569 15 14 15H10C8.34315 15 7 16.3431 7 18V20H17Z" />
              <circle cx="12" cy="10" r="3" />
              <path d="M3 7H5V9H3V7ZM3 11H5V13H3V11ZM3 15H5V17H3V15ZM19 7H21V9H19V7ZM19 11H21V13H19V11ZM19 15H21V17H19V15Z" />
            </svg>
          </button>
        )}

        {isChannel && onToggleChannelInfo && (
          <button
            onClick={onToggleChannelInfo}
            className={`hidden sm:inline-flex transition-colors ${
              showChannelInfo
                ? 'text-foreground bg-muted'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={t('chat.showChannelInfo')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3C3.897 3 3 3.897 3 5V19C3 20.103 3.897 21 5 21H19C20.103 21 21 20.103 21 19V5C21 3.897 20.103 3 19 3H5ZM5 19V5H13V19H5ZM19 19H15V5H19V19Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
