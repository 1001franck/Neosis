'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@application/auth/useAuth';
import { Space_Grotesk, Newsreader } from 'next/font/google';

const space = Space_Grotesk({ subsets: ['latin'], display: 'swap' });
const news = Newsreader({ subsets: ['latin'], display: 'swap', style: ['normal', 'italic'] });

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Mockup de l'application ─────────────────────────────────────────────────

function AppMockup() {
  const channels = ['général', 'annonces', 'projets', 'random'];
  const messages = [
    {
      user: 'Hugo',
      initial: 'H',
      accent: '#818cf8',
      text: 'La nouvelle feature de recherche est dispo 🔥',
      time: '14:32',
      reactions: [{ emoji: '🔥', count: 4 }],
    },
    {
      user: 'Bastian',
      initial: 'B',
      accent: '#a78bfa',
      text: "Trop bien — j'ai testé le voice chat aussi, zéro latence",
      time: '14:33',
    },
    {
      user: 'Harel',
      initial: 'H',
      accent: '#c4b5fd',
      text: 'On merge avant ce soir ?',
      time: '14:34',
    },
    {
      user: 'Hugo',
      initial: 'H',
      accent: '#818cf8',
      text: 'Oui, je review le PR maintenant',
      time: '14:35',
      reactions: [{ emoji: '👍', count: 3 }],
    },
  ];

  return (
    <motion.div
      className="relative w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.45, ease }}
    >
      {/* Halo derrière */}
      <div className="absolute -inset-8 bg-indigo-500/[0.08] blur-3xl rounded-full pointer-events-none" />

      {/* Cadre navigateur */}
      <div className="relative rounded-xl overflow-hidden border border-white/[0.09] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        {/* Barre navigateur */}
        <div className="bg-[#111115] px-4 py-2.5 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[#0a0a0d] rounded px-3 py-1 flex items-center gap-2">
              <svg className="w-3 h-3 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span className="text-[11px] text-white/30 tracking-wide">neosis.app</span>
            </div>
          </div>
        </div>

        {/* UI de l'application */}
        <div className="bg-[#0c0c0f] flex" style={{ height: '340px' }}>
          {/* Colonne serveurs */}
          <div className="w-[52px] bg-[#08080b] flex flex-col items-center pt-3 gap-2 border-r border-white/[0.05] flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-indigo-500/30">
              N
            </div>
            <div className="w-8 h-px bg-white/[0.08] my-0.5" />
            {['G', 'P'].map((s, i) => (
              <div key={i} className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-[11px] font-semibold text-white/40">
                {s}
              </div>
            ))}
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/25 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>

          {/* Liste des salons */}
          <div className="w-40 bg-[#0a0a0d] flex flex-col border-r border-white/[0.05] flex-shrink-0">
            <div className="px-3 py-2.5 border-b border-white/[0.05] flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60">Neosis HQ</span>
              <svg className="w-3 h-3 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </div>
            <div className="flex-1 px-2 py-2 overflow-hidden">
              <p className="text-[10px] text-white/25 uppercase tracking-widest px-2 mb-1.5">Salons texte</p>
              {channels.map((ch, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs mb-0.5 ${
                    i === 0
                      ? 'bg-white/[0.07] text-white/90'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  <span className="text-white/25">#</span>
                  {ch}
                </div>
              ))}
            </div>
          </div>

          {/* Zone messages */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-2">
              <span className="text-xs text-white/30">#</span>
              <span className="text-sm font-semibold text-white/90">général</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/30">3 en ligne</span>
              </div>
            </div>
            <div className="flex-1 px-4 py-3 space-y-3.5 overflow-hidden">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.4, ease }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
                    style={{ backgroundColor: msg.accent + '22', border: `1px solid ${msg.accent}33`, color: msg.accent }}
                  >
                    {msg.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span className="text-[12px] font-semibold" style={{ color: msg.accent }}>
                        {msg.user}
                      </span>
                      <span className="text-[10px] text-white/20">{msg.time}</span>
                    </div>
                    <p className="text-[12px] text-white/65 leading-relaxed">{msg.text}</p>
                    {msg.reactions && (
                      <div className="flex gap-1 mt-1">
                        {msg.reactions.map((r, j) => (
                          <span
                            key={j}
                            className="text-[10px] bg-white/[0.05] border border-white/[0.08] rounded px-1.5 py-0.5 text-white/50"
                          >
                            {r.emoji} {r.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <motion.div
                className="flex items-center gap-1.5 text-white/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.55, duration: 0.4 }}
              >
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-white/30"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
                <span className="text-[11px] ml-1">Loïc est en train d&apos;écrire…</span>
              </motion.div>
            </div>
            <div className="px-4 py-3 border-t border-white/[0.05]">
              <div className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 flex items-center">
                <span className="text-[12px] text-white/20 flex-1">Message #général</span>
                <svg className="w-4 h-4 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    num: '01',
    title: 'Temps réel, sans compromis',
    desc: 'Messages, présence, réactions et frappe — tout se synchronise instantanément entre tous les membres.',
  },
  {
    num: '02',
    title: 'Organisé par design',
    desc: 'Serveurs, salons texte et vocaux, rôles par membres. Une structure qui grandit avec ta communauté.',
  },
  {
    num: '03',
    title: 'Conversations privées',
    desc: 'Messages directs, profils utilisateurs et médias partagés. Le lien entre les personnes, pas juste les canaux.',
  },
];

// ─── Page principale ──────────────────────────────────────────────────────────

export default function LandingPage(): React.ReactNode {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      router.replace('/neosis/');
    }
  }, [isAuthenticated, isInitialized, router]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    html.style.overflow = 'auto';
    body.style.overflow = 'auto';
    body.style.height = 'auto';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className={`${space.className} min-h-screen bg-[#09090b] relative overflow-x-hidden`} style={{ color: '#f1f5f9' }}>
      {/* Halo central fixe — subtil */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/[0.07] blur-[100px] rounded-full" />
      </div>

      {/* NAVBAR */}
      <motion.nav
        className="relative z-10 flex items-center justify-between px-6 md:px-14 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex items-center gap-2.5">
          <img src="/neosis.png" alt="Neosis" className="w-16 h-16 object-contain" />
          <span className={`${news.className} text-[17px] font-semibold text-white/85`}>Neosis</span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href="/auth/login/"
            className="px-4 py-2 text-sm text-white/45 hover:text-white/80 transition-colors"
          >
            Connexion
          </a>
          <a
            href="/auth/register/"
            className="px-4 py-2 text-sm font-medium bg-white/[0.07] hover:bg-white/[0.11] border border-white/[0.09] rounded-lg text-white/80 hover:text-white transition-all"
          >
            S&apos;inscrire
          </a>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-14 pt-16 pb-20 text-center">
        <motion.h1
          className={`${news.className} text-5xl md:text-[68px] font-semibold leading-[1.07] tracking-tight max-w-3xl mx-auto`}
          style={{ color: '#f1f5f9' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
        >
          Parle à ta communauté.{' '}
          <em style={{ color: '#818cf8', fontStyle: 'italic' }}>Sans friction.</em>
        </motion.h1>

        <motion.p
          className="mt-6 text-base md:text-[17px] max-w-lg mx-auto leading-relaxed"
          style={{ color: 'rgba(241,245,249,0.60)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
        >
          Serveurs, salons, messages privés et voice chat - tout ce dont une communauté a besoin, rien de superflu.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-3 mt-9"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease }}
        >
          <a
            href="/auth/register/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-all shadow-lg shadow-indigo-500/25"
          >
            Commencer gratuitement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <a
            href="/auth/login/"
            className="px-5 py-3 text-sm text-white/45 hover:text-white/75 transition-colors"
          >
            Se connecter
          </a>
        </motion.div>

        {/* Mockup */}
        <div className="mt-20">
          <AppMockup />
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-6 md:px-14 py-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="divide-y divide-white/[0.06]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {features.map((f) => (
              <motion.div
                key={f.num}
                className="py-9 flex items-start gap-7"
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
                }}
              >
                <span className="text-xs font-mono text-indigo-400/50 pt-1 flex-shrink-0 w-6 text-right">
                  {f.num}
                </span>
                <div className="flex-1 grid md:grid-cols-2 gap-2 md:gap-10">
                  <h3 className="text-lg font-semibold leading-snug" style={{ color: '#f1f5f9' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(241,245,249,0.60)' }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-14 py-24">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <h2
            className={`${news.className} text-4xl md:text-[52px] font-semibold leading-[1.1] tracking-tight`}
            style={{ color: '#f1f5f9' }}
          >
            Prêt à lancer{' '}
            <em style={{ color: '#818cf8', fontStyle: 'italic' }}>ton serveur ?</em>
          </h2>
          <p className="mt-4 text-[15px]" style={{ color: 'rgba(241,245,249,0.50)' }}>
            Inscription gratuite. Aucune carte bancaire.
          </p>
          <div className="mt-8">
            <a
              href="/auth/register/"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-all shadow-lg shadow-indigo-500/25"
            >
              Créer mon compte
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 md:px-14 py-7 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/25">
          <span className={news.className}>Neosis © 2026</span>
          <span>Développé par Harel, Bastian et Hugo</span>
        </div>
      </footer>
    </div>
  );
}
