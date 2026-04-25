'use client';

/**
 * SHARED - USE DESKTOP NOTIFICATION
 * Envoie une notification native via Tauri quand l'app tourne en desktop.
 * En mode web, utilise l'API Notification du navigateur comme fallback.
 */

type InvokeFn = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

let invoke: InvokeFn | null = null;
let invokePromise: Promise<void> | null = null;

// Chargement dynamique de l'API Tauri (undefined en mode web)
if (typeof window !== 'undefined') {
  invokePromise = import('@tauri-apps/api/core')
    .then((m) => { invoke = m.invoke; })
    .catch(() => { invoke = null; });
}

/** Renvoie true si l'app tourne dans Tauri (synchrone, fiable dès le démarrage) */
export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function sendDesktopNotification(title: string, body: string): Promise<void> {
  // Attendre la résolution de l'import si pas encore terminé
  if (invokePromise) await invokePromise;

  if (invoke) {
    // Mode desktop Tauri — notification native Windows
    await invoke('notify', { title, body });
  } else if (typeof window !== 'undefined' && 'Notification' in window) {
    // Fallback navigateur
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }
}
