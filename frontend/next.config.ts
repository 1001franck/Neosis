import type { NextConfig } from "next";

const isTauri = process.env.TAURI_BUILD === '1';

const nextConfig: NextConfig = {
  // Desactive — cause des erreurs ESLint react-compiler sur le code existant
  reactCompiler: false,

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
