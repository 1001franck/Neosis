import { useCallback, useRef } from 'react';

/**
 * Ajoute la classe `is-scrolling` pendant le scroll et la retire après inactivité.
 * À utiliser avec la classe CSS `scrollbar-auto`.
 */
export function useScrollbarVisibility(delay = 1000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.classList.add('is-scrolling');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      el.classList.remove('is-scrolling');
    }, delay);
  }, [delay]);

  return { onScroll };
}
