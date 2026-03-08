/**
 * FORMAT UTILITIES
 * Fonctions de formatage diverses
 */

/**
 * Formater une taille de fichier en octets vers une chaîne lisible
 * @param bytes Taille en octets
 * @returns Chaîne formatée (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
