/**
 * SHARED UTILS - DATE
 * Date formatting and manipulation utilities
 */

/**
 * Retourne le début de la journée (minuit) pour une date donnée
 */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Vérifie si une date est aujourd'hui
 */
function isToday(date: Date): boolean {
  return startOfDay(date).getTime() === startOfDay(new Date()).getTime();
}

/**
 * Vérifie si une date est hier
 */
function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return startOfDay(date).getTime() === startOfDay(yesterday).getTime();
}

/**
 * Format timestamp intelligently based on recency
 * - Today: Show time only ("06:04 PM")
 * - Yesterday: "Hier 06:04 PM"
 * - This week: Day name + time ("Lundi 06:04 PM")
 * - Older: Full date ("09/02/2026")
 */
export function formatTimestamp(timestamp: string, createdAt?: Date): string {
  if (!createdAt) {
    return timestamp;
  }

  const messageDate = new Date(createdAt);
  
  // Aujourd'hui - afficher l'heure uniquement
  if (isToday(messageDate)) {
    return timestamp;
  }
  
  // Hier
  if (isYesterday(messageDate)) {
    return `Hier ${timestamp}`;
  }
  
  // Cette semaine (7 derniers jours)
  const now = new Date();
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
  if (diffInDays < 7) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return `${days[messageDate.getDay()]} ${timestamp}`;
  }
  
  // Date complète
  return messageDate.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

/**
 * Format date for display in separator between message groups
 * - Today: "Aujourd'hui"
 * - Yesterday: "Hier"
 * - Older: "lundi 9 février 2026"
 */
export function formatDateSeparator(date: Date): string {
  if (isToday(date)) {
    return "Aujourd'hui";
  }
  
  if (isYesterday(date)) {
    return 'Hier';
  }
  
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Format date for display (e.g., in media metadata)
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Format time only (for DM messages)
 * Always returns just the time: "14:30"
 */
export function formatTimeOnly(timestamp: string, createdAt?: Date): string {
  if (!createdAt) {
    return timestamp;
  }
  
  // Extract just the time from createdAt
  const hours = String(createdAt.getHours()).padStart(2, '0');
  const minutes = String(createdAt.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
