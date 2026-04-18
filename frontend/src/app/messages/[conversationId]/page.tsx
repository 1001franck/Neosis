// Route dynamique — placeholder pour valider l'export statique Next.js
// Le rendu reel est assure par ConversationPageClient via le layout client
export function generateStaticParams() {
  return [{ conversationId: '_' }];
}
export default function DirectConversationPage() { return null; }
