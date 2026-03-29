/**
 * MEDIA TOOLBAR COMPONENT
 * Toolbar pour gérer les médias (upload, selection, sort, view mode)
 */

'use client';


interface MediaToolbarProps {
  isSelectionMode: boolean;
  selectedCount: number;
  sortBy: 'date' | 'name' | 'size';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  onUploadClick: () => void;
  onToggleSelection: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onSortByChange: (sortBy: 'date' | 'name' | 'size') => void;
  onSortOrderToggle: () => void;
  onViewModeChange: (viewMode: 'grid' | 'list') => void;
}

const MediaToolbarComponent = ({
  isSelectionMode,
  selectedCount,
  sortBy,
  sortOrder,
  viewMode,
  onUploadClick,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onBulkDownload,
  onBulkDelete,
  onSortByChange,
  onSortOrderToggle,
  onViewModeChange,
}: MediaToolbarProps): React.ReactElement => {
  return (
    <div className="flex items-center justify-between gap-2">
      {/* Upload button */}
      {!isSelectionMode && (
        <button
          onClick={onUploadClick}
          className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
          </svg>
          Télevérser
        </button>
      )}

      {/* Selection toolbar */}
      <div className="flex items-center gap-2">
        {!isSelectionMode ? (
          <button
            onClick={onToggleSelection}
            className="px-3 py-1.5 bg-secondary hover:bg-card text-muted-foreground hover:text-foreground text-xs font-medium rounded transition-colors"
          >
            Sélectionner          </button>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">
              {selectedCount} sÃ©lectionnÃ©(s)
            </span>
            <button
              onClick={onSelectAll}
              className="px-2 py-1 text-xs text-primary hover:underline"
            >
              Tout
            </button>
            <button
              onClick={onDeselectAll}
              className="px-2 py-1 text-xs text-muted-foreground hover:underline"
            >
              Aucun
            </button>
            {selectedCount > 0 && (
              <>
                <button
                  onClick={onBulkDownload}
                  className="px-2 py-1 bg-secondary hover:bg-card text-muted-foreground hover:text-foreground text-xs rounded transition-colors"
                >
                  TÃ©lÃ©charger
                </button>
                <button
                  onClick={onBulkDelete}
                  className="px-2 py-1 bg-[#ed4245] hover:bg-[#c03537] text-white text-xs rounded transition-colors"
                >
                  Supprimer
                </button>
              </>
            )}
            <button
              onClick={onToggleSelection}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Terminer
            </button>
          </>
        )}
      </div>

      {/* Sort & View controls */}
      {!isSelectionMode && (
        <div className="flex items-center gap-2 ml-auto">
          {/* Sort dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as 'date' | 'name' | 'size')}
              className="px-2 py-1 bg-secondary text-muted-foreground text-xs rounded border border-border hover:border-primary focus:outline-none focus:border-primary transition-colors"
            >
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="size">Taille</option>
            </select>
            <button
              onClick={onSortOrderToggle}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Trier ${sortOrder === 'asc' ? 'par ordre croissant' : 'par ordre dÃ©croissant'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                {sortOrder === 'asc' ? (
                  <path d="M7 14l5-5 5 5H7z"/>
                ) : (
                  <path d="M7 10l5 5 5-5H7z"/>
                )}
              </svg>
            </button>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 p-1 bg-secondary rounded">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Vue grille"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Vue liste"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { MediaToolbarComponent as MediaToolbar };
