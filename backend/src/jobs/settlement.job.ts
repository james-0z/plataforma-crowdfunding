import { env } from '../config/env.js';
import { settleExpiredCampaigns } from '../services/settlement.service.js';

/** Revisa periódicamente las campañas vencidas. Devuelve una función para detenerlo. */
export function startSettlementJob(): () => void {
  const seconds = env.SETTLEMENT_INTERVAL_SECONDS;
  if (seconds <= 0) {
    console.log('⏸️  Cierre automático de campañas desactivado (SETTLEMENT_INTERVAL_SECONDS=0).');
    return () => undefined;
  }

  let running = false;
  const run = async () => {
    if (running) return; // evita solapamiento si una ejecución tarda más que el intervalo
    running = true;
    try {
      const r = await settleExpiredCampaigns();
      if (r.procesadas > 0) {
        console.log(
          `🏁 Cierre automático: ${r.exitosas} exitosas, ${r.fallidas} fallidas, ` +
            `${r.aportesReembolsados} aportes reembolsados (${r.montoReembolsado}).`,
        );
      }
    } catch (error) {
      console.error('❌ Falló el cierre automático de campañas:', error);
    } finally {
      running = false;
    }
  };

  void run();
  const timer = setInterval(run, seconds * 1000);
  timer.unref();
  return () => clearInterval(timer);
}
