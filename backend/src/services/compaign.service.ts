import { pool } from '../config/db.js';

export interface CampaignInput {
  creadorId: number;
  categoriaId: number;
  titulo: string;
  descripcion: string;
  metaMonto: number;
  fechaLimite: string;
}

export const campaignService = {
  // Obtener todas las campañas activas o filtradas por categoría
  async getAll(categoriaId?: number) {
    let query = `
      SELECT c.*, cat.nombre AS categoria_nombre, u.nombre AS creador_nombre
      FROM campanas c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      JOIN usuarios u ON c.creador_id = u.id
    `;
    const values: any[] = [];

    if (categoriaId) {
      query += ` WHERE c.categoria_id = $1`;
      values.push(categoriaId);
    }

    query += ` ORDER BY c.creado_en DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Obtener una campaña por ID
  async getById(id: number) {
    const query = `
      SELECT c.*, cat.nombre AS categoria_nombre, u.nombre AS creador_nombre
      FROM campanas c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      JOIN usuarios u ON c.creador_id = u.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new Error('Campaña no encontrada.');
    }
    return result.rows[0];
  },

  // Crear una nueva campaña
  async create(data: CampaignInput) {
    const { creadorId, categoriaId, titulo, descripcion, metaMonto, fechaLimite } = data;

    const query = `
      INSERT INTO campanas (creador_id, categoria_id, titulo, descripcion, meta_monto, fecha_limite)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [creadorId, categoriaId, titulo, descripcion, metaMonto, fechaLimite];

    const result = await pool.query(query, values);
    return result.rows[0];
  }
};