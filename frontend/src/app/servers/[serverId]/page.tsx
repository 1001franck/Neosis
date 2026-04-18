// Route dynamique — placeholder pour valider l'export statique Next.js
// Le rendu reel est assure par ServerPageClient via le layout client
export function generateStaticParams() {
  return [{ serverId: '_' }];
}
export default function ServerPage() { return null; }
