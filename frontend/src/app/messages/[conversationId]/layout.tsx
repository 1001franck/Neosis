'use client';

// Layout client du segment [conversationId]
// Rend ConversationPageClient — lit le conversationId via useParams()
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const ConversationPageClient = dynamic(() => import('./ConversationPageClient'), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ConversationLayout(_props: { children: ReactNode }): ReactNode {
  return <ConversationPageClient />;
}
