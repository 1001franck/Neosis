/**
 * HEADER COMPONENT
 * Composant header réutilisable pour le dashboard
 * Dark theme compatible
 */

'use client';

import { ReactNode } from 'react';

import { useAuth } from '@application/index';
import { logger } from '@shared/utils/logger';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Composant Header du dashboard
 *
 * @example
 * <Header
 *   title="Serveurs"
 *   subtitle="Gestion de vos serveurs"
 *   actions={<Button>Nouveau</Button>}
 * />
 */
export function Header({ title, subtitle, actions }: HeaderProps): React.ReactNode {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      logger.error('Logout failed', { error: err });
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Gauche - Titre */}
        <div className="flex-1">
          {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
          {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
        </div>

        {/* Centre - Actions */}
        {actions && <div className="flex gap-2 mx-6">{actions}</div>}

        {/* Droite - Profil */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 pr-4 border-r border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Avatar name={user.username} src={user.avatar} size="md" />
            </div>
          )}

          {/* Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:bg-red-500/10"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
