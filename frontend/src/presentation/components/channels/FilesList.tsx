/**
 * FILES LIST COMPONENT
 * Liste des fichiers partagés dans le channel
 */

'use client';


import type { ChannelMedia } from './types';

interface FilesListProps {
  files: ChannelMedia[];
  searchQuery: string;
}

export function FilesList({ files, searchQuery }: FilesListProps): React.ReactElement {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-[#4f545c] mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
        </svg>
        <p className="text-sm text-muted-foreground">
          {searchQuery ? 'Aucun fichier trouvÃ©' : 'Aucun fichier pour le moment'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fadeIn">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 p-3 bg-secondary rounded hover:bg-background transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 bg-card rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {file.uploadedBy} • {file.uploadedAt.toLocaleDateString()}
            </p>
          </div>
          <button
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="TÃ©lÃ©charger"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
