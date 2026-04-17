'use client';

import { ReactNode } from 'react';
import { PublicRoute } from '@presentation/components/auth/PublicRoute';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Layout pour les pages d'authentification
 * - Dark theme avec glassmorphism
 * - Orbes animés en arrière-plan
 * - Redirige vers dashboard si déjà authentifié (PublicRoute)
 */
export default function AuthLayout({ children }: AuthLayoutProps): React.ReactNode {
  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8"
        style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #0d1117 50%, #0a0a14 100%)' }}
      >
        {/* Orbes animés en arrière-plan */}
        <motion.div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            top: '-10%',
            left: '-5%',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl opacity-15"
          style={{
            width: 350,
            height: 350,
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '-8%',
            right: '-3%',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: 250,
            height: 250,
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            top: '50%',
            left: '60%',
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grille de fond subtile */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Contenu */}
        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
    </PublicRoute>
  );
}
