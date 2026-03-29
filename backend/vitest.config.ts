import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Variables d'environnement factices pour les tests — jamais utilisées en production
    env: {
      JWT_SECRET: 'test-secret-vitest-au-moins-32-caracteres-ok',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    },
  },
});
