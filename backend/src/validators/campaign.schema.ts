import { z } from 'zod';
import { CAMPAIGN_STATUSES } from '../models/campaign.model.js';
import { isoDateSchema, moneySchema } from './common.schema.js';

export const MIN_GOAL = 50_000;
export const MAX_DURATION_DAYS = 60;

export const createCampaignSchema = z.object({
  categoriaId: z.number({ error: 'La categoría es obligatoria.' }).int().positive(),
  titulo: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres.').max(150),
  descripcion: z.string().trim().min(20, 'La descripción debe tener al menos 20 caracteres.').max(5000),
  metaMonto: moneySchema(MIN_GOAL),
  fechaLimite: isoDateSchema,
});

export const listCampaignsQuerySchema = z.object({
  categoria: z.string().trim().max(50).optional(),
  estado: z.enum(CAMPAIGN_STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
