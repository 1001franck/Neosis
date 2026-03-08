// Environment variables - typées et sécurisées
export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
