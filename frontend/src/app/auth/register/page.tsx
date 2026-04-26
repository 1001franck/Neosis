'use client';

import { useAuth } from '@application/index';
import { logger } from '@shared/utils/logger';
import { useFormState } from '@shared/hooks/useFormState';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@shared/hooks/useLocale';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const baseInputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
} as const;

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { fields, error, isLoading, setField, setError, setLoading } = useFormState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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

    if (fields.password !== fields.confirmPassword) { setError(t('auth.register.errors.passwordMismatch')); return; }
    if (fields.password.length < 8) { setError(t('auth.register.errors.passwordTooShort')); return; }
    if (!/[a-z]/.test(fields.password)) { setError(t('auth.register.errors.passwordNoLower')); return; }
    if (!/[A-Z]/.test(fields.password)) { setError(t('auth.register.errors.passwordNoUpper')); return; }
    if (!/[0-9]/.test(fields.password)) { setError(t('auth.register.errors.passwordNoNumber')); return; }
    if (fields.username.length < 3) { setError(t('auth.register.errors.usernameTooShort')); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(fields.username)) { setError(t('auth.register.errors.usernameInvalid')); return; }

    setLoading(true);
    try {
      logger.info('Register attempt');
      await register({ username: fields.username, email: fields.email, password: fields.password });
      router.replace('/neosis/');
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

  const fieldStyle = (name: string, withPaddingRight = false) => ({
    ...baseInputStyle,
    paddingRight: withPaddingRight ? '44px' : '14px',
    borderColor: focusedField === name ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.09)',
    boxShadow: focusedField === name ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
    opacity: isLoading ? 0.45 : 1,
  });

  const labelStyle = {
    color: 'rgba(241,245,249,0.65)',
    fontSize: '13px',
    fontWeight: 500 as const,
    display: 'block' as const,
    marginBottom: '6px',
  };

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
          {t('auth.register.title')}
        </h1>
        <p style={{ color: 'rgba(241,245,249,0.48)', fontSize: '14px' }}>
          {t('auth.register.subtitle')}
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom d'utilisateur */}
        <div>
          <label htmlFor="username" style={labelStyle}>{t('auth.register.username')}</label>
          <input
            id="username"
            type="text"
            value={fields.username}
            onChange={(e) => setField('username', e.target.value)}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            placeholder={t('auth.register.usernamePlaceholder')}
            required
            disabled={isLoading}
            style={fieldStyle('username')}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" style={labelStyle}>{t('auth.register.email')}</label>
          <input
            id="email"
            type="email"
            value={fields.email}
            onChange={(e) => setField('email', e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder={t('auth.register.emailPlaceholder')}
            required
            disabled={isLoading}
            style={fieldStyle('email')}
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" style={labelStyle}>{t('auth.register.password')}</label>
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
              style={fieldStyle('password', true)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(241,245,249,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
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

          {/* Indicateur de force */}
          {fields.password && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      height: '3px',
                      flex: 1,
                      borderRadius: '9999px',
                      background: level <= passwordStrength.level ? passwordStrength.color : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: passwordStrength.color, flexShrink: 0 }}>
                {passwordStrength.label}
              </span>
            </motion.div>
          )}
        </div>

        {/* Confirmation */}
        <div>
          <label htmlFor="confirmPassword" style={labelStyle}>{t('auth.register.confirmPassword')}</label>
          <div style={{ position: 'relative' }}>
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={fields.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              style={fieldStyle('confirm', true)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(241,245,249,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              {showConfirm ? (
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

          {/* Correspondance */}
          {fields.confirmPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {fields.password === fields.confirmPassword ? (
                <>
                  <svg width="13" height="13" fill="none" stroke="#34d399" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: '12px', color: '#34d399' }}>{t('auth.register.passwordMatch')}</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" stroke="#f87171" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span style={{ fontSize: '12px', color: '#f87171' }}>{t('auth.register.passwordNoMatch')}</span>
                </>
              )}
            </motion.div>
          )}
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
            marginTop: '4px',
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
          {isLoading ? t('auth.register.loading') : t('auth.register.submit')}
        </button>
      </form>

      {/* Lien connexion */}
      <p style={{ color: 'rgba(241,245,249,0.40)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
        {t('auth.register.hasAccount')}{' '}
        <a
          href="/auth/login/"
          style={{ color: '#818cf8', fontWeight: 500, textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a5b4fc'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#818cf8'; }}
        >
          {t('auth.register.login')}
        </a>
      </p>
    </motion.div>
  );
}
