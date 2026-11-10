import { db } from '../config/db.js';
import { todayInTz } from '../utils/dates.js';

export interface SettlementResult {
  procesadas: number;
  exitosas: number;
  fallidas: number;
  aportesReembolsados: number;
  montoReembolsado: number;
}

/**
 * Corazón del modelo All-or-Nothing. Para cada campaña activa cuya fecha límite ya pasó:
 *   - meta alcanzada  -> 'exitosa' (los fondos se liberan al creador)
 *   - meta NO alcanzada -> 'fallida' y TODOS sus aportes se marcan como reembolsados
 * Cada campaña se liquida en su propia transacción y es idempotente: ejecutarlo dos veces
 * no reembolsa dos veces.
 *
 * Nota: no hay pasarela de pago real; "reembolsado" es el registro contable que una
 * integración de pagos (Stripe, Wompi, PayU…) usaría para ordenar la devolución.
 */
export async function settleExpiredCampaigns(): Promise<SettlementResult> {
  const result: SettlementResult = {
    procesadas: 0,
    exitosas: 0,
    fallidas: 0,
    aportesReembolsados: 0,
    montoReembolsado: 0,
  };

  const expired = await db.query(
    `SELECT id FROM campanas WHERE estado = 'activa' AND fecha_limite < $1::date ORDER BY id`,
    [todayInTz()],
  );

  let refundedCents = 0;

  for (const { id } of expired.rows as { id: number }[]) {
    await db.transaction(async (tx) => {
      const locked = await tx.query(
        `SELECT estado, (monto_recaudado >= meta_monto) AS meta_alcanzada
         FROM campanas WHERE id = $1 FOR UPDATE`,
        [id],
      );
      const campaign = locked.rows[0];
      if (!campaign || campaign.estado !== 'activa') return; // otro proceso ya la liquidó

      result.procesadas++;

      if (campaign.meta_alcanzada) {
        await tx.query(`UPDATE campanas SET estado = 'exitosa', cerrado_en = NOW() WHERE id = $1`, [id]);
        result.exitosas++;
        return;
      }

      await tx.query(`UPDATE campanas SET estado = 'fallida', cerrado_en = NOW() WHERE id = $1`, [id]);
      const refunds = await tx.query(
        `UPDATE aportes SET reembolsado = TRUE, reembolsado_en = NOW()
         WHERE campana_id = $1 AND reembolsado = FALSE RETURNING monto`,
        [id],
      );
      result.fallidas++;
      result.aportesReembolsados += refunds.rowCount;
      for (const r of refunds.rows as { monto: string }[]) refundedCents += Math.round(Number(r.monto) * 100);
    });
  }

  result.montoReembolsado = refundedCents / 100;
  return result;
}
