import type { NextConfig } from "next";

const isTauri = process.env.TAURI_BUILD === '1';

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Mode export statique pour Tauri (pas de SSR dans l'app desktop)
  ...(isTauri ? { output: 'export', images: { unoptimized: true } } : {}),

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
