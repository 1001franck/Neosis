/**
 * USE TYPING INDICATOR HOOK
 * Gère l'indication de saisie avec debounce automatique
 * Évite les appels répétés et nettoie correctement
 */

import { useEffect, useRef } from 'react';

interface UseTypingIndicatorOptions {
  value: string;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  debounceMs?: number;
}

/**
 * Hook pour gérer les indicateurs de saisie
 * Debounce automatique pour éviter trop de signaux
 */
export function useTypingIndicator({
  value,
  onTypingStart,
  onTypingStop,
  debounceMs = 3000
}: UseTypingIndicatorOptions): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);

  useEffect(() => {
    // Si pas de handlers, ne rien faire
    if (!onTypingStart || !onTypingStop) return;

    // Si valeur vide, arrêter
    if (!value.trim()) {
      if (isTypingRef.current) {
        onTypingStop();
        isTypingRef.current = false;
      }
      return;
    }

    // Signaler qu'on tape (seulement si pas déjà en train)
    if (!isTypingRef.current) {
      onTypingStart();
      isTypingRef.current = true;
    }

    // Réinitialiser le timeout à chaque changement
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Arrêter après X secondes d'inactivité
    timeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        onTypingStop();
        isTypingRef.current = false;
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onTypingStart, onTypingStop, debounceMs]);

  // Cleanup final au démontage
  useEffect(() => {
    return () => {
      if (isTypingRef.current && onTypingStop) {
        onTypingStop();
      }
    };
  }, [onTypingStop]);
}
