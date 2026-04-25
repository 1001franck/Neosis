/**
 * NEOSIS PAGE - Page d'accueil pour les utilisateurs sans serveurs
 * Design identique à /servers/{serverId} mais avec un EmptyState
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@application/auth/useAuth';
import { useServers } from '@application/servers/useServers';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { MainLayout } from '@presentation/components/layout/MainLayout';
import { logger } from '@shared/utils/logger';
import { useLocale } from '@shared/hooks/useLocale';
import { motion, type Variants } from 'framer-motion';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

/**
 * En export statique Tauri, les pages /servers/[id]/ ne sont pas pré-générées pour les vrais IDs.
 * On stocke l'ID cible et on navigue vers la page statique '_'.
 * En dev/web, navigation directe vers l'URL réelle.
 */
function navigateToServer(serverId: string): void {
  if (process.env.NEXT_PUBLIC_IS_TAURI === '1') {
    localStorage.setItem('neosis_server_id', serverId);
    window.location.href = '/servers/_/';
  } else {
    window.location.href = `/servers/${serverId}/`;
  }
}

export default function NeosisPage(): React.ReactNode {
  const router = useRouter();
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const { servers, getServers, createServer, joinServer } = useServers();
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [createServerName, setCreateServerName] = useState('');
  const [createServerDesc, setCreateServerDesc] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [serverModalError, setServerModalError] = useState<string | null>(null);
  const [serverModalLoading, setServerModalLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Charger les serveurs au montage
  useEffect(() => {
    const loadServers = async () => {
      try {
        await getServers();
      } catch (err) {
        logger.error('Failed to load servers', err);
      } finally {
        setLoading(false);
      }
    };

    loadServers();
  }, [getServers]);

  // Rediriger vers le premier serveur si l'utilisateur en a
  useEffect(() => {
    if (!loading && servers.length > 0) {
      const targetId = servers[0].id;
      logger.info('User has servers, redirecting to first', { serverId: targetId });
      navigateToServer(targetId);
    }
    // navigateToServer est stable (défini hors du composant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, servers]);

  const closeServerModals = () => {
    setShowCreateServer(false);
    setShowJoinServer(false);
    setServerModalError(null);
    setCreateServerName('');
    setCreateServerDesc('');
    setJoinInviteCode('');
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createServerName.trim()) return;
    setServerModalError(null);
    setServerModalLoading(true);
    try {
      const server = await createServer({ name: createServerName.trim(), description: createServerDesc.trim() || undefined });
      closeServerModals();
      navigateToServer(server.id);
    } catch (err) {
      setServerModalError((err as Error).message || t('servers.create.error'));
    } finally {
      setServerModalLoading(false);
    }
  };

  const handleJoinServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInviteCode.trim()) return;
    setServerModalError(null);
    setServerModalLoading(true);
    try {
      const server = await joinServer(joinInviteCode.trim());
      closeServerModals();
      navigateToServer(server.id);
    } catch (err) {
      setServerModalError((err as Error).message || t('servers.join.invalidCode'));
    } finally {
      setServerModalLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch {
      router.push('/');
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const sidebarUser = user ? { username: user.username, avatar: user.avatar ?? undefined } : undefined;

  return (
    <ProtectedRoute>
      <React.Fragment>
        <MainLayout
          servers={servers}
          showDirectMessages
          user={sidebarUser}
          onLogout={() => setShowLogoutModal(true)}
          onSettings={() => router.push('/settings')}
          onCreateServer={() => setShowCreateServer(true)}
          onJoinServer={() => setShowJoinServer(true)}
        >
          {/* Barre mobile : avatar + déconnexion (visible uniquement sur mobile) */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              {sidebarUser?.avatar ? (
                <img src={sidebarUser.avatar} alt={sidebarUser.username} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs text-white font-bold">
                  {sidebarUser?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="text-sm font-medium text-foreground">{sidebarUser?.username}</span>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-sm text-muted-foreground hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              {t('nav.logout')}
            </button>
          </div>

          {/* Empty State - Belle page d'accueil */}
          <div className="flex-1 flex items-center justify-center bg-background p-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="max-w-2xl w-full text-center space-y-8"
            >
              {/* Illustration / Logo */}
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 blur-3xl opacity-50 animate-pulse" />

                  {/* neosis Icon */}
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl">
                    <svg
                      className="w-20 h-20 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.73 4.87a18.2 18.2 0 00-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 00.96 17.7a18.43 18.43 0 005.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83zM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Texte principal */}
              <div className="space-y-4">
                <motion.h1
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {t('neosis.welcome')} {user?.username} !
                </motion.h1>

                <motion.p
                  className="text-xl text-muted-foreground max-w-lg mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {t('neosis.subtitle')}
                </motion.p>
              </div>

              {/* Boutons d'action */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {/* Bouton Créer */}
                <button
                  onClick={() => setShowCreateServer(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden min-w-[200px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z" />
                    </svg>
                    {t('nav.createServer')}
                  </span>
                </button>

                {/* Bouton Rejoindre */}
                <button
                  onClick={() => setShowJoinServer(true)}
                  className="group px-8 py-4 bg-card hover:bg-muted border-2 border-border hover:border-primary/50 text-foreground font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 min-w-[200px]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 10.9C11.39 10.9 10.9 11.39 10.9 12C10.9 12.61 11.39 13.1 12 13.1C12.61 13.1 13.1 12.61 13.1 12C13.1 11.39 12.61 10.9 12 10.9ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM14.19 14.19L6 18L9.81 9.81L18 6L14.19 14.19Z" />
                    </svg>
                    {t('nav.joinServer')}
                  </span>
                </button>
              </motion.div>

              {/* Informations additionnelles */}
              <motion.div
                className="pt-8 space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                {/* Séparateur */}
                <div className="flex items-center gap-4 max-w-md mx-auto">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('neosis.whyCreate')}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    { icon: '💬', title: t('neosis.features.chat.title'), desc: t('neosis.features.chat.desc') },
                    { icon: '👥', title: t('neosis.features.collab.title'), desc: t('neosis.features.collab.desc') },
                    { icon: '🎨', title: t('neosis.features.custom.title'), desc: t('neosis.features.custom.desc') },
                  ].map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      className="p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    >
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </MainLayout>

        {/* === MODAL : Créer un serveur === */}
        {showCreateServer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeServerModals}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-foreground mb-5">{t('servers.create.title')}</h3>
              <form onSubmit={handleCreateServer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">{t('servers.create.nameLabel')}</label>
                  <input
                    type="text"
                    value={createServerName}
                    onChange={(e) => setCreateServerName(e.target.value)}
                    placeholder={t('servers.create.namePlaceholder')}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    disabled={serverModalLoading}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">{t('servers.create.descLabel')}</label>
                  <input
                    type="text"
                    value={createServerDesc}
                    onChange={(e) => setCreateServerDesc(e.target.value)}
                    placeholder={t('servers.create.descPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    disabled={serverModalLoading}
                  />
                </div>
                {serverModalError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{serverModalError}</div>
                )}
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={closeServerModals} className="px-4 py-2.5 text-muted-foreground hover:text-foreground text-sm transition-colors" disabled={serverModalLoading}>
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    disabled={serverModalLoading || !createServerName.trim()}
                  >
                    {serverModalLoading ? t('servers.create.submitting') : t('servers.create.submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === MODAL : Rejoindre un serveur === */}
        {showJoinServer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeServerModals}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-foreground mb-5">{t('servers.join.title')}</h3>
              <form onSubmit={handleJoinServer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">{t('servers.join.codeLabel')}</label>
                  <input
                    type="text"
                    value={joinInviteCode}
                    onChange={(e) => setJoinInviteCode(e.target.value)}
                    placeholder={t('servers.join.codePlaceholder')}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    disabled={serverModalLoading}
                    autoFocus
                  />
                </div>
                {serverModalError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{serverModalError}</div>
                )}
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={closeServerModals} className="px-4 py-2.5 text-muted-foreground hover:text-foreground text-sm transition-colors" disabled={serverModalLoading}>
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    disabled={serverModalLoading || !joinInviteCode.trim()}
                  >
                    {serverModalLoading ? t('servers.join.submitting') : t('servers.join.submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === MODAL : Déconnexion === */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowLogoutModal(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground text-center">{t('logout.title')}</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                {t('logout.message')}
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-foreground bg-secondary border border-border hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? t('logout.confirming') : t('logout.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    </ProtectedRoute>
  );
}
