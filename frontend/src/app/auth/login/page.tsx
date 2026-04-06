'use client';

import { useAuth } from '@application/index';
import { logger } from '@shared/utils/logger';
import { useFormState } from '@shared/hooks/useFormState';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocale } from '@shared/hooks/useLocale';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

/**
 * PAGE LOGIN - Dark theme moderne avec glassmorphism
 * Permet aux utilisateurs de se connecter
 */
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const { fields, error, isLoading, setField, setError, setLoading } = useFormState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      logger.info('Login attempt');
      await login({ email: fields.email, password: fields.password });
      logger.info('Login successful');

      // Charger les serveurs de l'utilisateur
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servers`, {
        credentials: 'include',
      });

      if (response.ok) {
        const { data: servers } = await response.json();

        // Si l'utilisateur a des serveurs, rediriger vers le premier
        if (servers && servers.length > 0) {
          logger.info('Redirecting to first server', { serverId: servers[0].id });
          router.push(`/servers/${servers[0].id}`);
        } else {
          // Sinon, rediriger vers la page pour créer/rejoindre un serveur
          logger.info('No servers found, redirecting to neosis');
          router.push('/neosis');
        }
      } else {
        // En cas d'erreur, rediriger vers neosis par défaut
        router.push('/neosis');
      }
    } catch (err) {
      const message = (err as Error).message;
      logger.error('Login failed', err);
      setError(message || t('auth.login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Logo + En-tête */}
      <motion.div variants={fadeUp} custom={0} className="text-center space-y-3">
        {/* Logo animé */}
        <motion.div
          className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
          }}
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            {t('auth.login.title')}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {t('auth.login.subtitle')}
          </p>
        </div>
      </motion.div>

      {/* Carte glassmorphism */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="rounded-2xl p-6 border border-white/10"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <motion.div variants={fadeUp} custom={2}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.login.email')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={fields.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder={t('auth.login.emailPlaceholder')}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </motion.div>

          {/* Mot de passe */}
          <motion.div variants={fadeUp} custom={3}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.login.password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={fields.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>

          {/* Message d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="p-3 rounded-xl border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              style={{ background: 'rgba(239, 68, 68, 0.08)' }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </motion.div>
          )}

          {/* Bouton Connexion */}
          <motion.div variants={fadeUp} custom={4}>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.login.loading')}
                </div>
              ) : (
                t('auth.login.submit')
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>

      {/* Séparateur */}
      <motion.div variants={fadeUp} custom={5} className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-gray-500 text-xs uppercase tracking-wider">{t('auth.login.or')}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      {/* Lien vers inscription */}
      <motion.div variants={fadeUp} custom={6} className="text-center">
        <p className="text-gray-400 text-sm">
          {t('auth.login.noAccount')}{' '}
          <Link
            href="/auth/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200 hover:underline underline-offset-4"
          >
            {t('auth.login.createAccount')}
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
