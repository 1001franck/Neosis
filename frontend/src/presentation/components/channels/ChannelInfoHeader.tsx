/**
 * CHANNEL INFO HEADER COMPONENT
 * Header du sidebar avec titre du channel et bouton fermer
 * 
 * Responsabilités:
 * - Afficher le nom du channel
 * - Bouton pour fermer le sidebar
 */

'use client';

import { memo } from 'react';

interface ChannelInfoHeaderProps {
  channelName: string;
  onClose?: () => void;
}

const ChannelInfoHeaderComponent = ({
  channelName,
  onClose,
}: ChannelInfoHeaderProps): React.ReactElement => {
  return (
    <div className="p-4 border-b border-border flex items-center justify-between">
      <h2 className="text-foreground font-semibold">{channelName}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fermer la barre latÃ©rale"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export const ChannelInfoHeader = memo(ChannelInfoHeaderComponent);
