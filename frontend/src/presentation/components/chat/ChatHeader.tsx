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
  onToggleChannelInfo?: () => void;
  onToggleMembers?: () => void;
  onToggleFriends?: () => void;
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
  showFriends = false,
  onToggleChannelInfo,
  onToggleMembers,
  onToggleFriends,
  onSearchClick,
}: ChatHeaderProps): React.ReactElement {
  const { toggleChannelSidebar, isChannelSidebarOpen, isMobile, toggleSidebar, isSidebarOpen } = useResponsiveLayout();
  const { theme, toggleTheme } = useTheme();

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
            aria-label="Ouvrir la liste des serveurs"
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
          aria-label="Basculer le thème"
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
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

        {isChannel && onSearchClick && (
          <button
            onClick={onSearchClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Rechercher"
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
            aria-label="Afficher les membres"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.794 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19C2 15.14 5.141 12 9 12H11C14.859 12 18 15.14 18 19V20H2V19Z" />
              <path d="M20.0001 20.006H22.0001V19.006C22.0001 16.6616 20.8185 14.5618 19.0001 13.3062V14.0001C19.0001 14.8891 18.8001 15.7321 18.4511 16.4961C19.4371 17.4521 20.0001 18.7701 20.0001 20.006Z" />
              <path d="M15.3801 12.0001C16.3241 11.1691 16.9551 9.98306 16.9551 8.64106C16.9551 7.30006 16.3241 6.11406 15.3801 5.28306C15.7851 4.92106 16.3001 4.70606 16.8611 4.70606C18.3531 4.70606 19.5611 5.91406 19.5611 7.40606C19.5611 8.89806 18.3531 10.1061 16.8611 10.1061C16.3001 10.1061 15.7851 9.89106 15.3801 9.52906V12.0001Z" />
            </svg>
          </button>
        )}

        {isChannel && onToggleFriends && (
          <button
            onClick={onToggleFriends}
            className={`hidden sm:inline-flex transition-colors ${
              showFriends
                ? 'text-foreground bg-muted'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Afficher les amis"
            title="Amis"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12ZM7 10C8.66 10 10 8.66 10 7C10 5.34 8.66 4 7 4C5.34 4 4 5.34 4 7C4 8.66 5.34 10 7 10ZM7 12C4.33 12 0 13.34 0 16V18H10V16C10 13.34 5.67 12 7 12ZM15 14C12.33 14 8 15.34 8 18V20H22V18C22 15.34 17.67 14 15 14Z"/>
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
            aria-label="Afficher les informations du channel"
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
