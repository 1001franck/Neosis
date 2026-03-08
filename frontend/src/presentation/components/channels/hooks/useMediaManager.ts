/**
 * USE MEDIA MANAGER HOOK
 * Gère l'état et les actions pour les médias du channel avec useReducer
 * 
 * Responsabilités:
 * - Upload de médias
 * - Sélection multiple
 * - Tri (date, name, size)
 * - Mode d'affichage (grid/list)
 * - Actions bulk (download, delete)
 */

import { useReducer, useCallback } from 'react';
import { useToast } from '@presentation/components/toast/ToastProvider';
import { logger } from '@shared/utils/logger';
import type { ChannelMedia } from '../types';

interface UseMediaManagerProps {
  initialMedia?: ChannelMedia[];
}

type SortBy = 'date' | 'name' | 'size';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

interface MediaState {
  allMedia: ChannelMedia[];
  selection: {
    isActive: boolean;
    selectedIds: Set<string>;
  };
  sort: {
    by: SortBy;
    order: SortOrder;
  };
  viewMode: ViewMode;
  showUploadZone: boolean;
}

type MediaAction =
  | { type: 'SET_ALL_MEDIA'; payload: ChannelMedia[] }
  | { type: 'ADD_MEDIA'; payload: ChannelMedia[] }
  | { type: 'TOGGLE_SELECTION_MODE' }
  | { type: 'TOGGLE_MEDIA'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_SORT_BY'; payload: SortBy }
  | { type: 'TOGGLE_SORT_ORDER' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SHOW_UPLOAD_ZONE'; payload: boolean };

const createInitialState = (initialMedia: ChannelMedia[]): MediaState => ({
  allMedia: initialMedia,
  selection: {
    isActive: false,
    selectedIds: new Set(),
  },
  sort: {
    by: 'date',
    order: 'desc',
  },
  viewMode: 'grid',
  showUploadZone: false,
});

function mediaReducer(state: MediaState, action: MediaAction): MediaState {
  switch (action.type) {
    case 'SET_ALL_MEDIA':
      return { ...state, allMedia: action.payload };
    
    case 'ADD_MEDIA':
      return { ...state, allMedia: [...action.payload, ...state.allMedia] };
    
    case 'TOGGLE_SELECTION_MODE':
      return {
        ...state,
        selection: {
          isActive: !state.selection.isActive,
          selectedIds: state.selection.isActive ? new Set() : state.selection.selectedIds,
        },
      };
    
    case 'TOGGLE_MEDIA': {
      const newSelectedIds = new Set(state.selection.selectedIds);
      if (newSelectedIds.has(action.payload)) {
        newSelectedIds.delete(action.payload);
      } else {
        newSelectedIds.add(action.payload);
      }
      return {
        ...state,
        selection: { ...state.selection, selectedIds: newSelectedIds },
      };
    }
    
    case 'SELECT_ALL':
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedIds: new Set(action.payload),
        },
      };
    
    case 'DESELECT_ALL':
      return {
        ...state,
        selection: { ...state.selection, selectedIds: new Set() },
      };
    
    case 'SET_SORT_BY':
      return {
        ...state,
        sort: { ...state.sort, by: action.payload },
      };
    
    case 'TOGGLE_SORT_ORDER':
      return {
        ...state,
        sort: {
          ...state.sort,
          order: state.sort.order === 'asc' ? 'desc' : 'asc',
        },
      };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_SHOW_UPLOAD_ZONE':
      return { ...state, showUploadZone: action.payload };
    
    default:
      return state;
  }
}

interface UseMediaManagerReturn {
  // État
  allMedia: ChannelMedia[];
  isSelectionMode: boolean;
  selectedMediaIds: Set<string>;
  sortBy: SortBy;
  sortOrder: SortOrder;
  viewMode: ViewMode;
  showUploadZone: boolean;
  
  // Setters
  setShowUploadZone: (show: boolean) => void;
  setSortBy: (sortBy: SortBy) => void;
  setViewMode: (viewMode: ViewMode) => void;
  
  // Actions
  handleUpload: (files: File[]) => Promise<void>;
  toggleSelectionMode: () => void;
  toggleMediaSelection: (id: string) => void;
  selectAllMedia: (media: ChannelMedia[]) => void;
  deselectAllMedia: () => void;
  handleBulkDownload: (media: ChannelMedia[]) => void;
  handleBulkDelete: () => void;
  toggleSortOrder: () => void;
  sortMedia: (media: ChannelMedia[]) => ChannelMedia[];
}

export function useMediaManager({ initialMedia = [] }: UseMediaManagerProps): UseMediaManagerReturn {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(mediaReducer, initialMedia, createInitialState);

  /**
   * Upload de fichiers
   */
  const handleUpload = useCallback(async (files: File[]): Promise<void> => {
    try {
      const newMedia: ChannelMedia[] = files.map((file) => ({
        id: `media-${Date.now()}-${Math.random()}`,
        type: file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        thumbnail: file.type.startsWith('video/') ? URL.createObjectURL(file) : undefined,
        name: file.name,
        uploadedBy: 'Vous',
        uploadedAt: new Date(),
      }));
      
      dispatch({ type: 'ADD_MEDIA', payload: newMedia });
      toast.success(`${files.length} fichier(s) uploadé(s) avec succès`, 3000);
      dispatch({ type: 'SET_SHOW_UPLOAD_ZONE', payload: false });
    } catch (error) {
      toast.error('Erreur lors de l\'upload', 3000);
      logger.error('Upload error', error);
    }
  }, [toast]);

  const toggleSelectionMode = useCallback((): void => {
    dispatch({ type: 'TOGGLE_SELECTION_MODE' });
  }, []);

  const toggleMediaSelection = useCallback((id: string): void => {
    dispatch({ type: 'TOGGLE_MEDIA', payload: id });
  }, []);

  const selectAllMedia = useCallback((media: ChannelMedia[]): void => {
    dispatch({ type: 'SELECT_ALL', payload: media.map(m => m.id) });
  }, []);

  const deselectAllMedia = useCallback((): void => {
    dispatch({ type: 'DESELECT_ALL' });
  }, []);

  const handleBulkDownload = useCallback((media: ChannelMedia[]): void => {
    const selectedMedia = media.filter(m => state.selection.selectedIds.has(m.id));
    
    if (selectedMedia.length === 0) {
      toast.warning('Aucun média sélectionné', 2000);
      return;
    }

    selectedMedia.forEach(mediaItem => {
      const link = document.createElement('a');
      link.href = mediaItem.url;
      link.download = mediaItem.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast.success(`${selectedMedia.length} média(s) téléchargé(s)`, 3000);
    dispatch({ type: 'DESELECT_ALL' });
    dispatch({ type: 'TOGGLE_SELECTION_MODE' });
  }, [state.selection.selectedIds, toast]);

  const handleBulkDelete = useCallback((): void => {
    if (state.selection.selectedIds.size === 0) {
      toast.warning('Aucun média sélectionné', 2000);
      return;
    }

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${state.selection.selectedIds.size} média(s) ?`
    );

    if (confirmDelete) {
      const remaining = state.allMedia.filter(m => !state.selection.selectedIds.has(m.id));
      dispatch({ type: 'SET_ALL_MEDIA', payload: remaining });
      toast.success(`${state.selection.selectedIds.size} média(s) supprimé(s)`, 3000);
      dispatch({ type: 'DESELECT_ALL' });
      dispatch({ type: 'TOGGLE_SELECTION_MODE' });
    }
  }, [state.allMedia, state.selection.selectedIds, toast]);

  const setSortBy = useCallback((sortBy: SortBy): void => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  }, []);

  const toggleSortOrder = useCallback((): void => {
    dispatch({ type: 'TOGGLE_SORT_ORDER' });
  }, []);

  const setViewMode = useCallback((viewMode: ViewMode): void => {
    dispatch({ type: 'SET_VIEW_MODE', payload: viewMode });
  }, []);

  const setShowUploadZone = useCallback((show: boolean): void => {
    dispatch({ type: 'SET_SHOW_UPLOAD_ZONE', payload: show });
  }, []);

  const sortMedia = useCallback((media: ChannelMedia[]): ChannelMedia[] => {
    const sorted = [...media].sort((a, b) => {
      let comparison = 0;

      switch (state.sort.by) {
        case 'date':
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return state.sort.order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [state.sort.by, state.sort.order]);

  return {
    allMedia: state.allMedia,
    isSelectionMode: state.selection.isActive,
    selectedMediaIds: state.selection.selectedIds,
    sortBy: state.sort.by,
    sortOrder: state.sort.order,
    viewMode: state.viewMode,
    showUploadZone: state.showUploadZone,
    setShowUploadZone,
    setSortBy,
    setViewMode,
    handleUpload,
    toggleSelectionMode,
    toggleMediaSelection,
    selectAllMedia,
    deselectAllMedia,
    handleBulkDownload,
    handleBulkDelete,
    toggleSortOrder,
    sortMedia,
  };
}
