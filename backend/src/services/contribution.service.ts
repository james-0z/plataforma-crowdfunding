import { db } from '../config/db.js';
import { AppError } from '../errors/AppError.js';
import type { Campaign } from '../models/campaign.model.js';
import type { Contribution, MyContribution } from '../models/contribution.model.js';
import { todayInTz } from '../utils/dates.js';
import { mapContribution } from '../utils/mappers.js';
import type { CreateContributionInput } from '../validators/contribution.schema.js';
import { campaignService } from './campaign.service.js';

export const contributionService = {
  /**
   * Registra un aporte de forma atómica. Reglas:
   *  - la campaña debe estar activa y no haber vencido;
   *  - el creador no puede aportar a su propia campaña;
   *  - el acumulado se suma en SQL (NUMERIC), nunca con floats de JavaScript.
   * La campaña sigue abierta aunque alcance la meta: su resultado se decide al vencer
   * (ver settlement.service). Así puede recibir aportes por encima del 100 %.
   */
  async create(
    userId: number,
    input: CreateContributionInput,
  ): Promise<{ contribution: Contribution; campaign: Campaign }> {
    return db.transaction(async (tx) => {
      // Bloquea la fila: dos aportes simultáneos se serializan.
      const locked = await tx.query(
        `SELECT creador_id, estado, to_char(fecha_limite, 'YYYY-MM-DD') AS fecha_limite
         FROM campanas WHERE id = $1 FOR UPDATE`,
        [input.campanaId],
      );
      const campaign = locked.rows[0];

      if (!campaign) throw AppError.notFound('Campaña no encontrada.');
      if (campaign.estado !== 'activa' || campaign.fecha_limite < todayInTz()) {
        throw AppError.conflict('La campaña ya cerró y no acepta más aportes.');
      }
      if (campaign.creador_id === userId) {
        throw AppError.forbidden('No puedes aportar a tu propia campaña.');
      }

      const inserted = await tx.query(
        'INSERT INTO aportes (campana_id, usuario_id, monto) VALUES ($1, $2, $3) RETURNING *',
        [input.campanaId, userId, input.monto],
      );
      await tx.query('UPDATE campanas SET monto_recaudado = monto_recaudado + $1 WHERE id = $2', [
        input.monto,
        input.campanaId,
      ]);

      return {
        contribution: mapContribution(inserted.rows[0]),
        campaign: await campaignService.findById(input.campanaId, tx),
      };
    });
  },

  async listByUser(userId: number): Promise<MyContribution[]> {
    const result = await db.query(
      `SELECT a.*, c.titulo AS campana_titulo, c.estado AS estado_campana
       FROM aportes a JOIN campanas c ON c.id = a.campana_id
       WHERE a.usuario_id = $1
       ORDER BY a.fecha_aporte DESC, a.id DESC`,
      [userId],
    );
    return result.rows.map((row) => ({
      ...mapContribution(row),
      campanaTitulo: row.campana_titulo,
      estadoCampana: row.estado_campana,
    }));
  },
};
