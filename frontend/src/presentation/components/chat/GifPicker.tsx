/**
 * PRESENTATION - GIF PICKER
 * Sélecteur de GIFs via l'API Giphy
 *
 * Fonctionnalités :
 * - Affichage des GIFs tendance au chargement
 * - Recherche par mot-clé avec debounce
 * - Grille de miniatures cliquables
 * - Même positionnement que l'EmojiPicker
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gifApi, GifResult } from '@infrastructure/api/gif.api';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export function GifPicker({ onSelect, onClose }: GifPickerProps): React.ReactNode {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Chargement initial : GIFs tendance
  useEffect(() => {
    loadTrending();
    inputRef.current?.focus();
  }, []);

  const loadTrending = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await gifApi.trending();
      setGifs(results);
    } catch {
      setError('Impossible de charger les GIFs');
    } finally {
      setIsLoading(false);
    }
  };

  // Recherche avec debounce 400ms
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = value.trim() ? await gifApi.search(value) : await gifApi.trending();
        setGifs(results);
      } catch {
        setError('Erreur lors de la recherche');
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, []);

  const handleSelect = (gif: GifResult) => {
    onSelect(gif.url);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Picker */}
      <div className="absolute bottom-full right-0 mb-2 z-50 w-[340px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* En-tête avec recherche */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Rechercher des GIFs..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); loadTrending(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Label tendance / résultats */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {query ? 'Résultats' : 'Tendances'}
          </span>
          <span className="text-xs text-muted-foreground">Powered by GIPHY</span>
        </div>

        {/* Grille de GIFs */}
        <div className="h-[280px] overflow-y-auto p-2">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={loadTrending}
                className="text-xs text-primary hover:underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {!isLoading && !error && gifs.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Aucun GIF trouvé</p>
            </div>
          )}

          {!isLoading && !error && gifs.length > 0 && (
            <div className="columns-3 gap-1.5 space-y-1.5">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleSelect(gif)}
                  className="w-full rounded-lg overflow-hidden hover:opacity-80 hover:ring-2 hover:ring-primary transition-all break-inside-avoid"
                  title={gif.title}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- GIF externe Giphy, next/image ne supporte pas les URLs dynamiques non configurées */}
                  <img
                    src={gif.previewUrl}
                    alt={gif.title}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
