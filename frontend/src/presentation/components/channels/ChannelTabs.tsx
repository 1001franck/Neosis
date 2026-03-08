/**
 * CHANNEL TABS COMPONENT
 * Tabs de navigation pour Media/Links/Files
 */

'use client';

import { memo } from 'react';
import type { TabType } from './types';

interface ChannelTabsProps {
  activeTab: TabType;
  mediaCount: number;
  linksCount: number;
  filesCount: number;
  onTabChange: (tab: TabType) => void;
}

const ChannelTabsComponent = ({
  activeTab,
  mediaCount,
  linksCount,
  filesCount,
  onTabChange,
}: ChannelTabsProps): React.ReactElement => {
  return (
    <div className="flex border-b border-border animate-fadeIn">
      <button
        onClick={() => onTabChange('media')}
        className={`
          flex-1 px-4 py-3 text-sm font-medium transition-colors relative
          ${activeTab === 'media' 
            ? 'text-white' 
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        Médias        {mediaCount > 0 && (
          <span className="ml-1 text-xs text-muted-foreground">({mediaCount})</span>
        )}
        {activeTab === 'media' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>

      <button
        onClick={() => onTabChange('links')}
        className={`
          flex-1 px-4 py-3 text-sm font-medium transition-colors relative
          ${activeTab === 'links' 
            ? 'text-white' 
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        Liens
        {linksCount > 0 && (
          <span className="ml-1 text-xs text-muted-foreground">({linksCount})</span>
        )}
        {activeTab === 'links' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>

      <button
        onClick={() => onTabChange('files')}
        className={`
          flex-1 px-4 py-3 text-sm font-medium transition-colors relative
          ${activeTab === 'files' 
            ? 'text-white' 
            : 'text-muted-foreground hover:text-foreground'
          }
        `}
      >
        Fichiers
        {filesCount > 0 && (
          <span className="ml-1 text-xs text-muted-foreground">({filesCount})</span>
        )}
        {activeTab === 'files' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>
    </div>
  );
};

export const ChannelTabs = memo(ChannelTabsComponent);;
