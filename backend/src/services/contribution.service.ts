import { pool } from '../config/db.js';

export interface ContributionInput {
  campanaId: number;
  usuarioId: number;
  monto: number;
}

export const contributionService = {
  async create(data: ContributionInput) {
    const { campanaId, usuarioId, monto } = data;

    if (monto <= 0) {
      throw new Error('El monto del aporte debe ser mayor a cero.');
    }

    // Usar una transacción para asegurar consistencia atómica
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Verificar si la campaña existe y bloquear la fila para evitar condiciones de carrera
      const campaignResult = await client.query(
        'SELECT * FROM campanas WHERE id = $1 FOR UPDATE',
        [campanaId]
      );

      if (campaignResult.rows.length === 0) {
        throw new Error('Campaña no encontrada.');
      }

      const campaign = campaignResult.rows[0];

      if (campaign.estado !== 'activa') {
        throw new Error('No se puede aportar a una campaña que no está activa.');
      }

      // 2. Registrar el aporte en la tabla 'aportes'
      const contributionQuery = `
        INSERT INTO aportes (campana_id, usuario_id, monto)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const contributionResult = await client.query(contributionQuery, [campanaId, usuarioId, monto]);
      const newContribution = contributionResult.rows[0];

      // 3. Calcular el nuevo monto recaudado
      const nuevoMontoRecaudado = Number(campaign.monto_recaudado) + Number(monto);
      let nuevoEstado = campaign.estado;

      // Regla All-or-Nothing: Si se alcanza o supera la meta, pasa a 'exitosa'
      if (nuevoMontoRecaudado >= Number(campaign.meta_monto)) {
        nuevoEstado = 'exitosa';
      }

      // 4. Actualizar la campaña con el nuevo monto y estado
      const updateCampaignQuery = `
        UPDATE campanas
        SET monto_recaudado = $1, estado = $2
        WHERE id = $3
        RETURNING *;
      `;
      const updatedCampaignResult = await client.query(updateCampaignQuery, [
        nuevoMontoRecaudado,
        nuevoEstado,
        campanaId
      ]);

      await client.query('COMMIT');

      return {
        contribution: newContribution,
        campaign: updatedCampaignResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};