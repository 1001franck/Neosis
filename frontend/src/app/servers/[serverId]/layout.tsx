'use client';

// Layout client du segment [serverId]
// Rend ServerPageClient — lit le serverId via useParams()
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const ServerPageClient = dynamic(() => import('./ServerPageClient'), { ssr: false });

export default function ServerLayout({
  params,
}: {
  params: Promise<{ serverId: string }>;
  children: ReactNode;
}): ReactNode {
  return <ServerPageClient params={params} />;
}
