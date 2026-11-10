import { db, type Queryable } from '../config/db.js';
import { AppError } from '../errors/AppError.js';
import type { Campaign } from '../models/campaign.model.js';
import { addDays, todayInTz } from '../utils/dates.js';
import { mapCampaign } from '../utils/mappers.js';
import {
  MAX_DURATION_DAYS,
  type CreateCampaignInput,
  type ListCampaignsQuery,
} from '../validators/campaign.schema.js';

// Una sola definición de la consulta base (antes estaba duplicada).
const BASE_SELECT = `
  SELECT c.id, c.titulo, c.descripcion, c.creador_id, u.nombre AS creador_nombre,
         c.categoria_id, cat.nombre AS categoria_nombre, cat.slug AS categoria_slug,
         c.meta_monto, c.monto_recaudado,
         to_char(c.fecha_limite, 'YYYY-MM-DD') AS fecha_limite,
         c.estado, c.creado_en, c.cerrado_en,
         (SELECT COUNT(DISTINCT a.usuario_id) FROM aportes a WHERE a.campana_id = c.id)::int AS total_aportantes
  FROM campanas c
  JOIN usuarios u ON u.id = c.creador_id
  LEFT JOIN categorias cat ON cat.id = c.categoria_id`;

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const campaignService = {
  async list(query: ListCampaignsQuery): Promise<Page<Campaign>> {
    const where: string[] = [];
    const params: unknown[] = [];
    const bind = (value: unknown): string => {
      params.push(value);
      return `$${params.length}`;
    };

    if (query.categoria) where.push(`cat.slug = ${bind(query.categoria)}`);
    if (query.estado) where.push(`c.estado = ${bind(query.estado)}`);
    if (query.q) {
      // Se escapan los comodines de LIKE para que "50%" se busque literalmente.
      const p = bind(`%${query.q.replace(/[%_\\]/g, '\\$&')}%`);
      where.push(`(c.titulo ILIKE ${p} OR c.descripcion ILIKE ${p})`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = await db.query(
      `SELECT COUNT(*)::int AS n FROM campanas c LEFT JOIN categorias cat ON cat.id = c.categoria_id ${whereSql}`,
      params,
    );
    const offset = (query.page - 1) * query.pageSize;
    const rows = await db.query(
      `${BASE_SELECT} ${whereSql} ORDER BY c.creado_en DESC, c.id DESC LIMIT ${query.pageSize} OFFSET ${offset}`,
      params,
    );

    return {
      items: rows.rows.map(mapCampaign),
      total: total.rows[0].n,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async findById(id: number, executor: Queryable = db): Promise<Campaign> {
    const result = await executor.query(`${BASE_SELECT} WHERE c.id = $1`, [id]);
    if (!result.rows[0]) throw AppError.notFound('Campaña no encontrada.');
    return mapCampaign(result.rows[0]);
  },

  async listByCreator(creatorId: number): Promise<Campaign[]> {
    const result = await db.query(`${BASE_SELECT} WHERE c.creador_id = $1 ORDER BY c.creado_en DESC, c.id DESC`, [
      creatorId,
    ]);
    return result.rows.map(mapCampaign);
  },

  async create(creatorId: number, input: CreateCampaignInput): Promise<Campaign> {
    const today = todayInTz();
    const tomorrow = addDays(today, 1);
    const latest = addDays(today, MAX_DURATION_DAYS);

    if (input.fechaLimite < tomorrow) {
      throw AppError.badRequest('La fecha límite debe ser posterior a hoy.');
    }
    if (input.fechaLimite > latest) {
      throw AppError.badRequest(`La campaña no puede durar más de ${MAX_DURATION_DAYS} días.`);
    }

    const category = await db.query('SELECT id FROM categorias WHERE id = $1', [input.categoriaId]);
    if (!category.rows[0]) throw AppError.badRequest('La categoría seleccionada no existe.');

    const inserted = await db.query(
      `INSERT INTO campanas (creador_id, categoria_id, titulo, descripcion, meta_monto, fecha_limite)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [creatorId, input.categoriaId, input.titulo, input.descripcion, input.metaMonto, input.fechaLimite],
    );
    return this.findById(inserted.rows[0].id);
  },
};
