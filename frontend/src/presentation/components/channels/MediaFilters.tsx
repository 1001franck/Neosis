/**
 * MEDIA FILTERS COMPONENT
 * Filtres pour les types de médias (All/Images/Videos)
 */

'use client';

import { memo } from 'react';
import type { MediaFilter } from './types';

interface MediaFiltersProps {
  activeFilter: MediaFilter;
  onFilterChange: (filter: MediaFilter) => void;
}

const MediaFiltersComponent = ({
  activeFilter,
  onFilterChange,
}: MediaFiltersProps): React.ReactElement => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFilterChange('all')}
        className={`
          px-3 py-1.5 text-xs font-medium rounded transition-colors
          ${activeFilter === 'all' 
            ? 'bg-primary text-white' 
            : 'bg-secondary text-muted-foreground hover:text-foreground'
          }
        `}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('images')}
        className={`
          px-3 py-1.5 text-xs font-medium rounded transition-colors
          ${activeFilter === 'images' 
            ? 'bg-primary text-white' 
            : 'bg-secondary text-muted-foreground hover:text-foreground'
          }
        `}
      >
        Images
      </button>
      <button
        onClick={() => onFilterChange('videos')}
        className={`
          px-3 py-1.5 text-xs font-medium rounded transition-colors
          ${activeFilter === 'videos' 
            ? 'bg-primary text-white' 
            : 'bg-secondary text-muted-foreground hover:text-foreground'
          }
        `}
      >
        Videos
      </button>
    </div>
  );
};

export const MediaFilters = memo(MediaFiltersComponent);

