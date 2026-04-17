/**
 * HOOK: useChannelSidebarState
 * Centralise tous les états du ChannelInfoSidebar avec useReducer
 * 
 * Responsabilités:
 * - Gestion des tabs (active tab)
 * - Search & filters
 * - Lightbox state
 * - Loading state
 * - Upload zone visibility
 */

import { useReducer, useCallback } from 'react';
import type { TabType, MediaFilter } from '../types';

interface SidebarState {
  activeTab: TabType;
  searchQuery: string;
  mediaFilter: MediaFilter;
  isLoading: boolean;
  lightbox: {
    open: boolean;
    index: number;
  };
  showUploadZone: boolean;
}

type SidebarAction =
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_MEDIA_FILTER'; payload: MediaFilter }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'OPEN_LIGHTBOX'; payload: number }
  | { type: 'CLOSE_LIGHTBOX' }
  | { type: 'NEXT_MEDIA' }
  | { type: 'PREVIOUS_MEDIA' }
  | { type: 'SET_SHOW_UPLOAD_ZONE'; payload: boolean }
  | { type: 'CHANGE_TAB'; payload: TabType };

const initialState: SidebarState = {
  activeTab: 'media',
  searchQuery: '',
  mediaFilter: 'all',
  isLoading: false,
  lightbox: {
    open: false,
    index: 0,
  },
  showUploadZone: false,
};

function sidebarReducer(state: SidebarState, action: SidebarAction): SidebarState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_MEDIA_FILTER':
      return { ...state, mediaFilter: action.payload };
    
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'OPEN_LIGHTBOX':
      return {
        ...state,
        lightbox: { open: true, index: action.payload },
      };
    
    case 'CLOSE_LIGHTBOX':
      return {
        ...state,
        lightbox: { ...state.lightbox, open: false },
      };
    
    case 'NEXT_MEDIA':
      return {
        ...state,
        lightbox: { ...state.lightbox, index: state.lightbox.index + 1 },
      };
    
    case 'PREVIOUS_MEDIA':
      return {
        ...state,
        lightbox: {
          ...state.lightbox,
          index: state.lightbox.index > 0 ? state.lightbox.index - 1 : state.lightbox.index,
        },
      };
    
    case 'SET_SHOW_UPLOAD_ZONE':
      return { ...state, showUploadZone: action.payload };
    
    case 'CHANGE_TAB':
      return {
        ...state,
        activeTab: action.payload,
        searchQuery: '',
        mediaFilter: 'all',
      };
    
    default:
      return state;
  }
}

interface UseChannelSidebarStateReturn {
  // State
  activeTab: TabType;
  searchQuery: string;
  mediaFilter: MediaFilter;
  lightboxOpen: boolean;
  lightboxIndex: number;
  isLoading: boolean;
  showUploadZone: boolean;
  
  // Actions
  setActiveTab: (tab: TabType) => void;
  setSearchQuery: (query: string) => void;
  setMediaFilter: (filter: MediaFilter) => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  nextMedia: () => void;
  previousMedia: (maxIndex: number) => void;
  setIsLoading: (loading: boolean) => void;
  setShowUploadZone: (show: boolean) => void;
  handleTabChange: (tab: TabType) => void;
}

export function useChannelSidebarState(): UseChannelSidebarStateReturn {
  const [state, dispatch] = useReducer(sidebarReducer, initialState);

  // Actions wrapped with useCallback
  const setActiveTab = useCallback((tab: TabType) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setMediaFilter = useCallback((filter: MediaFilter) => {
    dispatch({ type: 'SET_MEDIA_FILTER', payload: filter });
  }, []);

  const openLightbox = useCallback((index: number) => {
    dispatch({ type: 'OPEN_LIGHTBOX', payload: index });
  }, []);

  const closeLightbox = useCallback(() => {
    dispatch({ type: 'CLOSE_LIGHTBOX' });
  }, []);

  const nextMedia = useCallback(() => {
    dispatch({ type: 'NEXT_MEDIA' });
  }, []);

  const previousMedia = useCallback((_maxIndex: number) => {
    dispatch({ type: 'PREVIOUS_MEDIA' });
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_IS_LOADING', payload: loading });
  }, []);

  const setShowUploadZone = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_UPLOAD_ZONE', payload: show });
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    dispatch({ type: 'CHANGE_TAB', payload: tab });
  }, []);

  return {
    activeTab: state.activeTab,
    searchQuery: state.searchQuery,
    mediaFilter: state.mediaFilter,
    lightboxOpen: state.lightbox.open,
    lightboxIndex: state.lightbox.index,
    isLoading: state.isLoading,
    showUploadZone: state.showUploadZone,
    setActiveTab,
    setSearchQuery,
    setMediaFilter,
    openLightbox,
    closeLightbox,
    nextMedia,
    previousMedia,
    setIsLoading,
    setShowUploadZone,
    handleTabChange,
  };
}
