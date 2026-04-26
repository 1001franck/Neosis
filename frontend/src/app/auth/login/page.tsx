'use client';

import { useAuth } from '@application/index';
import { logger } from '@shared/utils/logger';
import { useFormState } from '@shared/hooks/useFormState';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@shared/hooks/useLocale';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
} as const;

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
      router.replace('/neosis/');
    } catch (err) {
      logger.error('Login failed', err);
      setError((err as Error).message || t('auth.login.error'));
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (name: string) => ({
    ...inputStyle,
    borderColor: focusedField === name ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.09)',
    boxShadow: focusedField === name ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <img src="/neosis.png" alt="Neosis" className="w-7 h-7 object-contain" />
        <span style={{ color: '#f1f5f9', fontSize: '17px', fontWeight: 600 }}>Neosis</span>
      </div>

      {/* Titre */}
      <div className="mb-8">
        <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: 700, lineHeight: 1.2, marginBottom: '6px' }}>
          {t('auth.login.title')}
        </h1>
        <p style={{ color: 'rgba(241,245,249,0.48)', fontSize: '14px' }}>
          {t('auth.login.subtitle')}
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            style={{ color: 'rgba(241,245,249,0.65)', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}
          >
            {t('auth.login.email')}
          </label>
          <input
            id="email"
            type="email"
            value={fields.email}
            onChange={(e) => setField('email', e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder={t('auth.login.emailPlaceholder')}
            required
            disabled={isLoading}
            style={{
              ...fieldStyle('email'),
              opacity: isLoading ? 0.45 : 1,
            }}
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label
            htmlFor="password"
            style={{ color: 'rgba(241,245,249,0.65)', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}
          >
            {t('auth.login.password')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={fields.password}
              onChange={(e) => setField('password', e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              style={{
                ...fieldStyle('password'),
                paddingRight: '44px',
                opacity: isLoading ? 0.45 : 1,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(241,245,249,0.35)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
              }}
            >
              {showPassword ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(239,68,68,0.20)',
              background: 'rgba(239,68,68,0.07)',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </motion.div>
        )}

        {/* Bouton */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '11px',
            background: isLoading ? 'rgba(99,102,241,0.5)' : '#6366f1',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#818cf8'; }}
          onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#6366f1'; }}
        >
          {isLoading && (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {isLoading ? t('auth.login.loading') : t('auth.login.submit')}
        </button>
      </form>

      {/* Lien inscription */}
      <p style={{ color: 'rgba(241,245,249,0.40)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
        {t('auth.login.noAccount')}{' '}
        <a
          href="/auth/register/"
          style={{ color: '#818cf8', fontWeight: 500, textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a5b4fc'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#818cf8'; }}
        >
          {t('auth.login.createAccount')}
        </a>
      </p>
    </motion.div>
  );
}
