/**
 * LANDING PAGE
 * Page d'accueil publique sobre et professionnelle
 * Redirige les utilisateurs authentifi�s vers leur premier serveur
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@application/auth/useAuth';
import { Space_Grotesk, Newsreader } from 'next/font/google';

const space = Space_Grotesk({ subsets: ['latin'], display: 'swap' });
const news = Newsreader({ subsets: ['latin'], display: 'swap' });

// ============ ANIMATION VARIANTS ============

const cubicEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: cubicEase },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: cubicEase },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.25 },
  },
};

const featureCard = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: cubicEase },
  },
};

// ============ BACKDROP ============

function Backdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,51,102,0.14),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(0,71,102,0.12),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(148,163,184,0.06),transparent_35%)]" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

// ============ CHAT PREVIEW ============

function ChatPreview() {
  const messages = [
    {
      user: 'Bastian',
      avatar: 'B',
      color: 'from-slate-600 to-slate-700',
      text: 'Hey ! Vous avez vu la nouvelle mise à jour ? 😊',
      time: '14:32',
    },
    {
      user: 'Hugo',
      avatar: 'H',
      color: 'from-[#003366] to-slate-700',
      text: "Oui c'est incroyable ! Le voice chat marche trop bien 😊",
      time: '14:33',
    },
    {
      user: 'Harel',
      avatar: 'H',
      color: 'from-[#003247] to-slate-700',
      text: 'On se fait une session ce soir ? 😊',
      time: '14:34',
    },
  ];

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeIn}
      custom={0.35}
    >
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/30 blur-xl" />
      <div className="relative bg-[#0f141a]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-sm text-white/60 font-medium"># general</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#004766] animate-pulse" />
            <span className="text-xs text-[#004766]">3 en ligne</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55 + i * 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${msg.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <span className="text-white text-sm font-bold">{msg.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white">{msg.user}</span>
                  <span className="text-xs text-white/30">{msg.time}</span>
                </div>
                <p className="text-sm text-white/70 mt-0.5">{msg.text}</p>
              </div>
            </motion.div>
          ))}

          <motion.div
            className="flex items-center gap-2 text-white/40"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.35, duration: 0.4 }}
          >
            <div className="flex gap-1">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/40"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/40"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
              />
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/40"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              />
            </div>
            <span className="text-xs">Loïc est en train d&apos;écrire...</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ============ FEATURES ============

const features = [
  {
    title: 'Messages en temps réel',
    description: 'Des conversations instantanées et fiables, pensées pour les équipes et les communautés.',
  },
  {
    title: 'Serveurs & salons',
    description: 'Structurez vos échanges par thèmes, projets ou événements, sans friction.',
  },
  {
    title: 'Sécurisé & privé',
    description: 'Authentification moderne, rôles avancés et modération intégrée.',
  },
];

// ============ MAIN COMPONENT ============

export default function LandingPage(): React.ReactNode {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const redirectAuthenticatedUser = async () => {
      if (isAuthenticated && isInitialized) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servers`, {
            credentials: 'include',
          });

          if (response.ok) {
            const { data: servers } = await response.json();
            if (servers && servers.length > 0) {
              router.push(`/servers/${servers[0].id}`);
            } else {
              router.push('/neosis');
            }
          } else {
            router.push('/neosis');
          }
        } catch {
          router.push('/neosis');
        }
      }
    };

    redirectAuthenticatedUser();
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
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-2 border-[#003366]/30 border-t-[#004766] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className={`${space.className} min-h-screen bg-[#0b0f14] text-white relative overflow-x-hidden`}>
      <Backdrop />

      {/* NAVBAR */}
      <motion.nav
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-1.5">
          <img src="/neosis.png" alt="Neosis" className="w-[120px] h-[120px] object-contain" />
          <motion.span
            className={`${news.className} text-xl font-semibold tracking-tight text-white/90`}
            initial={{ opacity: 0, y: 6, letterSpacing: '0.18em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.04em' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Neosis
          </motion.span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/auth/register"
            className="px-5 py-2.5 text-sm font-medium bg-[#003366] text-white rounded-full hover:bg-[#004766] transition-all"
          >
            S&apos;inscrire
          </Link>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-8"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <div className="w-2 h-2 rounded-full bg-[#004766] animate-pulse" />
              <span className="text-xs tracking-wide text-white/60">Plateforme de messagerie communautaire</span>
            </motion.div>

            <motion.h1
              className={`${news.className} text-4xl md:text-6xl font-semibold leading-[1.1] tracking-tight`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              Des conversations claires.
              <br />
              Une communauté organisée.
              <br />
              <span className="text-[#004766]">Sans bruit.</span>
            </motion.h1>

            <motion.p
              className="text-base md:text-lg text-white/55 mt-6 max-w-md leading-relaxed"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
            >
              Neosis structure vos échanges : salons, rôles et messages en temps réel pour des équipes qui avancent.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4 mt-10"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-[#003366] rounded-full hover:bg-[#004766] transition-all"
              >
                Commencer
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-white/70 border border-white/10 rounded-full hover:text-white hover:border-white/20 transition-all"
              >
                Se connecter
              </Link>
            </motion.div>
          </div>

          <ChatPreview />
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.h2
              className={`${news.className} text-3xl md:text-4xl font-semibold`}
              variants={fadeUp}
              custom={0}
            >
              Un espace fiable pour parler, décider, avancer
            </motion.h2>
            <motion.p
              className="text-white/50 mt-3 max-w-2xl"
              variants={fadeUp}
              custom={0.1}
            >
              Des outils simples, une UI claire et un cœur temps réel pour garder le rythme.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={featureCard}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 mb-4 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#004766]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            className={`${news.className} text-3xl md:text-4xl font-semibold leading-tight`}
            variants={fadeUp}
            custom={0}
          >
            Prêt à structurer votre communauté ?
          </motion.h2>
          <motion.p
            className="text-white/50 mt-4 text-base"
            variants={fadeUp}
            custom={0.1}
          >
            Lancez un serveur et invitez votre équipe en quelques secondes.
          </motion.p>
          <motion.div className="mt-8" variants={fadeUp} custom={0.2}>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-9 py-3.5 text-sm font-semibold text-white bg-[#003366] rounded-full hover:bg-[#004766] transition-all"
            >
              Créer mon compte
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40">Neosis © 2026</span>
          </div>
          <div className="text-sm text-white/60">Copyright 2026 © Développé par Harel, Bastian et Hugo.</div>
        </div>
      </footer>
    </div>
  );
}
