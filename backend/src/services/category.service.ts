import { db } from '../config/db.js';
import type { Category } from '../models/campaign.model.js';

export const categoryService = {
  async list(): Promise<Category[]> {
    const result = await db.query('SELECT id, nombre, slug, descripcion FROM categorias ORDER BY nombre');
    return result.rows;
  },
};
