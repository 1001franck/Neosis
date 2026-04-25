import type { NextConfig } from "next";

const isTauri = process.env.TAURI_BUILD === '1';

const nextConfig: NextConfig = {
  // Desactive — cause des erreurs ESLint react-compiler sur le code existant
  reactCompiler: false,

  // Expose un flag runtime pour distinguer l'export statique Tauri du mode web/dev
  env: {
    NEXT_PUBLIC_IS_TAURI: isTauri ? '1' : '0',
  },

  // Mode export statique pour Tauri (pas de SSR dans l'app desktop)
  // trailingSlash genere auth/login/index.html que Tauri peut servir via le filesystem
  ...(isTauri ? { output: 'export', trailingSlash: true, images: { unoptimized: true } } : {}),

  // Rewrites actifs uniquement en mode web (pas en export statique)
  ...(!isTauri ? {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:3001/uploads/:path*',
        },
      ];
    },
  } : {}),
};

export default nextConfig;
