/**
 * SIDEBAR COMPONENT
 * Composant sidebar réutilisable pour la navigation
 */

'use client';

import React, { ReactNode } from 'react';
import { useTheme } from '@shared/hooks/useTheme';
import Link from 'next/link';

interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  active?: boolean;
}

interface SidebarProps {
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
}

/**
 * Composant Sidebar pour navigation
 *
 * @example
 * <Sidebar
 *   title="Serveurs"
 *   items={[
 *     { label: "Serveur 1", href: "/servers/1" },
 *     { label: "Serveur 2", href: "/servers/2" },
 *   ]}
 * />
 */
export function Sidebar({ title, items, collapsible = false }: SidebarProps): React.ReactNode {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={`
        bg-gray-900 text-white transition-all duration-300
        flex flex-col h-full border-r border-gray-800
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && title && (
          <h2 className="font-bold text-lg">{title}</h2>
        )}
        {collapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-foreground transition-colors"
            aria-label={isCollapsed ? 'Développer' : 'Réduire'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
              />
            </svg>
          </button>
        )}
      </div>

      {/* Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg
              transition-colors duration-200
              ${item.active
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-foreground'
              }
            `}
            title={isCollapsed ? item.label : undefined}
          >
            {item.icon && <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-sm">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs bg-blue-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 flex flex-col gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-semibold text-base shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          aria-label="Basculer le thème"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
          )}
          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          {isCollapsed ? 'v1.0' : 'Discord Clone v1.0'}
        </p>
      </div>
    </aside>
  );
}

