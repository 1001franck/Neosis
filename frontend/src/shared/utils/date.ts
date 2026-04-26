/**
 * SHARED UTILS - DATE
 * Utilitaires de formatage de dates — locale-aware
 */

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isToday(date: Date): boolean {
  return startOfDay(date).getTime() === startOfDay(new Date()).getTime();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return startOfDay(date).getTime() === startOfDay(yesterday).getTime();
}

/**
 * Formate l'horodatage d'un message de façon intelligente selon l'ancienneté :
 * - Aujourd'hui : heure seule
 * - Hier : "Hier 14:30" / "Yesterday 2:30 PM"
 * - < 7 jours : "Lundi 14:30" / "Monday 2:30 PM"
 * - Plus ancien : date locale complète
 */
export function formatTimestamp(
  timestamp: string,
  createdAt?: Date,
  locale = 'fr',
  yesterdayLabel = 'Hier',
): string {
  if (!createdAt) return timestamp;

  const messageDate = new Date(createdAt);

  if (isToday(messageDate)) return timestamp;

  if (isYesterday(messageDate)) return `${yesterdayLabel} ${timestamp}`;

  const diffInDays = (new Date().getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24);
  if (diffInDays < 7) {
    const day = messageDate.toLocaleDateString(locale, { weekday: 'long' });
    return `${day.charAt(0).toUpperCase()}${day.slice(1)} ${timestamp}`;
  }

  return messageDate.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formate la date pour le séparateur entre groupes de messages :
 * - Aujourd'hui → "Aujourd'hui" / "Today"
 * - Hier → "Hier" / "Yesterday"
 * - Plus ancien → "lundi 9 février 2026" / "Monday, February 9, 2026"
 */
export function formatDateSeparator(
  date: Date,
  locale = 'fr',
  todayLabel = "Aujourd'hui",
  yesterdayLabel = 'Hier',
): string {
  if (isToday(date)) return todayLabel;
  if (isYesterday(date)) return yesterdayLabel;

  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formate une date avec heure (ex: métadonnées médias)
 */
export function formatDate(date: Date, locale = 'fr'): string {
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Vérifie si deux dates sont le même jour
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

/**
 * Retourne uniquement l'heure au format HH:MM (pas de locale nécessaire)
 */
export function formatTimeOnly(timestamp: string, createdAt?: Date): string {
  if (!createdAt) return timestamp;
  const hours = String(createdAt.getHours()).padStart(2, '0');
  const minutes = String(createdAt.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
