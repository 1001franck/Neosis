'use client';

import { ReactNode } from 'react';
import { PublicRoute } from '@presentation/components/auth/PublicRoute';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): React.ReactNode {
  return (
    <PublicRoute>
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12"
        style={{ background: '#09090b', color: '#f1f5f9' }}
      >
        {/* Halo indigo — identique à la landing */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px] rounded-full pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.07)', filter: 'blur(90px)' }}
        />

        <div className="w-full max-w-sm relative z-10">
          {children}
        </div>
      </div>
    </PublicRoute>
  );
}
