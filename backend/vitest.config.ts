import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'secreto-solo-para-pruebas-automatizadas-0123456789',
      APP_TIMEZONE: 'America/Bogota',
      SETTLEMENT_INTERVAL_SECONDS: '0',
    },
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
