'use client';

// Layout client du segment [conversationId]
// Rend ConversationPageClient — lit le conversationId via useParams()
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const ConversationPageClient = dynamic(() => import('./ConversationPageClient'), { ssr: false });

export default function ConversationLayout({
  children: _children,
}: {
  children: ReactNode;
}): ReactNode {
  return <ConversationPageClient />;
}
