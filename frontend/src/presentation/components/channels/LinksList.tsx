/**
 * LINKS LIST COMPONENT
 * Liste des liens partagés dans le channel
 */

'use client';


import type { ChannelLink } from './types';

interface LinksListProps {
  links: ChannelLink[];
  searchQuery: string;
}

export function LinksList({ links, searchQuery }: LinksListProps): React.ReactElement {
  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-[#4f545c] mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
        </svg>
        <p className="text-sm text-muted-foreground">
          {searchQuery ? 'Aucun lien trouvé' : 'Aucun lien pour le moment'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fadeIn">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 bg-secondary rounded hover:bg-background transition-colors"
        >
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#00b0f4] truncate hover:underline">
                {link.title || link.url}
              </p>
              {link.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {link.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Publié par {link.postedBy}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

