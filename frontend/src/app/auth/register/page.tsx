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
 * PAGE REGISTER - Dark theme moderne avec glassmorphism
 * Permet aux utilisateurs de créer un compte
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { fields, error, isLoading, setField, setError, setLoading } = useFormState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Indicateur de force du mot de passe
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: t('auth.register.strength.weak'), color: '#ef4444' };
    if (score <= 2) return { level: 2, label: t('auth.register.strength.medium'), color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: t('auth.register.strength.good'), color: '#6366f1' };
    return { level: 4, label: t('auth.register.strength.strong'), color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(fields.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (fields.password !== fields.confirmPassword) {
      setError(t('auth.register.errors.passwordMismatch'));
      return;
    }

    if (fields.password.length < 8) {
      setError(t('auth.register.errors.passwordTooShort'));
      return;
    }

    if (!/[a-z]/.test(fields.password)) {
      setError(t('auth.register.errors.passwordNoLower'));
      return;
    }

    if (!/[A-Z]/.test(fields.password)) {
      setError(t('auth.register.errors.passwordNoUpper'));
      return;
    }

    if (!/[0-9]/.test(fields.password)) {
      setError(t('auth.register.errors.passwordNoNumber'));
      return;
    }

    if (fields.username.length < 3) {
      setError(t('auth.register.errors.usernameTooShort'));
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(fields.username)) {
      setError(t('auth.register.errors.usernameInvalid'));
      return;
    }

    setLoading(true);

    try {
      logger.info('Register attempt');
      await register({
        username: fields.username,
        email: fields.email,
        password: fields.password,
      });
      logger.info('Registration successful');

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
          // Nouvel utilisateur, aucun serveur → rediriger vers neosis pour créer/rejoindre
          logger.info('New user, no servers, redirecting to neosis');
          router.push('/neosis');
        }
      } else {
        // En cas d'erreur, rediriger vers neosis par défaut
        router.push('/neosis');
      }
    } catch (err) {
      logger.error('Registration failed', err);
      const raw = (err as Error).message || '';
      if (raw.toLowerCase().includes('already') || raw.toLowerCase().includes('existe')) {
        setError(t('auth.register.errors.alreadyExists'));
      } else if (raw.includes('500') || raw.toLowerCase().includes('internal')) {
        setError(t('auth.register.errors.serverError'));
      } else if (raw.toLowerCase().includes('network') || raw.toLowerCase().includes('fetch')) {
        setError(t('auth.register.errors.networkError'));
      } else {
        setError(raw || t('auth.register.errors.generic'));
      }
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
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #06b6d4)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
          }}
          whileHover={{ scale: 1.05, rotate: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            {t('auth.register.title')}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {t('auth.register.subtitle')}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom d'utilisateur */}
          <motion.div variants={fadeUp} custom={2}>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.register.username')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                value={fields.username}
                onChange={(e) => setField('username', e.target.value)}
                placeholder={t('auth.register.usernamePlaceholder')}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div variants={fadeUp} custom={3}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.register.email')}
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
                placeholder={t('auth.register.emailPlaceholder')}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </motion.div>

          {/* Mot de passe */}
          <motion.div variants={fadeUp} custom={4}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.register.password')}
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
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50"
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

            {/* Indicateur de force du mot de passe */}
            {fields.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: level <= passwordStrength.level
                          ? passwordStrength.color
                          : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Confirmation mot de passe */}
          <motion.div variants={fadeUp} custom={5}>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.register.confirmPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={fields.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirm ? (
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

            {/* Indicateur de correspondance */}
            {fields.confirmPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center gap-1.5"
              >
                {fields.password === fields.confirmPassword ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-emerald-400">{t('auth.register.passwordMatch')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs text-red-400">{t('auth.register.passwordNoMatch')}</span>
                  </>
                )}
              </motion.div>
            )}
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

          {/* Bouton Inscription */}
          <motion.div variants={fadeUp} custom={6}>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.register.loading')}
                </div>
              ) : (
                t('auth.register.submit')
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>

      {/* Séparateur */}
      <motion.div variants={fadeUp} custom={7} className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-gray-500 text-xs uppercase tracking-wider">{t('auth.register.or')}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      {/* Lien vers connexion */}
      <motion.div variants={fadeUp} custom={8} className="text-center">
        <p className="text-gray-400 text-sm">
          {t('auth.register.hasAccount')}{' '}
          <Link
            href="/auth/login"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 hover:underline underline-offset-4"
          >
            {t('auth.register.login')}
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
