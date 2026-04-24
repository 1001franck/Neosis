/**
 * MAIN LAYOUT COMPONENT
 * Layout principal de l'application Discord-like
 * 
 * Responsabilités:
 * - Composer ServerSidebar + DirectMessagesPanel + contenu principal
 * - Gérer le layout responsive unifié
 * - Coordonner les états actifs entre composants
 * 
 * Architecture responsive:
 * - Utilise ResponsiveSidebar pour toutes les sidebars
 * - Mobile: Sidebars en overlay plein écran
 * - Desktop: Layout classique avec widths fixes
 */

'use client';

import React from 'react';
import { ResponsiveSidebar } from '@presentation/components/common/ResponsiveSidebar';
import { ServerSidebar } from './ServerSidebar';
import { DirectMessagesPanel } from './DirectMessagesPanel';
import type { Server } from '@domain/servers/types';

interface MainLayoutUser {
  username: string;
  avatar?: string;
  customStatus?: string;
  statusEmoji?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  /** ID du serveur actuellement actif */
  activeServerId?: string;
  /** Afficher ou non le panel des messages directs */
  showDirectMessages?: boolean;
  /** Liste des serveurs */
  servers?: Server[];
  /** Callbacks pour la ServerSidebar */
  onLogout?: () => void;
  onSettings?: () => void;
  onCreateServer?: () => void;
  onJoinServer?: () => void;
  user?: MainLayoutUser;
}

/**
 * MainLayout - Layout principal de l'application
 * 
 * Structure responsive à 3 colonnes:
 * 1. ServerSidebar (72px) - Navigation serveurs (desktop only)
 * 2. DirectMessagesPanel (240px) - Liste messages/amis (responsive)
 * 3. Main content area - Contenu principal (flex-1)
 */
export function MainLayout({
  children,
  activeServerId,
  showDirectMessages = true,
  servers,
  onLogout,
  onSettings,
  onCreateServer,
  onJoinServer,
  user,
}: MainLayoutProps): React.ReactNode {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Server Sidebar - 72px, toujours visible sur desktop */}
      <ResponsiveSidebar id="server" position="left" width="w-[72px]" showOnDesktop={true} className="bg-secondary py-3 gap-2">
        <ServerSidebar
          activeServerId={activeServerId}
          servers={servers}
          onLogout={onLogout}
          onSettings={onSettings}
          onCreateServer={onCreateServer}
          onJoinServer={onJoinServer}
          user={user}
        />
      </ResponsiveSidebar>

      {/* Direct Messages Panel - 240px, responsive */}
      {showDirectMessages && (
        <ResponsiveSidebar id="dm-panel" position="left" width="w-60">
          <DirectMessagesPanel />
        </ResponsiveSidebar>
      )}

      {/* Main Content Area - Flex remaining space */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

