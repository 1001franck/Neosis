// Copied from /dashboard/settings/page.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@application/auth/useAuth';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { useTheme } from '@shared/hooks/useTheme';
import { socket } from '@infrastructure/websocket/socket';

/**
 * PAGE SETTINGS - Personnalisation du profil utilisateur
 * Thème-aware via Tailwind CSS variables (bg-background, bg-card, etc.)
 */
export default function SettingsPage(): React.ReactNode {
  const { user, updateProfile, uploadAvatar, uploadBanner } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Form state
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [customStatus, setCustomStatus] = useState(user?.customStatus ?? '');
  const [statusEmoji, setStatusEmoji] = useState(user?.statusEmoji ?? '');

  // UI state
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsername(user?.username ?? '');
    setBio(user?.bio ?? '');
    setCustomStatus(user?.customStatus ?? '');
    setStatusEmoji(user?.statusEmoji ?? '');
  }, [user?.username, user?.bio, user?.customStatus, user?.statusEmoji]);

  const emitProfileUpdate = useCallback((payload: {
    username?: string;
    avatar?: string | null;
    bio?: string | null;
    customStatus?: string | null;
    statusEmoji?: string | null;
    banner?: string | null;
  }) => {
    if (socket?.connected) {
      socket.emit('user:profile_update', payload);
    }
  }, []);

  /**
   * Upload avatar file
   */
  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10 Mo");
      return;
    }

    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(file);
      emitProfileUpdate({ avatar: updated.avatar ?? null });
      setSuccess('Avatar mis à jour !');
      setError(null);
    } catch (_err) {
      setError('Erreur lors de la mise à jour de l\'avatar');
    } finally {
      setUploadingAvatar(false);
    }
  }, [uploadAvatar, emitProfileUpdate]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      await updateProfile({ username, bio, customStatus, statusEmoji });
      emitProfileUpdate({
        username,
        bio,
        customStatus,
        statusEmoji,
      });
      setSuccess('Profil mis à jour !');
    } catch (_err) {
      setError("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  // Gestion upload bannière
  const handleBannerChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10 Mo");
      return;
    }
    setUploadingBanner(true);
    try {
      const updated = await uploadBanner(file);
      emitProfileUpdate({ banner: updated.banner ?? null });
      setSuccess('Bannière mise à jour !');
      setError(null);
    } catch (_err) {
      setError("Erreur lors de la mise à jour de la bannière");
    } finally {
      setUploadingBanner(false);
    }
  }, [uploadBanner, emitProfileUpdate]);

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="h-[100dvh] overflow-y-auto bg-background text-foreground">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Profil
            </h1>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors font-medium text-sm"
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
              )}
              {theme === 'dark' ? 'Clair' : 'Sombre'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
          {/* Banner Section */}
          <div className="mb-12">
            <div className="relative mb-6">
              {user.banner ? (
                <img
                  src={user.banner}
                  alt="Banner"
                  className="w-full h-48 object-cover rounded-2xl shadow-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                  <span className="text-muted text-lg">Ajouter une bannière</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium backdrop-blur"
                aria-label="Changer la bannière"
              >
                {uploadingBanner ? 'Envoi...' : 'Modifier'}
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
                disabled={uploadingBanner}
              />
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="relative">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg transition-colors"
                    aria-label="Changer l'avatar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
                {user.customStatus && (
                  <div className="flex items-center gap-2 text-muted mb-4">
                    <span className="text-xl">{user.statusEmoji}</span>
                    <span className="italic">{user.customStatus}</span>
                  </div>
                )}
                {user.bio && (
                  <p className="text-foreground/70 mb-4">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section: Informations Générales */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations Générales
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-foreground">
                    Nom d&apos;utilisateur
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={saving}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-muted"
                    placeholder="Votre nom d'utilisateur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-foreground">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    disabled={saving}
                    maxLength={300}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-muted resize-none"
                    placeholder="Décrivez-vous..."
                    rows={4}
                  />
                  <div className="mt-2 text-xs text-muted text-right">
                    {bio.length}/300
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Statut Personnalisé */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Statut Personnalisé
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-3 text-foreground">
                      Texte du statut
                    </label>
                    <input
                      type="text"
                      value={customStatus}
                      onChange={e => setCustomStatus(e.target.value)}
                      disabled={saving}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-muted"
                      placeholder="Ex: En train de jouer..."
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-semibold mb-3 text-foreground">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={statusEmoji}
                      onChange={e => setStatusEmoji(e.target.value)}
                      disabled={saving}
                      maxLength={2}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder-muted text-2xl"
                      placeholder="😀"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Messages */}
            <div className="space-y-3">
              {success && (
                <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              )}
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
