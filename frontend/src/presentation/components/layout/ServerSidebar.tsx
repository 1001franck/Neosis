/**
 * SERVER SIDEBAR COMPONENT
 * Barre latérale gauche avec les serveurs (style neosis)
 * 
 * Responsabilités:
 * - Afficher la liste des serveurs avec icônes circulaires
 * - Navigation entre serveurs (1-click)
 * - Boutons Créer / Rejoindre un serveur
 * - User section en bas (avatar, settings, logout)
 * 
 * Comportement responsive:
 * - Mobile: Overlay via ResponsiveSidebar
 * - Desktop (md+): Toujours visible (72px)
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@presentation/components/common/Avatar';
import type { Server } from '@domain/servers/types';
import { useLocale } from '@shared/hooks/useLocale';

interface ServerSidebarUser {
  username: string;
  avatar?: string;
  customStatus?: string;
  statusEmoji?: string;
}

interface ServerSidebarProps {
  servers?: Server[];
  activeServerId?: string;
  onServerClick?: (serverId: string) => void;
  onCreateServer?: () => void;
  onJoinServer?: () => void;
  onAddFriend?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  user?: ServerSidebarUser;
}

/**
 * Composant ServerSidebar
 * Design neosis-like : icônes circulaires, active indicator, tooltips
 * Contenu uniquement — le wrapper responsive est géré par ResponsiveSidebar
 */
export function ServerSidebar({ 
  servers, 
  activeServerId,
  onServerClick,
  onCreateServer,
  onJoinServer,
  onAddFriend,
  onSettings,
  onLogout,
  user,
}: ServerSidebarProps): React.ReactNode {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();

  const handleServerClick = (serverId: string) => {
    onServerClick?.(serverId);
    router.push(`/servers/${serverId}`);
  };

  const handleAddFriend = () => {
    if (onAddFriend) {
      onAddFriend();
      return;
    }
    router.push('/messages?addFriend=1');
  };

  return (
    <>
      {/* Home / Dashboard */}
      <div className="flex items-center justify-center mb-2">
        <div className="relative group">
          <button
            onClick={() => router.push('/messages')}
            className="group relative flex items-center justify-center w-12 h-12 rounded-[24px] bg-card hover:rounded-[16px] hover:bg-primary transition-all duration-200"
            aria-label={t('nav.home')}
          >
            <img
              src="/neosis.png"
              alt="Neosis"
              className="w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {t('nav.home')}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-card rounded-full mx-auto" />

      {/* Server List */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 scrollbar-hide py-2">
        {servers?.map((server) => {
          const isActive = server.id === activeServerId;
          
          return (
            <div key={server.id} className="flex items-center justify-center relative group">
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 w-1 h-10 bg-white rounded-r-full" />
              )}
              
              {/* Server Icon */}
              <button
                onClick={() => handleServerClick(server.id)}
                className={`
                  relative flex items-center justify-center w-12 h-12 
                  rounded-[24px] overflow-hidden
                  transition-all duration-200
                  ${isActive 
                    ? 'rounded-[16px] bg-primary' 
                    : 'bg-background hover:rounded-[16px] hover:bg-primary'
                  }
                `}
                aria-label={server.name}
              >
                {server.imageUrl || server.icon ? (
                  <img 
                    src={server.imageUrl || server.icon} 
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-foreground group-hover:text-primary-foreground">
                    {server.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {server.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 mt-auto pt-2">
        {/* Add Server */}
        <div className="flex items-center justify-center relative group">
          <button
            onClick={onCreateServer}
            className="flex items-center justify-center w-12 h-12 rounded-[24px] bg-card hover:rounded-[16px] hover:bg-emerald-500 transition-all duration-200"
            aria-label={t('nav.createServer')}
          >
            <svg
              className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {t('nav.createServer')}
          </div>
        </div>

        {/* Join Server */}
        <div className="flex items-center justify-center relative group">
          <button
            onClick={onJoinServer}
            className="flex items-center justify-center w-12 h-12 rounded-[24px] bg-card hover:rounded-[16px] hover:bg-emerald-500 transition-all duration-200"
            aria-label={t('nav.joinServer')}
          >
            <svg
              className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 10.9C11.39 10.9 10.9 11.39 10.9 12C10.9 12.61 11.39 13.1 12 13.1C12.61 13.1 13.1 12.61 13.1 12C13.1 11.39 12.61 10.9 12 10.9ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM14.19 14.19L6 18L9.81 9.81L18 6L14.19 14.19Z" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {t('nav.joinServer')}
          </div>
        </div>

        {/* Add Friend */}
        <div className="flex items-center justify-center relative group">
          <button
            onClick={handleAddFriend}
            className="flex items-center justify-center w-12 h-12 rounded-[24px] bg-card hover:rounded-[16px] hover:bg-primary transition-all duration-200"
            aria-label={t('nav.addFriend')}
          >
            <svg
              className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12ZM7 10C8.66 10 10 8.66 10 7C10 5.34 8.66 4 7 4C5.34 4 4 5.34 4 7C4 8.66 5.34 10 7 10ZM7 12C4.33 12 0 13.34 0 16V18H10V16C10 13.34 5.67 12 7 12ZM15 14C12.33 14 8 15.34 8 18V20H22V18C22 15.34 17.67 14 15 14ZM20 8V6H18V8H16V10H18V12H20V10H22V8H20Z" />
            </svg>
          </button>
          <div className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {t('nav.addFriend')}
          </div>
        </div>

        {/* Separator */}
        <div className="w-8 h-[2px] bg-border rounded-full mx-auto" />

      {/* User section */}
      <div className="flex flex-col items-center gap-1.5 pb-2">
        {/* User Avatar */}
        <div className="relative group">
          {user ? (
            <Avatar name={user.username} src={user.avatar} size="lg" className="cursor-pointer" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-base font-semibold text-primary-foreground">?</span>
            </div>
          )}
          {/* Online status */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-secondary rounded-full" />
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {user?.username ?? t('nav.user')}
          </div>
        </div>

        {/* Settings */}
        <div className="relative group">
          <button
            onClick={onSettings}
            className="flex items-center justify-center w-12 h-12 rounded-[16px] text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200"
            aria-label={t('nav.settings')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {t('nav.settings')}
            </div>
          </div>

          {/* Logout */}
        <div className="relative group">
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-12 h-12 rounded-[16px] text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            aria-label={t('nav.logout')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {t('nav.logout')}
            </div>

          {/* Language switcher */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="flex items-center justify-center w-12 h-12 rounded-[16px] text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 text-xs font-bold"
              aria-label={t('language.label')}
            >
              {locale === 'fr' ? '🇫🇷' : '🇬🇧'}
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-black text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {locale === 'fr' ? t('language.fr') : t('language.en')}
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
