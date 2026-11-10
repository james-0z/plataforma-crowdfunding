import { createApp } from './app.js';
import { db } from './config/db.js';
import { env } from './config/env.js';
import { startSettlementJob } from './jobs/settlement.job.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 API ejecutándose en http://localhost:${env.PORT}/api`);
});

const stopJob = startSettlementJob();

// Cierre ordenado (Ctrl+C o contenedor detenido).
const shutdown = (signal: string) => {
  console.log(`\n${signal} recibido, cerrando…`);
  stopJob();
  server.close(async () => {
    await db.close();
    process.exit(0);
  });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
