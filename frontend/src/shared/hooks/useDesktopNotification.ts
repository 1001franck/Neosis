'use client';

/**
 * SHARED - USE DESKTOP NOTIFICATION
 * Envoie une notification native via Tauri quand l'app tourne en desktop.
 * En mode web, utilise l'API Notification du navigateur comme fallback.
 */

let invoke: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null;

// Chargement dynamique de l'API Tauri (undefined en mode web)
if (typeof window !== 'undefined') {
  import('@tauri-apps/api/core').then((m) => {
    invoke = m.invoke;
  }).catch(() => {
    invoke = null;
  });
}

export async function sendDesktopNotification(title: string, body: string): Promise<void> {
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
